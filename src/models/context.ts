import { Config } from "./config";
import { PomeloRecord } from "./record";
import { Rule, RuleUnit } from "./rule";

export type TaskContext = {} & CommonContext;

export type RuleContext = {
    ruleUnit: {
        name: string;
    } & RuleUnit;
} & CommonContext;

export type ProcessContext = {
    mainResource: Promise<any>;
    rule: Rule;
} & CommonContext;

export type CommonContext = {
    config: Config;
    record?: PomeloRecord;
    onlyRecord: boolean;
    intervalTimeCount?: () => void;
    saveRecord: () => void;
    recordItem: (key: keyof PomeloRecord, content: string) => void;
};
