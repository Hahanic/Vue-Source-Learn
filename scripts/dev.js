// 这个文件会帮我们打包package.json下的模块，最终打包出js文件

// node dev.js 要打包的名字xxx -f 打包的格式

import minimist from "minimist";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import esbuild from "esbuild";

// node中名字的命令行参数
const args = minimist(process.argv.slice(2));

const target = args._[0] || "reactivity"; // 要打包的模块
const format = args.f || "esm"; // 打包的格式

const __filename = fileURLToPath(import.meta.url); // 获取文件绝对路径file: -> c:/user/.../dev.js
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url); // 在ESM模块中使用require

// 入口文件根据命令行提供的路径解析而来
const entry = resolve(__dirname, "../packages", target, "src/index.ts");
const pkg = require(`../packages/${target}/package.json`); // 读取对应模块的package.json

// 打包输出的目录
const outDir = resolve(__dirname, "../packages", target, "dist");

// 开始打包
esbuild.context({
  entryPoints: [entry], // 入口
  outfile: resolve(__dirname, `../packages/${target}/dist/index.js`), // 出口
  bundle: true, // 打包一起
  platform: 'browser',
  sourcemap: true, // 可调试源码
  format: format, // cjs esm iife
  globalName: pkg.buildOptions?.name, // 全局变量名字 只在iife下生效
}).then((ctx) => {
  console.log(`正在打包${target}模块，格式${format}`);
  // 监控入口文件持续打包
  return ctx.watch()
})