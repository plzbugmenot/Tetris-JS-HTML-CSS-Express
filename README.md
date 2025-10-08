# 🎮 多人俄羅斯方塊遊戲

```
████████╗███████╗████████╗██████╗ ██╗███████╗
╚══██╔══╝██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝
   ██║   █████╗     ██║   ██████╔╝██║███████╗
   ██║   ██╔══╝     ██║   ██╔══██╗██║╚════██║
   ██║   ███████╗   ██║   ██║  ██║██║███████║
   ╚═╝   ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝
```

一個基於 Node.js + Socket.IO 的即時多人俄羅斯方塊遊戲,支援 2-8 名玩家同時對戰。

## 📹 遊戲展示

https://github.com/user-attachments/assets/d566ad65-fef7-430b-8f50-e2c70a4ddc4a

## ✨ 特色功能

- 🎯 **即時多人對戰**: 支援 2-8 名玩家同時遊戲
- 🏆 **競爭模式**: 玩家淘汰機制,最後存活者獲勝
- 📊 **即時計分板**: 實時顯示所有玩家狀態和等級
- 🎨 **響應式設計**: 自適應不同玩家數量的布局
- 🐳 **Docker 支援**: 一鍵部署到容器環境
- 💫 **流暢動畫**: 淘汰效果、遊戲結束畫面等精美動畫

## 🚀 快速開始

### 本地開發

```bash
# 安裝依賴
npm install

# 啟動伺服器 (默認: localhost:8800)
npm start

# 訪問遊戲 (默認: http://localhost:3500)
```

### Docker 部署

```bash
# 使用 Docker Compose
docker-compose up -d

# 或使用 Docker
docker build -t tetris-game .
docker run -p 3500:3500 -p 8800:8800 tetris-game
```

## 📁 專案結構

```
.
├── server/              # 後端模組
│   ├── config.js        # 配置管理
│   ├── gameState.js     # 遊戲狀態管理
│   ├── gameLogic.js     # 遊戲邏輯
│   └── socketHandlers.js # Socket 事件處理
├── public/              # 前端資源
│   ├── index.html       # 主頁面
│   ├── css/style.css    # 主樣式
│   ├── js/              # 前端模組 (ES6)
│   │   ├── config.js    # 前端配置
│   │   ├── main.js      # 主入口
│   │   ├── socket.js    # Socket 通信
│   │   ├── render.js    # 遊戲渲染
│   │   ├── keyboard.js  # 鍵盤控制
│   │   └── ui.js        # UI 更新
│   └── socket.io/       # Socket.IO 客戶端
├── docs/                # 文檔目錄
│   ├── CODE_STYLE_GUIDE.md   # 代碼規範
│   ├── DOCKER_GUIDE.md       # Docker 部署指南
│   ├── GAME_SPEED_CONFIG.md  # 遊戲速度配置
│   └── INDEX.md              # 文檔索引
├── index.js             # 主入口文件
├── package.json         # 依賴配置
├── Dockerfile           # Docker 配置
└── docker-compose.yml   # Docker Compose 配置
```

## 🎮 遊戲規則

1. **加入房間**: 輸入玩家名稱加入遊戲房間
2. **等待玩家**: 至少 2 名玩家才能開始遊戲
3. **開始遊戲**: 任意玩家點擊"開始遊戲"按鈕
4. **操作方塊**:
   - ⬅️ `A` 或 `←`: 左移
   - ➡️ `D` 或 `→`: 右移
   - ⬇️ `S` 或 `↓`: 快速下降
   - 🔄 `W` 或 `↑`: 旋轉方塊
5. **淘汰機制**:
   - 當方塊堆積到頂部時被淘汰
   - 被淘汰的玩家顯示在左側計分板
   - 遊戲繼續直到只剩一名玩家或全部淘汰
6. **遊戲結束**: 所有玩家淘汰後顯示最終排名,3 秒後自動重置

## ⚙️ 環境變數

可通過 `.env` 文件配置以下變數:

```env
REACT_APP_SERVER_PORT=8800        # WebSocket 伺服器端口
REACT_APP_CLIENT_PORT=3500        # 客戶端伺服器端口
REACT_APP_SERVER_HOST=localhost   # 伺服器主機名
```

## 📚 文檔

