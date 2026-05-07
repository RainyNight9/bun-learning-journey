// 08-bundler/src/index.ts
// 这是要被打包的入口文件
import { greet } from "./utils";
import { tips } from "./tips";

const message = greet("Bun Bundler");
console.log(message);

// 演示打包后的代码可以独立运行
console.log(`运行时: Bun ${Bun.version}`);
console.log(`打包时间: ${new Date().toISOString()}`);

// 练习: define 替换构建时常量
declare const __APP_ENV__: string;
declare const __FEATURE_REPORT__: boolean;

console.log(`构建环境: ${__APP_ENV__}`);
console.log(`提示数量: ${tips.length}`);

// 练习: splitting 场景(动态导入)
if (__FEATURE_REPORT__) {
  const { printBuildReport } = await import("./lazy-report");
  printBuildReport();
}
