// 09-websocket/server.ts
// 🎯 练习实现: typing / 私聊 / 多房间 / SQLite 持久化
import { Database } from "bun:sqlite";
import type { Server, ServerWebSocket } from "bun";

type WsData = {
  username: string;
  room: string;
};

type ClientEvent =
  | { type: "chat"; text: string; target?: string }
  | { type: "typing"; isTyping: boolean }
  | { type: "join_room"; room: string };

type ServerEvent =
  | { type: "join" | "leave" | "system"; user: string; text: string; room: string; time: string }
  | { type: "message"; user: string; text: string; room: string; time: string; isPrivate?: boolean; target?: string }
  | { type: "typing"; user: string; room: string; isTyping: boolean; time: string }
  | { type: "history"; room: string; items: Array<{ user: string; text: string; target: string | null; isPrivate: boolean; time: string }> };

const db = new Database("./chat.sqlite", { create: true });
db.run("PRAGMA foreign_keys = ON");
db.run(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room TEXT NOT NULL,
    sender TEXT NOT NULL,
    receiver TEXT,
    text TEXT NOT NULL,
    is_private INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

const usersByRoom = new Map<string, Set<string>>();
const socketsByUser = new Map<string, Set<ServerWebSocket<WsData>>>();

const insertMessageStmt = db.prepare(`
  INSERT INTO chat_messages (room, sender, receiver, text, is_private)
  VALUES ($room, $sender, $receiver, $text, $is_private)
`);

const latestHistoryStmt = db.query(`
  SELECT sender, receiver, text, is_private, created_at
  FROM chat_messages
  WHERE room = ?
  ORDER BY id DESC
  LIMIT ?
`);

function now() {
  return new Date().toLocaleTimeString();
}

function roomChannel(room: string) {
  return `room:${room}`;
}

function normalizeRoom(room: string | null) {
  const value = (room ?? "general").trim().toLowerCase();
  return value || "general";
}

function getRoomUsers(room: string) {
  if (!usersByRoom.has(room)) usersByRoom.set(room, new Set<string>());
  return usersByRoom.get(room)!;
}

function registerSocket(ws: ServerWebSocket<WsData>) {
  const { username } = ws.data;
  if (!socketsByUser.has(username)) socketsByUser.set(username, new Set());
  socketsByUser.get(username)!.add(ws);
}

function unregisterSocket(ws: ServerWebSocket<WsData>) {
  const { username } = ws.data;
  const set = socketsByUser.get(username);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) socketsByUser.delete(username);
}

function sendRoomHistory(ws: ServerWebSocket<WsData>, room: string) {
  const rows = latestHistoryStmt.all(room, 20) as Array<{
    sender: string;
    receiver: string | null;
    text: string;
    is_private: number;
    created_at: string;
  }>;

  const items = rows
    .reverse()
    .map((row) => ({
      user: row.sender,
      text: row.text,
      target: row.receiver,
      isPrivate: row.is_private === 1,
      time: row.created_at,
    }));

  const historyEvent: ServerEvent = {
    type: "history",
    room,
    items,
  };
  ws.send(JSON.stringify(historyEvent));
}

function broadcastOnlineUsers(serverInstance: Server<WsData>, room: string) {
  const users = [...getRoomUsers(room)];
  const event: ServerEvent = {
    type: "system",
    user: "system",
    room,
    text: `房间 ${room} 在线: ${users.length > 0 ? users.join(", ") : "无"}`,
    time: now(),
  };
  serverInstance.publish(roomChannel(room), JSON.stringify(event));
}

function switchRoom(ws: ServerWebSocket<WsData>, serverInstance: Server<WsData>, nextRoomRaw: string) {
  const nextRoom = normalizeRoom(nextRoomRaw);
  const currentRoom = ws.data.room;
  const { username } = ws.data;
  if (nextRoom === currentRoom) return;

  ws.unsubscribe(roomChannel(currentRoom));
  getRoomUsers(currentRoom).delete(username);
  if (getRoomUsers(currentRoom).size === 0) usersByRoom.delete(currentRoom);

  const leaveEvent: ServerEvent = {
    type: "leave",
    user: username,
    room: currentRoom,
    text: `${username} 离开了房间 ${currentRoom}`,
    time: now(),
  };
  serverInstance.publish(roomChannel(currentRoom), JSON.stringify(leaveEvent));
  broadcastOnlineUsers(serverInstance, currentRoom);

  ws.data.room = nextRoom;
  ws.subscribe(roomChannel(nextRoom));
  getRoomUsers(nextRoom).add(username);

  const joinEvent: ServerEvent = {
    type: "join",
    user: username,
    room: nextRoom,
    text: `${username} 加入了房间 ${nextRoom}`,
    time: now(),
  };
  serverInstance.publish(roomChannel(nextRoom), JSON.stringify(joinEvent));
  broadcastOnlineUsers(serverInstance, nextRoom);
  sendRoomHistory(ws, nextRoom);
}

