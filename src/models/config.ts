import { PomeloRuleMap } from "./rule";

export interface PomeloConfig {
    interval?: number | string;
    record?: {
        expire: number | string;
    };
    resource: {
        url: string;
        parser?: (str: string) => object | Promise<object> | undefined | null; //将字符串解析成合法js对象
        worker?: (
            resource: object,
            handler: (content: string, link: string) => void | Promise<void>
        ) => void | Promise<void>; //处理解析后的对象
    };
    aria2: {
        env: boolean;
        host: string;
        port: string;
        token: string;
    };
    rules: PomeloRuleMap;
}
