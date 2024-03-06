import fs from "fs/promises";
import xmlJs from "xml2js";
import { matchRule } from "./rule";
import { Resource } from "./model";

async function main() {
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

main();
