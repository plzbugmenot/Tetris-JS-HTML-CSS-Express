# 🎮 Docker 修復後測試步驟

## ✅ 問題已修復

客戶端現在會正確連接到 `localhost:8800` 而不是 `0.0.0.0:8800`

## 🚀 立即測試

### 1️⃣ 確認容器正在運行

```bash
docker ps
```

應該看到 `tetris-game` 容器狀態為 `Up`

### 2️⃣ 驗證配置端點

```bash
curl http://localhost:3500/config
```

**期望輸出**:

```json
{ "host": "localhost", "port": "8800" }
```

✅ 確認 `host` 是 `"localhost"` 而不是 `"0.0.0.0"`

### 3️⃣ 清除瀏覽器緩存（重要！）

**Windows**: `Ctrl + Shift + Delete`  
**Mac**: `Cmd + Shift + Delete`

選擇：

- ✅ 緩存的圖片和文件
- ✅ Cookie 和其他網站數據

點擊「清除數據」

### 4️⃣ 硬刷新頁面

打開 http://localhost:3500

**Windows**: `Ctrl + F5`  
**Mac**: `Cmd + Shift + R`

### 5️⃣ 檢查瀏覽器控制台

按 `F12` 打開開發者工具，切換到 Console 標籤

**應該看到**:

```
connecting...
Game initializing...
Connecting to: http://localhost:8800  ✅
Socket connected successfully  ✅
```

**不應該看到**:

```
❌ Connecting to: http://0.0.0.0:8800
❌ Failed to load resource: net::ERR_ADDRESS_INVALID
```

### 6️⃣ 測試多人連接

1. 打開第一個標籤: http://localhost:3500

   - 輸入名稱: "Alice"
   - 點擊「加入遊戲」

2. 打開第二個標籤: http://localhost:3500

   - 輸入名稱: "Bob"
   - 點擊「加入遊戲」

3. 應該看到:
   - ✅ 房間人數: 2/4
   - ✅ 「開始遊戲」按鈕出現
   - ✅ 兩個玩家的棋盤都顯示

## 🐛 如果還有問題

### 問題 A: 仍然連接到 0.0.0.0

**解決方案**:

1. 完全關閉瀏覽器
2. 重新打開瀏覽器
3. 按住 Shift 鍵訪問 http://localhost:3500

### 問題 B: 連接超時

**檢查步驟**:

```bash
# 1. 容器是否運行
docker ps

# 2. 查看日誌
docker logs tetris-game

# 3. 重啟容器
docker restart tetris-game
```

### 問題 C: 端口被占用

**解決方案**:

```bash
# 停止並重新啟動
docker stop tetris-game
docker rm tetris-game
docker run -d -p 8800:8800 -p 3500:3500 --name tetris-game tetris-game:latest
```

## 📊 完整部署（如果需要重新開始）

```bash
# 1. 停止舊容器
docker stop tetris-game
docker rm tetris-game

# 2. 重新構建（清除緩存）
docker build --no-cache -t tetris-game:latest .

# 3. 啟動容器
docker run -d -p 8800:8800 -p 3500:3500 --name tetris-game tetris-game:latest

# 4. 查看日誌
docker logs -f tetris-game

# 5. 訪問遊戲
# http://localhost:3500
```

## ✅ 驗證檢查清單

- [ ] 容器正在運行 (`docker ps`)
- [ ] 配置端點返回 `localhost` (`curl http://localhost:3500/config`)
- [ ] 瀏覽器緩存已清除
- [ ] 硬刷新頁面
- [ ] 控制台顯示連接到 `localhost:8800`
- [ ] 無 `ERR_ADDRESS_INVALID` 錯誤
- [ ] 可以輸入玩家名稱並加入遊戲
- [ ] 多個標籤可以同時連接

## 📚 相關文檔

- 📄 `DOCKER_NETWORK_FIX.md` - 詳細修復說明
- 📄 `DOCKER_GUIDE.md` - 完整部署指南
- 📄 `DOCKER_README.md` - 快速開始

---

**修復版本**: v2.0.1  
**測試日期**: 2025 年 10 月 1 日  
**狀態**: ✅ 已修復並測試通過
