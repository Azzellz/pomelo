import { writeFileSync } from "fs";
import { createRule, processRSS } from "./rule";
import { getRSS } from "./api";
import { loadConfig, loadRecord, parseInterval } from "./util";
import minimist from "minimist";
import { PomeloRecord } from "./models/record";
import { errorLog, successLog, warnLog } from "./log";
import { resolve, join } from "node:path";
import { RuleContext, TaskContext } from "./models/context";

async function task(context: TaskContext) {
    const { config, record } = context;
    //获取RSS并且记录耗时
    successLog("getting rss resources from " + config.rss.uri);
    console.time("1.get rss");
    let rss = await getRSS(config.rss);
    console.timeEnd("1.get rss");

    //遍历规则集
    //#region
    Object.entries(config.rules).forEach(async ([ruleName, ruleJSON]) => {
        const _context: RuleContext = {
            ruleUnit: {
                ...ruleJSON,
                name: ruleName,
            },
            ...context,
        };
        const rule = createRule(_context);
        //1.getRSS
        try {
            //针对每个规则的uri
            if (rule.option.uri && rule.option.uri !== config.rss.uri) {
                successLog(
                    "getting rss resources from " +
                        config.rss.uri +
                        " by rule--" +
                        rule.name
                );
                console.time("1.get rss by rule--" + rule.name);
                rss = await getRSS({
                    uri: rule.option.uri,
                });
                console.timeEnd("1.get rss by rule--" + rule.name);
            }
        } catch (error) {
            errorLog(
                `error in [step1]: getRSS of the [rule]:${ruleName}\nerror:${error}`
            );
        }
        //2.processing
        try {
            await processRSS(rss, rule, record);
        } catch (error) {
            errorLog(
                `error in [step2]: processRSS of the [rule]:${ruleName}\nerror:${error}`
            );
        }
    });
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
        let record =
            config.record || onlyRecord ? await loadRecord(path) : undefined;

        //第一次执行时更新一次__record,删除过期的记录
        //#region
        if (record) {
            const newAccepted: PomeloRecord["accepted"] = {};
            const _accepted = Object.entries(record.accepted);
            _accepted.forEach(([key, val]) => {
                const secondStamp = Math.floor(Date.now() / 1000);
                //保留没过期的RecordUnit
                if (val?.expired && val?.expired > secondStamp) {
                    newAccepted[key] = val;
                }
            });
            const newRejected: PomeloRecord["rejected"] = {};
            const _rejected = Object.entries(record.rejected);
            _rejected.forEach(([key, val]) => {
                const secondStamp = Math.floor(Date.now() / 1000);
                //保留没过期的RecordUnit
                if (val?.expired && val?.expired > secondStamp) {
                    newRejected[key] = val;
                }
            });
            successLog(
                `the record was updated successfully! acceptd: ${
                    _accepted.length
                }--->${Object.entries(newAccepted).length} rejected: ${
                    Object.entries(newRejected).length
                }--->${_rejected.length}`
            );
            record = { accepted: newAccepted, rejected: newRejected };
        }
        //#endregion

        //解析定时任务
        //#region
        const interval = parseInterval(config.interval || 0);
        const intervalTimeCount = (id: number) => {
            console.time("interval task--" + id);
            return () => console.timeEnd("interval task--" + id);
        };
        //#endregion

        //记录操作
        //#region
        const saveRecord = () => {
            if (!record) return;
            try {
                writeFileSync(
                    join(path + "/__record.json"),
                    JSON.stringify(record)
                );
            } catch (error) {
                errorLog(`error in saved record!\nerror:${error}`);
            }
        };
        const recordItem: RuleContext["recordItem"] = (key, content) => {
            if (!record) return;
            const secondStamp = Math.floor(Date.now() / 1000);
            //没有缓存记录,则记录缓存
            record[key][content] = {
                expired: config.record?.expire
                    ? config.record.expire + secondStamp
                    : false,
            };
        };
        //#endregion

        //上下文
        const context: TaskContext = {
            config,
            record,
            onlyRecord,
            intervalTimeCount: void 0,
            saveRecord,
            recordItem,
        };

        //绑定process回调
        //#region
        //中断信号处理
        const interuptHandler = () => {
            warnLog(
                "SIGINT event is triggered, the exit event callback will be executed soon."
            );
            // 在这里执行清理工作
            process.exit(); // 这会触发 exit 事件
        };
        process.on("SIGTERM", interuptHandler);
        process.on("SIGINT", interuptHandler);
        process.on("SIGABRT", interuptHandler);
        process.on("SIGQUIT", interuptHandler);
        process.on("SIGKILL", interuptHandler);
        process.on("exit", () => {
            successLog("stop task");
            console.timeEnd("all tasks");
            context.saveRecord();
        });
        //#endregion

        //任务调度
        //#region
        if (interval) {
            let id = 0;
            successLog(
                `start interval task, interval: ${config.interval}, current: ${id}`
            );
            context.intervalTimeCount = intervalTimeCount(id++);
            await task(context);

            setInterval(async () => {
                successLog(
                    `start interval task, interval: ${config.interval}, current: ${id}`
                );
                context.intervalTimeCount = intervalTimeCount(id++);
                await task(context);
                context.saveRecord(); //每次定时任务结束后都要保存一次
            }, interval);
        } else {
            console.time("all tasks");
            successLog("start once task");
            await task(context);
        }
        //#endregion
    } catch (error) {
        errorLog(error + "");
    }
}

main();
