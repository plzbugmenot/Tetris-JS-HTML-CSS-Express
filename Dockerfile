# 使用官方 Node.js 18 LTS 版本
FROM node:18-alpine

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝生產環境依賴
RUN npm ci --only=production

# 複製應用程式源代碼
COPY . .

# 暴露端口（整合服務器：靜態文件 + Socket.IO）
EXPOSE 3500

# 設置環境變量
ENV NODE_ENV=production
ENV REACT_APP_SERVER_PORT=3500
ENV REACT_APP_SERVER_HOST=0.0.0.0

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3500/health', (r) => {if(r.statusCode !== 200) throw new Error('Health check failed')})"

# 啟動應用
CMD ["node", "index.js"]
