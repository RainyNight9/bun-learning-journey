// 03-package-manager/index.ts
// 🎯 学习目标:使用第三方包

// 导入通过 `bun add` 安装的包
// 运行前请先执行: bun install
import chalk from "chalk";
import { format } from "date-fns";

// ============================================
// 1. 使用 chalk 美化终端输出
// ============================================
console.log(chalk.green("✅ 成功信息"));
console.log(chalk.red("❌ 错误信息"));
console.log(chalk.yellow("⚠️  警告信息"));
console.log(chalk.blue("ℹ️  提示信息"));

console.log(chalk.bold.cyan("\n━━━━━━━━━━━━━━━━━━━━━━━━━━"));
console.log(chalk.bold.cyan("  Bun 包管理器演示"));
console.log(chalk.bold.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));

// ============================================
// 2. 使用 date-fns 格式化日期
// ============================================
const now = new Date();
console.log("📅 当前时间:");
console.log(`  标准格式: ${format(now, "yyyy-MM-dd HH:mm:ss")}`);
console.log(`  中文格式: ${format(now, "yyyy年MM月dd日 HH时mm分")}`);

// ============================================
// 3. 查看已安装的包信息
// ============================================
const packageJson = await Bun.file("./package.json").json();
console.log(chalk.magenta("\n📦 已安装的依赖:"));
for (const [name, version] of Object.entries(packageJson.dependencies ?? {})) {
  console.log(`  - ${chalk.cyan(name)}: ${chalk.gray(version as string)}`);
}


// 练习
import _ from "lodash";
console.log(_.chunk([1,2,3,4,5,6], 2));
