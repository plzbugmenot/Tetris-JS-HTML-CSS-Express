# 🐛 Bug 修復摘要

## 問題描述

用戶報告以下 JavaScript 錯誤：

1. ❌ `Uncaught SyntaxError: Identifier 'socket' has already been declared`
2. ❌ `Uncaught ReferenceError: sendMessage is not defined`
3. ❌ `Could not establish connection` (Chrome 擴展錯誤，可忽略)

## 根本原因

### 錯誤 #1: socket 變數重複聲明

- **位置**: `game-new.js` 第 1 行
- **原因**: `index.html` 中已聲明 `socket` 變數，而 `game-new.js` 又重複聲明
- **衝突**:

  ```javascript
  // index.html 中
  let socket;

  // game-new.js 中（錯誤）
  let socket; // ❌ 重複聲明
  ```

### 錯誤 #2: sendMessage 函數未定義

- **位置**: `index.html` 第 17 行
- **原因**: HTML 中調用了 `sendMessage()` 但實際函數名為 `registerPlayer()`
- **問題代碼**:
  ```html
  <button onclick="sendMessage()">
    <!-- ❌ 函數不存在 -->
    <button onclick="startGame()"><!-- ❌ 應為 requestStartGame() --></button>
  </button>
  ```

## 修復方案

### ✅ 修復 #1: 移除重複的 socket 聲明

**修改文件**: `public/game-new.js`

```javascript
// 修改前（第1-2行）
let socket;
let mySocketId = null;

// 修改後
// socket 由 index.html 提供，不在這裡聲明
let mySocketId = null;
```

**其他相關修改**:

- 在所有使用 `socket` 的地方改為 `window.socket`
- 在函數內部使用 `const socket = window.socket;` 獲取引用

### ✅ 修復 #2: 統一函數命名

**修改文件**: `public/index.html`

```html
<!-- 修改前 -->
<button onclick="sendMessage()">加入遊戲</button>
<button onclick="startGame()">開始遊戲</button>

<!-- 修改後 -->
<button onclick="registerPlayer()">加入遊戲</button>
<button onclick="requestStartGame()">開始遊戲</button>
```

**修改文件**: `public/game-new.js`

```javascript
// 重命名函數
function sendMessage() { ... }  // ❌ 舊名稱
function registerPlayer() { ... }  // ✅ 新名稱

function startGame() { ... }  // ❌ 舊名稱
function requestStartGame() { ... }  // ✅ 新名稱
```

## 詳細代碼修改

### 1. game-new.js 全局變數區域

```diff
- let socket;
+ // socket 由 index.html 提供，不在這裡聲明
  let mySocketId = null;
```

### 2. game-new.js 初始化函數

```diff
  function init() {
    if (typeof window.socket !== 'undefined' && window.socket) {
-     socket = window.socket;
      mySocketId = window.socket.id;
    } else {
      window.addEventListener('socketReady', () => {
-       socket = window.socket;
        mySocketId = window.socket.id;
      });
    }
  }
```

### 3. game-new.js Socket 監聽設置

```diff
  function setupSocketListeners() {
+   const socket = window.socket;
    if (!socket) return;

    socket.on('connect', () => { ... });
    // ... 其他監聽器
  }
```

### 4. game-new.js 玩家註冊函數

```diff
- function sendMessage() {
+ function registerPlayer() {
+   const socket = window.socket;
    if (!socket || !socket.connected) {
      alert('正在連接到伺服器，請稍後再試...');
      return;
    }
    // ... 其餘代碼
  }
```

### 5. game-new.js 開始遊戲函數

```diff
- function startGame() {
+ function requestStartGame() {
+   const socket = window.socket;
    if (!socket) return;
    socket.emit('startGameWithCouplePlayer');
  }
```

### 6. game-new.js 鍵盤監聽器

```diff
  function setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
+     const socket = window.socket;
      if (!socket || gameState !== GAME) return;

      switch(e.key) {
        case 'ArrowLeft':
          socket.emit('moveBlock', { ... });
          break;
        // ... 其他按鍵
        case 'Enter':
          if (gameState === READY) {
-           startGame();
+           requestStartGame();
          }
          break;
      }
    });
  }
```

## 驗證步驟

### ✅ 修復後的預期結果

1. **瀏覽器控制台應顯示**:

   ```
   connecting...
   Connecting to: http://localhost:8801
   Socket connected successfully
   Game initializing...
   Socket connected: <socket-id>
   ```

2. **無錯誤訊息**:

   - ✅ 無 "socket has already been declared"
   - ✅ 無 "sendMessage is not defined"

3. **功能正常**:
   - ✅ 可以輸入玩家名稱並點擊「加入遊戲」
   - ✅ 可以看到房間人數更新
   - ✅ 當 ≥2 人時可以點擊「開始遊戲」

## 測試檢查清單

- [ ] 清除瀏覽器緩存（Ctrl+Shift+Del）
- [ ] 硬刷新頁面（Ctrl+F5）
- [ ] 打開開發者工具（F12）查看控制台
- [ ] 確認無紅色錯誤訊息
- [ ] 測試註冊功能
- [ ] 測試開始遊戲功能
- [ ] 測試鍵盤控制（方向鍵）

## 後續改進建議

### 代碼質量

1. ✨ 考慮使用 ES6 模組化（import/export）
2. ✨ 添加 TypeScript 類型檢查
3. ✨ 使用 ESLint 進行代碼檢查

### 錯誤處理

1. ✨ 添加更詳細的錯誤日誌
2. ✨ 實現重連機制
3. ✨ 添加網絡狀態監測

### 用戶體驗

1. ✨ 添加加載動畫
2. ✨ 顯示連接狀態指示器
3. ✨ 提供更友好的錯誤提示

## 相關文件

- 📄 `public/index.html` - 主 HTML 文件
- 📄 `public/game-new.js` - 遊戲邏輯（新版）
- 📄 `public/style.css` - 樣式文件
- 📄 `index.js` - 後端服務器
- 📄 `UI_TEST_GUIDE.md` - UI 測試指南

---

**修復日期**: 2025 年 10 月 1 日  
**修復版本**: v2.0-bugfix  
**影響範圍**: 前端 JavaScript 代碼  
**破壞性變更**: 無
