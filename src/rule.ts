import { postDownloadRequest } from "./api";
import { Config } from "./models/config";
import { MikanamiItem } from "./models/mikanami-rss";
import { Rule, RegExpOption, RuleJSON } from "./models/rule";

export function matchRule(item: MikanamiItem, rule: Rule): boolean {
    //TODO 不同的源有不同的处理方式
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
    }

    //未匹配任何行为
    return false;
}

const commonReject = /sp|ova|oad|special|特別/i;

//creator
//#region
function createCommonAccept(keyword: string) {
    const replaced = keyword.replace(
        /[-\\/\\\\^$*+?.()|[\\]{}]/g,
        "\\\\{html}amp;"
    );
    return (content: string) => {
        const condition1 =
            new RegExp(replaced, "i").test(content) &&
            /Baha/i.test(content) &&
            /gj\\.y/i.test(content);
        if (condition1) {
            return true;
        }
        const condition2 =
            new RegExp(replaced, "i").test(content) &&
            /LoliHouse/i.test(content);
        return condition1 || condition2;
    };
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
            console.log("[pomelo]: Accept", ruleName);
            try {
                await postDownloadRequest(
                    config,
                    item.enclosure[0].$.url,
                    this.option
                );
            } catch (error) {
                console.error(
                    "[pomelo]: Post download request failed, target item: ",
                    item
                );
            }
        },
        onRejected() {
            console.log("[pomelo]: Reject", ruleName);
        },
    };
}

//#endregion
