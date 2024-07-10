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
const BOARD_SIZE_WIDTH = 10;
const TIMEperS = 50;
// const FRAME = Math.floor(1000 / TIMEperS); // every 20ms render
const FRAME = 10; // every 20ms render
const UP = "UP";
const DOWN = "DOWN";
const LEFT = "LEFT";
const RIGHT = "RIGHT";

const TEAM1 = "TEAM1";
const TEAM2 = "TEAM2";

let DOMINO_1 = [];
let DOMINO_2 = [];
let DOMINO_3 = [];
let DOMINO_4 = [];
let DOMINO_5 = [];
let DOMINO_6 = [];
let DOMINO_7 = [];
let DOMINOS = [];
const init = () => {
  // ----
  DOMINO_1 = [
    { x: 5, y: 1 },
    { x: 6, y: 1 },
    { x: 7, y: 1 },
    { x: 8, y: 1 },
  ];
  // --
  // --
  DOMINO_2 = [
    { x: 5, y: 1 },
    { x: 6, y: 1 },
    { x: 5, y: 2 },
    { x: 6, y: 2 },
  ];
  // --
  //  |
  DOMINO_3 = [
    { x: 6, y: 1 },
    { x: 7, y: 1 },
    { x: 7, y: 2 },
    { x: 7, y: 3 },
  ];
  // --
  // |
  DOMINO_4 = [
    { x: 6, y: 1 },
    { x: 7, y: 1 },
    { x: 6, y: 2 },
    { x: 6, y: 3 },
  ];
  // |_
  // |
  DOMINO_5 = [
    { x: 5, y: 2 },
    { x: 6, y: 1 },
    { x: 6, y: 2 },
    { x: 7, y: 2 },
  ];
  // |_
  //   |
  DOMINO_6 = [
    { x: 6, y: 1 },
    { x: 6, y: 2 },
    { x: 7, y: 2 },
    { x: 7, y: 3 },
  ];
  //  _|
  // |
  DOMINO_7 = [
    { x: 7, y: 1 },
    { x: 7, y: 2 },
    { x: 6, y: 2 },
    { x: 6, y: 3 },
  ];

  DOMINOS = [
    DOMINO_1,
    DOMINO_2,
    DOMINO_3,
    DOMINO_4,
    DOMINO_5,
    DOMINO_6,
    DOMINO_7,
  ];
};

const initialGroundBlock = [
  { y: BOARD_SIZE_HEIGHT, x: 0 },

  { y: BOARD_SIZE_HEIGHT, x: 2 },
  { y: BOARD_SIZE_HEIGHT, x: 3 },

  { y: BOARD_SIZE_HEIGHT, x: 5 },
  { y: BOARD_SIZE_HEIGHT, x: 7 },
  { y: BOARD_SIZE_HEIGHT, x: 8 },
  { y: BOARD_SIZE_HEIGHT, x: 9 },
  { y: BOARD_SIZE_HEIGHT, x: 10 },
  { y: BOARD_SIZE_HEIGHT - 1, x: 0 },
  { y: BOARD_SIZE_HEIGHT - 1, x: 1 },
  { y: BOARD_SIZE_HEIGHT - 1, x: 2 },

  { y: BOARD_SIZE_HEIGHT - 1, x: 4 },
  { y: BOARD_SIZE_HEIGHT - 1, x: 5 },
  { y: BOARD_SIZE_HEIGHT - 1, x: 7 },
  { y: BOARD_SIZE_HEIGHT - 1, x: 8 },
  { y: BOARD_SIZE_HEIGHT - 1, x: 10 },
];

const mainLoop = () => {
  users = users.map((item) =>
    item.actionTime === 0
      ? movedBlockVertical(item)
      : {
          ...item,
          actionTime: item.actionTime - 1,
        }
  );

  users = users.map((item) =>
    item.itemIsNeccessaryBlock ? newBlockGenerateItem(item) : item
  );

  users = users.map((item) => sendBlockToOther(item));
};

let broadcast = setInterval(() => {
  mainLoop();
  const data = {
    users: users,
  };
  socketIO.emit("stateOfUsers", data);
}, FRAME);

