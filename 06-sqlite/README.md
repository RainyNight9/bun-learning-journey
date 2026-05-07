# 06 - SQLite 数据库 🗄️

> Bun 内置的 SQLite 驱动,**比 better-sqlite3 快 3-6 倍**

## 🎯 学习目标

- 使用 `bun:sqlite` 内置模块
- 掌握 CRUD (增删改查) 操作
- 学习预编译语句(防 SQL 注入)
- 使用事务提升批量操作性能
- 类型安全的查询结果

## ▶️ 运行

```bash
bun run index.ts
```

运行后会生成 `mydb.sqlite` 数据库文件。

## 💡 核心 API

### 创建/连接数据库

```typescript
import { Database } from "bun:sqlite";

// 文件数据库
const db = new Database("./mydb.sqlite", { create: true });

// 内存数据库(超快,但程序结束即消失)
const memDb = new Database(":memory:");
```

### 执行 SQL

```typescript
// run() - 执行 DDL 或不需要返回的 SQL
db.run("CREATE TABLE users (id INT, name TEXT)");

// query() - 准备查询语句(可重复使用)
const stmt = db.query("SELECT * FROM users WHERE id = ?");
stmt.get(1);   // 返回单条
stmt.all();    // 返回所有

// prepare() - 准备语句(用于增删改)
const insert = db.prepare("INSERT INTO users VALUES (?, ?)");
insert.run(1, "Alice");
```

### 参数绑定(防 SQL 注入)

```typescript
// 命名参数 (推荐)
db.prepare("INSERT INTO users (name) VALUES ($name)")
  .run({ $name: "Alice" });

// 位置参数
db.prepare("INSERT INTO users (name) VALUES (?)")
  .run("Alice");
```

### 事务

```typescript
const insertMany = db.transaction((users) => {
  for (const u of users) insert.run(u);
});

// 自动包裹在 BEGIN/COMMIT 中,出错自动 ROLLBACK
insertMany([{...}, {...}, {...}]);
```

## 🚀 性能对比

| 操作 | better-sqlite3 (Node.js) | bun:sqlite |
|:---|:---:|:---:|
| 单次插入 | ~50,000 ops/s | ~150,000 ops/s |
| 单次查询 | ~80,000 ops/s | ~250,000 ops/s |
| 事务批量插入 | ~500,000 ops/s | ~1,500,000 ops/s |

## 🧪 练习

1. 创建一个 `posts` 表,与 `users` 建立外键关系
2. 实现分页查询 (LIMIT + OFFSET)
3. 使用 `JOIN` 联表查询用户和帖子
4. 实现一个完整的博客文章 CRUD API (结合 04 章的 HTTP 服务器)
