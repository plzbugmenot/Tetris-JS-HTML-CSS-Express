# 🐳 Docker 部署指南

## 📋 前置要求

- Docker 已安裝（版本 20.10 或更高）
- Docker Compose 已安裝（版本 2.0 或更高）

檢查版本：

```bash
docker --version
docker-compose --version
```

## 🚀 快速開始

### 方法 1: 使用 Docker Compose（推薦）

#### 1. 構建並啟動容器

```bash
npm run docker:compose:up
```

或直接使用 docker-compose：

```bash
docker-compose up -d
```

#### 2. 查看日誌

```bash
npm run docker:compose:logs
```

或：

```bash
docker-compose logs -f
```

#### 3. 停止容器

```bash
npm run docker:compose:down
```

#### 4. 重新構建並啟動

```bash
npm run docker:compose:rebuild
```

### 方法 2: 使用 Docker 命令

#### 1. 構建鏡像

```bash
npm run docker:build
```

或：

```bash
docker build -t tetris-game:latest .
```

#### 2. 運行容器

```bash
npm run docker:run
```

或：

```bash
docker run -d \
  -p 8800:8800 \
  -p 3500:3500 \
  --name tetris-game \
  tetris-game:latest
```

#### 3. 停止並刪除容器

```bash
npm run docker:stop
```

或：

```bash
docker stop tetris-game && docker rm tetris-game
```

## 🌐 訪問應用

容器啟動後，可以通過以下地址訪問：

- **客戶端**: http://localhost:3500
- **服務器 API**: http://localhost:8800
- **配置端點**: http://localhost:8800/config

## 🔧 環境變量配置

### 默認配置

在 `Dockerfile` 中設置：

```dockerfile
ENV REACT_APP_SERVER_PORT=8800
ENV REACT_APP_CLIENT_PORT=3500
ENV REACT_APP_SERVER_HOST=0.0.0.0
```

### 自定義配置

#### 使用 docker-compose.yml

編輯 `docker-compose.yml` 文件：

```yaml
environment:
  - REACT_APP_SERVER_PORT=8801
  - REACT_APP_CLIENT_PORT=3501
  - REACT_APP_SERVER_HOST=0.0.0.0
```

#### 使用 Docker 命令行

```bash
docker run -d \
  -p 8801:8801 \
  -p 3501:3501 \
  -e REACT_APP_SERVER_PORT=8801 \
  -e REACT_APP_CLIENT_PORT=3501 \
  -e REACT_APP_SERVER_HOST=0.0.0.0 \
  --name tetris-game \
  tetris-game:latest
```

## 📊 容器管理

### 查看容器狀態

```bash
docker ps
```

### 查看容器日誌

```bash
docker logs tetris-game
docker logs -f tetris-game  # 實時查看
```

### 進入容器內部

```bash
docker exec -it tetris-game sh
```

### 查看容器資源使用

```bash
docker stats tetris-game
```

### 重啟容器

```bash
docker restart tetris-game
```

## 🔍 健康檢查

容器內置健康檢查：

```bash
docker inspect --format='{{.State.Health.Status}}' tetris-game
```

可能的狀態：

- `starting` - 正在啟動
- `healthy` - 運行正常
- `unhealthy` - 運行異常

## 🐛 故障排除

### 容器無法啟動

#### 1. 檢查端口占用

```powershell
# Windows
netstat -ano | findstr "8800"
netstat -ano | findstr "3500"
```

```bash
# Linux/Mac
lsof -i :8800
lsof -i :3500
```

#### 2. 查看詳細錯誤

```bash
docker logs tetris-game
```

#### 3. 檢查容器狀態

```bash
docker ps -a
```

### 無法連接到遊戲

#### 1. 確認容器正在運行

```bash
docker ps | grep tetris-game
```

#### 2. 檢查端口映射

```bash
docker port tetris-game
```

應該顯示：

```
3500/tcp -> 0.0.0.0:3500
8800/tcp -> 0.0.0.0:8800
```

#### 3. 測試連接

```bash
curl http://localhost:3500
curl http://localhost:8800/config
```

### 構建失敗

#### 1. 清理舊鏡像

```bash
docker system prune -a
```

#### 2. 重新構建（無緩存）

```bash
docker build --no-cache -t tetris-game:latest .
```

#### 3. 檢查 Dockerfile 語法

```bash
docker build --check -t tetris-game:latest .
```

## 🚢 生產環境部署

### 使用特定標籤

```bash
# 構建帶版本標籤的鏡像
docker build -t tetris-game:v2.0.0 .
docker build -t tetris-game:latest .

# 運行特定版本
docker run -d \
  -p 8800:8800 \
  -p 3500:3500 \
  --name tetris-game \
  --restart unless-stopped \
  tetris-game:v2.0.0
```

### 推送到 Docker Hub

```bash
# 登錄 Docker Hub
docker login

# 標記鏡像
docker tag tetris-game:latest yourusername/tetris-game:latest
docker tag tetris-game:v2.0.0 yourusername/tetris-game:v2.0.0

# 推送鏡像
docker push yourusername/tetris-game:latest
docker push yourusername/tetris-game:v2.0.0
```

### 從 Docker Hub 拉取並運行

```bash
# 拉取鏡像
docker pull yourusername/tetris-game:latest

# 運行容器
docker run -d \
  -p 8800:8800 \
  -p 3500:3500 \
  --name tetris-game \
  --restart unless-stopped \
  yourusername/tetris-game:latest
```

## 📦 多架構支持

構建支持多架構的鏡像：

```bash
# 創建並使用 buildx builder
docker buildx create --name multiarch --use

# 構建多架構鏡像並推送
docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7 \
  -t yourusername/tetris-game:latest \
  --push \
  .
```

## 🔒 安全建議

1. **不要在鏡像中存儲敏感信息**

   - 使用環境變量傳遞配置
   - 使用 Docker secrets 管理敏感數據

2. **定期更新基礎鏡像**

   ```bash
   docker pull node:18-alpine
   docker build --no-cache -t tetris-game:latest .
   ```

3. **掃描安全漏洞**

   ```bash
   docker scan tetris-game:latest
   ```

4. **限制容器資源**
   ```bash
   docker run -d \
     --cpus="1.0" \
     --memory="512m" \
     -p 8800:8800 \
     -p 3500:3500 \
     tetris-game:latest
   ```

## 📝 完整部署檢查清單

- [ ] Docker 和 Docker Compose 已安裝
- [ ] 構建 Docker 鏡像成功
- [ ] 容器啟動成功
- [ ] 端口映射正確（8800, 3500）
- [ ] 健康檢查通過
- [ ] 可以訪問 http://localhost:3500
- [ ] 多個客戶端可以連接
- [ ] 遊戲功能正常運行
- [ ] 日誌無錯誤訊息

## 🛠️ 開發環境 vs 生產環境

### 開發環境

```bash
# 使用 nodemon 進行熱重載
npm run dev
```

### 生產環境

```bash
# 使用 Docker 部署
docker-compose up -d
```

## 📚 相關資源

- [Docker 官方文檔](https://docs.docker.com/)
- [Docker Compose 文檔](https://docs.docker.com/compose/)
- [Node.js Docker 最佳實踐](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

**最後更新**: 2025 年 10 月 1 日  
**Docker 版本**: 20.10+  
**Node.js 版本**: 18 LTS
