// 08-bundler/build.ts
// 🎯 学习目标:使用 Bun 的打包器 API + 练习 define / splitting / compile

type BuildResult = Awaited<ReturnType<typeof Bun.build>>;

function printOutputs(title: string, result: BuildResult) {
  console.log(`\n[outputs] ${title}`);
  for (const output of result.outputs) {
    const size = (output.size / 1024).toFixed(2);
    console.log(`   ${output.path} (${size} KB)`);
  }
}

async function runBuild(title: string, options: Parameters<typeof Bun.build>[0]) {
  console.log(`\n[build] ${title}`);
  const result = await Bun.build(options);

  if (!result.success) {
    console.error("Build failed");
    for (const message of result.logs) console.error(message);
    process.exit(1);
  }

  printOutputs(title, result);
  return result;
}

console.log("Start bundler practice...");

// 1) 基础打包(用于对比体积)
const baseResult = await runBuild("基础打包", {
  entrypoints: ["./src/index.ts"],
  outdir: "./dist/base",
  target: "bun",
  format: "esm",
  minify: true,
  sourcemap: "external",
  splitting: false,
  define: {
    __APP_ENV__: '"base"',
    __FEATURE_REPORT__: "false",
  },
});

// 2) define: 构建时注入不同环境常量
await runBuild("define(DEV)", {
  entrypoints: ["./src/index.ts"],
  outdir: "./dist/define-dev",
  target: "bun",
  format: "esm",
  minify: true,
  splitting: false,
  define: {
    __APP_ENV__: '"development"',
    __FEATURE_REPORT__: "false",
  },
});

await runBuild("define(PROD + lazy report)", {
  entrypoints: ["./src/index.ts"],
  outdir: "./dist/define-prod",
  target: "bun",
  format: "esm",
  minify: true,
  splitting: false,
  define: {
    __APP_ENV__: '"production"',
    __FEATURE_REPORT__: "true",
  },
});

// 3) splitting: true + 动态导入
await runBuild("splitting(true)", {
  entrypoints: ["./src/index.ts"],
  outdir: "./dist/splitting",
  target: "bun",
  format: "esm",
  minify: true,
  sourcemap: "external",
  splitting: true,
  define: {
    __APP_ENV__: '"production"',
    __FEATURE_REPORT__: "true",
  },
});

// 4) compile: 通过命令行进行(练习项)
console.log("\nCompile practice command:");
console.log("   bun build ./src/index.ts --compile --outfile ./dist/myapp");

console.log("\nBuild practice complete");
console.log("Run base output:");
if (baseResult.outputs.length > 0) {
  console.log("   bun run dist/base/index.js");
}

export { baseResult };
