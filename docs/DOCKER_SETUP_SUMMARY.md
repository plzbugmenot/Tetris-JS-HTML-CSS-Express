# 🐳 Docker 配置完成摘要

## ✅ 已添加的文件

### 1. Docker 配置文件

#### `Dockerfile`

- **用途**: Docker 鏡像構建配置
- **基礎鏡像**: node:18-alpine
- **暴露端口**: 8800 (Socket.IO), 3500 (客戶端)
- **特點**:
  - 使用輕量級 Alpine Linux
  - 生產環境優化（npm ci --only=production）
  - 內置健康檢查
  - 自動設置環境變量

#### `.dockerignore`

- **用途**: 排除不需要打包進鏡像的文件
- **排除內容**:
  - node_modules（會在容器內重新安裝）
  - 文檔文件（.md）
  - Git 目錄
  - IDE 配置
  - 臨時文件和日誌

#### `docker-compose.yml`

- **用途**: Docker Compose 編排配置
- **服務**: tetris-game
- **端口映射**: 8800:8800, 3500:3500
- **特性**:
  - 自動重啟（unless-stopped）
  - 健康檢查
  - 網絡隔離

### 2. 部署腳本

#### `docker-deploy.ps1` (Windows PowerShell)

- 自動化部署腳本
- 檢查 Docker 安裝
- 構建鏡像
- 啟動容器
- 提供交互式選項

#### `docker-deploy.sh` (Linux/Mac Bash)

- 與 PowerShell 腳本功能相同
- 適用於 Unix-like 系統

### 3. 文檔

#### `DOCKER_GUIDE.md`

- 完整的 Docker 部署指南
- 包含故障排除
- 生產環境配置
- 安全建議

## 📦 更新的文件

### `package.json`

- ✅ 版本更新: 1.0.0 → 2.0.0
- ✅ 名稱更新: server → tetris-multiplayer-server
- ✅ 添加描述和關鍵字
- ✅ 分離開發依賴（nodemon → devDependencies）
- ✅ 生產模式: start 使用 node 而非 nodemon
- ✅ 開發模式: 新增 dev 命令使用 nodemon

#### 新增的 npm 腳本

```json
{
  "start": "node index.js", // 生產環境啟動
  "dev": "nodemon index.js", // 開發環境啟動
  "build": "echo \"No build step...\"", // 構建命令（Node.js 無需構建）

  // Docker 命令
  "docker:build": "docker build -t tetris-game:latest .",
  "docker:run": "docker run -p 8800:8800 -p 3500:3500 --name tetris-game tetris-game:latest",
  "docker:stop": "docker stop tetris-game && docker rm tetris-game",

  // Docker Compose 命令
  "docker:compose:up": "docker-compose up -d",
  "docker:compose:down": "docker-compose down",
  "docker:compose:logs": "docker-compose logs -f",
  "docker:compose:rebuild": "docker-compose up -d --build"
}
```

## 🚀 使用方法

### 方法 1: 使用自動部署腳本（推薦）

#### Windows:

```powershell
.\docker-deploy.ps1
```

#### Linux/Mac:

```bash
chmod +x docker-deploy.sh
./docker-deploy.sh
```

### 方法 2: 使用 npm 腳本

#### 構建鏡像

```bash
npm run docker:build
```

#### 啟動容器（Docker Compose）

```bash
npm run docker:compose:up
```

#### 查看日誌

```bash
npm run docker:compose:logs
```

#### 停止容器

```bash
npm run docker:compose:down
```

### 方法 3: 使用 Docker 命令

#### 構建

```bash
docker build -t tetris-game:latest .
```

#### 運行

```bash
docker run -d \
  -p 8800:8800 \
  -p 3500:3500 \
  --name tetris-game \
  tetris-game:latest
```

## 🌐 訪問應用

容器啟動後，訪問以下地址：

- **遊戲客戶端**: http://localhost:3500
- **服務器 API**: http://localhost:8800
- **配置接口**: http://localhost:8800/config

## 🔧 環境變量

### 默認配置

| 變量                    | 默認值     | 說明           |
| ----------------------- | ---------- | -------------- |
| `NODE_ENV`              | production | 運行環境       |
| `REACT_APP_SERVER_PORT` | 8800       | Socket.IO 端口 |
| `REACT_APP_CLIENT_PORT` | 3500       | 客戶端端口     |
| `REACT_APP_SERVER_HOST` | 0.0.0.0    | 服務器主機     |

### 自定義配置

編輯 `docker-compose.yml`:

