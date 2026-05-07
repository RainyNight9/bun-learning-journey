// 06-sqlite/index.ts
// 🎯 学习目标:使用 Bun 内置的 SQLite 数据库
// 无需安装任何包,Bun 内置了高性能 SQLite 驱动!

import { Database } from "bun:sqlite";

// ============================================
// 1. 创建/连接数据库
// ============================================
console.log("📦 1. 创建数据库");
// ":memory:" 表示内存数据库,程序结束就消失
// 也可以传入文件路径,如 "./mydb.sqlite"
const db = new Database("./mydb.sqlite", { create: true });
db.run("PRAGMA foreign_keys = ON");

// ============================================
// 2. 创建表
// ============================================
console.log("\n🏗️  2. 创建表结构");
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    age INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);
console.log("   ✅ users 表已创建");

db.run(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);
console.log("   ✅ posts 表已创建(含 user_id 外键)");

// 清空表(便于重复运行)
db.run("DELETE FROM posts");
db.run("DELETE FROM users");

// ============================================
// 3. 插入数据 - 预编译语句(防 SQL 注入)
// ============================================
console.log("\n➕ 3. 插入数据");

const insertStmt = db.prepare(
  "INSERT INTO users (name, email, age) VALUES ($name, $email, $age)"
);

insertStmt.run({ $name: "Alice", $email: "alice@example.com", $age: 28 });
insertStmt.run({ $name: "Bob", $email: "bob@example.com", $age: 32 });
insertStmt.run({ $name: "Charlie", $email: "charlie@example.com", $age: 25 });

console.log("   ✅ 已插入 3 条数据");

// ============================================
// 4. 批量插入 - 事务(性能更高)
// ============================================
console.log("\n📦 4. 批量插入(事务)");

const insertMany = db.transaction((users: Array<{name: string, email: string, age: number}>) => {
  for (const user of users) {
    insertStmt.run({ $name: user.name, $email: user.email, $age: user.age });
  }
});

insertMany([
  { name: "David", email: "david@example.com", age: 35 },
  { name: "Eve", email: "eve@example.com", age: 27 },
]);
console.log("   ✅ 事务批量插入完成");

// ============================================
// 5. 查询数据
// ============================================
console.log("\n🔍 5. 查询数据");

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  created_at: string;
}

// 查询所有
const allUsers = db.query("SELECT * FROM users").all() as User[];
console.log("   所有用户:");
console.table(allUsers);

// 查询单条
const oneUser = db.query("SELECT * FROM users WHERE name = ?").get("Alice") as User;
console.log("\n   查询 Alice:", oneUser);

// 条件查询
const youngUsers = db
  .query("SELECT name, age FROM users WHERE age < ? ORDER BY age")
  .all(30) as Array<{name: string, age: number}>;
console.log("\n   年龄 < 30 的用户:", youngUsers);

// ============================================
// 6. 更新数据
// ============================================
console.log("\n✏️  6. 更新数据");

const updateResult = db
  .prepare("UPDATE users SET age = ? WHERE name = ?")
  .run(29, "Alice");
console.log(`   ✅ 已更新 ${updateResult.changes} 条记录`);

// ============================================
// 7. 删除数据
// ============================================
console.log("\n🗑️  7. 删除数据");

const deleteResult = db
  .prepare("DELETE FROM users WHERE name = ?")
  .run("Charlie");
console.log(`   ✅ 已删除 ${deleteResult.changes} 条记录`);

// ============================================
// 8. 聚合查询
// ============================================
console.log("\n📊 8. 聚合查询");

const stats = db.query(`
  SELECT
    COUNT(*) as total,
    AVG(age) as avg_age,
    MAX(age) as max_age,
    MIN(age) as min_age
  FROM users
`).get() as {total: number, avg_age: number, max_age: number, min_age: number};

console.log(`   总用户数: ${stats.total}`);
console.log(`   平均年龄: ${stats.avg_age?.toFixed(1)}`);
console.log(`   最大年龄: ${stats.max_age}`);
console.log(`   最小年龄: ${stats.min_age}`);

// ============================================
// 9. 练习: posts 数据(外键关系)
// ============================================
console.log("\n📝 9. posts 外键关系");

const insertPostStmt = db.prepare(`
  INSERT INTO posts (user_id, title, content)
  VALUES ($user_id, $title, $content)
`);

const currentUsers = db
  .query("SELECT id, name FROM users ORDER BY id")
  .all() as Array<{ id: number; name: string }>;

if (currentUsers.length >= 2) {
  insertPostStmt.run({
    $user_id: currentUsers[0].id,
    $title: "Bun 学习笔记 #1",
    $content: "今天学习了 bun:sqlite 的基本 CRUD。",
  });
  insertPostStmt.run({
    $user_id: currentUsers[0].id,
    $title: "Bun 学习笔记 #2",
    $content: "事务和预编译语句非常实用。",
  });
  insertPostStmt.run({
    $user_id: currentUsers[1].id,
    $title: "SQLite 实战",
    $content: "我用 JOIN 查出了用户和帖子。",
  });
  console.log("   ✅ 已插入示例帖子");
}

