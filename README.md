# 🥟 Bun 学习之旅 (Bun Learning Journey)

> 从零开始,10 个循序渐进的小项目,带你彻底掌握 Bun!

## 📚 项目简介

这是一个为新手设计的 Bun 学习项目,通过 **10 个由浅入深的实战案例**,覆盖 Bun 的所有核心功能。每个案例都是可独立运行的小项目,配有详细注释和说明文档。

## 🎯 学习目标

完成本项目后,你将掌握:

- ✅ Bun 运行时的基本使用
- ✅ 原生 TypeScript 支持
- ✅ Bun 包管理器(比 npm 快 25 倍)
- ✅ 内置 HTTP / WebSocket 服务器
- ✅ 文件 I/O 操作
- ✅ 内置 SQLite 数据库
- ✅ 测试运行器 (`bun:test`)
- ✅ 打包与编译为可执行文件
- ✅ 全栈应用开发

## 📂 项目结构

```
bun-learning-journey/
├── 01-hello/              # Hello Bun - 第一个程序
├── 02-runtime/            # 运行时特性 - TS/JSX 原生支持
├── 03-package-manager/    # 包管理器 - bun add/install
├── 04-http-server/        # HTTP 服务器 - Bun.serve
├── 05-file-io/            # 文件 I/O - Bun.file
├── 06-sqlite/             # SQLite 数据库 - bun:sqlite
├── 07-testing/            # 测试运行器 - bun:test
├── 08-bundler/            # 打包器 - bun build
├── 09-websocket/          # WebSocket - 实时通信
├── 10-final-project/      # 综合项目 - TODO 全栈应用
└── docs/                  # 学习笔记文档
```

## 🚀 快速开始

### 前置要求

确保已安装 Bun:

```bash
# 安装 Bun
curl -fsSL https://bun.sh/install | bash

# 检查版本
bun --version
```

> **PATH 未生效?** 如果 `bun: command not found`,手动配置:
> ```bash
> export BUN_INSTALL="$HOME/.bun"
> export PATH="$BUN_INSTALL/bin:$PATH"
> ```

### 开始学习

按照 `01` → `10` 的顺序进入每个目录,阅读其中的 `README.md`,然后运行示例:

```bash
cd 01-hello
bun run index.ts
```

## 📖 学习路径

| 阶段 | 项目 | 耗时 | 难度 |
|:---:|:---|:---:|:---:|
| 1 | 01-hello - 第一个 Bun 程序 | 10 分钟 | ⭐ |
| 2 | 02-runtime - 运行时特性 | 20 分钟 | ⭐ |
| 3 | 03-package-manager - 包管理 | 20 分钟 | ⭐⭐ |
| 4 | 04-http-server - HTTP 服务器 | 30 分钟 | ⭐⭐ |
| 5 | 05-file-io - 文件操作 | 20 分钟 | ⭐⭐ |
| 6 | 06-sqlite - 数据库 | 30 分钟 | ⭐⭐⭐ |
| 7 | 07-testing - 单元测试 | 30 分钟 | ⭐⭐⭐ |
| 8 | 08-bundler - 打包编译 | 30 分钟 | ⭐⭐⭐ |
| 9 | 09-websocket - 实时通信 | 30 分钟 | ⭐⭐⭐⭐ |
| 10 | 10-final-project - 综合实战 | 60 分钟 | ⭐⭐⭐⭐ |

**预计总耗时:约 5 小时**

## 💡 学习建议

1. **循序渐进**:严格按顺序学习,后面的项目会用到前面的知识
2. **动手实践**:每个示例都要亲自运行一次,修改代码观察效果
3. **阅读注释**:代码中的注释包含重要知识点
4. **查阅文档**:遇到问题多查 [Bun 官方文档](https://bun.sh/docs)

## 🔗 参考资源

- [Bun 官方文档](https://bun.sh/docs)
- [Bun 中文文档](https://www.bunjs.cn/docs/quickstart)
- [GitHub 仓库](https://github.com/oven-sh/bun)

---

**Happy Coding! 🎉**
