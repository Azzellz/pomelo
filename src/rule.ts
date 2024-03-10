import { postDownloadRequest } from "./api";
import { SupportRSS, SupportRSSItem } from "./models/common-rss";
import { Config } from "./models/config";
import { PomeloRecord } from "./models/record";
import { Rule, RegExpOption, RuleJSON } from "./models/rule";
import {
    getUrlFromRSSItem,
    isMikananiRSS,
    isNyaaRSS,
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
    if (rule.reject) {
        if (typeof rule.reject === "function" && rule.reject(content)) {
            rule.onRejected && rule.onRejected(item, record);
            return false;
        } else if (
            rule.reject instanceof Array &&
            rule.reject.some((rep) => rep.test(content))
        ) {
            rule.onRejected && rule.onRejected(item, record);
            return false;
        }
    }

    //再匹配接受条件
    if (typeof rule.accept === "function" && rule.accept(content)) {
        rule.onAccepted && rule.onAccepted(item, record);
        return true;
    } else if (
        rule.accept instanceof Array &&
        rule.accept.some((rep) => rep.test(content))
    ) {
        rule.onAccepted && rule.onAccepted(item, record);
        return true;
    }

    //未匹配任何行为
    return false;
}

function createHandlerByOptions(optss: RegExpOption[][] | string[][]) {
    return (content: string) =>
        optss.some((opts) =>
            opts.every((opt) =>
                typeof opt === "string"
                    ? new RegExp(opt, "i").test(content)
                    : new RegExp(opt.expr, opt.flag).test(content)
            )
        );
}

export function createRule(
    config: Config,
    ruleName: string,
    ruleJSON: RuleJSON
): Rule {
    return {
        option: ruleJSON.option,
        accept: createHandlerByOptions(ruleJSON.accept),
        reject: createHandlerByOptions(ruleJSON.reject),
        async onAccepted(item, record) {
            console.log(
                `[pomelo]: accept ${item.title[0]} by [rule]:${ruleName}`
            );

            //记录
            if (config.record?.expire && record) {
                const recordUnit = record.accepted[item.title[0]];
                const secondStamp = Math.floor(Date.now() / 1000);
                //判断是否存在记录
                if (recordUnit) {
                    if (recordUnit.expired > secondStamp) {
                        //说明没过期,直接退出
                        return;
                    } else {
                        //记录过期,记录新缓存
                        record.accepted[item.title[0]] = {
                            expired: config.record.expire + secondStamp,
                        };
                    }
                } else {
                    //没有缓存记录,则记录缓存
                    record.accepted[item.title[0]] = {
                        expired: config.record.expire + secondStamp,
                    };
                }
            }

            //发送下载请求
            try {
                await postDownloadRequest(
                    config,
                    getUrlFromRSSItem(item),
                    this.option
                );
            } catch (error) {
                console.error(
                    `[pomelo]: post download request failed!\nitem: ${item.title[0]}\nerror: ${error}`
                );
            }
        },
        onRejected(item, record) {
            console.log(
                `[pomelo]: reject ${item.title[0]} by [rule]:${ruleName}`
            );
            //记录
            if (config.record?.expire && record) {
                const recordUnit = record.rejected[item.title[0]];
                const secondStamp = Math.floor(Date.now() / 1000);
                //判断是否存在记录
                if (recordUnit) {
                    if (recordUnit.expired > secondStamp) {
                        //说明没过期,直接退出
                        return;
                    } else {
                        //记录过期,记录新缓存
                        record.rejected[item.title[0]] = {
                            expired: config.record.expire + secondStamp,
                        };
                    }
                } else {
                    //没有缓存记录,则记录缓存
                    record.rejected[item.title[0]] = {
                        expired: config.record.expire + secondStamp,
                    };
                }
            }
        },
    };
}

//#endregion