// ============================================
// 10. 练习: 分页查询 (LIMIT + OFFSET)
// ============================================
console.log("\n📄 10. 分页查询");
const pageSize = 2;
const page = 1; // 第 1 页
const offset = (page - 1) * pageSize;

const pagedPosts = db
  .query(`
    SELECT id, user_id, title, created_at
    FROM posts
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `)
  .all(pageSize, offset) as Array<{
    id: number;
    user_id: number;
    title: string;
    created_at: string;
  }>;

console.log(`   第 ${page} 页(每页 ${pageSize} 条):`);
console.table(pagedPosts);

// ============================================
// 11. 练习: JOIN 联表查询
// ============================================
console.log("\n🔗 11. JOIN 联表查询");
const postWithAuthors = db
  .query(`
    SELECT
      p.id AS post_id,
      p.title,
      u.name AS author,
      u.email AS author_email,
      p.created_at
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.id DESC
  `)
  .all() as Array<{
    post_id: number;
    title: string;
    author: string;
    author_email: string;
    created_at: string;
  }>;
console.table(postWithAuthors);

// ============================================
// 12. 练习: 博客文章 CRUD API (可选启动)
// 设置环境变量 START_BLOG_API=true 后启动
// ============================================
const shouldStartApi = Bun.env.START_BLOG_API === "true";

if (shouldStartApi) {
  const getPostById = db.query("SELECT * FROM posts WHERE id = ?");
  const createPost = db.prepare(
    "INSERT INTO posts (user_id, title, content) VALUES ($user_id, $title, $content)"
  );
  const updatePost = db.prepare(
    "UPDATE posts SET title = COALESCE($title, title), content = COALESCE($content, content) WHERE id = $id"
  );
  const deletePost = db.prepare("DELETE FROM posts WHERE id = ?");

  const server = Bun.serve({
    port: 3001,
    async fetch(req) {
      const url = new URL(req.url);
      const method = req.method;

      if (url.pathname === "/api/posts" && method === "GET") {
        const pageNum = Number(url.searchParams.get("page") ?? "1");
        const sizeNum = Number(url.searchParams.get("size") ?? "10");
        const safePage = Number.isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
        const safeSize = Number.isNaN(sizeNum) || sizeNum < 1 ? 10 : sizeNum;
        const pageOffset = (safePage - 1) * safeSize;

        const rows = db
          .query(`
            SELECT p.id, p.title, p.content, p.created_at, u.name AS author
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.id DESC
            LIMIT ? OFFSET ?
          `)
          .all(safeSize, pageOffset);
        return Response.json({ page: safePage, size: safeSize, posts: rows });
      }

      if (url.pathname === "/api/posts" && method === "POST") {
        try {
          const body = await req.json() as {
            user_id: number;
            title: string;
            content: string;
          };
          const result = createPost.run({
            $user_id: body.user_id,
            $title: body.title,
            $content: body.content,
          });
          const created = getPostById.get(result.lastInsertRowid);
          return Response.json({ success: true, post: created }, { status: 201 });
        } catch {
          return Response.json({ error: "Invalid request body" }, { status: 400 });
        }
      }

      if (url.pathname.startsWith("/api/posts/") && method === "GET") {
        const id = Number(url.pathname.split("/").pop());
        if (Number.isNaN(id)) {
          return Response.json({ error: "Invalid post id" }, { status: 400 });
        }
        const row = getPostById.get(id);
        if (!row) {
          return Response.json({ error: "Post not found" }, { status: 404 });
        }
        return Response.json({ post: row });
      }

      if (url.pathname.startsWith("/api/posts/") && method === "PUT") {
        const id = Number(url.pathname.split("/").pop());
        if (Number.isNaN(id)) {
          return Response.json({ error: "Invalid post id" }, { status: 400 });
        }
        try {
          const body = await req.json() as { title?: string; content?: string };
          const result = updatePost.run({
            $id: id,
            $title: body.title ?? null,
            $content: body.content ?? null,
          });
          if (result.changes === 0) {
            return Response.json({ error: "Post not found" }, { status: 404 });
          }
          return Response.json({ success: true, post: getPostById.get(id) });
        } catch {
          return Response.json({ error: "Invalid request body" }, { status: 400 });
        }
      }

      if (url.pathname.startsWith("/api/posts/") && method === "DELETE") {
        const id = Number(url.pathname.split("/").pop());
        if (Number.isNaN(id)) {
          return Response.json({ error: "Invalid post id" }, { status: 400 });
        }
        const result = deletePost.run(id);
        if (result.changes === 0) {
          return Response.json({ error: "Post not found" }, { status: 404 });
        }
        return Response.json({ success: true });
      }

      return new Response("404 Not Found", { status: 404 });
    },
  });

  console.log(`\n🚀 博客 CRUD API 已启动: http://localhost:${server.port}`);
  console.log("   示例: GET /api/posts?page=1&size=5");
} else {
  // ============================================
  // 13. 关闭数据库
  // ============================================
  db.close();
  console.log("\n👋 数据库已关闭");
  console.log("💡 如需启动练习 API,请运行: START_BLOG_API=true bun run index.ts");
}
