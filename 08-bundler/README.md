# 08 - Bundler 打包器 📦

> Bun 内置打包器,**比 esbuild 还要快**,可以打包成独立可执行文件!

## 🎯 学习目标

- 使用 `bun build` 命令打包项目
- 使用 `Bun.build()` API 编程式打包
- 打包成独立的可执行文件 (`--compile`)
- 了解 source map、minify、tree-shaking

## ▶️ 运行

### 方式 1: 命令行打包

```bash
# 基本打包
bun build ./src/index.ts --outdir ./dist

# 压缩 + 生成 sourcemap
bun build ./src/index.ts --outdir ./dist --minify --sourcemap

# 打包成单文件
bun build ./src/index.ts --outfile ./dist/bundle.js --minify

# 🔥 打包成可执行文件 (无需 Bun 即可运行!)
bun build ./src/index.ts --compile --outfile ./dist/myapp
```

### 方式 2: 编程式打包

```bash
bun run build.ts
```

### 方式 3: 运行打包结果

```bash
# 运行 JS 文件
bun run dist/index.js

# 直接执行编译后的二进制 (如果用了 --compile)
./dist/myapp
```

## 💡 Bun.build 配置选项

```typescript
await Bun.build({
  entrypoints: ["./src/index.ts"],   // 入口文件(可多个)
  outdir: "./dist",                   // 输出目录
  target: "bun",                      // 目标: 'bun' | 'node' | 'browser'
  format: "esm",                      // 模块格式: 'esm' | 'cjs' | 'iife'
  minify: true,                       // 压缩代码
  sourcemap: "external",              // sourcemap: 'none' | 'inline' | 'external'
  splitting: false,                   // 代码分割
  external: ["react"],                // 外部依赖(不打包)
  define: {                           // 编译时常量替换
    "process.env.NODE_ENV": '"production"'
  },
  loader: {                           // 自定义 loader
    ".png": "file"
  }
});
```

## 🔥 编译为可执行文件 (Compile)

这是 Bun 的杀手级特性!可以将整个 Node.js/Bun 项目打包成一个独立的可执行文件:

```bash
bun build ./src/index.ts --compile --outfile myapp
```

特点:
- ✅ 无需安装 Bun 即可运行
- ✅ 跨平台 (Linux / macOS / Windows)
- ✅ 包含所有依赖
- ✅ 启动快(冷启动 ~10ms)

文件大小约 50-100MB(包含完整 Bun 运行时)。

### 跨平台编译

```bash
# 在 Mac 上编译 Linux 二进制
bun build ./src/index.ts --compile --target=bun-linux-x64 --outfile myapp-linux

# Windows
bun build ./src/index.ts --compile --target=bun-windows-x64 --outfile myapp.exe

# 不同架构
bun build ./src/index.ts --compile --target=bun-linux-arm64 --outfile myapp-arm
```

## ⚡ 性能对比

打包一个中型项目:
- **Webpack**: ~10s
- **esbuild**: ~0.3s
- **bun build**: **~0.1s** ⚡

## 🧪 练习

1. 修改 `src/` 添加更多代码,观察打包后文件大小变化
2. 尝试 `--compile` 编译成可执行文件,测试运行
3. 添加 `define` 替换环境变量,看看打包后的差异
4. 使用 `splitting: true` 启用代码分割,观察输出
