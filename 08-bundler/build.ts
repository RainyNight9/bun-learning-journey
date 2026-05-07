// 08-bundler/build.ts
// 🎯 学习目标:使用 Bun 的打包器 API

console.log("🔨 开始打包...\n");

const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "bun",          // 'bun' | 'node' | 'browser'
  format: "esm",          // 'esm' | 'cjs' | 'iife'
  minify: true,           // 是否压缩
  sourcemap: "external",  // 'none' | 'inline' | 'external'
  splitting: false,       // 是否代码分割
});

if (!result.success) {
  console.error("❌ 打包失败");
  for (const message of result.logs) {
    console.error(message);
  }
  process.exit(1);
}

console.log("✅ 打包成功!\n");
console.log("📦 生成的文件:");
for (const output of result.outputs) {
  const size = (output.size / 1024).toFixed(2);
  console.log(`   ${output.path} (${size} KB)`);
}

console.log("\n💡 测试运行打包后的文件:");
console.log("   bun run dist/index.js");