const server = Bun.serve<WsData>({
  port: 3002,
  fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === "/chat") {
      const username = (url.searchParams.get("user") ?? `Guest${Date.now()}`).trim();
      const room = normalizeRoom(url.searchParams.get("room"));
      const success = server.upgrade(req, { data: { username, room } });
      if (success) return undefined;
      return new Response("升级失败", { status: 400 });
    }

    if (url.pathname === "/") {
      return new Response(Bun.file("./client.html"));
    }

    return new Response("Not Found", { status: 404 });
  },
  websocket: {
    open(ws) {
      const { username, room } = ws.data;
      registerSocket(ws);
      getRoomUsers(room).add(username);
      ws.subscribe(roomChannel(room));

      console.log(`✅ ${username} 连接,房间: ${room}`);

      const joinEvent: ServerEvent = {
        type: "join",
        user: username,
        room,
        text: `${username} 加入了房间 ${room}`,
        time: now(),
      };
      server.publish(roomChannel(room), JSON.stringify(joinEvent));
      broadcastOnlineUsers(server, room);
      sendRoomHistory(ws, room);
    },
    message(ws, message) {
      const raw = typeof message === "string" ? message : message.toString();
      const { username, room } = ws.data;

      let event: ClientEvent;
      try {
        event = JSON.parse(raw) as ClientEvent;
      } catch {
        // 兼容旧版纯文本消息
        event = { type: "chat", text: raw };
      }

      if (event.type === "typing") {
        const typingEvent: ServerEvent = {
          type: "typing",
          user: username,
          room,
          isTyping: event.isTyping,
          time: now(),
        };
        server.publish(roomChannel(room), JSON.stringify(typingEvent));
        return;
      }

      if (event.type === "join_room") {
        switchRoom(ws, server, event.room);
        return;
      }

      if (event.type !== "chat") return;
      const text = (event.text ?? "").trim();
      if (!text) return;

      const target = event.target?.trim();
      if (target) {
        // 点对点私聊: 发给目标用户和发送者自己
        const payload: ServerEvent = {
          type: "message",
          user: username,
          text,
          room,
          target,
          isPrivate: true,
          time: now(),
        };
        const encoded = JSON.stringify(payload);
        const targetSockets = socketsByUser.get(target);
        if (targetSockets && targetSockets.size > 0) {
          for (const sock of targetSockets) sock.send(encoded);
          ws.send(encoded);
        } else {
          ws.send(
            JSON.stringify({
              type: "system",
              user: "system",
              room,
              text: `用户 ${target} 不在线`,
              time: now(),
            } satisfies ServerEvent)
          );
        }

        insertMessageStmt.run({
          $room: room,
          $sender: username,
          $receiver: target,
          $text: text,
          $is_private: 1,
        });
        return;
      }

      const msg: ServerEvent = {
        type: "message",
        user: username,
        text,
        room,
        time: now(),
      };
      server.publish(roomChannel(room), JSON.stringify(msg));
      insertMessageStmt.run({
        $room: room,
        $sender: username,
        $receiver: null,
        $text: text,
        $is_private: 0,
      });
    },
    close(ws) {
      const { username, room } = ws.data;
      unregisterSocket(ws);
      getRoomUsers(room).delete(username);
      if (getRoomUsers(room).size === 0) usersByRoom.delete(room);

      console.log(`👋 ${username} 离开,房间: ${room}`);

      const leaveEvent: ServerEvent = {
        type: "leave",
        user: username,
        room,
        text: `${username} 离开了房间 ${room}`,
        time: now(),
      };
      server.publish(roomChannel(room), JSON.stringify(leaveEvent));
      broadcastOnlineUsers(server, room);
    },
  },
});

console.log("🚀 WebSocket 聊天服务器启动");
console.log(`📱 打开浏览器访问: http://localhost:${server.port}`);
console.log(`🔌 WebSocket 地址: ws://localhost:${server.port}/chat?user=YourName&room=general`);
