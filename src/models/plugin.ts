import { PomeloConfig } from "./config";

export type PomeloPlugin = {
    name?: string;
    onAccepted?: (this: PomeloPlugin, content: string, link: string) => void;
    onRejected?: (this: PomeloPlugin, content: string, link: string) => void;
    onBeforeParse?: (this: PomeloPlugin) => void;
    onParsed?: (this: PomeloPlugin) => void;
    parser?: PomeloConfig["resource"]["parser"];
    worker?: PomeloConfig["resource"]["worker"];
};
