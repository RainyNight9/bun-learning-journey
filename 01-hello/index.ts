// 01-hello/index.ts
// 🎯 学习目标:体验 Bun 的第一个程序

// Bun 原生支持 TypeScript,无需安装 ts-node 或编译!
const greeting: string = "Hello, Bun! 🥟";
const version: string = Bun.version;

console.log(greeting);
console.log(`当前 Bun 版本: ${version}`);

// Bun 提供了一些独特的全局 API
console.log(`运行平台: ${process.platform}`);
console.log(`Node 兼容版本: ${process.versions.node}`);
console.log(`url: ${import.meta.url}`);
console.log(`Bun.env: ${JSON.stringify(Bun.env)}`);

// Bun.nanoseconds() - 高精度计时
const start = Bun.nanoseconds();
let sum = 0;
for (let i = 0; i < 1_000_000; i++) {
  sum += i;
}
const end = Bun.nanoseconds();

console.log(`\n💡 计算 100 万次累加`);
console.log(`结果: ${sum}`);
console.log(`耗时: ${((end - start) / 1_000_000).toFixed(2)} ms`);

// 💡 知识点:
// 1. 直接运行 .ts 文件,无需编译
// 2. Bun 全局对象提供了运行时 API
// 3. 完全兼容 Node.js 的 process 对象
