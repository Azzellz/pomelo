import axios from "axios";
import { readFile, writeFile } from "fs/promises";
import { parseStringPromise } from "xml2js";

//mikanami
function getMikanamiRSS() {
    axios.get("https://mikanani.me/RSS/Classic").then(async (res) => {
        await writeFile(
            "../templates/mikanami.json",
            JSON.stringify(await parseStringPromise(res.data as string))
        );
    });
}

//ShareAcgnx
function getShareAcgnxRSS() {
    axios.get("https://share.acgnx.se/rss.xml").then(async (res) => {
        await writeFile(
            "../templates/shareAcgnx.json",
            JSON.stringify(await parseStringPromise(res.data as string))
        );
    });
}

//Nyaa
function getNyaaRSS() {
    axios.get("https://nyaa.si/?page=rss").then(async (res) => {
        await writeFile(
            "../templates/nyaa.json",
            JSON.stringify(await parseStringPromise(res.data as string))
        );
    });
}

// getMikanamiRSS();
// getShareAcgnxRSS();
getNyaaRSS()
