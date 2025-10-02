# 🎮 快速測試步驟

## ✅ Bug 已修復

- ✅ Socket 重複聲明問題
- ✅ sendMessage 未定義問題
- ✅ 函數名稱統一為 registerPlayer() 和 requestStartGame()

## 🚀 立即測試

### 1️⃣ 啟動服務器

```powershell
npm start
```

或指定端口：

```powershell
$env:REACT_APP_SERVER_PORT=8801; $env:REACT_APP_CLIENT_PORT=3501; node index.js
```

### 2️⃣ 打開多個瀏覽器標籤

**標籤 1**: `http://localhost:3501`

- 輸入名稱: "Alice"
- 點擊「加入遊戲」

**標籤 2**: `http://localhost:3501`

- 輸入名稱: "Bob"
- 點擊「加入遊戲」

**標籤 3**: `http://localhost:3501`（可選）

- 輸入名稱: "Charlie"

**標籤 4**: `http://localhost:3501`（可選）

- 輸入名稱: "Diana"

### 3️⃣ 驗證結果

#### 控制台應顯示：

```
connecting...
Connecting to: http://localhost:8801
Socket connected successfully
Game initializing...
Socket connected: <socket-id>
New user response: {size: 1, maxPlayers: 4, ...}
```

#### UI 應顯示：

- ✅ 房間人數: 1/4 → 2/4 → 3/4 → 4/4
- ✅ 當 ≥2 人時出現「開始遊戲」按鈕
- ✅ 所有玩家棋盤以網格排列
- ✅ 自己的棋盤有綠色邊框

### 4️⃣ 開始遊戲

- 任一玩家點擊「開始遊戲」
- 使用方向鍵控制方塊
- 按空格鍵旋轉方塊

## 🐛 如果還有問題

### 清除緩存：

1. 按 `Ctrl + Shift + Delete`
2. 選擇「緩存的圖片和文件」
3. 點擊「清除數據」

### 硬刷新：

- Windows: `Ctrl + F5`
- Mac: `Cmd + Shift + R`

### 查看日誌：

1. 按 `F12` 打開開發者工具
2. 切換到 `Console` 標籤
3. 查看是否有紅色錯誤訊息

## 📋 已修改的文件

1. ✅ `public/game-new.js` - 移除 socket 重複聲明，更新函數名稱
2. ✅ `public/index.html` - 更新按鈕事件處理器

## 📚 相關文檔

- 📄 `BUGFIX_SUMMARY.md` - 詳細修復說明
- 📄 `UI_TEST_GUIDE.md` - 完整測試指南
- 📄 `MULTIPLAYER_UPDATES.md` - 多人功能更新
- 📄 `QUICK_START.md` - 快速開始指南

---

最後更新：2025 年 10 月 1 日
