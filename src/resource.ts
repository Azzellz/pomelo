import { successLog, errorLog } from "./log";
import { matchRule } from "./rule";
import { getResourceString } from "./api";
import type { PomeloProcessContext } from "./models/context";
import { PomeloPlugin } from "./models";

//根据不同的rss类型进行不同的处理
export async function processResource(context: PomeloProcessContext) {
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
            resource = await getResourceString(rule.resource);
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
async function parseResource<T extends { target: string }>(
    context: PomeloProcessContext & T
) {
    const { rule, config, target, plugins } = context;
    try {
        plugins.forEach((p) => p.onBeforeParse?.());
        rule.onBeforeParse?.();

        //优先使用rule的resource选项
        const options = rule.resource ? rule.resource : config.resource;

        let parser: PomeloPlugin["parser"] = options.parser;
        let worker: PomeloPlugin["worker"] = options.worker;
        plugins.forEach((p) => {
            parser = p.parser;
            worker = p.worker;
        });
        if (parser && worker) {
            const parsed = await parser(target);
            if (!parsed) throw "the parser dont return valid analytic product";
            await worker(parsed, async (content, link) => {
                await matchRule({ content, link, ...context });
            });
        } else {
            throw "please support right parser and worker!";
        }

        plugins.forEach((p) => p.onParsed?.());
        rule.onParsed?.();
    } catch (error) {
        errorLog(
            `error in [step2]: processRSS of the [rule]:${rule.name}\nerror:${error}`
        );
    }
}
