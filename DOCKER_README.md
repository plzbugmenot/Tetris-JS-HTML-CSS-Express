# 🐳 Docker 快速開始

## 一鍵部署

### Windows

```powershell
.\docker-deploy.ps1
```

### Linux/Mac

```bash
chmod +x docker-deploy.sh
./docker-deploy.sh
```

## 手動部署

### 構建並運行

```bash
# 構建鏡像
docker build -t tetris-game:latest .

# 運行容器
docker run -d -p 8800:8800 -p 3500:3500 --name tetris-game tetris-game:latest

# 訪問遊戲
# http://localhost:3500
```

### 使用 Docker Compose

```bash
# 啟動
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止
docker-compose down
```

## 使用 npm 腳本

```bash
npm run docker:build          # 構建鏡像
npm run docker:compose:up     # 啟動容器
npm run docker:compose:logs   # 查看日誌
npm run docker:compose:down   # 停止容器
```

## 📚 完整文檔

- 📄 [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - 完整部署指南
- 📄 [DOCKER_COMPLETE_REPORT.md](./DOCKER_COMPLETE_REPORT.md) - 配置報告

---

✅ **測試通過** | 🚀 **生產就緒** | 📦 **v2.0.0**
