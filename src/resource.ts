import { matchRule } from "./rule";
import type { PomeloProcessContext } from "./models/context";
import { PomeloPlugin } from "./models";

//根据不同的rss类型进行不同的处理
export async function processResource(context: PomeloProcessContext) {
    const { rule, config, resource, plugins } = context;
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
            const parsed = await parser(resource);
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
        throw `error in step2: process-resource of the [rule]:${rule.name}\nerror:${error}`;
    }
}
