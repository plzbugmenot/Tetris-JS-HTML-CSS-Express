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
├── server/              # 後端模組 (重構中)
│   ├── config.js       # 配置管理
│   └── gameState.js    # 遊戲狀態管理
├── public/             # 前端資源
│   ├── index.html      # 主頁面
│   ├── game-new.js     # 遊戲邏輯 (重構中)
│   ├── style.css       # 主樣式
│   └── socket.io/      # Socket.IO 客戶端
├── docs/               # 文檔目錄
│   ├── DOCKER_*.md     # Docker 相關文檔
│   ├── MULTIPLAYER_UPDATES.md  # 多人遊戲更新
│   └── QUICK_START.md  # 快速開始指南
├── index.js            # 主入口文件
├── package.json        # 依賴配置
├── Dockerfile          # Docker 配置
└── docker-compose.yml  # Docker Compose 配置
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

詳細文檔請查看 `docs/` 目錄:

- [Docker 部署指南](docs/DOCKER_GUIDE.md)
- [多人遊戲更新](docs/MULTIPLAYER_UPDATES.md)
- [快速開始指南](docs/QUICK_START.md)
- [UI 測試指南](docs/UI_TEST_GUIDE.md)

## 🛠️ 技術棧

- **後端**: Node.js, Express, Socket.IO
- **前端**: Vanilla JavaScript, HTML5, CSS3
- **部署**: Docker, Docker Compose

## 🐛 問題回報

如果遇到問題,請查看:

1. [Bug 修復摘要](docs/BUGFIX_SUMMARY.md)
2. [Docker 網路修復](docs/DOCKER_NETWORK_FIX.md)

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
