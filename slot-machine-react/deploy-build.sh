#!/bin/bash

# ============================================
# Vercel 快速部署脚本 - 拖拽构建文件版本
# ============================================

echo "🎰 Slot Machine React - Vercel 快速部署"
echo ""

cd "$(dirname "$0")"

# 检查是否已登录 Vercel
if ! vercel whoami 2>/dev/null; then
    echo "⚠️  请先登录 Vercel"
    vercel login
fi

# 进入 build 目录直接部署
echo ""
echo "📦 使用已构建的 build 文件夹..."
cd build

if [ ! -f "index.html" ]; then
    echo "❌ build 文件夹不存在或为空，先执行构建..."
    cd ..
    npm run build
    cd build
fi

# 部署
echo ""
echo "🚀 部署到 Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 部署成功！"
    echo ""
else
    echo ""
    echo "❌ 部署失败"
    exit 1
fi
