# 快速 Docker 構建和部署腳本

Write-Host "🐳 開始 Docker 構建和部署流程..." -ForegroundColor Cyan
Write-Host ""

# 檢查 Docker 是否安裝
Write-Host "📋 檢查 Docker 安裝..." -ForegroundColor Yellow
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 錯誤: Docker 未安裝！" -ForegroundColor Red
    Write-Host "請先安裝 Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

$dockerVersion = docker --version
Write-Host "✅ Docker 已安裝: $dockerVersion" -ForegroundColor Green
Write-Host ""

# 檢查 Docker Compose 是否安裝
Write-Host "📋 檢查 Docker Compose 安裝..." -ForegroundColor Yellow
if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  警告: docker-compose 未安裝，將使用 docker compose" -ForegroundColor Yellow
    $composeCmd = "docker compose"
} else {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose 已安裝: $composeVersion" -ForegroundColor Green
    $composeCmd = "docker-compose"
}
Write-Host ""

# 停止並刪除舊容器
Write-Host "🛑 停止並刪除舊容器..." -ForegroundColor Yellow
docker stop tetris-game 2>$null
docker rm tetris-game 2>$null
Write-Host "✅ 舊容器已清理" -ForegroundColor Green
Write-Host ""

# 構建 Docker 鏡像
Write-Host "🔨 構建 Docker 鏡像..." -ForegroundColor Yellow
docker build -t tetris-game:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker 構建失敗！" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker 鏡像構建成功" -ForegroundColor Green
Write-Host ""

# 選擇部署方式
Write-Host "🚀 選擇部署方式:" -ForegroundColor Cyan
Write-Host "  1. 使用 Docker Compose (推薦)" -ForegroundColor White
Write-Host "  2. 使用 Docker 命令" -ForegroundColor White
$choice = Read-Host "請輸入選擇 (1 或 2)"

if ($choice -eq "1") {
    # 使用 Docker Compose
    Write-Host ""
    Write-Host "🐳 使用 Docker Compose 啟動容器..." -ForegroundColor Yellow
    
    if ($composeCmd -eq "docker compose") {
        docker compose up -d
    } else {
        docker-compose up -d
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker Compose 啟動失敗！" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ 容器已啟動（使用 Docker Compose）" -ForegroundColor Green
} else {
    # 使用 Docker 命令
    Write-Host ""
    Write-Host "🐳 使用 Docker 命令啟動容器..." -ForegroundColor Yellow
    
    docker run -d `
        -p 8800:8800 `
        -p 3500:3500 `
        --name tetris-game `
        --restart unless-stopped `
        tetris-game:latest
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker 容器啟動失敗！" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ 容器已啟動（使用 Docker 命令）" -ForegroundColor Green
}

Write-Host ""

# 等待容器啟動
Write-Host "⏳ 等待容器啟動..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 檢查容器狀態
Write-Host "📊 檢查容器狀態..." -ForegroundColor Yellow
$containerStatus = docker ps --filter "name=tetris-game" --format "{{.Status}}"

if ($containerStatus) {
    Write-Host "✅ 容器正在運行: $containerStatus" -ForegroundColor Green
} else {
    Write-Host "❌ 容器未運行！" -ForegroundColor Red
    Write-Host ""
    Write-Host "查看錯誤日誌:" -ForegroundColor Yellow
    docker logs tetris-game
    exit 1
}

Write-Host ""

# 顯示訪問信息
Write-Host "🎉 部署成功！" -ForegroundColor Green
Write-Host ""
Write-Host "📍 訪問地址:" -ForegroundColor Cyan
Write-Host "  客戶端: http://localhost:3500" -ForegroundColor White
Write-Host "  服務器: http://localhost:8800" -ForegroundColor White
Write-Host "  配置端點: http://localhost:8800/config" -ForegroundColor White
Write-Host ""
Write-Host "📝 有用的命令:" -ForegroundColor Cyan
Write-Host "  查看日誌: docker logs -f tetris-game" -ForegroundColor White
Write-Host "  停止容器: docker stop tetris-game" -ForegroundColor White
Write-Host "  刪除容器: docker rm tetris-game" -ForegroundColor White
Write-Host "  重啟容器: docker restart tetris-game" -ForegroundColor White
Write-Host ""

# 詢問是否查看日誌
$viewLogs = Read-Host "是否查看實時日誌？(y/n)"
if ($viewLogs -eq "y" -or $viewLogs -eq "Y") {
    Write-Host ""
    Write-Host "📜 顯示實時日誌（按 Ctrl+C 退出）..." -ForegroundColor Yellow
    docker logs -f tetris-game
}
