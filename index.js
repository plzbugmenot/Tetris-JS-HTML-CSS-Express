/**
 * 多人俄羅斯方塊遊戲 - 主入口
 * 
 * 使用模組化架構:
 * - server/config.js - 配置管理
 * - server/gameState.js - 遊戲狀態管理
 * - server/gameLogic.js - 遊戲邏輯
 * - server/socketHandlers.js - Socket 事件處理
 * 
 * @author ARMY
 * @date July 12, 2024 (重構: October 2, 2025)
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');

// 導入 server 模組
const config = require('./server/config');
const { setupSocketHandlers } = require('./server/socketHandlers');

// 環境變數配置
const SERVER_PORT = process.env.REACT_APP_SERVER_PORT || 3500;
const SERVER_HOST = process.env.REACT_APP_SERVER_HOST || "localhost";

/**
 * 創建並配置整合服務器（靜態文件 + Socket.IO）
 */
function createServer() {
  const app = express();
  app.use(cors());

  // 靜態文件服務
  app.use(express.static('public'));

  // 健康檢查端點
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'Tetris Multiplayer Game' });
  });

  const server = http.Server(app);

  // 在同一個服務器上配置 Socket.IO
  const io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // 設置 Socket 事件處理
  setupSocketHandlers(io);

  return { server, port: SERVER_PORT, host: SERVER_HOST };
}

/**
 * 錯誤處理函數
 */
function handleServerError(err, port) {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 錯誤：端口 ${port} 已被占用！`);
    console.log(`💡 請嘗試以下解決方案：`);
    console.log(`   1. 關閉占用該端口的其他程序`);
    console.log(`   2. 使用不同的端口（設置環境變數）`);
    console.log(`   例如: $env:REACT_APP_SERVER_PORT="${port + 1}" (PowerShell)`);
    console.log(`   或: set REACT_APP_SERVER_PORT=${port + 1} (CMD)`);
    process.exit(1);
  } else {
    console.error(`❌ 服務器錯誤:`, err);
    process.exit(1);
  }
}

/**
 * 啟動應用
 */
function startApplication() {
  console.log('\n' + '='.repeat(60));
  console.log('🎮  多人俄羅斯方塊遊戲服務器');
  console.log('='.repeat(60) + '\n');

  // 創建整合服務器
  const { server, port, host } = createServer();

  // 啟動服務器
  server.listen(port, host, () => {
    console.log(`✅ 服務器啟動成功`);
    console.log(`   地址: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
    console.log(`   靜態文件: ✓`);
    console.log(`   Socket.IO: ✓`);
    console.log(`   最大玩家數: ${config.MAX_PLAYERS}`);
    console.log(`\n` + '='.repeat(60));
    console.log(`🚀 請在瀏覽器中打開: http://localhost:${port}`);
    console.log('='.repeat(60) + '\n');
  }).on('error', (err) => {
    handleServerError(err, port);
  });

  // 優雅關閉
  process.on('SIGINT', () => {
    console.log('\n👋 正在關閉服務器...');
    server.close(() => {
      console.log('✅ 服務器已關閉');
      process.exit(0);
    });
  });
}

// 啟動應用
startApplication();
