// 04-http-server/index.ts
// 🎯 学习目标:使用 Bun.serve 构建 HTTP 服务器

const server = Bun.serve({
  port: 3000,

  // fetch 函数处理所有请求
  async fetch(req) {
    const url = new URL(req.url);
    const method = req.method;

    console.log(`📥 ${method} ${url.pathname}`);

    // ============================================
    // 路由 1: 首页
    // ============================================
    if (url.pathname === "/") {
      return new Response(
        `
<!DOCTYPE html>
<html>
<head>
  <title>Bun HTTP Server</title>
  <style>
    body { font-family: sans-serif; padding: 40px; max-width: 600px; margin: auto; }
    h1 { color: #ff5722; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    a { color: #2196f3; }
  </style>
</head>
<body>
  <h1>🥟 Hello from Bun!</h1>
  <p>这是一个用 <code>Bun.serve</code> 构建的 HTTP 服务器</p>
  <h3>可用路由:</h3>
  <ul>
    <li><a href="/api/hello">GET /api/hello</a> - JSON 响应</li>
    <li><a href="/api/users">GET /api/users</a> - 用户列表</li>
    <li><a href="/api/echo?msg=hello">GET /api/echo?msg=hello</a> - 查询参数</li>
    <li>POST /api/users - 创建用户 (需要工具发送)</li>
  </ul>
</body>
</html>`,
        {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    // ============================================
    // 路由 2: JSON 响应
    // ============================================
    if (url.pathname === "/api/hello") {
      return Response.json({
        message: "Hello, Bun!",
        timestamp: Date.now(),
        runtime: `Bun ${Bun.version}`,
      });
    }

    // ============================================
    // 路由 3: 查询参数处理
    // ============================================
    if (url.pathname === "/api/echo") {
      const msg = url.searchParams.get("msg") ?? "No message";
      return Response.json({ echo: msg });
    }

    // ============================================
    // 路由 4: 用户列表 (GET)
    // ============================================
    if (url.pathname === "/api/users" && method === "GET") {
      const users = [
        { id: 1, name: "Alice", age: 28 },
        { id: 2, name: "Bob", age: 32 },
        { id: 3, name: "Charlie", age: 25 },
      ];
      return Response.json({ users, total: users.length });
    }

    // ============================================
    // 路由 5: 创建用户 (POST, 接收 JSON body)
    // ============================================
    if (url.pathname === "/api/users" && method === "POST") {
      try {
        const body = await req.json();
        return Response.json(
          {
            success: true,
            user: { id: Date.now(), ...body },
          },
          { status: 201 }
        );
      } catch (err) {
        return Response.json({ error: "Invalid JSON" }, { status: 400 });
      }
    }

    // ============================================
    // 404 - 未找到
    // ============================================
    return new Response("404 Not Found", { status: 404 });
  },

  // 错误处理
  error(error) {
    console.error("❌ 服务器错误:", error);
    return new Response("Internal Server Error", { status: 500 });
  },
});

console.log(`🚀 服务器启动: http://localhost:${server.port}`);
console.log(`💡 按 Ctrl+C 停止服务器\n`);
