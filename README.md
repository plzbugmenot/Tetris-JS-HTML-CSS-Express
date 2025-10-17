# TETRIS (Javascript, Express, Node)

![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg) ![License](https://img.shields.io/badge/license-ISC-blue.svg)

```
████████╗███████╗████████╗██████╗ ██╗███████╗
╚══██╔══╝██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝
   ██║   █████╗     ██║   ██████╔╝██║███████╗
   ██║   ██╔══╝     ██║   ██╔══██╗██║╚════██║
   ██║   ███████╗   ██║   ██║  ██║██║███████║
   ╚═╝   ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝
```

A real-time multiplayer Tetris game built with Node.js and Socket.IO, supporting unlimited players.

## Video

<https://github.com/user-attachments/assets/d566ad65-fef7-430b-8f50-e2c70a4ddc4a>

## ✨ Features

- **Real-time Multiplayer**: Supports unlimited players simultaneously.
- **Competitive Mode**: Last player standing wins.
- **Live Scoreboard**: See all players' stats in real-time.
- **Docker Support**: Easy deployment with Docker.

## 🚀 Quick Start

### Local Development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the server**

   ```bash
   npm start
   ```

3. **Play the game**
   Open your browser and go to `http://localhost:3500`.

### Docker Deployment

```bash
# With Docker Compose
docker-compose up -d

# Or with Docker
docker build -t tetris-game .
docker run -p 3500:3500 tetris-game
```

## 📁 Project Structure

```
.
├── server/              # Backend modules
│   ├── config.js        # Configuration management
│   ├── gameState.js     # Game state management
│   ├── gameLogic.js     # Game logic
│   └── socketHandlers.js # Socket event handlers
├── public/              # Frontend assets
│   ├── index.html       # Main page
│   ├── css/style.css    # Main stylesheet
│   ├── js/              # Frontend modules (ES6)
│   │   ├── config.js    # Frontend configuration
│   │   ├── main.js      # Main entry point
│   │   ├── socket.js    # Socket communication
│   │   ├── render.js    # Game rendering
│   │   ├── keyboard.js  # Keyboard controls
│   │   └── ui.js        # UI updates
│   └── socket.io/       # Socket.IO client library
├── docs/                # Documentation
│   ├── CODE_STYLE_GUIDE.md   # Code style guide
│   ├── DOCKER_GUIDE.md       # Docker deployment guide
│   ├── GAME_SPEED_CONFIG.md  # Game speed configuration
│   └── INDEX.md              # Documentation index
├── index.js             # Main entry point
├── package.json         # Dependencies configuration
├── Dockerfile           # Docker configuration
└── docker-compose.yml   # Docker Compose configuration
```

## 🎮 Game Rules & Controls

1. **Join Room**: Enter your name to join the game room.
2. **Wait for Players**: A minimum of 1 player is required to start (single player mode) or multiple players for competitive mode.
3. **Start Game**: Any player can click the "Start Game" button.
4. **Controls**:
   - ⬅️ `A` or `←`: Move Left
   - ➡️ `D` or `→`: Move Right
   - ⬇️ `S` or `↓`: Soft Drop
   - 🔄 `W` or `↑`: Rotate
   - ⚡ `Space`: Hard Drop
   - 💾 `C` or `Shift`: Hold
5. **Elimination**:
   - You are eliminated when blocks stack to the top.
   - Eliminated players are shown on the scoreboard.
   - The game continues until one player remains.
6. **Game Over**: Final rankings are displayed, and the game resets automatically after 3 seconds.

## ⚙️ Environment Variables

You can configure the following variables in a `.env` file:

```env
REACT_APP_SERVER_PORT=8800        # WebSocket server port
REACT_APP_CLIENT_PORT=3500        # Client server port
REACT_APP_SERVER_HOST=localhost   # Server hostname
```

## 📚 Documentation

- 📖 [Documentation Index](docs/INDEX.md) - Navigation for all documents.
- 🚀 [Quick Start Guide](QUICK_START.md) - Guide to get started quickly.
- 💻 [Code Style Guide](docs/CODE_STYLE_GUIDE.md) - Development standards and best practices.
- 🐳 [Docker Deployment](docs/DOCKER_GUIDE.md) - Guide for containerized deployment.
- ⚔️ [Attack System](docs/ATTACK_SYSTEM.md) - Details on the Combo and Garbage Line mechanics.
- 🎮 [Game Speed Config](docs/GAME_SPEED_CONFIG.md) - Guide for adjusting game speed.
- 📅 [Work Summary](docs/TODAY_SUMMARY.md) - Record of daily progress.

## 🛠️ Built With Love Using

- Javascript
- HTML, CSS
- Socket.IO
- Node.js, Express.js

## License

This project is licensed under the ISC License.

## 🎉 Latest Release: v2.0 (2025)

## 💬 Let's Connect

- [Chat on Telegram](https://t.me/plzbugmenot)
- [Drop me a mail](mailto:pleasebugmenot.dev@gmail.com)

Happy Tetris😊
