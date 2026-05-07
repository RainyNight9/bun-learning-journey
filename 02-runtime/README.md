# 02 - Runtime 运行时特性 ⚡

> 探索 Bun 运行时与 Node.js 的差异和优势

## 🎯 学习目标

- 掌握 Bun 原生 TypeScript 特性
- 学习顶层 `await` 写法
- 了解 Bun 内置的 Web API (`fetch`)
- 自动加载 `.env` 文件
- 使用 `import.meta` 获取模块信息

## ▶️ 运行

```bash
bun run index.ts
```

## 💡 关键知识点

### 1. 顶层 await
Bun 完全支持 ES 模块的顶层 `await`,无需放在 `async` 函数中:

```typescript
// ✅ Bun 中可以直接这样写
const data = await fetch("https://api.example.com/data");
```

### 2. 内置 fetch API
Bun 内置了与浏览器一致的 `fetch` API,**无需** 安装 `node-fetch` 或 `axios`:

```typescript
const res = await fetch(url);
const json = await res.json();
```

### 3. 自动加载 .env
Bun **自动** 加载 `.env` 文件到 `Bun.env` (或 `process.env`),无需 `dotenv` 包:

```typescript
const port = Bun.env.APP_PORT; // 自动读取 .env 中的值
```

支持的文件优先级:
- `.env.local` (本地覆盖,不应提交)
- `.env.development` / `.env.production`
- `.env`

### 4. Bun.sleep()
方便的异步等待 API:

```typescript
await Bun.sleep(1000); // 等待 1 秒
```

## 🧪 练习

1. 修改 `.env` 文件,添加更多变量并打印
2. 使用 `Bun.sleep()` 实现一个倒计时
3. 调用真实的 API (如 GitHub API) 获取数据
