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

// 清空表(便于重复运行)
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
// 9. 关闭数据库
// ============================================
db.close();
console.log("\n👋 数据库已关闭");
