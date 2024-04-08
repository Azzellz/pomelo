import { Config } from "./config";
import { PomeloRecord } from "./record";

export type PomeloHandler = (content: string) => boolean;
export interface PomeloRule {
    name: string;
    resource?: Config["resource"];
    option: PomeloDownloadOption;
    accept?: PomeloHandler;
    reject?: PomeloHandler;
    onMatchBegin?: () => void;
    onMatchEnd?: () => void;
    onAccepted?: (content: string, link: string, record?: PomeloRecord) => Promise<void>;
    onRejected?: (content: string, link: string, record?: PomeloRecord) => void;
}

export type PomeloRuleMap = {
    [name in string]: PomeloRuleUnit;
};

export interface PomeloRegExp {
    expr: string;
    flag: string;
}
export interface PomeloRuleUnit {
    option: PomeloDownloadOption;
    resource: Config["resource"];
    accept: RuleHandlerOption;
    reject: RuleHandlerOption;
}

export type RuleHandlerOption =
    | PomeloRegExp[][]
    | string[][]
    | string
    | PomeloRegExp
    | PomeloHandler;

export type PomeloDownloadOption = {
    dir: string;
    host?: string;
    port?: string;
    token?: string;
};
