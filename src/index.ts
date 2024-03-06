import fs from "fs/promises";
import xmlJs from "xml2js";
import { matchRule } from "./rule";
import { Resource } from "./model";
import config from "../pomelo.json";

async function task() {
    const xmlBuf = await fs.readFile("../source.xml");
    const resource: Resource = await xmlJs.parseStringPromise(
        xmlBuf.toString()
    );
    resource.rss.channel.forEach((ch) => {
        ch.item.forEach((item) => {
            matchRule(item);
        });
    });
}

const second = 60;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;

if (config.interval) {
    const id = setInterval(() => {
        console.log("[pomelo]:start interval task");
        task();
    }, config.interval);
    process.on("exit", () => {
        clearInterval(id);
        console.log("[pomelo]:stop interval task");
    });
} else {
    console.log("[pomelo]:start once task");
    task();
}
