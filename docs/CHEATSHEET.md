# 📚 Bun 学习笔记汇总

> 学习过程中的核心知识点整理

## 一、Bun 是什么?

**Bun** 是一个 **多合一 (all-in-one) 的 JavaScript 运行时和工具链**,由 [Jarred Sumner](https://github.com/Jarred-Sumner) 使用 **Zig** 语言开发,基于 **JavaScriptCore** 引擎(同 Safari)。

它想一站式取代:
- Node.js (运行时)
- npm / yarn / pnpm (包管理器)
- webpack / esbuild / vite (打包器)
- jest / vitest (测试运行器)
- nodemon (热重载)
- dotenv (环境变量加载)
- ts-node (TS 运行器)

## 二、Bun vs Node.js vs Deno

| 特性 | Node.js | Deno | **Bun** |
|:---|:---:|:---:|:---:|
| 引擎 | V8 | V8 | JavaScriptCore |
| 语言实现 | C++ | Rust | Zig |
| TypeScript | 需编译 | ✅ 原生 | ✅ 原生 |
| 包管理器 | npm (外置) | 去中心化 | ✅ 内置 |
| 打包器 | 无 | ✅ 内置 | ✅ 内置 |
| 测试运行器 | 无 (实验性) | ✅ 内置 | ✅ 内置 (Jest 兼容) |
| 启动速度 | 慢 | 中 | ⚡ 极快 |
| HTTP 性能 | 基准 | 1.5x | **4x** |
| npm 兼容 | ✅ | ⚠️ | ✅ |

## 三、核心 API 速查

### 3.1 运行时 (Runtime)

```typescript
Bun.version              // 版本号
Bun.env                  // 环境变量 (= process.env)
Bun.nanoseconds()        // 高精度时间戳
Bun.sleep(ms)            // 异步等待
Bun.which("node")        // 查找可执行文件路径
Bun.pathToFileURL(p)     // 路径转 URL
Bun.fileURLToPath(u)     // URL 转路径
```

### 3.2 HTTP 服务器

```typescript
const server = Bun.serve({
  port: 3000,
  fetch(req) { return new Response("Hello"); }
});
```

**进阶用法：**
```typescript
const server = Bun.serve({
  port: 3000,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);

    // 路由
    if (url.pathname === "/") {
      return new Response("Home");
    }

    if (url.pathname === "/api") {
      // JSON 响应
      return Response.json({ message: "Hello API" });
    }

    if (url.pathname === "/api/user" && req.method === "POST") {
      const body = await req.json();
      return Response.json({ received: body });
    }

    // 静态文件
    if (url.pathname.startsWith("/static")) {
      const path = `./public${url.pathname}`;
      const file = Bun.file(path);
      if (await file.exists()) {
        return new Response(file);
      }
    }

    return new Response("Not Found", { status: 404 });
  },
  error(error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
});

// CORS 中间件
function withCORS(handler: (req: Request) => Response | Promise<Response>) {
  return async (req: Request) => {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }
    const res = await handler(req);
    const newRes = new Response(res.body, res);
    newRes.headers.set("Access-Control-Allow-Origin", "*");
    return newRes;
  };
}
```

### 3.3 WebSocket

```typescript
const server = Bun.serve({
  fetch(req, server) {
    server.upgrade(req, { data: {...} });
  },
  websocket: {
    open(ws) {},
    message(ws, msg) {},
    close(ws) {}
  }
});
```

### 3.4 文件 I/O

```typescript
// 读
await Bun.file(path).text()
await Bun.file(path).json()
await Bun.file(path).arrayBuffer()
await Bun.file(path).bytes()
await Bun.file(path).exists()

// 写
await Bun.write(path, "content")
await Bun.write(path, { obj: "json" })
await Bun.write(path, await fetch(url))   // 下载文件
```

### 3.5 SQLite

```typescript
import { Database } from "bun:sqlite";
const db = new Database("db.sqlite");
db.run(sql);                          // 执行
db.query(sql).all();                  // 查所有
db.query(sql).get(...args);           // 查单条
db.prepare(sql).run(...args);         // 增/改/删
db.transaction(fn);                   // 事务
```

### 3.6 测试

```typescript
import { test, expect, describe, mock, beforeEach, afterEach, spyOn } from "bun:test";

test("name", () => { expect(x).toBe(y); });
describe("group", () => { /* tests */ });

const fn = mock((x) => x * 2);
```

**进阶测试：**
```typescript
// 异步测试
test("async", async () => {
  const result = await someAsyncFunction();
  expect(result).toBe("ok");
});

// 钩子函数
describe("group", () => {
  beforeEach(() => { /* 每个测试前 */ });
  afterEach(() => { /* 每个测试后 */ });
  
  test("test 1", () => {});
  test("test 2", () => {});
});

// Mock 进阶
const fetch = mock(() => Promise.resolve({ json: () => ({ data: 1 }) }));
expect(fetch).toHaveBeenCalled();
expect(fetch).toHaveBeenCalledTimes(1);
expect(fetch).toHaveBeenCalledWith("url");

// 快照测试
test("snapshot", () => {
  const data = { a: 1, b: 2 };
  expect(data).toMatchSnapshot();
});

// SpyOn
const obj = { method: () => "hello" };
const spy = spyOn(obj, "method");
obj.method();
expect(spy).toHaveBeenCalled();
spy.mockRestore();
```

### 3.7 打包

```typescript
await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "bun",
  minify: true,
});
```

**高级配置：**
```typescript
await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "browser", // 或 "node", "bun"
  format: "esm",    // 或 "cjs", "iife"
  splitting: true,  // 代码分割
  minify: true,
  sourcemap: "external",
  external: ["react", "react-dom"], // 外部依赖
  plugins: [],      // 自定义插件
  loader: {
    ".png": "file", // 文件加载器
    ".css": "text"
  }
});
```

### 3.8 Bun Shell

```typescript
import { $ } from "bun";

// 执行命令
const result = await $`ls -la`.text();

// 捕获输出
const files = await $`ls`.lines();
const { stdout, stderr, exitCode } = await $`echo hello`.quiet();

// 管道
await $`cat file.txt | grep "pattern"`.text();

// 环境变量
await $`echo $VAR`.env({ VAR: "value" });

// 工作目录
await $`pwd`.cwd("/path/to/dir");

// 输入
await $`wc -l`.stdin("hello\nworld");
```

### 3.9 进程管理

```typescript
// 启动子进程
const proc = Bun.spawn(["echo", "hello"]);
const text = await new Response(proc.stdout).text();

// 带选项
const proc = Bun.spawn(["npm", "install"], {
  cwd: "./project",
  env: { ...process.env, NODE_ENV: "production" },
  onExit(proc, exitCode, signalCode, error) {
    console.log("进程退出");
  }
});

// 等待完成
await proc.exited;
```

### 3.10 JSX/TSX

```typescript
// bun 原生支持 JSX/TSX
function App() {
  return <div>Hello Bun</div>;
}

// 服务端渲染
Bun.serve({
  fetch() {
    return new Response(<App />, {
      headers: { "Content-Type": "text/html" }
    });
  }
});
```

### 3.11 环境变量

```typescript
// 读取环境变量
Bun.env.NODE_ENV;
Bun.env.API_KEY;

// 自动加载 .env 文件
// .env, .env.local, .env.{NODE_ENV}, .env.{NODE_ENV}.local (优先级从低到高)

// 手动加载
await Bun.load(".env.development");
```

### 3.12 插件系统

```typescript
import { plugin } from "bun";

plugin({
  name: "my-plugin",
  setup(build) {
    build.onLoad({ filter: /\.txt$/ }, async (args) => {
      const text = await Bun.file(args.path).text();
      return {
        contents: `export default ${JSON.stringify(text)}`,
        loader: "js",
      };
    });
  },
});
```

## 四、命令行速查

### 运行
```bash
bun <file>                    # 运行文件
bun run <script>              # 运行 package.json 脚本
bun --hot run <file>          # 热重载模式
bun --watch run <file>        # 文件变化自动重启
```

### 包管理
```bash
bun install                   # 安装依赖
bun add <pkg>                 # 添加
bun add -d <pkg>              # 开发依赖
bun add -g <pkg>              # 全局
bun remove <pkg>              # 移除
bun update                    # 更新
bun outdated                  # 查看过时
bun pm ls                     # 列出所有依赖
```

### 项目初始化
```bash
bun init                      # 初始化项目
bun create <template>         # 从模板创建
```

### 测试
```bash
bun test                      # 运行所有测试
bun test --watch              # 监听模式
bun test --coverage           # 覆盖率
```

### 打包
```bash
bun build <entry>             # 打包
bun build <entry> --compile   # 编译成可执行文件
```

### 其他
```bash
bun x <pkg>                   # 相当于 npx
bun repl                      # 进入 REPL
bun --help                    # 帮助
```

## 五、常见坑与解决方案

### 坑 1: PATH 未生效
安装后提示 `bun: command not found`:
```bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
# 并写入 ~/.bashrc 或 ~/.zshrc
```

### 坑 2: TypeScript 类型错误
如果 IDE 提示 `Cannot find name 'Bun'`:
```bash
bun add -d @types/bun
```

### 坑 3: `node:xxx` 模块
Bun 兼容 Node.js 模块,推荐使用 `node:` 前缀:
```typescript
import fs from "node:fs";      // ✅ 推荐
import fs from "fs";           // ⚠️ 可能有歧义
```

### 坑 4: Windows 某些包不兼容
Bun 在 Windows 上的支持在持续完善,遇到问题可以:
- 使用 WSL
- 或使用 Node.js 运行有问题的包

## 六、性能对比速查

| 场景 | Bun 相对速度 |
|:---|:---:|
| 启动速度 | 4x (vs Node) |
| HTTP 吞吐量 | 4x (vs Node) |
| WebSocket 连接数 | 7x (vs `ws`) |
| 文件读取 | 10x (vs fs) |
| SQLite | 3-6x (vs better-sqlite3) |
| 测试运行 | 13x (vs Jest) |
| 打包速度 | 略快于 esbuild |
| 包安装 | 25x (vs npm) |

## 七、推荐的 Bun 框架

- **[Elysia](https://elysiajs.com/)** - Bun 原生,类型安全的 Web 框架
- **[Hono](https://hono.dev/)** - 超快、超轻量、多运行时支持
- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript-first ORM

## 八、最佳实践

### 8.1 代码风格

```typescript
// ✅ 使用 node: 前缀
import fs from "node:fs";
import path from "node:path";

// ✅ 使用 Bun 原生 API
const content = await Bun.file("file.txt").text();

// ❌ 避免混用
const content = await fs.promises.readFile("file.txt", "utf-8");
```

### 8.2 性能优化

```typescript
// ✅ 使用 Bun.file 而不是 fs
const file = Bun.file("large-file.txt");

// ✅ 流式处理大文件
const stream = file.stream();

// ✅ 使用 Bun.spawn 而不是 child_process
const proc = Bun.spawn(["cmd"]);
```

### 8.3 项目结构推荐

```
my-project/
├── src/
│   ├── index.ts
│   └── utils/
├── tests/
│   └── *.test.ts
├── public/
│   └── static/
├── .env
├── .env.local
├── bun.lockb
├── package.json
└── tsconfig.json
```

## 九、部署指南

### 9.1 编译为可执行文件

```bash
# 编译
bun build ./src/index.ts --compile --outfile myapp

# 运行
./myapp
```

### 9.2 Docker 部署

```dockerfile
FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --production
COPY . .
EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
```

### 9.3 生产环境配置

```typescript
const server = Bun.serve({
  port: Bun.env.PORT || 3000,
  hostname: "0.0.0.0",
  fetch(req) {
    return new Response("Production ready!");
  }
});
```

## 十、调试技巧

### 10.1 使用 --inspect

```bash
# 启动调试模式
bun --inspect index.ts

# 等待调试器连接
bun --inspect-brk index.ts
```

### 10.2 日志调试

```typescript
console.log("普通日志");
console.error("错误日志");
console.warn("警告");
console.debug("调试");

// 带时间戳
console.time("label");
// ... 代码 ...
console.timeEnd("label");
```

### 10.3 调试器

在 VS Code 中创建 `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "bun",
      "request": "launch",
      "name": "Bun: Debug",
      "program": "${workspaceFolder}/src/index.ts",
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

## 十一、学习资源

- 📖 [官方文档](https://bun.sh/docs)
- 📖 [中文文档](https://www.bunjs.cn/docs/quickstart)
- 💬 [Discord 社区](https://bun.sh/discord)
- 🐙 [GitHub](https://github.com/oven-sh/bun)
- 📦 [Elysia 框架](https://elysiajs.com/)
- 📦 [Hono 框架](https://hono.dev/)
- 📦 [Drizzle ORM](https://orm.drizzle.team/)

---

> **记住**:Bun 是一个快速迭代的项目,官方文档永远是最准确的参考。
