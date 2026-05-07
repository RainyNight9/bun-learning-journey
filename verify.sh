#!/bin/bash
# verify.sh - 验证 Bun 环境

echo "🔍 检查 Bun 安装..."

if ! command -v bun &> /dev/null; then
  echo "❌ Bun 未安装或未在 PATH 中"
  echo ""
  echo "请执行以下命令配置 PATH:"
  echo "  export BUN_INSTALL=\"\$HOME/.bun\""
  echo "  export PATH=\"\$BUN_INSTALL/bin:\$PATH\""
  exit 1
fi

echo "✅ Bun 版本: $(bun --version)"
echo "✅ 安装路径: $(which bun)"
echo ""
echo "🎉 环境就绪!可以开始学习了"
echo ""
echo "👉 从第一章开始:"
echo "   cd 01-hello && bun run index.ts"
