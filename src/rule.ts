import { postDownloadRequest } from "./api";
import { SupportRSS, SupportRSSItem } from "./models/common-rss";
import { Config } from "./models/config";
import { Rule, RegExpOption, RuleJSON } from "./models/rule";
import {
    getUrlFromRSSItem,
    isMikananiRSS,
    isNyaaRSS,
    isShareAcgnxRSS,
} from "./util";

//根据不同的rss类型进行不同的处理
export function processRSS(rss: SupportRSS, rule: Rule) {
    if (isMikananiRSS(rss)) {
        rss.rss.channel.forEach((ch) => {
            ch.item.forEach((item) => {
                matchRule(item, rule);
            });
        });
    } else if (isNyaaRSS(rss)) {
        rss.rss.channel.forEach((ch) => {
            ch.item.forEach((item) => {
                matchRule(item, rule);
            });
        });
    } else if (isShareAcgnxRSS(rss)) {
        rss.rss.channel.forEach((ch) => {
            ch.item.forEach((item) => {
                matchRule(item, rule);
            });
        });
    } else {
        throw "Unsupported RSS feeds, please replace them with supported RSS feeds.";
    }
}

export function matchRule(item: SupportRSSItem, rule: Rule): boolean {
    const content = item.title[0];

    //先匹配拒绝条件
    if (rule.reject) {
        if (typeof rule.reject === "function" && rule.reject(content)) {
            rule.onRejected && rule.onRejected(item);
            return false;
        } else if (
            rule.reject instanceof Array &&
            rule.reject.some((rep) => rep.test(content))
        ) {
            rule.onRejected && rule.onRejected(item);
            return false;
        } else {
        }
    }

    //再匹配接受条件
    if (typeof rule.accept === "function" && rule.accept(content)) {
        rule.onAccepted && rule.onAccepted(item);
        return true;
    } else if (
        rule.accept instanceof Array &&
        rule.accept.some((rep) => rep.test(content))
    ) {
        rule.onAccepted && rule.onAccepted(item);
        return true;
    } else {
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
        async onAccepted(item) {
            console.log(
                `[pomelo]: Accept ${item.title[0]} by [rule]:${ruleName}`
            );
            try {
                await postDownloadRequest(
                    config,
                    getUrlFromRSSItem(item),
                    this.option
                );
            } catch (error) {
                console.error(
                    `[pomelo]: Post download request failed!\nitem: ${item.title[0]}\nerror: ${error}`
                );
            }
        },
        onRejected(item) {
            console.log(
                `[pomelo]: Reject ${item.title[0]} by [rule]:${ruleName}`
            );
        },
    };
}

//#endregion
