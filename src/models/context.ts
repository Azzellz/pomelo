import { Config } from "./config";
import { PomeloRecord } from "./record";
import { RuleUnit } from "./rule";

export type TaskContext = {
    record?: PomeloRecord;
} & CommonContext;

export type RuleContext = {
    ruleUnit: {
        name: string;
    } & RuleUnit;
} & CommonContext;

type CommonContext = {
    config: Config;
    onlyRecord: boolean;
    intervalTimeCount?: () => void;
    saveRecord: () => void;
    recordItem: (key: keyof PomeloRecord, content: string) => void;
};
