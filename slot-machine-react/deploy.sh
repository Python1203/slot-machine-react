#!/bin/bash

# ============================================
# Slot Machine React - Vercel 一键部署脚本
# ============================================
# 此脚本将自动构建并部署项目到 Vercel
# ============================================

echo "🎰 开始部署 Slot Machine React 到 Vercel..."
echo ""

# 进入项目目录
cd "$(dirname "$0")"

# 步骤 1: 清理旧的构建文件
echo "📦 步骤 1: 清理旧的构建文件..."
rm -rf build
echo "✅ 清理完成"
echo ""

# 步骤 2: 安装依赖（如果需要）
echo "📦 步骤 2: 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
else
    echo "✅ 依赖已存在"
fi
echo ""

# 步骤 3: 构建生产版本
echo "🔨 步骤 3: 构建生产版本..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败！请检查错误信息。"
    exit 1
fi

echo "✅ 构建成功！"
echo ""

# 步骤 4: 部署到 Vercel
echo "🚀 步骤 4: 部署到 Vercel..."
echo ""
echo "提示："
echo "  - 如果是首次部署，Vercel 会询问项目名称和配置"
echo "  - 按提示选择 'Y' 确认部署"
echo "  - 项目名称建议使用：slot-machine-react"
echo ""

# 执行部署
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 部署成功！"
    echo ""
    echo "================================="
    echo "✅ 部署完成！"
    echo "================================="
    echo ""
    echo "下一步操作："
    echo "1. 复制 Vercel 提供的 URL"
    echo "2. 在浏览器中打开测试游戏"
    echo "3. 验证 GEO 语义化数据是否正确抓取"
    echo ""
    echo "GEO 验证方法："
    echo "  - 访问 https://www.schema.org/validator 验证 JSON-LD"
    echo "  - 使用 Perplexity 搜索你的网站 URL"
    echo "  - 检查 AI 是否能正确识别 RTP 97.5% 和 4.9 评分"
    echo ""
else
    echo "❌ 部署失败！请检查网络和 Vercel 账户状态。"
    exit 1
fi
