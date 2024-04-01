import { postDownloadRequest } from "./api";
import { errorLog, successLog, warnLog } from "./log";
import { SupportRSS, SupportRSSItem } from "./models/common-rss";
import { Config } from "./models/config";
import { PomeloRecord } from "./models/record";
import type {
    Rule,
    RuleUnit,
    RuleHandlerOption,
    PomeloHandler,
    RegExpOption,
} from "./models/rule";
import {
    getUrlFromRSSItem,
    isMikananiRSS,
    isNyaaRSS,
    isRegExpOption,
    isShareAcgnxRSS,
} from "./util";

//根据不同的rss类型进行不同的处理
export function processRSS(rss: SupportRSS, rule: Rule, record?: PomeloRecord) {
    if (isMikananiRSS(rss)) {
        rss.rss.channel.forEach((ch) => {
            ch.item.forEach((item) => {
                matchRule(item, rule, record);
            });
        });
    } else if (isNyaaRSS(rss)) {
        rss.rss.channel.forEach((ch) => {
            ch.item.forEach((item) => {
                matchRule(item, rule, record);
            });
        });
    } else if (isShareAcgnxRSS(rss)) {
        rss.rss.channel.forEach((ch) => {
            ch.item.forEach((item) => {
                matchRule(item, rule, record);
            });
        });
    } else {
        throw "unsupported RSS feeds, please replace them with supported RSS feeds.";
    }
}

export function matchRule(
    item: SupportRSSItem,
    rule: Rule,
    record?: PomeloRecord
): boolean {
    const content = item.title[0];

    //先匹配拒绝条件
    if (rule.reject && rule.reject(content)) {
        rule.onRejected && rule.onRejected(item, record);
        return false;
    }

    //再匹配接受条件
    if (rule.accept && rule.accept(content)) {
        rule.onAccepted && rule.onAccepted(item, record);
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
}: {
    config: Config;
    ruleUnit: {
        name: string;
    } & RuleUnit;
    onlyRecord: boolean;
}): Rule {
    return {
        name: ruleUnit.name,
        option: ruleUnit.option,
        accept: createHandlerByOptions(ruleUnit.accept),
        reject: createHandlerByOptions(ruleUnit.reject),
        //accept匹配时的回调
        async onAccepted(item, record) {
            //记录
            let recordItem: () => void = () => {};
            const content = item.title[0];
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
                    } else {
                        //记录过期,记录新缓存
                        recordItem = () => {
                            record.accepted[content] = {
                                expired: config.record?.expire
                                    ? config.record.expire + secondStamp
                                    : false,
                            };
                        };
                    }
                } else {
                    //没有缓存记录,则记录缓存
                    recordItem = () => {
                        record.accepted[content] = {
                            expired: config.record?.expire
                                ? config.record.expire + secondStamp
                                : false,
                        };
                    };
                }
            }
            //打印接受日志
            successLog(`accept ${content} by [rule]: ${ruleUnit.name}`);

            try {
                //判断是否仅需要记录
                if (!onlyRecord) {
                    await postDownloadRequest(
                        config,
                        getUrlFromRSSItem(item),
                        this.option,
                        this.name
                    );
                }
                recordItem();
            } catch (error) {
                errorLog(
                    `post download request failed!\nitem: ${content}\nerror: ${error}`
                );
            }
        },
        //reject匹配时的回调
        onRejected(item, record) {
            //记录
            let recordItem: () => void = () => {};
            const content = item.title[0];
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
                    } else {
                        //记录过期,记录新缓存
                        recordItem = () => {
                            record.rejected[content] = {
                                expired: config.record?.expire
                                    ? config.record.expire + secondStamp
                                    : false,
                            };
                        };
                    }
                } else {
                    //没有缓存记录,则记录缓存
                    recordItem = () => {
                        record.rejected[content] = {
                            expired: config.record?.expire
                                ? config.record.expire + secondStamp
                                : false,
                        };
                    };
                }
            }
            successLog(`reject ${content} by [rule]: ${ruleUnit.name}`);
            recordItem();
        },
    };
}

//#endregion
