// 10-final-project/db.ts
// 数据库初始化与操作

import { Database } from "bun:sqlite";

export const db = new Database("./todos.sqlite", { create: true });

// 初始化表结构
db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// CRUD 操作封装
// ============================================
export const TodoRepository = {
  getAll(): Todo[] {
    return db.query("SELECT * FROM todos ORDER BY id DESC").all() as Todo[];
  },

  getById(id: number): Todo | null {
    return db.query("SELECT * FROM todos WHERE id = ?").get(id) as Todo | null;
  },

  create(title: string, description = ""): Todo {
    const result = db
      .prepare("INSERT INTO todos (title, description) VALUES (?, ?)")
      .run(title, description);
    return this.getById(Number(result.lastInsertRowid))!;
  },

  update(id: number, data: Partial<Pick<Todo, "title" | "description" | "completed">>): Todo | null {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) { fields.push("title = ?"); values.push(data.title); }
    if (data.description !== undefined) { fields.push("description = ?"); values.push(data.description); }
    if (data.completed !== undefined) { fields.push("completed = ?"); values.push(data.completed); }
    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    db.prepare(`UPDATE todos SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    return this.getById(id);
  },

  delete(id: number): boolean {
    const result = db.prepare("DELETE FROM todos WHERE id = ?").run(id);
    return result.changes > 0;
  },

  getStats(): { total: number; completed: number; pending: number } {
    const total = (db.query("SELECT COUNT(*) as c FROM todos").get() as any).c;
    const completed = (db.query("SELECT COUNT(*) as c FROM todos WHERE completed = 1").get() as any).c;
    return { total, completed, pending: total - completed };
  },
};
