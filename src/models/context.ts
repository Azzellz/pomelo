import { Config } from "./config";
import { PomeloRecord } from "./record";
import { RuleUnit } from "./rule";

export type TaskContext = {
    config: Config;
    record?: PomeloRecord;
    onlyRecord?: boolean;
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
