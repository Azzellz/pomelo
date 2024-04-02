import { postDownloadRequest } from "./api";
import { errorLog, successLog, warnLog } from "./log";
import { Config } from "./models/config";
import { RuleContext } from "./models/context";
import { PomeloRecord } from "./models/record";
import type { Rule, RuleHandlerOption, PomeloHandler } from "./models/rule";
import { parseRSS } from "./parser";
import {
    isMikananiRSS,
    isNyaaRSS,
    isRegExpOption,
    isShareAcgnxRSS,
} from "./util";

//根据不同的rss类型进行不同的处理
export async function processResource(
    config: Config,
    resource: any,
    rule: Rule,
    record?: PomeloRecord
) {
    //优先使用rule的resource选项
    const _resource = rule.resource ? rule.resource : config.resource;
    //处理RSS
    if (
        _resource.type === "rss-mikanani" ||
        _resource.type === "rss-nyaa" ||
        _resource.type === "rss-share-acgnx"
    ) {
        if (
            isMikananiRSS(resource) ||
            isNyaaRSS(resource) ||
            isShareAcgnxRSS(resource)
        ) {
            if (_resource.parser) {
                await _resource.parser(resource, async (content, link) => {
                    await matchRule(content, link, rule, record);
                });
            } else {
                await parseRSS(resource, async (content, link) => {
                    await matchRule(content, link, rule, record);
                });
            }
        } else {
            throw "unsupported RSS feeds, please replace them with supported RSS feeds.";
        }
    } else if (
        _resource.type === "other" &&
        typeof _resource.parser === "function"
    ) {
        //自定义解析
        await _resource.parser(resource, async (content, link) => {
            await matchRule(content, link, rule, record);
        });
    } else {
        throw "please input right resource type! support type: rss-mikanani/rss-nyaa/rss-share-acgnx/other(need parser)";
    }
    rule.onMatchEnd && rule.onMatchEnd();
}

export async function matchRule(
    content: string,
    link: string,
    rule: Rule,
    record?: PomeloRecord
) {
    //先匹配拒绝条件
    if (rule.reject && rule.reject(content)) {
        rule.onRejected && (await rule.onRejected(content, link, record));
        return false;
    }

    //再匹配接受条件
    if (rule.accept && rule.accept(content)) {
        rule.onAccepted && (await rule.onAccepted(content, link, record));
        return true;
    }

    //未匹配任何行为
    return false;
}

function createHandlerByOptions(
    optss: RuleHandlerOption
): PomeloHandler | undefined {
    if (typeof optss === "function") {
        return (content: string) => optss(content);
    } else if (typeof optss === "string") {
        return (content: string) => new RegExp(optss, "i").test(content);
    } else if (isRegExpOption(optss)) {
        return (content: string) =>
            new RegExp(optss.expr, optss.flag).test(content);
    } else {
        if (!optss) {
            return void 0;
        } else {
            return (content: string) => {
                return optss.some((opts) => {
                    return opts.every((opt) =>
                        typeof opt === "string"
                            ? new RegExp(opt, "i").test(content)
                            : new RegExp(opt.expr, opt.flag).test(content)
                    );
                });
            };
        }
    }
}

export function createRule({
    config,
    ruleUnit,
    onlyRecord = false,
    intervalTimeCount,
    recordItem,
    record,
}: RuleContext): Rule {
    console.time("2.match rule--" + ruleUnit.name);
    return {
        name: ruleUnit.name,
        option: ruleUnit.option,
        resource: ruleUnit.resource,
        accept: createHandlerByOptions(ruleUnit.accept),
        reject: createHandlerByOptions(ruleUnit.reject),
        //accept匹配时的回调
        async onAccepted(content, link) {
            if (config.record && record) {
                const recordUnit = record.accepted[content];
                const secondStamp = Math.floor(Date.now() / 1000);
                //判断是否存在记录
                if (recordUnit) {
                    //判断过期
                    if (
                        !recordUnit.expired ||
                        recordUnit.expired > secondStamp
                    ) {
                        //说明没过期,直接退出
                        return warnLog(
                            `checked [record]: ${content} when accepted, download request will be skipped.`
                        );
                    }
                }
            }
            //打印接受日志
            successLog(`accept ${content} by [rule]: ${ruleUnit.name}`);
            console.timeEnd("2.match rule--" + ruleUnit.name);
            try {
                //判断是否仅需要记录
                if (!onlyRecord) {
                    console.time("3.postDownload");
                    await postDownloadRequest(
                        config,
                        link,
                        this.option,
                        this.name
                    );
                    console.timeEnd("3.postDownload");
                }
                recordItem("accepted", content);
            } catch (error) {
                errorLog(
                    `post download request failed!\nitem: ${content}\nerror: ${error}`
                );
            }
        },
        //reject匹配时的回调
        onRejected(content) {
            if (config.record?.expire && record) {
                const recordUnit = record.rejected[content];
                const secondStamp = Math.floor(Date.now() / 1000);
                //判断是否存在记录
                if (recordUnit) {
                    if (
                        !recordUnit.expired ||
                        recordUnit.expired > secondStamp
                    ) {
                        //说明没过期,直接退出
                        return warnLog(
                            `checked [record]: ${content} when rejected, download request will be skipped.`
                        );
                    }
                }
            }
            successLog(`reject ${content} by [rule]: ${ruleUnit.name}`);
            recordItem("rejected", content);
        },
        //结束匹配时调用
        onMatchEnd() {
            console.timeEnd("2.match rule--" + ruleUnit.name);
            intervalTimeCount && intervalTimeCount();
        },
    };
}

//#endregion
