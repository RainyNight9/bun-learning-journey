# 09 - WebSocket 实时通信 🔌

> Bun 内置 WebSocket 服务器,**比 ws 库快 7 倍**

## 🎯 学习目标

- 使用 `Bun.serve` 处理 WebSocket
- 学习 `upgrade()` 升级 HTTP 到 WS
- 使用 pub/sub 模式实现广播
- 构建一个完整的实时聊天室

## ▶️ 运行

```bash
bun run server.ts
```

然后打开浏览器访问: **http://localhost:3001**

打开多个标签页,输入不同的用户名,就能看到实时聊天效果!

## 💡 核心 API

### 升级 HTTP 到 WebSocket

```typescript
const server = Bun.serve({
  fetch(req, server) {
    // 升级到 WebSocket
    const success = server.upgrade(req, {
      data: { userId: 123 }  // 附加自定义数据
    });

    if (success) return undefined;
    return new Response("Upgrade failed", { status: 400 });
  },

  websocket: {
    open(ws) { /* 连接建立 */ },
    message(ws, msg) { /* 收到消息 */ },
    close(ws) { /* 连接关闭 */ },
    drain(ws) { /* 缓冲区可写 */ },
  }
});
```

### 发送消息

```typescript
// 单播 - 发给某一个客户端
ws.send("hello");
ws.send(JSON.stringify({ type: "msg", text: "hi" }));

// 广播 (Pub/Sub)
ws.subscribe("room-1");      // 订阅频道
server.publish("room-1", "Hello everyone");  // 广播到频道
ws.unsubscribe("room-1");    // 取消订阅
```

### 附加数据 `ws.data`

```typescript
// 类型化的 ws.data
const server = Bun.serve<{ username: string }>({
  fetch(req, server) {
    server.upgrade(req, {
      data: { username: "Alice" }
    });
  },
  websocket: {
    open(ws) {
      console.log(ws.data.username); // "Alice"
    }
  }
});
```

## 🎨 演示效果

本示例实现了一个完整的聊天室,包含:
- ✅ 用户加入/离开通知
- ✅ 实时消息广播
- ✅ 在线用户列表
- ✅ 消息时间戳
- ✅ 美观的前端界面

## ⚡ 性能数据

并发 WebSocket 连接处理能力:
- **ws 库** (Node.js): ~50,000 连接
- **Bun WebSocket**: **~350,000 连接** ⚡

## 🧪 练习

1. 添加 "正在输入..." 提示功能
2. 实现私聊功能(点对点消息)
3. 添加多个聊天室(不同的频道)
4. 持久化聊天记录到 SQLite (结合 06 章)
