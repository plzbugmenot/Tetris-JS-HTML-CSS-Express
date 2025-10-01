# 🎮 多人俄羅斯方塊 - 快速開始指南

## ✅ 已完成的更新

### 後端改進（index.js）

1. ✅ **MAX_PLAYERS 配置** - 可調整最大玩家數（預設 4 人）
2. ✅ **動態玩家系統** - 支援 USER1, USER2, USER3, USER4...
3. ✅ **靈活遊戲開始** - 2-4 人即可開始遊戲
4. ✅ **斷線處理** - 自動移除離線玩家
5. ✅ **端口錯誤處理** - 友好的中文錯誤訊息
6. ✅ **房間狀態追蹤** - 顯示當前玩家數

## 🚀 啟動方式

### 使用預設端口（8800/3500）

```bash
node index.js
```

### 使用自定義端口

```powershell
# PowerShell
$env:REACT_APP_SERVER_PORT=8801
$env:REACT_APP_CLIENT_PORT=3501
node index.js
```

### 一行命令（PowerShell）

```powershell
$env:REACT_APP_SERVER_PORT=8801; $env:REACT_APP_CLIENT_PORT=3501; node index.js
```

## 🎯 測試多人連線

### 1. 啟動服務器

服務器會顯示：

```
Server listening on localhost:8801
Client listening on 3501
```

### 2. 打開瀏覽器

- 玩家 1: `http://localhost:3501`
- 玩家 2: `http://localhost:3501`（新標籤）
- 玩家 3: `http://localhost:3501`（新標籤）
- 玩家 4: `http://localhost:3501`（新標籤）

### 3. 控制台輸出

當玩家連線時，你會看到：

```
✅ 玩家連接：Player1 (USER1)
目前玩家數：1/4

✅ 玩家連接：Player2 (USER2)
目前玩家數：2/4

🎮 遊戲開始！玩家數：2/4
```

當玩家離開時：

```
👋 玩家離開：Player1 (USER1)
目前玩家數：1/4
```

## ⚙️ 配置選項

### 修改最大玩家數

在 `index.js` 第 92 行：

```javascript
const MAX_PLAYERS = 4; // 改為 2-8 之間的任意數字
```

### 建議設定

- **2 人**：經典對戰模式
- **4 人**：小型多人對戰（預設）
- **6 人**：中型團體遊戲
- **8 人**：大型混戰（不建議超過 8 人）

## 📊 新增 Socket 事件

### 客戶端需要處理的新事件

```javascript
// 連線被拒絕（房間已滿）
socket.on("connectionRejected", (data) => {
  console.log(data.reason);
  alert(data.reason);
});

// 遊戲開始失敗（玩家數不符）
socket.on("gameStartFailed", (data) => {
  console.log(data.reason);
  alert(data.reason);
});

// 玩家離開
socket.on("playerDisconnected", (data) => {
  console.log(`${data.userName} 已離開，剩餘 ${data.remainingPlayers} 人`);
  // 更新玩家列表 UI
});

// 新玩家加入（更新的資料結構）
socket.on("newUserResponse", (data) => {
  console.log(`當前 ${data.size}/${data.maxPlayers} 人`);
  // data.newUser.playerNumber - 玩家編號（1, 2, 3, 4...）
  // data.newUser.who - 玩家ID（USER1, USER2, USER3...）
});
```

## 🔍 調試技巧

### 檢查端口占用

```powershell
# 查看端口使用情況
netstat -ano | findstr :8800
netstat -ano | findstr :3500
```

### 關閉占用端口的程序

```powershell
# 找到 PID 後
taskkill /PID <PID編號> /F
```

### 查看實時日誌

服務器會在控制台顯示所有重要事件：

- 玩家連線/離線
- 遊戲開始/結束
- 錯誤訊息

## ⚠️ 目前限制

1. **前端 UI** - 目前只顯示 2 個玩家的棋盤，需要更新以支援更多玩家
2. **攻擊系統** - 發送區塊機制基於 2 人設計，多人模式下可能需調整
3. **遊戲平衡** - 多人模式的遊戲規則可能需要重新設計

## 🎨 建議的前端更新

### 1. 動態玩家列表

```html
<div id="player-list"></div>
```

```javascript
socket.on("newUserResponse", (data) => {
  updatePlayerList(data);
});

function updatePlayerList(data) {
  // 顯示所有在線玩家
  // 使用 data.size 和 data.maxPlayers
}
```

### 2. 多棋盤佈局

- 2 人：左右分屏
- 4 人：四宮格
- 6 人：3x2 網格
- 8 人：4x2 網格

### 3. 玩家狀態指示器

```javascript
players.forEach((player) => {
  // 顯示玩家名稱、等級、狀態
  // 使用不同顏色區分玩家
});
```

## 📝 待辦事項

- [ ] 更新前端 UI 支援動態玩家數
- [ ] 重新設計多人攻擊系統
- [ ] 添加房間系統（多個遊戲房間）
- [ ] 添加觀戰者模式
- [ ] 添加遊戲大廳
- [ ] 添加玩家排行榜

## 🆘 常見問題

### Q: 為什麼我看不到其他玩家？

A: 前端 UI 目前只顯示 2 個玩家。雖然後端支援多人，但需要更新前端代碼。

### Q: 最多支援多少人？

A: 技術上可支援任意數量，但建議 2-8 人以保證性能。

### Q: 如何重啟遊戲？

A: 在終端按 `Ctrl+C` 停止，然後重新運行 `node index.js`

### Q: 端口被占用怎麼辦？

A: 使用環境變量設置不同端口，或關閉占用端口的程序。

## 📞 技術支持

如遇問題，請查看：

1. 控制台日誌
2. 瀏覽器開發者工具（F12）的 Console 和 Network 標籤
3. `MULTIPLAYER_UPDATES.md` 了解詳細技術文檔

---

最後更新：2025 年 10 月 1 日
