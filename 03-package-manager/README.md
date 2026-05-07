# 03 - Package Manager 包管理器 📦

> Bun 内置的包管理器,比 npm 快 25 倍!

## 🎯 学习目标

- 掌握 `bun install` / `bun add` / `bun remove`
- 理解 `bun.lockb` 二进制锁文件
- 学习 `package.json` 脚本运行
- 对比 Bun 与 npm / yarn / pnpm 的速度

## ▶️ 运行步骤

```bash
# 1. 安装依赖 (会自动创建 bun.lockb 锁文件)
bun install

# 2. 运行程序
bun run index.ts

# 或使用 package.json 中的 scripts
bun run start
```

## 💡 核心命令速查

| 命令 | 作用 | 对应 npm 命令 |
|:---|:---|:---|
| `bun install` | 安装所有依赖 | `npm install` |
| `bun add <pkg>` | 添加依赖 | `npm install <pkg>` |
| `bun add -d <pkg>` | 添加开发依赖 | `npm install -D <pkg>` |
| `bun add -g <pkg>` | 全局安装 | `npm install -g <pkg>` |
| `bun remove <pkg>` | 移除依赖 | `npm uninstall <pkg>` |
| `bun update` | 更新依赖 | `npm update` |
| `bun outdated` | 查看过时依赖 | `npm outdated` |
| `bun run <script>` | 运行脚本 | `npm run <script>` |
| `bun x <pkg>` | 临时执行 | `npx <pkg>` |

## ⚡ 性能对比

以安装一个中型项目为例:

| 工具 | 耗时 | 相对速度 |
|:---|:---:|:---:|
| npm | ~40s | 1x |
| yarn | ~35s | 1.1x |
| pnpm | ~20s | 2x |
| **bun** | **~1.5s** | **25x+** ⚡ |

## 💎 Bun 包管理器的特点

### 1. `bun.lockb` - 二进制锁文件
Bun 使用二进制格式的锁文件,比 JSON 格式的 `package-lock.json` 更小、读取更快。

### 2. 全局缓存
所有包都缓存在 `~/.bun/install/cache`,避免重复下载。

### 3. 兼容 npm registry
完全兼容 npm 生态,可以直接使用 npm 上的任何包。

### 4. 并行下载
充分利用网络带宽,大幅提升安装速度。

## 🧪 练习

1. 尝试添加一个新包,比如 `lodash`:
```bash
bun add lodash @types/lodash
```

2. 在代码中使用它:
```typescript
import _ from "lodash";
console.log(_.chunk([1,2,3,4,5,6], 2));
```

3. 查看安装速度(使用 `time` 命令):
```bash
time bun install
``
