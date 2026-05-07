// 02-runtime/index.ts
// 🎯 学习目标:体验 Bun 运行时的强大特性

// ============================================
// 1. 原生 TypeScript 类型支持
// ============================================
interface User {
  id: number;
  name: string;
  email: string;
}

const users: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

console.log("👥 用户列表:", users);

// ============================================
// 2. 顶层 await (Top-level await)
// ============================================
console.log("\n⏳ 模拟异步操作...");
await Bun.sleep(500);
console.log("✅ 完成!");

// ============================================
// 3. 内置 fetch API (浏览器风格)
// ============================================
console.log("\n🌐 测试内置 fetch API");
try {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
  const todo = await response.json();
  console.log("📝 获取的 TODO:", todo);
} catch (error) {
  console.log("⚠️  网络请求失败 (可能是网络限制)");
}

// ============================================
// 4. 环境变量 - .env 文件自动加载
// ============================================
console.log("\n🔑 环境变量:");
console.log(`APP_NAME: ${Bun.env.APP_NAME ?? "未设置"}`);
console.log(`APP_PORT: ${Bun.env.APP_PORT ?? "未设置"}`);

// ============================================
// 5. 高精度计时 - 性能测试
// ============================================
console.log("\n⚡ 性能测试:JSON 解析");
const largeJson = JSON.stringify({ data: Array(10000).fill({ name: "test", value: 42 }) });

const startTime = performance.now();
JSON.parse(largeJson);
const endTime = performance.now();

console.log(`解析耗时: ${(endTime - startTime).toFixed(3)} ms`);

// ============================================
// 6. import.meta - ES 模块元信息
// ============================================
console.log("\n📦 模块信息:");
console.log(`当前文件: ${import.meta.path}`);
console.log(`所在目录: ${import.meta.dir}`);
console.log(`是否为主模块: ${import.meta.main}`);


// 练习
console.log("=== 1) 读取 .env 变量 ===");
console.log("APP_NAME:", Bun.env.APP_NAME);
console.log("APP_PORT:", Bun.env.APP_PORT);
console.log("GITHUB_USER:", Bun.env.GITHUB_USER);

console.log("\n=== 2) Bun.sleep() 倒计时 ===");
for (let i = 5; i > 0; i--) {
  console.log(`${i}...`);
  await Bun.sleep(1000);
}
console.log("Go!");

console.log("\n=== 3) 调用 GitHub API ===");
const username = Bun.env.GITHUB_USER ?? "RainyNight9";
const res = await fetch(`https://api.github.com/users/${username}`);

if (!res.ok) {
  throw new Error(`GitHub API 请求失败: ${res.status} ${res.statusText}`);
}

const user = await res.json() as {
  login: string;
  public_repos: number;
  followers: number;
};

console.log(`用户: ${user.login}`);
console.log(`公开仓库: ${user.public_repos}`);
console.log(`关注者: ${user.followers}`);

export { };
