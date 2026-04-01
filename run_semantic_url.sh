#!/bin/bash

# 语义化 URL 系统 - 快速启动脚本

echo "🚀 启动语义化 URL 演示系统..."
echo ""

# 检查依赖
echo "📦 检查依赖..."
python -c "import pypinyin" 2>/dev/null || {
    echo "❌ 缺少 pypinyin，正在安装..."
    pip install pypinyin==0.52.0
}

echo ""
echo "✅ 依赖检查完成"
echo ""

# 选择要运行的服务
echo "请选择要运行的服务："
echo "1. Slug 生成器测试（快速演示）"
echo "2. FastAPI 语义化路由示例（端口 8000）"
echo "3. GEO 优化器示例（端口 8001）"
echo "4. 全部运行"
echo ""

read -p "输入选项 (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🎯 运行 Slug 生成器测试..."
        python test_semantic_url.py
        ;;
    2)
        echo ""
        echo "🎯 启动 FastAPI 语义化路由示例..."
        echo "📍 访问地址：http://localhost:8000"
        echo "📍 API 文档：http://localhost:8000/docs"
        echo ""
        python semantic_url_example.py
        ;;
    3)
        echo ""
        echo "🎯 启动 GEO 优化器示例..."
        echo "📍 访问地址：http://localhost:8001"
        echo "📍 API 文档：http://localhost:8001/docs"
        echo ""
        python geo_optimizer.py
        ;;
    4)
        echo ""
        echo "🎯 启动所有服务..."
        echo ""
        
        # 在后台启动 FastAPI 示例
        echo "📍 启动语义化路由示例（端口 8000）..."
        python semantic_url_example.py &
        PID1=$!
        
        sleep 2
        
        # 在后台启动 GEO 优化器
        echo "📍 启动 GEO 优化器（端口 8001）..."
        python geo_optimizer.py &
        PID2=$!
        
        echo ""
        echo "✅ 所有服务已启动！"
        echo ""
        echo "📍 语义化路由示例：http://localhost:8000"
        echo "📍 API 文档 1: http://localhost:8000/docs"
        echo ""
        echo "📍 GEO 优化器：http://localhost:8001"
        echo "📍 API 文档 2: http://localhost:8001/docs"
        echo ""
        echo "按 Ctrl+C 停止所有服务"
        echo ""
        
        # 等待进程
        wait
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac
