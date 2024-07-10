const PORT = 8800;
const F_PORT = 3300;

const express = require("express");
const server = express();
const cors = require("cors");
const server_http = require("http").Server(server);

const socketIO = require("socket.io")(server_http, {
  cors: ["*"],
});

server.use(cors());
server.get("/", (req, res) => {
  res.send("server is running");
});
server_http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

/********* C L I E N T *************/
const client = express();
client.use(express.static("public"));
const client_http = require("http").Server(client);

client.get("/", (req, res) => {
  res.send("client is running");
});

/********* TETRIS Board*************/

/************************
 * +----------------+
 * |        |       |
 * | User1  | User2 |
 * |        |       |
 * +----------------+
 ***********************/

/*********TETRIS Setting*************/

let users = [];
const BOARD_SIZE_HEIGHT = 21;
const BOARD_SIZE_WIDTH = 11;
const TIMEperS = 50;
// const FRAME = Math.floor(1000 / TIMEperS); // every 20ms render
const FRAME = 20; // every 20ms render
const UP = "UP";
const DOWN = "DOWN";
const LEFT = "LEFT";
const RIGHT = "RIGHT";

const TEAM1 = "TEAM1";
const TEAM2 = "TEAM2";
// ----
const DOMINO_1 = [
  { x: 5, y: 1 },
  { x: 6, y: 1 },
  { x: 7, y: 1 },
  { x: 8, y: 1 },
];
// --
// --
const DOMINO_2 = [
  { x: 5, y: 1 },
  { x: 6, y: 1 },
  { x: 5, y: 2 },
  { x: 6, y: 2 },
];
// --
//  |
const DOMINO_3 = [
  { x: 6, y: 1 },
  { x: 7, y: 1 },
  { x: 7, y: 2 },
  { x: 7, y: 3 },
];
// --
// |
const DOMINO_4 = [
  { x: 6, y: 1 },
  { x: 7, y: 1 },
  { x: 6, y: 2 },
  { x: 6, y: 3 },
];

// |_
// |
const DOMINO_5 = [
  { x: 5, y: 2 },
  { x: 6, y: 1 },
  { x: 6, y: 2 },
  { x: 7, y: 2 },
];
// |_
//   |
const DOMINO_6 = [
  { x: 6, y: 1 },
  { x: 6, y: 2 },
  { x: 7, y: 2 },
  { x: 7, y: 3 },
];
//  _|
// |
const DOMINO_7 = [
  { x: 7, y: 1 },
  { x: 7, y: 2 },
  { x: 6, y: 2 },
  { x: 6, y: 3 },
];

const DOMINOS = [
  DOMINO_1,
  DOMINO_2,
  DOMINO_3,
  DOMINO_4,
  DOMINO_5,
  DOMINO_6,
  DOMINO_7,
];

const initialGroundBlock = [
  { y: BOARD_SIZE_HEIGHT, x: 0 },
  { y: BOARD_SIZE_HEIGHT, x: 1 },
  { y: BOARD_SIZE_HEIGHT, x: 2 },
  { y: BOARD_SIZE_HEIGHT, x: 3 },
  { y: BOARD_SIZE_HEIGHT, x: 4 },
  { y: BOARD_SIZE_HEIGHT, x: 5 },
  { y: BOARD_SIZE_HEIGHT, x: 7 },
  { y: BOARD_SIZE_HEIGHT, x: 8 },
  { y: BOARD_SIZE_HEIGHT, x: 9 },
  { y: BOARD_SIZE_HEIGHT, x: 10 },
  { y: BOARD_SIZE_HEIGHT - 1, x: 0 },
  { y: BOARD_SIZE_HEIGHT - 1, x: 1 },
  { y: BOARD_SIZE_HEIGHT - 1, x: 2 },
  { y: BOARD_SIZE_HEIGHT - 1, x: 3 },
  { y: BOARD_SIZE_HEIGHT - 1, x: 4 },
  { y: BOARD_SIZE_HEIGHT - 1, x: 5 },
  { y: BOARD_SIZE_HEIGHT - 1, x: 7 },
  { y: BOARD_SIZE_HEIGHT - 1, x: 8 },
];

const mainLoop = () => {};

let broadcast = setInterval(() => {
  mainLoop();
  const data = {
    users: users,
  };
  socketIO.emit("stateOfUsers", data);
}, FRAME);

const generateRandomDomino = () => {
  let tmpNum = Math.floor(Date.now() * Math.random()) % DOMINOS.length;
  return { body: DOMINOS[tmpNum], num: tmpNum };
};

const getRandomDomino = () => {
  let tmp = generateRandomDomino();
  return tmp;
};

const createUser = (data) => {
  let tmp = generateRandomDomino();

  return {
    userName: data.userName || "a",
    socketID: data.socketID,
    actionTime: FRAME,
    BlockBody: tmp.body,
    blockType: tmp.num,
    groundBlock: initialGroundBlock,
    isNeccessaryBlock: false,
  };
};

const rotateBlock = (tmpBlockBody) => {
  let _x = tmpBlockBody[2].x;
  let _y = tmpBlockBody[2].y;
  tmpBlockBody = tmpBlockBody.map((item) => getRotateDomino(item, _x, _y));
  return tmpBlockBody;
};

const getRotateDomino = (item, _x, _y) => {
  let x1 = item.x;
  let y1 = item.y;
  item.x = _x + (y1 - _y);
  item.y = _y - (x1 - _x);
  return item;
};

const moveBlock = (BlockBody, direction) => {
  // move block to Right or Left as input value
  let dx = 0;
  if (direction === RIGHT) dx = -1;
  else if (direction === LEFT) dx = 1;
  for (block of BlockBody) block.x += dx;
};

/***************** SOCKET **********************/
socketIO.on("connect", (socket) => {
  console.log("connected with client");

  socket.on("newUser", (data) => {
    // if (users.length < 2) {
    let newUser = createUser(data);
    users.push(newUser);
    console.log(newUser.userName, " is connected...", newUser.socketID);
    console.log("There are ", users.length, " users...");
    socketIO.emit("newUserResponse", newUser);
    // } else {
    //   let errorMsg = "There is full users.";
    //   socketIO.emit("newUserResponseError", errorMsg);
    // }
  });

  socket.on("test", () => {
    console.log("working now");
  });

  socket.on("changeDirection", (data) => {
    users = users.map((item) =>
      item.socketID === data.socketID
        ? {
            ...item,
            BlockBody: rotateBlock(item.BlockBody),
          }
        : item
    );
  });

  socket.on("moveBlock", (data) => {
    users = users.map((item) =>
      item.socketID === data.socketID
        ? {
            ...item,
            BlockBody: moveBlock(item.BlockBody, data.direction),
          }
        : item
    );
  });

  socket.on("dropBlock", (data) => {
    users = users.map((item) =>
      item.socketID === data.socketID ? dropBlock(item) : item
    );
  });
});

client_http.listen(F_PORT, () => {
  console.log(`Client listening on ${F_PORT}`);
});
