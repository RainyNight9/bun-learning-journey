// 04-http-server/index.ts
// 🎯 学习目标:使用 Bun.serve 构建 HTTP 服务器

type User = { id: number; name: string; age: number };

const users: User[] = [
  { id: 1, name: "Alice", age: 28 },
  { id: 2, name: "Bob", age: 32 },
  { id: 3, name: "Charlie", age: 25 },
];

const server = Bun.serve({
  port: 3000,

  // fetch 函数处理所有请求
  async fetch(req) {
    const start = performance.now();
    const url = new URL(req.url);
    const method = req.method;

    console.log(`📥 ${method} ${url.pathname}`);

    try {
      // ============================================
      // 路由 0: 静态文件服务
      // ============================================
      if (url.pathname.startsWith("/static/")) {
        const filePath = `./public/${url.pathname.replace("/static/", "")}`;
        const file = Bun.file(filePath);

        if (await file.exists()) {
          return new Response(file);
        }
        return new Response("Static file not found", { status: 404 });
      }

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
    <li><a href="/playground">POST /api/users</a> - 创建用户(交互测试页)</li>
    <li><a href="/playground">PUT /api/users/:id</a> - 更新用户(交互测试页)</li>
    <li><a href="/playground">DELETE /api/users/:id</a> - 删除用户(交互测试页)</li>
    <li><a href="/static/hello.txt">/static/hello.txt</a> - 静态文件示例</li>
  </ul>
</body>
</html>`,
          {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          }
        );
      }

      // ============================================
      // 路由 1.5: 交互测试页 (用于触发 POST/PUT/DELETE)
      // ============================================
      if (url.pathname === "/playground") {
        return new Response(
          `
<!DOCTYPE html>
<html>
<head>
  <title>API Playground</title>
  <style>
    body { font-family: sans-serif; padding: 40px; max-width: 760px; margin: auto; }
    button { margin-right: 8px; padding: 8px 12px; }
    pre { background: #f7f7f7; padding: 12px; border-radius: 8px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>API Playground</h1>
  <p>点击下面按钮来调用 POST / PUT / DELETE:</p>
  <p>
    <button id="create">POST /api/users</button>
    <button id="update">PUT /api/users/1</button>
    <button id="remove">DELETE /api/users/2</button>
    <a href="/api/users">查看用户列表</a>
  </p>
  <pre id="result">等待操作...</pre>

  <script>
    const result = document.getElementById("result");

    async function callApi(path, method, body) {
      const res = await fetch(path, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined
      });
      const data = await res.json();
      result.textContent = method + " " + path + "\\n\\n" + JSON.stringify(data, null, 2);
    }

    document.getElementById("create").addEventListener("click", () => {
      callApi("/api/users", "POST", { name: "Playground User", age: 20 });
    });

    document.getElementById("update").addEventListener("click", () => {
      callApi("/api/users/1", "PUT", { name: "Alice Updated", age: 29 });
    });

    document.getElementById("remove").addEventListener("click", () => {
      callApi("/api/users/2", "DELETE");
    });
  </script>
</body>
</html>`,
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
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
        return Response.json({ users, total: users.length });
      }

      // ============================================
      // 路由 5: 创建用户 (POST, 接收 JSON body)
      // ============================================
      if (url.pathname === "/api/users" && method === "POST") {
        try {
          const body = await req.json() as Partial<User>;
          const newUser: User = {
            id: Date.now(),
            name: body.name ?? "Unknown",
            age: body.age ?? 0,
          };
          users.push(newUser);

          return Response.json(
            {
              success: true,
              user: newUser,
            },
            { status: 201 }
          );
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
      }

      // ============================================
      // 路由 6: 更新用户 (PUT)
      // ============================================
      if (url.pathname.startsWith("/api/users/") && method === "PUT") {
        const id = Number(url.pathname.split("/").pop());
        if (Number.isNaN(id)) {
          return Response.json({ error: "Invalid user id" }, { status: 400 });
        }

        try {
          const body = await req.json() as Partial<User>;
          const index = users.findIndex((user) => user.id === id);
          if (index === -1) {
            return Response.json({ error: "User not found" }, { status: 404 });
          }

          users[index] = { ...users[index], ...body, id: users[index].id };
          return Response.json({ success: true, user: users[index] });
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
      }

      // ============================================
      // 路由 7: 删除用户 (DELETE)
      // ============================================
      if (url.pathname.startsWith("/api/users/") && method === "DELETE") {
        const id = Number(url.pathname.split("/").pop());
        if (Number.isNaN(id)) {
          return Response.json({ error: "Invalid user id" }, { status: 400 });
        }

        const index = users.findIndex((user) => user.id === id);
        if (index === -1) {
          return Response.json({ error: "User not found" }, { status: 404 });
        }

        const [deletedUser] = users.splice(index, 1);
        return Response.json(
          {
            success: true,
            deleted: deletedUser,
          },
          { status: 200 }
        );
      }

      // ============================================
      // 404 - 未找到
      // ============================================
      return new Response("404 Not Found", { status: 404 });
    } finally {
      const duration = (performance.now() - start).toFixed(2);
      console.log(`⏱️ ${method} ${url.pathname} - ${duration}ms`);
    }
  },

  // 错误处理
  error(error) {
    console.error("❌ 服务器错误:", error);
    return new Response("Internal Server Error", { status: 500 });
  },
});

console.log(`🚀 服务器启动: http://localhost:${server.port}`);
console.log(`💡 按 Ctrl+C 停止服务器\n`);

export {}
