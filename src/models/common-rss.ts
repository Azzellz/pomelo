import { MikanamiItem, MikanamiRSS } from "./mikanami-rss";
import { NyaaItem, NyaaRSS } from "./nyaa-rss";
import { ShareAcgnxItem, ShareAcgnxRSS } from "./shareAcgnx-rss";

export type SupportRSSUrl =
    | "https://mikanani.me/RSS/Classic"
    | "https://share.acgnx.se/rss.xml"
    | "https://nyaa.si/?page=rss";

export type SupportRSSName = "mikanani" | "share.acgnx" | "nyaa";

export type SupportRSS = MikanamiRSS | NyaaRSS | ShareAcgnxRSS;

export type SupportRSSItem = MikanamiItem | ShareAcgnxItem | NyaaItem;
