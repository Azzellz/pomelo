import { postDownloadRequest } from "./api";
import { errorLog, successLog, warnLog } from "./utils/log";
import type {
    PomeloProcessContext,
    PomeloRuleContext,
    PomeloRule,
    RuleHandlerOption,
    PomeloHandler,
} from "./models";
import { getResourceString as _getResource } from "./api";
import { isRegExpOption } from "./utils";

export async function matchRule<T extends { content: string; link: string }>(
    context: PomeloProcessContext & T
) {
    const { content, link, record, rule, plugins } = context;

    //先匹配拒绝条件
    if (rule.reject && rule.reject(content)) {
        plugins.forEach((p) => p.onRejected?.(content, link));
        rule.onRejected?.(content, link, record);
        return false;
    }

    //再匹配接受条件
    if (rule.accept && rule.accept(content)) {
        plugins.forEach((p) => p.onAccepted?.(content, link));
        await rule.onAccepted?.(content, link, record);
        return true;
    }

    //未匹配任何行为
    return false;
}

function createMatcher(optss: RuleHandlerOption): PomeloHandler | undefined {
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

export function createRule(context: PomeloRuleContext): PomeloRule {
    const {
        config,
        ruleUnit,
        onlyRecord = false,
        intervalTimeCount,
        recordItem,
        record,
        deleteItem,
        downloadMap,
    } = context;
    return {
        name: ruleUnit.name,
        option: ruleUnit.option,
        accept: createMatcher(ruleUnit.accept),
        reject: createMatcher(ruleUnit.reject),
        async onAccepted(content: string, link: string) {
            if (downloadMap[link]) {
                warnLog(content + " has been downloaded but accepted");
                return;
            }

            if (config.record && record) {
                const recordUnit = record.accepted[content];
                const secondStamp = Math.floor(Date.now() / 1000);
                //判断是否存在记录并且发送下载请求成功
                if (recordUnit) {
                    //判断过期
                    if (
                        !recordUnit.expired ||
                        recordUnit.expired > secondStamp
                    ) {
                        //说明没过期,直接退出
                        return warnLog(
                            `checked [record]: ${content} when accepted, post download request will be skipped.`
                        );
                    }
                }
            }
            try {
                //打印接受日志
                successLog(`accept ${content} by [rule]: ${ruleUnit.name}`);
                recordItem("accepted", content);
                //判断是否仅需要记录
                if (!onlyRecord) {
                    console.time("3.post download request to aria2 --" + link);
                    downloadMap[link] = true;
                    await postDownloadRequest(
                        config,
                        link,
                        this.option,
                        this.name
                    );
                    console.timeEnd(
                        "3.post download request to aria2 --" + link
                    );
                }
            } catch (error) {
                deleteItem("accepted", content);
                downloadMap[link] = false;
                errorLog(
                    `post download request failed!\nitem: ${content}\nerror: ${error}`
                );
            }
        },
        onRejected(content: string) {
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
        onBeforeParse() {
            console.time("2.match rule--" + ruleUnit.name);
        },
        onParsed() {
            console.timeEnd("2.match rule--" + ruleUnit.name);
            intervalTimeCount && intervalTimeCount();
        },
    };
}
