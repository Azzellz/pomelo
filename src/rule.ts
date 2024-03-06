import { createDownload } from "./download";
import { Item, Rule } from "./model";

export function matchRule(item: Item): boolean {
    const content = item.title[0];
    for (const rule of rules) {
        //拒绝条件匹配
        if (rule.reject) {
            if (typeof rule.reject === "function" && rule.reject(content)) {
                rule.onRejected && rule.onRejected(item);
                return false;
            } else if (
                rule.reject instanceof Array &&
                rule.reject.some((rep) => rep.test(content))
            ) {
                rule.onRejected && rule.onRejected(item);
                return false;
            }
        }

        //接受条件匹配
        if (typeof rule.accept === "function" && rule.accept(content)) {
            rule.onAccepted && rule.onAccepted(item);
            return true;
        } else if (
            rule.accept instanceof Array &&
            rule.accept.some((rep) => rep.test(content))
        ) {
            rule.onAccepted && rule.onAccepted(item);
            return true;
        }
    }
    //未匹配任何行为
    return false;
}

const commonReject = /sp|ova|oad|special|特別/i;

function createCommonAccept(keyword: string) {
    const replaced = keyword.replace(
        /[-\\/\\\\^$*+?.()|[\\]{}]/g,
        "\\\\{html}amp;"
    );
    return (content: string) => {
        const condition1 =
            new RegExp(replaced, "i").test(content) &&
            /Baha/i.test(content) &&
            /gj\\.y/i.test(content);
        if (condition1) {
            return true;
        }
        const condition2 =
            new RegExp(replaced, "i").test(content) &&
            /LoliHouse/i.test(content);
        return condition1 || condition2;
    };
}

//rules
//#region

const rule1: Rule = {
    name: "葬送的芙莉莲",
    accept: createCommonAccept("Frieren"),
    reject: [commonReject],
    onAccepted(item) {
        console.log("rule1 success", this.name);
    },
};
const rule2 = {
    name: "公主殿下，「拷问」的时间到了",
    accept: createCommonAccept("o jikan des"),
    reject: [commonReject],
    onAccepted() {
        console.log("rule2 success", this.name);
    },
};
const rule3 = {
    name: "我独自升级",
    accept: createCommonAccept("re dake level up na ke"),
    reject: [commonReject],
    onAccepted() {
        console.log("rule3 success", this.name);
    },
};
const rule4 = {
    name: "我内心的糟糕念头",
    accept: createCommonAccept("oku no Kokoro no Yabai Yats"),
    reject: [commonReject],
    onAccepted() {
        console.log("rule4 success", this.name);
    },
};
const rule5 = {
    name: "迷宫饭",
    accept: createCommonAccept("elicious in Dungeo"),
    reject: [commonReject],
    onAccepted() {
        console.log("rule5 success", this.name);
    },
};
const rule6 = {
    name: "憧憬成为魔法少女",
    accept: createCommonAccept("Mahou Shoujo ni Akogarete"),
    reject: [commonReject],
    onAccepted() {
        console.log("rule6 success", this.name);
    },
};
const rule7 = {
    name: "魔都精兵的奴隶",
    accept: createCommonAccept("Mato Seihei no Slave"),
    reject: [commonReject],
    onAccepted() {
        console.log("rule7 success", this.name);
    },
};
const rule8 = {
    name: "药师少女的独语",
    accept: createCommonAccept("药师少女"),
    reject: [commonReject],
    onAccepted() {
        console.log("rule8 success", this.name);
    },
};
const rule9 = {
    name: "不死不幸",
    accept: createCommonAccept("ndead Unluc"),
    reject: [commonReject],
    onAccepted() {
        console.log("rule9 success", this.name);
    },
};
const rule10 = {
    name: "香格里拉边境~粪作猎人向神作游戏发起挑战~",
    accept: createCommonAccept("Shangri"),
    reject: [commonReject],
    onAccepted() {
        console.log("rule10 success", this.name);
    },
};
const rule11 = {
    name: "新番 全搬运 未分类",
    accept: (content: string) => {
        return (
            /lolihouse/i.test(content) ||
            /Baha/i.test(content) ||
            /gj\\.y/i.test(content) ||
            /ani/i.test(content) ||
            /bilibili/i.test(content)
        );
    },
    reject: [/bdrip|合集/i],
    onAccepted() {
        console.log("rule11 success", this.name);
    },
};

const rules: Rule[] = [
    rule1,
    rule2,
    rule3,
    rule4,
    rule5,
    rule6,
    rule7,
    rule8,
    rule9,
    rule10,
    rule11,
];

//#endregion