- 📖 [完整文檔索引](docs/INDEX.md) - 所有文檔的導航
- 🚀 [快速開始](QUICK_START.md) - 快速上手指南
- 💻 [代碼規範](docs/CODE_STYLE_GUIDE.md) - 開發規範和最佳實踐
- 🐳 [Docker 部署](docs/DOCKER_GUIDE.md) - 容器化部署指南
- ⚔️ [攻擊系統](docs/ATTACK_SYSTEM.md) - Combo 連擊和垃圾行攻擊機制
- 🎮 [遊戲速度配置](docs/GAME_SPEED_CONFIG.md) - 遊戲速度調整指南
- 📅 [今日工作總結](docs/TODAY_SUMMARY.md) - 每日進度和成果記錄
- 📋 [待辦事項清單](#📋-待辦事項清單) - 專案改進計劃和已知問題

## 🛠️ 技術棧

- **後端**: Node.js, Express, Socket.IO
- **前端**: Vanilla JavaScript (ES6 模組), HTML5, CSS3
- **部署**: Docker, Docker Compose
- **架構**: 模組化設計,前後端分離

## 📋 待辦事項清單

### 🔴 高優先級 - 關鍵問題

#### ~~1. 後端狀態管理問題~~ ✅ **已修復** (Commit: 5aa4a15)
- ~~問題描述~~: ~~狀態管理邏輯不完整~~
- **修復內容**:
  - ✅ 已實現 `updateUser()` 和 `updateAllUsers()` 函數
  - ✅ 玩家操作（旋轉、移動、下落）現在會立即更新並廣播
  - ✅ 主遊戲循環正確保存狀態更新

#### ~~2. 前後端數據結構不一致~~ ✅ **已修復** (Commit: 5aa4a15)
- ~~問題描述~~: ~~屬性名不匹配~~
- **修復內容**:
  - ✅ 統一所有屬性名為前端期望格式
  - ✅ `itemBlockBody`, `itemGroundBlock`, `itemPreBody`
  - ✅ `gameState.js` 和 `gameLogic.js` 已同步更新

#### 3. **消行邏輯缺失** ⚠️ **新問題** (Commit: 5aa4a15 引入)
- **問題描述**: `server/gameLogic.js` 的 `processPlayerTick()` 函數移除了消行邏輯
  - 行 283-289: 只返回 `moveBlockDown()` 結果，沒有調用 `clearLines()`
  - 缺少分數和等級更新邏輯
- **影響**: 
  - ❌ 完整的行無法消除（方塊會堆到頂部）
  - ❌ 分數永遠為 0
  - ❌ 等級永遠為 0
- **解決方案**:
```javascript
function processPlayerTick(player) {
    if (player.state === config.LOSE || player.state === config.ELIMINATED) {
        return player;
    }

    if (player.actionTime > 0) {
        return { ...player, actionTime: player.actionTime - 1 };
    }

    // 方塊自動下移
    const movedPlayer = moveBlockDown(player);

    // ⚠️ 需要添加：檢查並消除完整的行
    const { itemGroundBlock, linesCleared } = clearLines(movedPlayer);

    // ⚠️ 需要添加：更新分數和等級
    const newLevel = movedPlayer.level + Math.floor(linesCleared / 4);
    const newScore = (movedPlayer.score || 0) + linesCleared * 100;

    return {
        ...movedPlayer,
        itemGroundBlock,
        level: newLevel,
        score: newScore
    };
}
```

#### 4. 其他遊戲邏輯缺陷
- ✅ ~~**碰撞檢測邊界問題**~~: `checkCollision` 函數中的邊界檢查與 `config.js` 中的棋盤尺寸一致，此問題已解決。
- ✅ ~~**方塊固定時機**~~: 已在後端實現方塊鎖定延遲（Lock Delay）機制。
- ✅ ~~**方塊類型未設置**~~: 後端 `gameState.js` 已正確隨機指派 0-6 的方塊類型，此問題已在後端解決。

### 🟡 中優先級 - 功能完善

#### 5. 前端渲染優化
- [ ] 實現 Canvas 渲染替代 DOM 渲染（性能提升 60%+）
- [ ] 添加方塊移動動畫效果
- [ ] 實現幽靈方塊（Ghost Piece）預覽
- [ ] 優化大量玩家時的渲染性能（>4 人）

#### 6. 遊戲功能增強
- ✅ ~~添加 Combo 連擊系統~~ - 已實現（3秒超時、分數獎勵、攻擊加成）
- ✅ ~~實現垃圾行攻擊系統~~ - 已實現（等級加成、Combo 加成、隨機目標）
- [ ] 實現方塊鎖定延遲（Lock Delay）
- [ ] 添加硬降落（Hard Drop）與軟降落的分數差異
- [ ] 實現 T-Spin 檢測和獎勵機制
- [ ] 實現背靠背（Back-to-Back）獎勵
- [ ] 添加等級速度曲線調整
- [ ] 實現暫停/繼續功能
- [ ] 添加遊戲房間系統（多房間支持）
- [ ] 攻擊目標選擇（手動選擇、攻擊最強/最弱者）

#### 7. UI/UX 改進
- [ ] 添加遊戲加載畫面
- [ ] 實現響應式布局優化（移動端適配）
- [ ] 添加音效和背景音樂
- [ ] 實現主題切換（暗色/亮色模式）
- [ ] 添加粒子效果（消行、淘汰等）
- [ ] 優化計分板顯示（實時排名動畫）
- [ ] 添加玩家頭像和個性化設定
- [ ] 實現遊戲回放功能

#### 8. 網絡優化
- [ ] 實現斷線重連機制
- [ ] 添加心跳包檢測
- [ ] 優化 Socket 數據傳輸（減少帶寬）
- [ ] 實現客戶端預測和服務器校正
- [ ] 添加延遲顯示和網絡狀態指示

### 🟢 低優先級 - 代碼質量

#### 9. 測試覆蓋
- [ ] **後端單元測試**
  - [ ] `gameLogic.js` 所有函數測試
  - [ ] `gameState.js` 狀態管理測試
  - [ ] `socketHandlers.js` 事件處理測試
  - [ ] 碰撞檢測邊界測試
  - [ ] 消行邏輯測試
- [ ] **前端單元測試**
  - [ ] 渲染模組測試
  - [ ] Socket 通信測試
  - [ ] 鍵盤輸入測試
- [ ] **集成測試**
  - [ ] 完整遊戲流程測試
  - [ ] 多人對戰場景測試
  - [ ] 斷線重連測試
- [ ] **壓力測試**
  - [ ] 8 人同時遊戲測試
  - [ ] 長時間運行穩定性測試
  - [ ] 並發連接測試

#### 10. 代碼重構
- ✅ ~~移除 `public/game.js`~~（已刪除）
- ✅ ~~清理 `backup/` 目錄~~（已刪除）
- ✅ ~~移除 `docs/CLEANUP_SUMMARY.md`~~（已刪除）
- [ ] 審查 `public/secure/` 目錄內容（可能包含敏感信息）
- [ ] 統一代碼註釋風格（JSDoc）
- [ ] 提取魔法數字為常數
- [ ] 實現統一的錯誤處理機制

#### 11. 開發工具配置
- [ ] 添加 ESLint 配置
- [ ] 添加 Prettier 配置
- [ ] 配置 Git Hooks（pre-commit、pre-push）
- [ ] 添加 TypeScript 支持（可選）
- [ ] 配置 CI/CD 流程（GitHub Actions）
- [ ] 添加性能監控（如 PM2）

#### 12. 文檔完善
- ✅ ~~添加 API 文檔~~ - 已新增 `docs/GAME_SPEED_CONFIG.md` (Commit: 4f5229b)
- [ ] Socket 事件文檔
- [ ] 創建貢獻指南（CONTRIBUTING.md）
- [ ] 添加架構設計文檔
- [ ] 完善安裝和部署文檔
- [ ] 創建常見問題解答（FAQ）
- [ ] 添加開發日誌（CHANGELOG.md）

#### 13. 部署和運維
- [ ] 測試 Docker 部署腳本
  - [ ] `docker-deploy.ps1` (Windows)
  - [ ] `docker-deploy.sh` (Linux/Mac)
- [ ] 添加環境變數驗證
- [ ] 實現健康檢查端點優化
- [ ] 配置 Nginx 反向代理
- [ ] 添加 SSL/TLS 支持
- [ ] 實現日誌系統（Winston）
- [ ] 配置監控告警（可選）

### 🔵 未來規劃

#### 14. 進階功能
- [ ] 實現觀戰模式
- [ ] 添加排行榜系統（持久化）
- [ ] 實現玩家等級和經驗系統
- [ ] 添加成就系統
- [ ] 實現好友系統
- [ ] 添加聊天功能
- [ ] 實現自定義遊戲規則
- [ ] 支持競技模式和排位賽

#### 15. 性能優化
- [ ] 實現 Redis 緩存
- [ ] 數據庫集成（玩家數據持久化）
- [ ] 負載均衡支持
- [ ] CDN 配置
- [ ] 資源壓縮和優化

#### 16. 安全性
- [ ] 實現用戶認證系統
- [ ] 添加 CSRF 保護
- [ ] 實現速率限制（Rate Limiting）
- [ ] 輸入驗證和清理
- [ ] 添加安全響應頭
- [ ] 敏感信息加密

---

## 🐛 已知問題

### 嚴重問題
1. ~~**遊戲狀態同步失敗**~~ ✅ **已修復** (Commit: 5aa4a15) - 玩家操作現在會正確同步
2. ~~**方塊渲染錯誤**~~ ✅ **已修復** (Commit: 5aa4a15) - 數據結構已統一
3. ~~**消行功能失效**~~ ✅ **已修復** - `gameLogic.js` 中的消行、計分和升級邏輯已恢復。

### 一般問題
1. 消行動畫缺失
2. 多人遊戲時偶爾卡頓
3. 斷線後無法重連
4. 方塊類型顯示始終為 0（前端渲染可能缺少顏色）

---

## 📝 版本歷史

- **v2.0** (2025) - 多人對戰模式,支援 2-8 人遊戲,淘汰機制
- **v1.3** (2024-07-12) - 初始版本,雙人對戰模式

## 👥 作者

- **ARMY** - 初始版本 (2024 年 7 月 12 日)
- **Copilot Team** - 多人模式和重構 (2024-2025)

## 💬 聯絡方式

- [Telegram](https://t.me/plzbugmenot)
- [Email](mailto:pleasebugmenot.dev@gmail.com)

## 📄 授權

MIT License

---

Made with ❤️ and ☕ | Happy Tetris! 😊
