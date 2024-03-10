import { readFile, writeFile } from "fs/promises";
import { existsSync, writeFileSync } from "fs";
import { createRule, processRSS } from "./rule";
import { getRSS } from "./api";
import { Config } from "./models/config";
import { parseInterval } from "./util";
import { load as loadYaml } from "js-yaml";
import minimist from "minimist";
import { PomeloRecord } from "./models/record";

async function loadConfig(path: string): Promise<Config> {
    if (existsSync(`${path}pomelo.config.ts`)) {
        //这里使用默认导出
        return (await import(`${path}pomelo.config.ts`)).default;
    } else if (existsSync(`${path}pomelo.json`)) {
        return (await import(`${path}pomelo.json`)).default;
    } else if (existsSync(`${path}pomelo.yaml`)) {
        const config = loadYaml(
            (await readFile(`${path}pomelo.yaml`)).toString()
        ) as Config;
        return config;
    } else if (existsSync(`${path}pomelo.yml`)) {
        const config = loadYaml(
            (await readFile(`${path}pomelo.yml`)).toString()
        ) as Config;
        return config;
    } else {
        throw "[pomelo]: failed to find pomelo.config.ts/pomelo.json/pomelo.yaml/pomelo.yml, please use -d to specify the path of the dir to the configuration file.";
    }
}

async function loadRecord(path: string): Promise<PomeloRecord> {
    if (existsSync(`${path}__record.json`)) {
        return (await import(`${path}__record.json`)).default;
    } else {
        //配置了record选项但是路径没有这个文件,那么返回一个空record
        return {
            accepted: {},
            rejected: {},
        };
    }
}

async function task(config: Config, record?: PomeloRecord) {
    let rss = await getRSS(config.rss);
    Object.entries(config.rules).forEach(async ([ruleName, ruleJSON]) => {
        const rule = createRule(config, ruleName, ruleJSON);
        //1.getRSS
        try {
            rule.option.uri &&
                rule.option.uri !== config.rss.uri &&
                (rss = await getRSS({ uri: rule.option.uri }));
        } catch (error) {
            return console.error(
                `[pomelo]: error in [step1]:getRSS of the [rule]:${ruleName}\nerror:${error}`
            );
        }
        //2.processing
        try {
            processRSS(rss, rule, record);
        } catch (error) {
            return console.error(
                `[pomelo]: error in [step2]:processRSS of the [rule]:${ruleName}\nerror:${error}`
            );
        }
    });
}

async function main() {
    //解析命令行参数
    const args = minimist(process.argv.slice(2));
    const basePath = args.d || args.dir || "./";
    //加载配置
    try {
        const config = await loadConfig(basePath);
        const record = config.record?.expire
            ? await loadRecord(basePath)
            : undefined;
        //解析定时任务
        const interval = parseInterval(config.interval);
        if (interval) {
            setInterval(() => {
                console.log(
                    `[pomelo]: start interval task, interval:${config.interval}`
                );
                task(config, record);
            }, interval);
        } else {
            console.log("[pomelo]: start once task");
            task(config, record);
        }
        process.on("exit", () => {
            console.log("[pomelo]: stop task");
            try {
                writeFileSync(
                    basePath + "__record.json",
                    JSON.stringify(record)
                );
            } catch (error) {
                console.error(
                    `[pomelo]: error in saved record!\nerror:${error}`
                );
            }
        });
    } catch (error) {
        console.error(error);
    }
}

main();
