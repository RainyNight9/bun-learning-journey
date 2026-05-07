// 05-file-io/index.ts
// 🎯 学习目标:掌握 Bun 的文件 I/O API

// ============================================
// 1. Bun.write() - 写入文件
// ============================================
console.log("📝 1. 写入文件");

// 写入字符串
await Bun.write("./output.txt", "Hello from Bun!\n这是一个中文测试\n");

// 写入 JSON
const data = {
  name: "Bun",
  version: Bun.version,
  features: ["快", "兼容", "全能"],
};
await Bun.write("./output.json", JSON.stringify(data, null, 2));

// 写入 Blob
const blob = new Blob(["This is a blob content"], { type: "text/plain" });
await Bun.write("./output-blob.txt", blob);

console.log("   ✅ 已创建: output.txt, output.json, output-blob.txt");

// ============================================
// 2. Bun.file() - 读取文件
// ============================================
console.log("\n📖 2. 读取文件");

const textFile = Bun.file("./output.txt");

// 读取为字符串
const text = await textFile.text();
console.log("   文本内容:", text.trim());

// 读取 JSON
const jsonFile = Bun.file("./output.json");
const jsonData = await jsonFile.json();
console.log("   JSON 内容:", jsonData);

// ============================================
// 3. 文件元信息
// ============================================
console.log("\n📊 3. 文件元信息");

const file = Bun.file("./output.txt");
console.log(`   大小: ${file.size} 字节`);
console.log(`   类型: ${file.type}`);
console.log(`   最后修改: ${new Date(file.lastModified).toLocaleString()}`);

// ============================================
// 4. 检查文件是否存在
// ============================================
console.log("\n🔍 4. 检查文件是否存在");

const exists = await Bun.file("./output.txt").exists();
const notExists = await Bun.file("./non-existent.txt").exists();
console.log(`   output.txt 存在: ${exists}`);
console.log(`   non-existent.txt 存在: ${notExists}`);

// ============================================
// 5. 读取二进制数据
// ============================================
console.log("\n🔢 5. 读取二进制数据");

const buffer = await Bun.file("./output.txt").arrayBuffer();
console.log(`   ArrayBuffer 字节数: ${buffer.byteLength}`);

const bytes = await Bun.file("./output.txt").bytes();
console.log(`   前 20 字节 (hex): ${Array.from(bytes.slice(0, 20)).map(b => b.toString(16)).join(" ")}`);

// ============================================
// 6. 流式读取(大文件)
// ============================================
console.log("\n🌊 6. 流式读取");

const stream = Bun.file("./output.txt").stream();
const reader = stream.getReader();
let chunkCount = 0;
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  chunkCount++;
  console.log(`   读取 chunk #${chunkCount}: ${value.byteLength} 字节`);
}

// ============================================
// 7. 复制文件
// ============================================
console.log("\n📋 7. 复制文件");

const source = Bun.file("./output.txt");
await Bun.write("./output-copy.txt", source);
console.log("   ✅ 已复制到: output-copy.txt");

// ============================================
// 8. Node.js 兼容的 fs 模块也能用
// ============================================
console.log("\n🔗 8. Node.js fs 模块兼容");

import { readFileSync } from "node:fs";
const content = readFileSync("./output.txt", "utf-8");
console.log(`   通过 fs.readFileSync 读取: ${content.trim()}`);

// ============================================
// 9. 练习: 下载网络图片到本地
// ============================================
console.log("\n🖼️ 9. 下载网络图片");
await Bun.write("./image.jpg", await fetch("https://picsum.photos/200"));
console.log("   ✅ 已下载: image.jpg");

// ============================================
// 10. 练习: 读取并修改 JSON 文件
// ============================================
console.log("\n🛠️ 10. 读取并修改 JSON");
const editableJsonFile = Bun.file("./output.json");
const editableJson = await editableJsonFile.json() as {
  name: string;
  version: string;
  features: string[];
  updatedAt?: string;
  practiceDone?: boolean;
};

editableJson.updatedAt = new Date().toISOString();
editableJson.practiceDone = true;
editableJson.features.push("文件修改");

await Bun.write("./output.json", JSON.stringify(editableJson, null, 2));
console.log("   ✅ 已更新: output.json");

// ============================================
// 11. 练习: 简易 grep 工具
// ============================================
console.log("\n🔎 11. 简易 grep");
async function grepInFile(filePath: string, keyword: string) {
  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    console.log(`   文件不存在: ${filePath}`);
    return [];
  }

  const lines = (await file.text()).split("\n");
  const matches = lines
    .map((line, index) => ({ lineNo: index + 1, line }))
    .filter((item) => item.line.includes(keyword));

  console.log(`   在 ${filePath} 中搜索 "${keyword}"，命中 ${matches.length} 行`);
  for (const item of matches) {
    console.log(`   L${item.lineNo}: ${item.line}`);
  }
  return matches;
}

await grepInFile("./output.txt", "Bun");
await grepInFile("./output.json", "practiceDone");
