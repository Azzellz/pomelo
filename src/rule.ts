export function matchRule(content: string) {
    for (const rule of rules) {
        if (rule.match.test(content)) {
            rule.oper();
            return true;
        }
    }
    return false;
}

//Rules
interface Rule {
    name: string;
    match: RegExp;
    oper: Function;
}
const rule1: Rule = {
    name: "Mahou Shoujo ni Akogarete",
    match: /Mahou Shoujo ni Akogarete/gi,
    oper() {
        console.log("rule1 success! ", this.name);
    },
};
const rule2 = {
    name: "elicious in Dungeo",
    match: /elicious in Dungeo/gi,
    oper() {
        console.log("rule2 success", this.name);
    },
};
const rule3 = {
    name: "Mato Seihei no Slave",
    match: /Mato Seihei no Slave/gi,
    oper() {
        console.log("rule3 success", this.name);
    },
};
const rules: Rule[] = [rule1, rule2, rule3];
