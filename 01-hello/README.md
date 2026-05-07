# 01 - Hello Bun 👋

> 你的第一个 Bun 程序

## 🎯 学习目标

- 验证 Bun 安装是否成功
- 体验 Bun 直接运行 TypeScript 的能力
- 了解 `Bun` 全局对象

## ▶️ 运行

```bash
bun run index.ts
```

或者更简短的方式:

```bash
bun index.ts
```

## 💡 关键知识点

### 1. 原生 TypeScript 支持
Bun 内置了 TypeScript 转换器,**无需** 任何配置就能直接运行 `.ts` 文件。这意味着:
- ❌ 不需要 `tsc`
- ❌ 不需要 `ts-node`
- ❌ 不需要 `tsconfig.json`(但建议有,用于 IDE 支持)

### 2. Bun 全局对象
Bun 提供了一个全局的 `Bun` 对象,包含了许多实用 API:
- `Bun.version` - 版本号
- `Bun.nanoseconds()` - 高精度时间戳
- `Bun.serve()` - HTTP 服务器
- `Bun.file()` - 文件操作

### 3. Node.js 兼容性
Bun 的目标是成为 Node.js 的直接替代品,因此完全兼容:
- `process` 对象
- `Buffer`
- `__dirname` / `__filename`
- 大部分 Node.js 内置模块 (`fs`, `path`, `http`, ...)

## 🧪 练习

修改 `index.ts`,尝试:
1. 输出 `import.meta.url` 看看是什么
2. 使用 `Bun.env` 替代 `process.env`
3. 计算更复杂的运算并观察性能
