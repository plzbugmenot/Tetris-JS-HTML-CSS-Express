# 代碼整理指南

## 📐 專案結構規範

### 目錄組織

```
project/
├── server/          # 後端邏輯
│   ├── config.js    # 配置管理
│   ├── gameState.js # 狀態管理
│   ├── gameLogic.js # 遊戲邏輯
│   └── socketHandlers.js # Socket 處理
├── public/          # 前端資源
│   ├── css/         # 樣式文件
│   ├── js/          # JavaScript 模組
│   ├── index.html   # 主頁面
│   └── socket.io/   # Socket.IO 客戶端
├── docs/            # 文檔
├── index.js         # 主入口
└── README.md        # 專案說明
```

## 📝 命名規範

### 文件命名

- 模組文件: `camelCase.js` (如 `gameLogic.js`)
- 配置文件: `config.js`, `.env`
- 文檔文件: `UPPERCASE.md` (如 `README.md`)

### 變量命名

- 常數: `UPPER_SNAKE_CASE` (如 `MAX_PLAYERS`)
- 變量: `camelCase` (如 `playerName`)
- 函數: `camelCase` (如 `addUser`)
- 類: `PascalCase` (如 `GameBoard`)

## 🎨 代碼風格

### JavaScript

```javascript
// ✅ 好的寫法
const MAX_PLAYERS = 4;

function addUser(socketID, userName) {
  return {
    socketID,
    userName,
    state: READY,
  };
}

// ❌ 避免的寫法
const maxplayers = 4;
function AddUser(socket, name) {
  return { socket: socket, name: name, state: "READY" };
}
```

### CSS

```css
/* ✅ 好的寫法 - 有註解和分類 */
/* === 全局樣式 === */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* === 遊戲容器 === */
.game-container {
  display: grid;
  gap: 20px;
}

/* ❌ 避免的寫法 - 無組織 */
* {
  margin: 0;
  padding: 0;
}
.game-container {
  display: grid;
  gap: 20px;
}
```

## 📦 模組化原則

### 單一職責

每個模組只負責一個功能:

- ✅ `config.js` - 只管理配置
- ✅ `gameState.js` - 只管理狀態
- ❌ 避免一個文件包含所有邏輯

### 導入/導出

```javascript
// ✅ 清晰的導出
module.exports = {
  addUser,
  removeUser,
  getAllUsers,
};

// ✅ 清晰的導入
const { addUser, removeUser } = require("./gameState");
```

## 📄 註解規範

### 文件頭註解

```javascript
/**
 * 遊戲狀態管理模組
 * 負責管理玩家列表、遊戲狀態和方塊形狀定義
 */
```

### 函數註解

```javascript
/**
 * 添加新玩家
 * @param {string} socketID - Socket 連接 ID
 * @param {string} userName - 玩家名稱
 * @returns {Object} 新玩家對象
 */
function addUser(socketID, userName) {
  // 實現...
}
```

### 區塊註解

```javascript
// ==================== 玩家管理 ====================

// ==================== Socket 事件監聽 ====================
```

## 🔍 代碼審查清單

### 提交前檢查

- [ ] 代碼格式一致
- [ ] 有適當的註解
- [ ] 函數職責單一
- [ ] 變量命名清晰
- [ ] 移除未使用的代碼
- [ ] 移除 `console.log` 調試語句 (除非必要)

### 審查重點

- [ ] 性能問題
- [ ] 潛在的錯誤
- [ ] 代碼可讀性
- [ ] 是否符合專案風格

## 🚀 Git 提交規範

### 提交信息格式

```
<type>: <subject>

<body>
```

### Type 類型

- `feat`: 新功能
- `fix`: 修復 bug
- `refactor`: 重構
- `docs`: 文檔更新
- `style`: 代碼格式調整
- `test`: 測試相關

### 示例

```
feat: 添加多人遊戲淘汰機制

- 實現玩家淘汰邏輯
- 添加遊戲結束畫面
- 更新計分板顯示
```

## 📚 參考資源

- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google HTML/CSS Style Guide](https://google.github.io/styleguide/htmlcssguide.html)

---

遵循這些規範可以讓代碼更加清晰、易維護和專業。
