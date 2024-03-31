import { readFile } from "fs/promises";
import { existsSync, writeFileSync } from "fs";
import { createRule, processRSS } from "./rule";
import { getRSS } from "./api";
import { Config } from "./models/config";
import { parseInterval } from "./util";
import { load as loadYaml } from "js-yaml";
import minimist from "minimist";
import { PomeloRecord } from "./models/record";
import { errorLog, successLog } from "./log";
import { resolve, join, relative } from "path";
import { platform } from "os";

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
        throw `failed to find pomelo.config.ts/pomelo.json/pomelo.yaml/pomelo.yml from ${path}, please use -d to specify the path of the dir to the configuration file.`;
    }
}

//加载记录文件
async function loadRecord(path: string): Promise<PomeloRecord> {
    const recordPath = path + "/__record.json";
    if (existsSync(recordPath)) {
        const record = (await import(recordPath)).default;
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

async function task(
    config: Config,
    record?: PomeloRecord,
    onlyRecord: boolean = false
) {
    let rss = await getRSS(config.rss);
    Object.entries(config.rules).forEach(async ([ruleName, ruleJSON]) => {
        const rule = createRule(config, ruleName, ruleJSON, onlyRecord);
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
    const dir = args.d === true ? "./" : args.d || "./";
    const isOnlyRecord = args.r === true;
    const isWindows =
        platform().includes("win32") || platform().includes("win64");

    //路径:要区分平台
    const path = isWindows ? relative(__dirname, dir) : resolve(__dirname, dir);

    try {
        //加载配置
        const config = await loadConfig(path);
        const record = config.record?.expire
            ? await loadRecord(path)
            : undefined;
        //解析定时任务
        const interval = parseInterval(config.interval || 0);
        if (interval) {
            setInterval(() => {
                successLog(`start interval task, interval:${config.interval}`);
                task(config, record, isOnlyRecord);
            }, interval);
        } else {
            console.time("task");
            successLog("start once task");
            task(config, record, isOnlyRecord);
        }
        process.on("exit", () => {
            successLog("stop task");
            console.timeEnd("task");
            try {
                writeFileSync(
                    join(path + "/__record.json"),
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
