# 📚 文檔索引

本專案的所有重要文檔說明。

---

## 📖 核心文檔

### 根目錄

| 文檔                                | 說明                         | 適用對象         |
| ----------------------------------- | ---------------------------- | ---------------- |
| [README.md](../README.md)           | 專案總覽、功能介紹、快速上手 | 所有人 ⭐        |
| [QUICK_START.md](../QUICK_START.md) | 快速啟動指南、操作說明       | 開發者/使用者 ⭐ |

### docs/ 目錄

| 文檔                                       | 說明                     | 適用對象      |
| ------------------------------------------ | ------------------------ | ------------- |
| [CODE_STYLE_GUIDE.md](CODE_STYLE_GUIDE.md) | 代碼風格規範、最佳實踐   | 開發者        |
| [DOCKER_GUIDE.md](DOCKER_GUIDE.md)         | Docker 部署完整指南      | 運維/部署人員 |
| [ATTACK_SYSTEM.md](ATTACK_SYSTEM.md)       | 攻擊系統機制詳解         | 玩家/開發者   |
| [GAME_SPEED_CONFIG.md](GAME_SPEED_CONFIG.md) | 遊戲速度配置說明      | 開發者        |

---

## 🗂️ 專案結構

```
New-Tetris-JS-HTML-CSS-Express/
├── 📄 README.md              # 專案說明
├── 📄 QUICK_START.md         # 快速開始
├── 📄 index.js               # 主入口文件 (154行)
├── 📄 package.json           # 依賴配置
│
├── 📁 server/                # 後端模組 (4個文件)
│   ├── config.js             # 配置管理
│   ├── gameState.js          # 遊戲狀態
│   ├── gameLogic.js          # 遊戲邏輯
│   └── socketHandlers.js     # Socket 處理
│
├── 📁 public/                # 前端資源
│   ├── index.html            # 主頁面
│   ├── style.css             # 樣式表
│   └── js/                   # 前端模組 (6個文件)
│       ├── config.js         # 前端配置
│       ├── ui.js             # UI 更新
│       ├── socket.js         # Socket 通信
│       ├── render.js         # 遊戲渲染
│       ├── keyboard.js       # 鍵盤控制
│       └── main.js           # 前端入口
│
├── 📁 docs/                  # 技術文檔
│   ├── INDEX.md              # 本文件
│   ├── CODE_STYLE_GUIDE.md   # 代碼規範
│   └── DOCKER_GUIDE.md       # Docker 指南
│
├── 📁 backup/                # 重構前的備份文件
└── 📁 node_modules/          # 依賴包
```

---

## 🚀 快速導航

### 我想

#### 🎮 運行遊戲

→ 查看 [QUICK_START.md](../QUICK_START.md)

#### ⚔️ 了解攻擊系統

→ 查看 [ATTACK_SYSTEM.md](ATTACK_SYSTEM.md)

#### 🐳 使用 Docker 部署

→ 查看 [DOCKER_GUIDE.md](DOCKER_GUIDE.md)

#### 💻 參與開發

→ 查看 [CODE_STYLE_GUIDE.md](CODE_STYLE_GUIDE.md)

#### 📅 查看今日進度

→ 查看 [TODAY_SUMMARY.md](TODAY_SUMMARY.md)

#### 📖 了解專案

→ 查看 [README.md](../README.md)

---

## 📝 文檔維護

### 文檔更新原則

1. **保持簡潔** - 只保留必要的文檔
2. **及時更新** - 代碼變更時同步更新文檔
3. **清晰命名** - 文檔名稱要能清楚表達內容
4. **分類明確** - 根據用途放在正確的位置

### 新增文檔指南

如需新增文檔,請考慮:

- **是否必要?** - 能否整合到現有文檔中?
- **放在哪裡?** - 根目錄還是 docs/?
- **誰會看?** - 開發者、使用者還是運維人員?

---

## 🔄 歷史記錄

### 2025-10-02

- ✅ 大規模清理重複文檔
- ✅ 刪除所有重構報告(已完成的臨時文檔)
- ✅ 簡化文檔結構,只保留 4 個核心文檔
- ✅ 創建文檔索引

---

**總文檔數**: 4 個核心文檔  
**文檔狀態**: ✅ 精簡完成  
**維護難度**: ⭐ 簡單
