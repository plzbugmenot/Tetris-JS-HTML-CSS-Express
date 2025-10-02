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
const CLIENT_PORT = process.env.REACT_APP_CLIENT_PORT || 3500;
const CLIENT_HOST = process.env.REACT_APP_CLIENT_CONNECT_HOST ||
  (config.HOST === "0.0.0.0" ? "localhost" : config.HOST);

/**
 * 創建並配置遊戲服務器
 */
function createGameServer() {
  const app = express();
  app.use(cors());

  // 基本路由
  app.get('/', (req, res) => {
    res.send('Tetris Game Server is running');
  });

  // 配置端點 - 提供環境配置給前端
  app.get('/config', (req, res) => {
    res.json({
      host: CLIENT_HOST,
      port: config.PORT
    });
  });

  const server = http.Server(app);
  const io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // 設置 Socket 事件處理
  setupSocketHandlers(io);

  return { server, port: config.PORT, host: config.HOST };
}

/**
 * 創建並配置靜態文件服務器
 */
function createClientServer() {
  const app = express();
  app.use(express.static('public'));

  // 基本路由
  app.get('/', (req, res) => {
    res.send('Tetris Client Server is running');
  });

  // 配置端點
  app.get('/config', (req, res) => {
    res.json({
      host: CLIENT_HOST,
      port: config.PORT
    });
  });

  const server = http.Server(app);

  return { server, port: CLIENT_PORT };
}

/**
 * 錯誤處理函數
 */
function handleServerError(err, port, serverType) {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 錯誤：${serverType}端口 ${port} 已被占用！`);
    console.log(`💡 請嘗試以下解決方案：`);
    console.log(`   1. 關閉占用該端口的其他程序`);
    console.log(`   2. 使用不同的端口（設置環境變數）`);
    const envVar = serverType === '遊戲服務器' ?
      'REACT_APP_SERVER_PORT' : 'REACT_APP_CLIENT_PORT';
    console.log(`   例如: $env:${envVar}="${port + 1}" (PowerShell)`);
    console.log(`   或: set ${envVar}=${port + 1} (CMD)`);
    process.exit(1);
  } else {
    console.error(`❌ ${serverType}錯誤:`, err);
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

  // 創建服務器
  const gameServer = createGameServer();
  const clientServer = createClientServer();

  // 啟動遊戲服務器 (Socket.IO)
  gameServer.server.listen(gameServer.port, gameServer.host, () => {
    console.log(`✅ 遊戲服務器啟動成功`);
    console.log(`   地址: http://${gameServer.host}:${gameServer.port}`);
    console.log(`   最大玩家數: ${config.MAX_PLAYERS}`);
  }).on('error', (err) => {
    handleServerError(err, gameServer.port, '遊戲服務器');
  });

  // 啟動客戶端服務器 (靜態文件)
  clientServer.server.listen(clientServer.port, () => {
    console.log(`✅ 客戶端服務器啟動成功`);
    console.log(`   地址: http://localhost:${clientServer.port}`);
    console.log(`\n` + '='.repeat(60));
    console.log(`🚀 請在瀏覽器中打開: http://localhost:${clientServer.port}`);
    console.log('='.repeat(60) + '\n');
  }).on('error', (err) => {
    handleServerError(err, clientServer.port, '客戶端服務器');
  });

  // 優雅關閉
  process.on('SIGINT', () => {
    console.log('\n👋 正在關閉服務器...');
    gameServer.server.close(() => {
      console.log('✅ 遊戲服務器已關閉');
    });
    clientServer.server.close(() => {
      console.log('✅ 客戶端服務器已關閉');
      process.exit(0);
    });
  });
}

// 啟動應用
startApplication();
