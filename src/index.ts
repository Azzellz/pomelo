import fs from "fs/promises";
import xmlJs from "xml2js";
import { matchRule } from "./rule";

async function main() {
    const xmlBuf = await fs.readFile("../source.xml");
    const targetJson = await xmlJs.parseStringPromise(xmlBuf.toString());
    targetJson.rss.channel.forEach((ch: any) => {
        ch.item.forEach((item: any) => {
            matchRule(item.title);
        });
    });
}

main();
