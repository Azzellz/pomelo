import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { createRule, processRSS } from "./rule";
import { getRSS } from "./api";
import { Config } from "./models/config";
import { parseInterval } from "./util";
import { load as loadYaml } from "js-yaml";
import minimist from "minimist";

async function loadConfig(path: string): Promise<Config> {
    if (existsSync(`${path}pomelo.config.ts`)) {
        //这里使用默认导出
        return (await import(`${path}pomelo.config.ts`)).default;
    } else if (existsSync(`${path}pomelo.json`)) {
        return await import(`${path}pomelo.json`);
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
        throw "[pomelo]: Failed to find pomelo.config.ts/pomelo.json/pomelo.yaml/pomelo.yml";
    }
}

async function task(config: Config) {
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
                `[pomelo]: Error in [step1]:getRSS of the [rule]:${ruleName}\nerror:${error}`
            );
        }
        //2.processing
        try {
            processRSS(rss, rule);
        } catch (error) {
            return console.error(
                `[pomelo]: Error in [step2]:processRSS of the [rule]:${ruleName}\nerror:${error}`
            );
        }
    });
}

async function main() {
    //解析命令行参数
    const args = minimist(process.argv.slice(2));
    const basePath = args.d || args.dir || "./";
    //加载配置
    const config = await loadConfig(basePath);
    //解析定时任务
    const interval = parseInterval(config.interval);
    if (interval) {
        setInterval(() => {
            console.log("[pomelo]:start interval task");
            task(config);
        }, interval);
    } else {
        console.log("[pomelo]:start once task");
        task(config);
    }
    process.on("exit", () => {
        console.log("[pomelo]:stop task");
    });
}

main();
