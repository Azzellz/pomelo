import { createPomelo } from "./src";
import { resolve } from "path";
import minimist from "minimist";

//解析命令行参数
//#region
const args = minimist(process.argv.slice(2));
const onlyRecord = args.r === true || args.record === true;
const config = resolve(args.d === true ? "./" : args.d || "./");
//#endregion

createPomelo({ config, onlyRecord }).then((p) => p.task());
