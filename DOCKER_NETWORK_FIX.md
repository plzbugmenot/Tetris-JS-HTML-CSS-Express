# 🔧 Docker 網絡連接修復報告

## ❌ 原始問題

客戶端無法連接到 Socket.IO 服務器：

```
Connecting to: http://0.0.0.0:8800
Failed to load resource: net::ERR_ADDRESS_INVALID
```

## 🔍 問題分析

### 根本原因

1. **Docker 容器配置問題**

   - `REACT_APP_SERVER_HOST=0.0.0.0` 用於服務器監聽所有網絡接口
   - 但 `0.0.0.0` 對客戶端是無效的連接地址
   - 客戶端需要連接到 `localhost` 或 `127.0.0.1`

2. **配置端點返回錯誤地址**
   - `/config` 端點直接返回 `HOST` 變數（值為 `0.0.0.0`）
   - 客戶端從 `/config` 獲取配置後嘗試連接到 `0.0.0.0`

## ✅ 解決方案

### 1. 新增環境變量

添加 `CLIENT_HOST` 變數來區分服務器監聽地址和客戶端連接地址：

```javascript
const HOST = process.env.REACT_APP_SERVER_HOST || "localhost";
const CLIENT_HOST =
  process.env.REACT_APP_CLIENT_CONNECT_HOST ||
  (HOST === "0.0.0.0" ? "localhost" : HOST);
```

### 2. 修改配置端點

**修改前** (`index.js`):

```javascript
server.get("/config", (req, res) => {
  res.json({
    host: HOST, // ❌ 返回 0.0.0.0
    port: PORT,
  });
});

client.get("/config", (req, res) => {
  res.json({
    host: HOST, // ❌ 返回 0.0.0.0
    port: PORT,
  });
});
```

**修改後**:

```javascript
server.get("/config", (req, res) => {
  res.json({
    host: CLIENT_HOST, // ✅ 返回 localhost
    port: PORT,
  });
});

client.get("/config", (req, res) => {
  res.json({
    host: CLIENT_HOST, // ✅ 返回 localhost
    port: PORT,
  });
});
```

### 3. 更新 Docker 配置

**Dockerfile**:

```dockerfile
ENV REACT_APP_SERVER_HOST=0.0.0.0
ENV REACT_APP_CLIENT_CONNECT_HOST=localhost  # ✅ 新增
```

**docker-compose.yml**:

```yaml
environment:
  - REACT_APP_SERVER_HOST=0.0.0.0
  - REACT_APP_CLIENT_CONNECT_HOST=localhost # ✅ 新增
```

### 4. 修改服務器監聽

確保服務器明確監聽指定的 HOST：

```javascript
server_http.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
});
```

## 📊 修改文件清單

| 文件                 | 修改內容                            | 狀態 |
| -------------------- | ----------------------------------- | ---- |
| `index.js`           | 添加 `CLIENT_HOST` 變數             | ✅   |
| `index.js`           | 修改兩個 `/config` 端點             | ✅   |
| `index.js`           | 修改 `listen()` 調用                | ✅   |
| `Dockerfile`         | 添加 `CLIENT_CONNECT_HOST` 環境變量 | ✅   |
| `docker-compose.yml` | 添加 `CLIENT_CONNECT_HOST` 環境變量 | ✅   |

## 🧪 測試結果

### 配置端點測試

```bash
# 服務器配置端點
$ curl http://localhost:8800/config
{"host":"localhost","port":"8800"}  # ✅

# 客戶端配置端點
$ curl http://localhost:3500/config
{"host":"localhost","port":"8800"}  # ✅
```

### 容器狀態

```bash
$ docker ps
CONTAINER ID   IMAGE                COMMAND    STATUS
ab32b220af05   tetris-game:latest   ...        Up (healthy)  # ✅
```

### 容器日誌

```
Server listening on 0.0.0.0:8800  # ✅ 監聽所有接口
Client listening on 3500          # ✅ 客戶端正常
```

## 🌐 工作原理

### Docker 網絡架構

```
┌─────────────────────────────────────────┐
│         Docker 容器                      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Node.js 服務器                  │   │
│  │  監聽: 0.0.0.0:8800             │   │
│  │  (接受所有網絡接口的連接)         │   │
│  └─────────────────────────────────┘   │
│              ↕                          │
│  ┌─────────────────────────────────┐   │
│  │  靜態文件服務器                   │   │
│  │  監聽: 0.0.0.0:3500             │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
              ↕
    端口映射: 8800:8800, 3500:3500
              ↕
┌─────────────────────────────────────────┐
│         主機 (Host Machine)              │
│                                         │
│  瀏覽器訪問:                             │
│  http://localhost:3500                  │
│                                         │
│  客戶端連接:                             │
│  http://localhost:8800 (Socket.IO)     │
└─────────────────────────────────────────┘
```

