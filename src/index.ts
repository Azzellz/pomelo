import { resolve } from "path";
import { writeFileSync } from "fs";
import { join } from "path";
import { getResource, postDownloadRequest } from "./api";
import { errorLog, successLog, warnLog } from "./log";
import type {
    PomeloTaskContext,
    Config,
    PomeloProcessContext,
    PomeloRuleContext,
    PomeloRecord,
    PomeloPlugin,
    PomeloDownloadOption,
} from "./models";
import { processResource } from "./resource";
import { createRule } from "./rule";
import {
    checkConfig,
    loadConfig,
    loadRecord,
    parseToMillisecond,
} from "./utils";

async function _init({
    config,
    record,
    onlyRecord,
}: {
    config: Config | string;
    record?: PomeloRecord | string;
    onlyRecord: boolean;
}) {
    try {
        //解析路径,record路径默认与config路径一致
        //#region
        const configPath =
            typeof config === "string" ? resolve(config) : resolve(".");

        const recordPath =
            typeof record === "string" ? resolve(record) : configPath;
        //#endregion

        //加载配置和记录
        //#region
        const _config =
            typeof config === "string"
                ? checkConfig(await loadConfig(configPath))
                : checkConfig(config);

        let _record: PomeloRecord | undefined = void 0;
        if (_config.record) {
            if (typeof record === "string" || !record) {
                _record = await loadRecord(recordPath);
            } else {
                _record = record;
            }
        }

        //#endregion

        //第一次执行时更新一次__record,删除过期的记录
        //#region
        if (_record) {
            const newAccepted: PomeloRecord["accepted"] = {};
            const _accepted = Object.entries(_record.accepted);
            _accepted.forEach(([key, val]) => {
                const secondStamp = Math.floor(Date.now() / 1000);
                //保留没过期的RecordUnit
                if (val?.expired && val?.expired > secondStamp) {
                    newAccepted[key] = val;
                }
            });
            const newRejected: PomeloRecord["rejected"] = {};
            const _rejected = Object.entries(_record.rejected);
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
            _record = { accepted: newAccepted, rejected: newRejected };
        }
        //#endregion

        //解析定时任务
        //#region
        const interval = parseToMillisecond(_config.interval || 0);
        const intervalTimeCount = (id: number) => {
            console.time("interval task--" + id);
            return () => console.timeEnd("interval task--" + id);
        };
        //#endregion

        //记录操作
        //#region
        //保存记录
        const saveRecord: PomeloRuleContext["saveRecord"] = () => {
            if (!_record) return;
            //先清洗一遍record
            let validRecord: PomeloRecord = {
                accepted: {},
                rejected: {},
            };
            Object.entries(_record.accepted).forEach(([k, v]) => {
                if (v) {
                    validRecord.accepted[k] = v;
                }
            });
            Object.entries(_record.rejected).forEach(([k, v]) => {
                if (v) {
                    validRecord.rejected[k] = v;
                }
            });
            try {
                writeFileSync(
                    join(configPath + "/__record.json"),
                    JSON.stringify(_record)
                );
            } catch (error) {
                errorLog(`error in saved record!\nerror:${error}`);
            }
        };
        //删除记录item
        const deleteItem: PomeloRuleContext["deleteItem"] = (key, content) => {
            if (!_record) return;
            _record[key][content] = void 0;
        };
        //记录item
        const recordItem: PomeloRuleContext["recordItem"] = (key, content) => {
            if (!_record) return;
            const secondStamp = Math.floor(Date.now() / 1000);
            //没有缓存记录,则记录缓存
            _record[key][content] = {
                expired: _config.record?.expire
                    ? parseToMillisecond(_config.record.expire) + secondStamp
                    : false,
            };
        };
        //#endregion

        //封装对象上下文
        //#region
        const context: PomeloTaskContext = {
            config: _config,
            record: _record,
            plugins: [],
            intervalTimeCount: void 0,
            downloadMap: {},
            onlyRecord,
            saveRecord,
            recordItem,
            deleteItem,
        };
        //#endregion

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
            return {
                task: async () => {
                    let id = 0;
                    successLog(
                        `start interval task, interval: ${_config.interval}, current: ${id}`
                    );
                    context.intervalTimeCount = intervalTimeCount(id++);
                    await _task(context);

                    setInterval(async () => {
                        successLog(
                            `start interval task, interval: ${_config.interval}, current: ${id}`
                        );
                        context.intervalTimeCount = intervalTimeCount(id++);
                        await _task(context);
                        context.saveRecord(); //每次定时任务结束后都要保存一次
                    }, interval);
                },
                context,
            };
        } else {
            return {
                task: async () => {
                    console.time("all tasks");
                    successLog("start once task");
                    await _task(context);
                },
                context,
            };
        }
        //#endregion
    } catch (error) {
        errorLog(error + "");
        return void 0;
    }
}

async function _task(context: PomeloTaskContext) {
    const { config } = context;

    //获取RSS并且记录耗时
    successLog("getting rss resources from " + config.resource.url);
    console.time("1.get rss");
    const mainResource = getResource(config.resource).then((res) => {
        console.timeEnd("1.get rss");
        return res;
    });

    //遍历规则集
    //#region
    Object.entries(config.rules).forEach(async ([ruleName, ruleJSON]) => {
        //rule
        const ruleContext: PomeloRuleContext = {
            ruleUnit: {
                ...ruleJSON,
                name: ruleName,
            },
            ...context,
        };
        const rule = createRule(ruleContext);
        //process
        const processContext: PomeloProcessContext = {
            mainResource,
            rule,
            ...context,
        };
        await processResource(processContext);
    });
}

export async function createPomelo({
    config,
    record,
    onlyRecord = false,
}: {
    config: Config | string;
    record?: PomeloRecord | string;
    onlyRecord?: boolean;
}) {
    try {
        const result = await _init({ config, record, onlyRecord });
        if (!result) throw "error in createPomelo:";
        return {
            task: result.task,
            use(plugin: PomeloPlugin) {
                result.context.plugins.push(plugin);
            },
        };
    } catch (error) {
        throw "error in createPomelo! " + error;
    }
}

export default createPomelo;