const generateRandomDomino = () => {
  init();

  let tmpNum = Math.floor(Date.now() * Math.random()) % DOMINOS.length;
  let tmpBody = [];
  for (domi of DOMINOS[tmpNum]) tmpBody.push(domi);
  return { body: tmpBody, num: tmpNum };
};

const insertBlockBodyToGroundBody = (ground, block) => {
  let tmp = ground;
  for (domi of block) tmp.push(domi);
  return tmp;
};

const createUser = (data) => {
  let tmp = generateRandomDomino();
  return {
    userName: data.userName || "a",
    socketID: data.socketID,
    actionTime: FRAME,
    itemBlockBody: tmp.body,
    itemBlockType: tmp.num,
    itemGroundBlock: initialGroundBlock,
    itemIsNeccessaryBlock: false,
  };
};

const sendBlockToOther = (item) => {
  let tmpGround = item.itemGroundBlock;
  let tmpNumber = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];
  for (block of tmpGround) tmpNumber[block.y] = tmpNumber[block.y] + 1;
  for (let i = 0; i < tmpNumber.length; i++)
    if (tmpNumber[i] === BOARD_SIZE_WIDTH) {
      tmpGround = tmpGround.filter((block) => block.y != i);
      tmpGround = tmpGround.map((block) =>
        block.y < i ? { x: block.x, y: block.y + 1 } : block
      );
    }

  return {
    ...item,
    itemGroundBlock: tmpGround,
  };
};

const newBlockGenerateItem = (item) => {
  let tmpBlock = generateRandomDomino();

  return {
    ...item,
    itemGroundBlock: insertBlockBodyToGroundBody(
      item.itemGroundBlock,
      item.itemBlockBody
    ),
    itemBlockBody: tmpBlock.body,
    itemBlockType: tmpBlock.num,
    itemIsNeccessaryBlock: false,
    actionTime: FRAME,
  };
};

const dropBlock = (item) => {
  tmpBlockBody = item.itemBlockBody;
  while (isAvailableMoveVertical(tmpBlockBody, item.itemGroundBlock)) {
    for (domi of tmpBlockBody) {
      domi.y += 1;
    }
  }
  return {
    ...item,
    itemGroundBlock: item.itemGroundBlock,
    isNeccessaryBlock: true,
    actionTime: FRAME,
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

const moveBlockHorizental = (BlockBody, direction) => {
  // move block to Right or Left as input value
  let moveValue = direction === RIGHT ? 1 : -1;
  if (availableMoveBlockHorizental(BlockBody, moveValue))
    for (domi of BlockBody) {
      domi.x += moveValue;
    }
  return BlockBody;
};

const availableMoveBlockHorizental = (BlockBody, moveValue) => {
  let flag = true;
  for (domi of BlockBody) {
    let tmp = domi.x + moveValue;
    if (tmp < 1 || tmp > BOARD_SIZE_WIDTH) flag = false;
  }
  return flag;
};

const movedBlockVertical = (item) => {
  let tmp = item;
  if (isAvailableMoveVertical(tmp.itemBlockBody, tmp.itemGroundBlock)) {
    return {
      ...item,
      itemBlockBody: moveBlockVertical(item.itemBlockBody),
      actionTime: FRAME,
    };
  } else {
    return {
      ...item,
      itemIsNeccessaryBlock: true,
      actionTime: FRAME,
    };
  }
};

const isAvailableMoveVertical = (BlockBody, GroundBlock) => {
  for (domi of BlockBody) {
    let tmp = domi.y + 1;
    if (tmp < 1 || tmp > BOARD_SIZE_HEIGHT) return false;

    for (bgDomin of GroundBlock) {
      if (bgDomin.x === domi.x && bgDomin.y === domi.y + 1) return false;
    }
  }
  return true;
};

const moveBlockVertical = (BlockBody) => {
  // move down as time flow
  for (block of BlockBody) block.y += 1;

  return BlockBody;
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
            itemBlockBody: rotateBlock(item.itemBlockBody),
          }
        : item
    );
  });

  socket.on("moveBlock", (data) => {
    users = users.map((item) =>
      item.socketID === data.socketID
        ? {
            ...item,
            itemBlockBody: moveBlockHorizental(
              item.itemBlockBody,
              data.direction
            ),
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
