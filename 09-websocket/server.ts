// 09-websocket/server.ts
// 🎯 学习目标:使用 Bun.serve 内置的 WebSocket

interface ChatMessage {
  type: "join" | "leave" | "message" | "system";
  user: string;
  text?: string;
  time: string;
}

// 维护在线用户
const users = new Set<string>();

const server = Bun.serve<{ username: string }>({
  port: 3001,

  // HTTP 处理 - 用于升级到 WebSocket 或返回客户端页面
  fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket 升级路由
    if (url.pathname === "/chat") {
      const username = url.searchParams.get("user") ?? `Guest${Date.now()}`;

      // 升级到 WebSocket,并附带用户数据
      const success = server.upgrade(req, {
        data: { username },
      });

      if (success) return undefined; // 已升级,无需返回
      return new Response("升级失败", { status: 400 });
    }

    // 提供客户端 HTML 页面
    if (url.pathname === "/") {
      return new Response(Bun.file("./client.html"));
    }

    return new Response("Not Found", { status: 404 });
  },

  // ============================================
  // WebSocket 处理器
  // ============================================
  websocket: {
    // 客户端连接时
    open(ws) {
      const { username } = ws.data;
      users.add(username);

      console.log(`✅ ${username} 加入了聊天室`);

      // 订阅频道(用于广播)
      ws.subscribe("chat-room");

      // 通知所有人(包括自己)
      const joinMsg: ChatMessage = {
        type: "join",
        user: username,
        text: `${username} 加入了聊天室`,
        time: new Date().toLocaleTimeString(),
      };
      server.publish("chat-room", JSON.stringify(joinMsg));

      // 发送当前在线用户列表给新加入的人
      ws.send(
        JSON.stringify({
          type: "system",
          user: "system",
          text: `当前在线: ${[...users].join(", ")}`,
          time: new Date().toLocaleTimeString(),
        })
      );
    },

    // 收到消息时
    message(ws, message) {
      const { username } = ws.data;
      const text = typeof message === "string" ? message : message.toString();

      console.log(`💬 ${username}: ${text}`);

      const msg: ChatMessage = {
        type: "message",
        user: username,
        text,
        time: new Date().toLocaleTimeString(),
      };

      // 广播给所有订阅 chat-room 的客户端
      server.publish("chat-room", JSON.stringify(msg));
    },

    // 客户端断开时
    close(ws) {
      const { username } = ws.data;
      users.delete(username);

      console.log(`👋 ${username} 离开了聊天室`);

      const leaveMsg: ChatMessage = {
        type: "leave",
        user: username,
        text: `${username} 离开了聊天室`,
        time: new Date().toLocaleTimeString(),
      };
      server.publish("chat-room", JSON.stringify(leaveMsg));
    },
  },
});

console.log(`🚀 WebSocket 聊天服务器启动`);
console.log(`📱 打开浏览器访问: http://localhost:${server.port}`);
console.log(`🔌 WebSocket 地址: ws://localhost:${server.port}/chat?user=YourName\n`);
