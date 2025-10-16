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
const { setupSocketHandlers, cleanup } = require('./server/socketHandlers');
const logger = require('./server/logger');

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
    logger.error(`端口 ${port} 已被占用！`);
    logger.section('如何處理');
    logger.detail('1', '關閉占用該端口的其他程序');
    logger.detail('2', '使用不同的端口（設定環境變數）');
    logger.detail('PowerShell', `$env:REACT_APP_SERVER_PORT="${port + 1}"`);
    logger.detail('CMD', `set REACT_APP_SERVER_PORT=${port + 1}`);
    process.exit(1);
  } else {
    logger.error('服務器錯誤', err.message || err.code);
    process.exit(1);
  }
}

/**
 * 啟動應用
 */
function startApplication() {
  logger.banner('CYBER GRID SERVER', '多人俄羅斯方塊 · Neon Control Room');

  // 創建整合服務器
  const { server, port, host } = createServer();

  // 啟動服務器
  server.listen(port, host, () => {
    logger.success('服務器啟動成功');
    logger.section('服務狀態');
    const resolvedHost = host === '0.0.0.0' ? 'localhost' : host;
    const endpointUrl = `http://${resolvedHost}:${port}`;
    logger.detail('地址', endpointUrl);
    logger.detail('靜態文件', '啟用');
    logger.detail('Socket.IO', '啟用');
    logger.detail('挑戰者人數', '無限制');
    logger.footer(endpointUrl);
  }).on('error', (err) => {
    handleServerError(err, port);
  });

  // 優雅關閉
  process.on('SIGINT', () => {
    logger.warn('接收到關閉信號，正在關閉服務器...');

    // 清理所有定時器和資源
    cleanup();

    // 關閉服務器
    server.close(() => {
      logger.success('服務器已安全關閉');
      process.exit(0);
    });

    // 設置強制退出定時器（10秒後強制退出）
    setTimeout(() => {
      logger.warn('強制退出服務器');
      process.exit(1);
    }, 10000);
  });
}

// 啟動應用
startApplication();
