import { Config } from "./config";
import { PomeloRecord } from "./record";
import { RuleUnit } from "./rule";

export type TaskContext = {
    config: Config;
    record?: PomeloRecord;
    onlyRecord?: boolean;
    lastMD5: string; //上一份rss的md5
    intervalTimeCount?: () => void;
};

export type RuleContext = {
    config: Config;
    ruleUnit: {
        name: string;
    } & RuleUnit;
    onlyRecord: boolean;
    intervalTimeCount?: () => void;
};
