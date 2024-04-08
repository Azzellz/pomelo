import { Config } from "./config";
import { PomeloPlugin } from "./plugin";
import { PomeloRecord } from "./record";
import { PomeloRule, PomeloRuleUnit } from "./rule";

export type PomeloTaskContext = {} & PomeloCommonContext;

export type PomeloRuleContext = {
    ruleUnit: {
        name: string;
    } & PomeloRuleUnit;
} & PomeloCommonContext;

export type PomeloProcessContext = {
    mainResource: Promise<object>;
    rule: PomeloRule;
} & PomeloCommonContext;

export type PomeloCommonContext = {
    config: Config;
    record?: PomeloRecord;
    onlyRecord: boolean;
    intervalTimeCount?: () => void;
    saveRecord: () => void;
    recordItem: (key: keyof PomeloRecord, content: string) => void;
    deleteItem: (key: keyof PomeloRecord, content: string) => void;
    downloadMap: Record<string, boolean>; //映射下载情况
    plugins: PomeloPlugin[];
};
