// 08-bundler/src/index.ts
// 这是要被打包的入口文件
import { greet } from "./utils";

const message = greet("Bun Bundler");
console.log(message);

// 演示打包后的代码可以独立运行
console.log(`运行时: Bun ${Bun.version}`);
console.log(`打包时间: ${new Date().toISOString()}`);
