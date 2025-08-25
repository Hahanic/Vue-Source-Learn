// 这个文件会帮我们打包package.json下的模块，最终打包出js文件

// node dev.js 要打包的名字xxx -f 打包的格式

import minimist from "minimist";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// node中名字的命令行参数
const args = minimist(process.argv.slice(2));

const target = args._[0] || "reactivity"; // 要打包的模块
const format = args.f || "esm"; // 打包的格式

const __filename = fileURLToPath(import.meta.url); // 获取文件绝对路径file: -> c:/user/.../dev.js
const __dirname = dirname(__filename);

// 入口文件根据命令行提供的路径解析而来
const entry = resolve(__dirname, "../packages", target, "src/index.ts");