# 05 - File I/O 文件操作 📁

> Bun 的文件 I/O API 比 Node.js `fs` 快 10 倍

## 🎯 学习目标

- 使用 `Bun.file()` 读取文件
- 使用 `Bun.write()` 写入文件
- 处理文本、JSON、二进制、Blob 数据
- 流式读取大文件
- 了解 Node.js `fs` 兼容性

## ▶️ 运行

```bash
bun run index.ts
```

运行后会生成几个文件:
- `output.txt` - 文本文件
- `output.json` - JSON 文件
- `output-blob.txt` - 从 Blob 写入
- `output-copy.txt` - 复制的文件

## 💡 核心 API

### Bun.file(path) - 懒加载文件对象

```typescript
const file = Bun.file("./data.txt");

// 并不立即读取,而是返回一个类 Blob 对象
await file.text();         // 读取为字符串
await file.json();         // 解析为 JSON
await file.arrayBuffer();  // 读取为 ArrayBuffer
await file.bytes();        // 读取为 Uint8Array
await file.exists();       // 检查是否存在
file.stream();             // 获取可读流

// 元信息 (不需要 await)
file.size;          // 字节数
file.type;          // MIME 类型
file.lastModified;  // 最后修改时间
```

### Bun.write(path, data) - 写入文件

```typescript
// 写字符串
await Bun.write("./file.txt", "content");

// 写 JSON
await Bun.write("./file.json", JSON.stringify(obj));

// 写 Blob
await Bun.write("./file.bin", new Blob([...]));

// 写 Response (下载远程文件!)
await Bun.write("./image.png", await fetch(url));

// 复制文件
await Bun.write("./dest.txt", Bun.file("./source.txt"));
```

## ⚡ 性能对比

读取一个 1MB 文件:
- Node.js `fs.readFile`: ~5 ms
- **Bun.file + .text()**: ~0.5 ms (10 倍快)

## 🔗 Node.js 兼容性

Bun 完全兼容 `fs` 模块,如果你有现成代码:

```typescript
import { readFileSync, writeFileSync } from "node:fs";
import fs from "node:fs/promises";

// 所有 fs API 都可以正常使用
const content = readFileSync("./file.txt", "utf-8");
await fs.writeFile("./file.txt", "content");
```

## 🧪 练习

1. 下载一张网络图片到本地:
   ```typescript
   await Bun.write(
     "./image.jpg",
     await fetch("https://picsum.photos/200")
   );
   ```

2. 读取并修改 JSON 文件
3. 实现一个简单的 grep 工具(搜索文件中包含关键词的行)
