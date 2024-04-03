import { Config } from "./config";
import { PomeloRecord } from "./record";

export type PomeloHandler = (content: string) => boolean;
export interface Rule {
    name: string;
    resource?: Config["resource"];
    option: DownloadOption;
    accept?: PomeloHandler;
    reject?: PomeloHandler;
    onBeginMatch?: () => void;
    onAccepted?: (content: string, link: string, record?: PomeloRecord) => void;
    onRejected?: (content: string, link: string, record?: PomeloRecord) => void;
    onEndMatch?: () => void;
}

export type RuleMap = {
    [name in string]: RuleUnit;
};

export interface RegExpOption {
    expr: string;
    flag: string;
}
export interface RuleUnit {
    option: DownloadOption;
    resource: Config["resource"];
    accept: RuleHandlerOption;
    reject: RuleHandlerOption;
}

export type RuleHandlerOption =
    | RegExpOption[][]
    | string[][]
    | string
    | RegExpOption
    | PomeloHandler;

export type DownloadOption = {
    dir: string;
    host?: string;
    port?: string;
    token?: string;
};
