// 10-final-project/server.ts
// 🎯 综合实战:全栈 TODO 应用
// 结合了前面所有章节学到的知识:
// - HTTP 服务器 (04)
// - 文件 I/O (05)
// - SQLite 数据库 (06)
// - WebSocket 实时通信 (09)

import { TodoRepository } from "./db";

// ============================================
// 工具函数
// ============================================
function jsonResponse(data: any, status = 200): Response {
  return Response.json(data, { status });
}

function errorResponse(message: string, status = 400): Response {
  return Response.json({ error: message }, { status });
}

// ============================================
// 路由处理
// ============================================
async function handleApi(req: Request, url: URL): Promise<Response> {
  const { pathname } = url;
  const method = req.method;

  // GET /api/todos - 获取所有
  if (pathname === "/api/todos" && method === "GET") {
    return jsonResponse(TodoRepository.getAll());
  }

  // GET /api/todos/stats - 统计
  if (pathname === "/api/todos/stats" && method === "GET") {
    return jsonResponse(TodoRepository.getStats());
  }

  // POST /api/todos - 创建
  if (pathname === "/api/todos" && method === "POST") {
    try {
      const body = await req.json();
      if (!body.title || typeof body.title !== "string") {
        return errorResponse("title 字段必填且必须是字符串");
      }
      const todo = TodoRepository.create(body.title, body.description ?? "");
      broadcast({ type: "created", todo });
      return jsonResponse(todo, 201);
    } catch {
      return errorResponse("无效的 JSON");
    }
  }

  // /api/todos/:id 系列
  const idMatch = pathname.match(/^\/api\/todos\/(\d+)$/);
  if (idMatch) {
    const id = Number(idMatch[1]);

    if (method === "GET") {
      const todo = TodoRepository.getById(id);
      if (!todo) return errorResponse("Todo 不存在", 404);
      return jsonResponse(todo);
    }

    if (method === "PUT" || method === "PATCH") {
      try {
        const body = await req.json();
        const updated = TodoRepository.update(id, body);
        if (!updated) return errorResponse("Todo 不存在", 404);
        broadcast({ type: "updated", todo: updated });
        return jsonResponse(updated);
      } catch {
        return errorResponse("无效的 JSON");
      }
    }

    if (method === "DELETE") {
      const ok = TodoRepository.delete(id);
      if (!ok) return errorResponse("Todo 不存在", 404);
      broadcast({ type: "deleted", id });
      return jsonResponse({ success: true });
    }
  }

  return errorResponse("接口不存在", 404);
}

// ============================================
// WebSocket 广播
// ============================================
function broadcast(payload: any) {
  server.publish("todos", JSON.stringify(payload));
}

// ============================================
// 启动服务器
// ============================================
const server = Bun.serve({
  port: 3000,

  async fetch(req, server) {
    const url = new URL(req.url);
    const start = performance.now();

    // WebSocket 升级
    if (url.pathname === "/ws") {
      if (server.upgrade(req)) return undefined;
      return new Response("Upgrade failed", { status: 400 });
    }

    // API 路由
    if (url.pathname.startsWith("/api/")) {
      const response = await handleApi(req, url);
      const elapsed = (performance.now() - start).toFixed(2);
      console.log(`📡 ${req.method} ${url.pathname} - ${response.status} (${elapsed}ms)`);
      return response;
    }

    // 静态文件
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(Bun.file("./public/index.html"));
    }
    if (url.pathname.startsWith("/static/")) {
      const path = `./public${url.pathname.replace("/static", "")}`;
      const file = Bun.file(path);
      if (await file.exists()) return new Response(file);
    }

    return new Response("Not Found", { status: 404 });
  },

  websocket: {
    open(ws) {
      ws.subscribe("todos");
      console.log("🔌 WebSocket 客户端已连接");
    },
    message(ws, msg) {
      // 这里不处理客户端消息,仅做广播
    },
    close() {
      console.log("👋 WebSocket 客户端已断开");
    },
  },

  error(err) {
    console.error("❌ 错误:", err);
    return new Response("Internal Server Error", { status: 500 });
  },
});

console.log(`
╔════════════════════════════════════════════════════╗
║  🥟  Bun TODO 全栈应用                              ║
╠════════════════════════════════════════════════════╣
║  🚀 服务器: http://localhost:${server.port}                  ║
║  🔌 WebSocket: ws://localhost:${server.port}/ws              ║
║  💾 数据库: ./todos.sqlite                          ║
║                                                    ║
║  API 端点:                                          ║
║   GET    /api/todos          - 列表                 ║
║   GET    /api/todos/stats    - 统计                 ║
║   POST   /api/todos          - 创建                 ║
║   GET    /api/todos/:id      - 详情                 ║
║   PATCH  /api/todos/:id      - 更新                 ║
║   DELETE /api/todos/:id      - 删除                 ║
╚════════════════════════════════════════════════════╝
`);
