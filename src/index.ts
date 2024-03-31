import { readFile, writeFile } from "fs/promises";
import { existsSync, writeFileSync } from "fs";
import { createRule, processRSS } from "./rule";
import { getRSS } from "./api";
import { Config } from "./models/config";
import { parseInterval } from "./util";
import { load as loadYaml } from "js-yaml";
import minimist from "minimist";
import { PomeloRecord } from "./models/record";
import { errorLog, successLog } from "./log";
import { relative, resolve, join } from "path";

//加载配置文件,支持四种
async function loadConfig(path: string): Promise<Config> {
    const tsConfigPath = path + "/pomelo.config.ts";
    if (existsSync(tsConfigPath)) {
        //这里使用默认导出
        return (await import(tsConfigPath)).default;
    }

    const jsonConfigPath = path + "/pomelo.json";
    if (existsSync(jsonConfigPath)) {
        return (await import(jsonConfigPath)).default;
    }

    const yamlConfigPath = path + "/pomelo.yaml";
    if (existsSync(yamlConfigPath)) {
        const config = loadYaml(
            (await readFile(yamlConfigPath)).toString()
        ) as Config;
        return config;
    }

    const ymlConfigPath = path + "/pomelo.yml";
    if (existsSync(ymlConfigPath)) {
        const config = loadYaml(
            (await readFile(ymlConfigPath)).toString()
        ) as Config;
        return config;
    } else {
        throw "failed to find pomelo.config.ts/pomelo.json/pomelo.yaml/pomelo.yml, please use -d to specify the path of the dir to the configuration file.";
    }
}

//加载记录文件
async function loadRecord(path: string): Promise<PomeloRecord> {
    if (existsSync(`${path}/__record.json`)) {
        const record = (await import(`${path}/__record.json`)).default;
        return {
            accepted: {},
            rejected: {},
            ...record,
        };
    } else {
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
            return errorLog(
                `error in [step1]: getRSS of the [rule]:${ruleName}\nerror:${error}`
            );
        }
        //2.processing
        try {
            processRSS(rss, rule, record);
        } catch (error) {
            return errorLog(
                `error in [step2]: processRSS of the [rule]:${ruleName}\nerror:${error}`
            );
        }
    });
}

async function main() {
    //解析命令行参数
    const args = minimist(process.argv.slice(2));
    const _path = args.d || args.dir || "./";
    const relativePath = relative(__dirname, _path);
    const resolvePath = resolve(__dirname, _path);

    try {
        //加载配置
        const config = await loadConfig(relativePath);
        const record = config.record?.expire
            ? await loadRecord(relativePath)
            : undefined;
        //解析定时任务
        const interval = parseInterval(config.interval || 0);
        if (interval) {
            setInterval(() => {
                successLog(`start interval task, interval:${config.interval}`);
                task(config, record);
            }, interval);
        } else {
            successLog("start once task");
            task(config, record);
        }
        process.on("exit", () => {
            successLog("stop task");
            try {
                writeFileSync(
                    join(resolvePath + "/__record.json"),
                    JSON.stringify(record)
                );
            } catch (error) {
                errorLog(`error in saved record!\nerror:${error}`);
            }
        });
    } catch (error) {
        errorLog(error + "");
    }
}

main();