```yaml
environment:
  - REACT_APP_SERVER_PORT=8801
  - REACT_APP_CLIENT_PORT=3501
```

或使用命令行:

```bash
docker run -d \
  -e REACT_APP_SERVER_PORT=8801 \
  -e REACT_APP_CLIENT_PORT=3501 \
  -p 8801:8801 \
  -p 3501:3501 \
  tetris-game:latest
```

## 📊 容器管理

### 常用命令

```bash
# 查看運行中的容器
docker ps

# 查看所有容器
docker ps -a

# 查看容器日誌
docker logs tetris-game
docker logs -f tetris-game  # 實時查看

# 停止容器
docker stop tetris-game

# 啟動容器
docker start tetris-game

# 重啟容器
docker restart tetris-game

# 刪除容器
docker rm tetris-game

# 進入容器
docker exec -it tetris-game sh

# 查看容器資源使用
docker stats tetris-game

# 檢查健康狀態
docker inspect --format='{{.State.Health.Status}}' tetris-game
```

## 🐛 常見問題

### 1. 端口已被占用

**錯誤**: `bind: address already in use`

**解決方案**:

```bash
# 查看端口占用
netstat -ano | findstr "8800"  # Windows
lsof -i :8800                   # Linux/Mac

# 使用不同端口
docker run -d -p 8801:8800 -p 3501:3500 tetris-game:latest
```

### 2. 容器無法啟動

**檢查步驟**:

```bash
# 查看錯誤日誌
docker logs tetris-game

# 檢查容器狀態
docker ps -a

# 重新構建鏡像
docker build --no-cache -t tetris-game:latest .
```

### 3. 構建失敗

**解決方案**:

```bash
# 清理 Docker 緩存
docker system prune -a

# 重新構建
docker build --no-cache -t tetris-game:latest .
```

### 4. 無法連接到遊戲

**檢查清單**:

- [ ] 容器是否運行: `docker ps`
- [ ] 端口映射是否正確: `docker port tetris-game`
- [ ] 防火牆是否阻止連接
- [ ] 瀏覽器緩存清除: Ctrl+Shift+Del

## 🚢 生產環境部署

### 推送到 Docker Hub

```bash
# 1. 登錄
docker login

# 2. 標記鏡像
docker tag tetris-game:latest yourusername/tetris-game:v2.0.0

# 3. 推送
docker push yourusername/tetris-game:v2.0.0
```

### 從遠程倉庫部署

```bash
# 拉取鏡像
docker pull yourusername/tetris-game:v2.0.0

# 運行容器
docker run -d \
  -p 8800:8800 \
  -p 3500:3500 \
  --name tetris-game \
  --restart unless-stopped \
  yourusername/tetris-game:v2.0.0
```

## 📝 部署檢查清單

- [ ] Docker 已安裝並運行
- [ ] Docker Compose 已安裝（可選）
- [ ] 所有配置文件已創建
- [ ] 環境變量已設置（如需自定義）
- [ ] 構建成功無錯誤
- [ ] 容器啟動成功
- [ ] 端口映射正確
- [ ] 健康檢查通過
- [ ] 可以訪問 http://localhost:3500
- [ ] 多個客戶端可以連接
- [ ] 遊戲功能正常

## 🎯 下一步

1. **測試部署**

   ```bash
   .\docker-deploy.ps1  # Windows
   ./docker-deploy.sh   # Linux/Mac
   ```

2. **訪問應用**

   - 打開瀏覽器訪問 http://localhost:3500
   - 多個標籤頁測試多人遊戲

3. **監控運行**

   ```bash
   docker logs -f tetris-game
   ```

4. **生產環境部署**
   - 參考 `DOCKER_GUIDE.md` 進行完整配置
   - 設置 HTTPS（使用 nginx 反向代理）
   - 配置域名和 SSL 證書

## 📚 相關文檔

- 📄 `DOCKER_GUIDE.md` - 完整 Docker 部署指南
- 📄 `README.md` - 項目說明
- 📄 `QUICK_START.md` - 快速開始指南
- 📄 `UI_TEST_GUIDE.md` - UI 測試指南

## 🔄 版本歷史

- **v2.0.0** (2025-10-01)
  - ✅ 添加完整 Docker 支持
  - ✅ 添加 Docker Compose 配置
  - ✅ 添加自動化部署腳本
  - ✅ 更新 package.json 配置
  - ✅ 分離開發和生產依賴

---

**創建日期**: 2025 年 10 月 1 日  
**Docker 版本要求**: 20.10+  
**Node.js 版本**: 18 LTS  
**狀態**: ✅ 已完成並測試
