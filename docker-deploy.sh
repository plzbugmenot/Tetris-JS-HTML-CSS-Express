#!/bin/bash

# 快速 Docker 構建和部署腳本 (Linux/Mac)

echo "🐳 開始 Docker 構建和部署流程..."
echo ""

# 檢查 Docker 是否安裝
echo "📋 檢查 Docker 安裝..."
if ! command -v docker &> /dev/null; then
    echo "❌ 錯誤: Docker 未安裝！"
    echo "請先安裝 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

DOCKER_VERSION=$(docker --version)
echo "✅ Docker 已安裝: $DOCKER_VERSION"
echo ""

# 檢查 Docker Compose 是否安裝
echo "📋 檢查 Docker Compose 安裝..."
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo "✅ Docker Compose 已安裝: $COMPOSE_VERSION"
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    echo "✅ Docker Compose 已安裝 (內置版本)"
    COMPOSE_CMD="docker compose"
else
    echo "⚠️  警告: Docker Compose 未安裝"
    COMPOSE_CMD=""
fi
echo ""

# 停止並刪除舊容器
echo "🛑 停止並刪除舊容器..."
docker stop tetris-game 2>/dev/null || true
docker rm tetris-game 2>/dev/null || true
echo "✅ 舊容器已清理"
echo ""

# 構建 Docker 鏡像
echo "🔨 構建 Docker 鏡像..."
docker build -t tetris-game:latest .

if [ $? -ne 0 ]; then
    echo "❌ Docker 構建失敗！"
    exit 1
fi
echo "✅ Docker 鏡像構建成功"
echo ""

# 選擇部署方式
echo "🚀 選擇部署方式:"
echo "  1. 使用 Docker Compose (推薦)"
echo "  2. 使用 Docker 命令"
read -p "請輸入選擇 (1 或 2): " choice

if [ "$choice" = "1" ] && [ -n "$COMPOSE_CMD" ]; then
    # 使用 Docker Compose
    echo ""
    echo "🐳 使用 Docker Compose 啟動容器..."
    
    $COMPOSE_CMD up -d
    
    if [ $? -ne 0 ]; then
        echo "❌ Docker Compose 啟動失敗！"
        exit 1
    fi
    
    echo "✅ 容器已啟動（使用 Docker Compose）"
else
    # 使用 Docker 命令
    echo ""
    echo "🐳 使用 Docker 命令啟動容器..."
    
    docker run -d \
        -p 8800:8800 \
        -p 3500:3500 \
        --name tetris-game \
        --restart unless-stopped \
        tetris-game:latest
    
    if [ $? -ne 0 ]; then
        echo "❌ Docker 容器啟動失敗！"
        exit 1
    fi
    
    echo "✅ 容器已啟動（使用 Docker 命令）"
fi

echo ""

# 等待容器啟動
echo "⏳ 等待容器啟動..."
sleep 3

# 檢查容器狀態
echo "📊 檢查容器狀態..."
CONTAINER_STATUS=$(docker ps --filter "name=tetris-game" --format "{{.Status}}")

if [ -n "$CONTAINER_STATUS" ]; then
    echo "✅ 容器正在運行: $CONTAINER_STATUS"
else
    echo "❌ 容器未運行！"
    echo ""
    echo "查看錯誤日誌:"
    docker logs tetris-game
    exit 1
fi

echo ""

# 顯示訪問信息
echo "🎉 部署成功！"
echo ""
echo "📍 訪問地址:"
echo "  客戶端: http://localhost:3500"
echo "  服務器: http://localhost:8800"
echo "  配置端點: http://localhost:8800/config"
echo ""
echo "📝 有用的命令:"
echo "  查看日誌: docker logs -f tetris-game"
echo "  停止容器: docker stop tetris-game"
echo "  刪除容器: docker rm tetris-game"
echo "  重啟容器: docker restart tetris-game"
echo ""

# 詢問是否查看日誌
read -p "是否查看實時日誌？(y/n): " view_logs
if [ "$view_logs" = "y" ] || [ "$view_logs" = "Y" ]; then
    echo ""
    echo "📜 顯示實時日誌（按 Ctrl+C 退出）..."
    docker logs -f tetris-game
fi