### 配置流程

1. **瀏覽器訪問**: `http://localhost:3500`
2. **獲取配置**: `fetch('/config')` → `{"host":"localhost","port":"8800"}`
3. **連接 Socket.IO**: `io.connect('http://localhost:8800')` ✅

## 💡 關鍵概念

### 0.0.0.0 vs localhost

| 地址        | 用途       | 說明                     |
| ----------- | ---------- | ------------------------ |
| `0.0.0.0`   | 服務器監聽 | 接受所有網絡接口的連接   |
| `localhost` | 客戶端連接 | 本機回環地址 (127.0.0.1) |

### 為什麼需要區分？

- **服務器端**: 使用 `0.0.0.0` 可以接受來自任何網絡接口的連接（包括 localhost、內網 IP 等）
- **客戶端**: 必須使用具體的主機名（如 `localhost`）才能建立連接
- **Docker 環境**: 容器內監聽 `0.0.0.0`，主機上通過 `localhost` 訪問

## 🔒 安全考慮

### 生產環境配置

```javascript
// 開發環境
const CLIENT_HOST = "localhost";

// 生產環境
const CLIENT_HOST = "yourdomain.com"; // 或實際的域名/IP
```

### Docker Compose 生產配置

```yaml
environment:
  - REACT_APP_SERVER_HOST=0.0.0.0
  - REACT_APP_CLIENT_CONNECT_HOST=${DOMAIN_NAME:-localhost}
```

## 📝 使用說明

### 本地開發

```bash
# 不使用 Docker
npm run dev

# 客戶端自動連接到 localhost:8800
```

### Docker 部署

```bash
# 構建並運行
docker build -t tetris-game:latest .
docker run -d -p 8800:8800 -p 3500:3500 --name tetris-game tetris-game:latest

# 訪問遊戲
# http://localhost:3500
```

### Docker Compose 部署

```bash
# 啟動
docker-compose up -d

# 訪問遊戲
# http://localhost:3500
```

## 🎯 驗證步驟

### 1. 清除瀏覽器緩存

```
Ctrl + Shift + Delete (Windows)
Cmd + Shift + Delete (Mac)
```

### 2. 硬刷新頁面

```
Ctrl + F5 (Windows)
Cmd + Shift + R (Mac)
```

### 3. 檢查控制台

應該看到：

```
connecting...
Game initializing...
Connecting to: http://localhost:8800  # ✅ 正確！
Socket connected successfully
```

### 4. 測試多人連接

- 打開多個瀏覽器標籤
- 輸入不同的玩家名稱
- 確認可以看到其他玩家

## 🐛 故障排除

### 如果仍然看到 0.0.0.0

1. **清除瀏覽器緩存**（最重要）
2. **重新構建容器**:

   ```bash
   docker stop tetris-game
   docker rm tetris-game
   docker build --no-cache -t tetris-game:latest .
   docker run -d -p 8800:8800 -p 3500:3500 --name tetris-game tetris-game:latest
   ```

3. **檢查配置端點**:
   ```bash
   curl http://localhost:3500/config
   # 應該返回: {"host":"localhost","port":"8800"}
   ```

### 如果連接超時

1. 檢查容器是否運行: `docker ps`
2. 檢查日誌: `docker logs tetris-game`
3. 檢查端口: `docker port tetris-game`

## ✅ 完成狀態

- [x] 識別問題根本原因
- [x] 添加 `CLIENT_HOST` 變數
- [x] 修改配置端點
- [x] 更新 Docker 配置文件
- [x] 重新構建和測試
- [x] 驗證配置端點正確
- [x] 文檔更新

## 🎉 總結

問題已完全解決！現在：

✅ **服務器監聽**: `0.0.0.0:8800`（接受所有連接）  
✅ **客戶端連接**: `localhost:8800`（正確的地址）  
✅ **配置端點**: 返回正確的客戶端連接地址  
✅ **Docker 容器**: 正常運行並可訪問

請**清除瀏覽器緩存**並**硬刷新**頁面來測試修復效果！

---

**修復日期**: 2025 年 10 月 1 日  
**影響範圍**: Docker 網絡配置  
**修復版本**: v2.0.1
