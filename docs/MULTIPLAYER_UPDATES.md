# 多人連線功能更新

## 📋 更新概要

將原本僅支援 2 人連線的俄羅斯方塊遊戲升級為支援多人連線（預設最多 4 人）。

## ✨ 主要改動

### 1. 添加可配置的最大玩家數

```javascript
const MAX_PLAYERS = 4; // 可以調整為 2-8 人
```

### 2. 改進連線邏輯

- ✅ 將硬編碼的 2 人限制改為 `MAX_PLAYERS`
- ✅ 當房間已滿時，向新連線玩家發送友好的拒絕訊息
- ✅ 在控制台顯示當前玩家數 `X/MAX_PLAYERS`

### 3. 動態玩家角色系統

- ✅ 從固定的 `USER1`/`USER2` 改為動態的 `USER1`、`USER2`、`USER3`...
- ✅ 每個玩家都有唯一的 `playerNumber` 屬性
- ✅ 自動分配玩家名稱（`Player1`, `Player2`, 等）

### 4. 靈活的遊戲開始條件

- ✅ 支援 2-MAX_PLAYERS 人開始遊戲
- ✅ 當玩家數不足或超過限制時，提供清晰的錯誤訊息

### 5. 斷線處理

- ✅ 自動檢測玩家斷線
- ✅ 從玩家列表中移除斷線玩家
- ✅ 通知其他玩家有人離開
- ✅ 在控制台記錄離開事件

### 6. 端口占用錯誤處理

- ✅ 優雅處理端口被占用的情況
- ✅ 顯示中文錯誤訊息和解決方案
- ✅ 提供環境變量配置建議

## 🎮 使用方式

### 啟動服務器

```bash
node index.js
```

### 自定義配置

#### 修改最大玩家數

在 `index.js` 中修改：

```javascript
const MAX_PLAYERS = 6; // 改為你想要的數字
```

#### 使用不同端口

```powershell
# PowerShell
$env:REACT_APP_SERVER_PORT=8801
$env:REACT_APP_CLIENT_PORT=3501
node index.js
```

```cmd
# CMD
set REACT_APP_SERVER_PORT=8801
set REACT_APP_CLIENT_PORT=3501
node index.js
```

## 📝 Socket.IO 事件

### 新增/修改的事件

#### 服務器發送事件

- `newUserResponse` - 包含 `maxPlayers` 資訊
- `connectionRejected` - 當房間已滿時發送
- `gameStartFailed` - 當玩家數不符合要求時發送
- `playerDisconnected` - 當有玩家離開時通知所有人

#### 客戶端接收事件

客戶端需要處理以下新事件：

```javascript
socket.on("connectionRejected", (data) => {
  alert(data.reason);
});

socket.on("gameStartFailed", (data) => {
  alert(data.reason);
});

socket.on("playerDisconnected", (data) => {
  console.log(`玩家 ${data.userName} 已離開`);
  // 更新 UI
});
```

## 🔍 控制台輸出示例

```
Server listening on localhost:8800
✅ 玩家連接：Player1 (USER1) - socketID: xxx
目前玩家數：1/4

✅ 玩家連接：Player2 (USER2) - socketID: yyy
目前玩家數：2/4

🎮 遊戲開始！玩家數：2/4

👋 玩家離開：Player1 (USER1)
目前玩家數：1/4
```

## ⚠️ 注意事項

1. **前端更新需求**：前端程式碼（`public/game.js`）可能需要相應更新以：

   - 支援顯示多個玩家的棋盤
   - 處理新的 Socket 事件
   - 調整 UI 佈局以容納更多玩家

2. **遊戲邏輯**：某些特定的 2 人對戰機制（如發送區塊）可能需要重新設計以支援多人遊戲。

3. **性能考慮**：建議 MAX_PLAYERS 不要超過 8，以確保遊戲流暢運行。

## 🐛 已知問題

- 發送區塊系統（sendStateBlocks）仍基於 2 人遊戲設計，多人模式下可能需要調整
- 前端 UI 目前只顯示 2 個玩家的信息

## 🔄 後續改進建議

1. 更新前端以支援動態玩家數量顯示
2. 重新設計多人對戰的攻擊/防禦機制
3. 添加觀戰者模式
4. 添加房間系統（多個遊戲房間）
5. 添加遊戲大廳和配對系統

## 📅 更新日期

2025 年 10 月 1 日
