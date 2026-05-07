# 04 - HTTP Server 🌐

> 使用 `Bun.serve` 构建高性能 HTTP 服务器

## 🎯 学习目标

- 掌握 `Bun.serve` API
- 处理不同 HTTP 方法 (GET/POST/PUT/DELETE)
- 解析 URL、查询参数、请求体
- 返回 HTML / JSON 响应
- 错误处理

## ▶️ 运行

```bash
bun run index.ts
# 或启用热重载
bun --hot run index.ts
```

访问 http://localhost:3000

## 🧪 测试各个路由

```bash
# GET 请求
curl http://localhost:3000/api/hello
curl "http://localhost:3000/api/echo?msg=你好"
curl http://localhost:3000/api/users

# POST 请求 (创建用户)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"David","age":30}'
```

## 💡 核心 API

### `Bun.serve(options)`

```typescript
const server = Bun.serve({
  port: 3000,              // 监听端口
  hostname: "0.0.0.0",     // 监听地址(可选)
  fetch(req) {             // 请求处理函数
    return new Response("Hello");
  },
  error(error) {           // 错误处理(可选)
    return new Response("Error", { status: 500 });
  },
});
```

### Request 对象 (Web 标准)

```typescript
req.method           // HTTP 方法
req.url              // 完整 URL
req.headers          // 请求头
await req.json()     // 解析 JSON body
await req.text()     // 获取文本 body
await req.formData() // 获取表单数据
```

### Response 对象

```typescript
// 文本响应
new Response("Hello");

// HTML 响应
new Response(html, {
  headers: { "Content-Type": "text/html" }
});

// JSON 响应 (推荐)
Response.json({ data: "value" });

// 带状态码
Response.json({ error: "Not Found" }, { status: 404 });

// 重定向
Response.redirect("/login", 302);
```

## ⚡ 热重载 (Hot Reload)

开发时使用 `--hot` 标志,代码修改后自动重启:

```bash
bun --hot run index.ts
```

## 🚀 性能数据

Bun 的 HTTP 服务器性能非常出色:
- **Node.js**: ~40,000 req/s
- **Deno**: ~60,000 req/s
- **Bun**: ~160,000 req/s ⚡ (4 倍于 Node.js)

## 🧪 练习

1. 添加一个 PUT 路由来更新用户
2. 添加一个 DELETE 路由来删除用户
3. 添加一个简单的日志中间件(记录请求时长)
4. 处理静态文件服务 (提示:使用 `Bun.file()`)
