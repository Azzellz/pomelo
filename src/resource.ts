import { successLog, errorLog } from "./log";
import { parseRSS } from "./parser";
import { matchRule } from "./rule";
import { getResource as _getResource } from "./api";
import { isMikananiRSS, isNyaaRSS, isShareAcgnxRSS } from "./utils";
import type { PomeloProcessContext } from "./models/context";

//根据不同的rss类型进行不同的处理
export async function processResource(context: PomeloProcessContext) {
    const { rule } = context;
    const resource = await getResource(context);
    await parseResource({ target: resource, ...context });
}

//获取资源
async function getResource(context: PomeloProcessContext) {
    const { mainResource, rule, config } = context;
    let resource = await mainResource;
    try {
        //针对每个规则
        if (
            rule.resource &&
            rule.resource.url &&
            rule.resource.url !== config.resource.url
        ) {
            successLog(
                "getting rss resources from " +
                    config.resource.url +
                    " by rule--" +
                    rule.name
            );
            console.time("1.get rss by rule--" + rule.name);
            resource = await _getResource(rule.resource);
            console.timeEnd("1.get rss by rule--" + rule.name);
        }
    } catch (error) {
        errorLog(
            `error in [step1]: getRSS of the [rule]:${rule.name}\nerror:${error}`
        );
    } finally {
        return resource;
    }
}

//解析资源并且进行matchRule
async function parseResource<T extends { target: object }>(
    context: PomeloProcessContext & T
) {
    const { rule, config, target, plugins } = context;
    try {
        plugins.forEach((p) => p.onMatchBegin?.());
        rule.onMatchBegin?.();

        //优先使用rule的resource选项
        const resource = rule.resource ? rule.resource : config.resource;
        //处理RSS
        if (
            resource.type === "rss-mikanani" ||
            resource.type === "rss-nyaa" ||
            resource.type === "rss-share-acgnx"
        ) {
            if (
                isMikananiRSS(target) ||
                isNyaaRSS(target) ||
                isShareAcgnxRSS(target)
            ) {
                if (resource.parser) {
                    await resource.parser(target, async (content, link) => {
                        await matchRule({ content, link, ...context });
                    });
                } else {
                    await parseRSS(target, async (content, link) => {
                        await matchRule({ content, link, ...context });
                    });
                }
            } else {
                throw "unsupported RSS feeds, please replace them with supported RSS feeds.";
            }
        } else if (
            resource.type === "other" &&
            typeof resource.parser === "function"
        ) {
            //自定义解析
            await resource.parser(target, async (content, link) => {
                await matchRule({ content, link, ...context });
            });
        } else {
            throw "please input right resource type! support type: rss-mikanani/rss-nyaa/rss-share-acgnx/other(need parser)";
        }

        plugins.forEach((p) => p.onMatchEnd?.());
        rule.onMatchEnd?.();
    } catch (error) {
        errorLog(
            `error in [step2]: processRSS of the [rule]:${rule.name}\nerror:${error}`
        );
    }
}
