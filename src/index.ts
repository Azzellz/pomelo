import { readFile } from "fs/promises";
import { existsSync } from "fs";
import yaml from "js-yaml";
import { createRule, matchRule } from "./rule";
import { getRSS } from "./api";
import { Config } from "./models/config";
import { MikanamiRSS } from "./models/mikanami-rss";

async function loadConfig(path: string): Promise<Config> {
    if (existsSync(`${path}pomelo.config.ts`)) {
        //这里使用默认导出
        return (await import(`${path}pomelo.config.ts`)).default;
    } else if (existsSync(`${path}pomelo.json`)) {
        return await import(`${path}pomelo.json`);
    } else if (existsSync(`${path}pomelo.yaml`)) {
        const config = yaml.load(
            (await readFile(`${path}pomelo.yaml`)).toString()
        ) as Config;
        return config;
    } else if (existsSync(`${path}pomelo.yml`)) {
        const config = yaml.load(
            (await readFile(`${path}pomelo.yml`)).toString()
        ) as Config;
        return config;
    } else {
        throw "[pomelo]: Failed to find pomelo.config.ts/pomelo.json/pomelo.yaml/pomelo.yml";
    }
}

function parseInterval(format: string | number): number {
    if (typeof format === "number") {
        return format;
    }

    const second = 60;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const value = parseInt(format.slice(format.length - 1));
    const unit = format[format.length - 1] as "s" | "m" | "h" | "d";
    switch (unit) {
        case "s":
            return second * value;
        case "m":
            return minute * value;
        case "h":
            return hour * value;
        case "d":
            return day * value;
        default:
            return 0;
    }
}

async function task(config: Config) {
    const resource = await getRSS<MikanamiRSS>(config.rss);
    Object.entries(config.rules).forEach(([ruleName, ruleJSON]) => {
        const rule = createRule(config, ruleName, ruleJSON);
        resource.rss.channel.forEach((ch) => {
            ch.item.forEach((item) => {
                matchRule(item, rule);
            });
        });
    });
}

async function main() {
    const config = await loadConfig("../");
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
