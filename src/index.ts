import { readFile } from "fs/promises";
import { existsSync, writeFileSync } from "fs";
import { createRule, processRSS } from "./rule";
import { getRSS } from "./api";
import { Config } from "./models/config";
import { parseInterval } from "./util";
import { load as loadYaml } from "js-yaml";
import minimist from "minimist";
import { PomeloRecord } from "./models/record";
import { errorLog, successLog, warnLog } from "./log";
import { resolve, join, relative } from "path";
import { platform } from "os";
import { createHash } from "crypto";

//loader
//#region

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

//#endregion

async function task({
    config,
    record,
    onlyRecord = false,
    lastMD5,
}: {
    config: Config;
    record?: PomeloRecord;
    onlyRecord?: boolean;
    lastMD5: string; //上一份rss的md5
}): Promise<string> {
    try {
        let rss = await getRSS(config.rss);
        //检查md5,如果两次相同就不更新了
        const md5 = createHash("md5").update(JSON.stringify(rss)).digest("hex");
        if (lastMD5 && lastMD5 === md5) {
            warnLog("rss resource has not been updated, skip this task.");
            return md5;
        }
        //遍历规则集
        Object.entries(config.rules).forEach(async ([ruleName, ruleJSON]) => {
            const rule = createRule(config, ruleName, ruleJSON, onlyRecord);
            //1.getRSS
            try {
                //针对每个规则的uri
                if (rule.option.uri && rule.option.uri !== config.rss.uri) {
                    rss = await getRSS({
                        uri: rule.option.uri,
                    });
                }
            } catch (error) {
                errorLog(
                    `error in [step1]: getRSS of the [rule]:${ruleName}\nerror:${error}`
                );
            }
            //2.processing
            try {
                processRSS(rss, rule, record);
            } catch (error) {
                errorLog(
                    `error in [step2]: processRSS of the [rule]:${ruleName}\nerror:${error}`
                );
            }
        });
        return md5;
    } catch (error) {
        return "";
    }
}

async function main() {
    //解析命令行参数
    const args = minimist(process.argv.slice(2));
    const dir = args.d === true ? "./" : args.d || "./";
    const onlyRecord = args.r === true || args.record === true;
    //路径:要区分平台
    const path = resolve(dir);
    try {
        //加载配置
        const config = await loadConfig(path);
        const record =
            config.record || onlyRecord ? await loadRecord(path) : undefined;

        //解析定时任务
        const interval = parseInterval(config.interval || 0);
        const lastMD5 = "";
        //上下文
        const context = { config, record, onlyRecord, lastMD5 };

        if (interval) {
            successLog(`start interval task, interval: ${config.interval}`);
            context.lastMD5 = await task(context);
            setInterval(async () => {
                successLog(`start interval task, interval: ${config.interval}`);
                context.lastMD5 = await task(context);
            }, interval);
        } else {
            console.time("task");
            successLog("start once task");
            context.lastMD5 = await task(context);
        }
        process.on("exit", () => {
            successLog("stop task");
            console.timeEnd("task");
            if (!record) return;
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
