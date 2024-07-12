const PORT = 8800;
const F_PORT = 3500;

const express = require("express");
const server = express();
const cors = require("cors");
const { stat } = require("fs");
const server_http = require("http").Server(server);

const socketIO = require("socket.io")(server_http, {
  cors: ["*"],
  // cors: "http://localhost:3300",
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
const FRAME = 1; // every 20ms render
const UP = "UP";
const DOWN = "DOWN";
const LEFT = "LEFT";
const RIGHT = "RIGHT";

const TEAM1 = "TEAM1";
const TEAM2 = "TEAM2";

const WIN = "WIN";
const LOSE = "LOSE";
const GAME = "GAME";

const INIT_LEVEL = 0;
const ACTION_INIT_TIME = 30;

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

  users = users.map((item) =>
    isGameOver(item.itemGroundBlock) === LOSE ? { ...item, state: LOSE } : item
  );
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
  let preDomino = generateRandomDomino();
  return {
    userName: data.userName || "user",
    socketID: data.socketID,

    actionTime: ACTION_INIT_TIME,

    itemBlockBody: tmp.body,
    itemBlockType: tmp.num,
    itemPreBody: preDomino.body,
    itemPreType: preDomino.num,
    itemGroundBlock: getinitialGroundBlocks(0),
    itemLastBlock: [],

    itemIsNeccessaryBlock: false,

    state: GAME,
    level: INIT_LEVEL,
  };
};

const isGameOver = (GroundBlock) => {
  let state = GAME;
  for (block of GroundBlock) if (block.y === 1) state = LOSE;
  return state;
};

const getinitialGroundBlocks = (level) => {
  let tmp = [];
  for (let line = 0; line < level + 2; line++) {
    let rand_1 = Math.floor(Date.now() * Math.random()) % BOARD_SIZE_WIDTH;
    let rand_2 = Math.floor(Date.now() * Math.random()) % BOARD_SIZE_WIDTH;
    if (rand_1 === rand_2)
      rand_2 = Math.floor(Date.now() * Math.random()) % BOARD_SIZE_WIDTH;
    for (let i = 0; i < BOARD_SIZE_WIDTH; i++)
      if (i !== rand_1 && i !== rand_2)
        tmp.push({
          x: i,
          y: BOARD_SIZE_HEIGHT - line,
        });
  }
  return tmp;
};

const sendBlockToOther = (item) => {
  let tmpGround = item.itemGroundBlock;
  let tmpNumber = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];
  let sendBlockLines = [];
  for (block of tmpGround) tmpNumber[block.y] = tmpNumber[block.y] + 1;
  for (let i = 0; i < tmpNumber.length; i++)
    if (tmpNumber[i] === BOARD_SIZE_WIDTH) {
      tmpGround = tmpGround.filter((block) => block.y != i);
      tmpGround = tmpGround.map((block) =>
        block.y < i ? { x: block.x, y: block.y + 1 } : block
      );
      sendBlockLines.push(i);
    }

  // send blocks to the other
  let sendBlocks = getSendBlockFormLaskBlock(
    item.itemLastBlock,
    sendBlockLines
  );

  if (sendBlockLines.length >= 2 && sendBlocks.length) {
    receiveBlockFromSender(item.socketID, sendBlocks, sendBlockLines.length);
    sendBlockLines = [];
  }

  return {
    ...item,
    itemGroundBlock: tmpGround,
  };
};

const getSendBlockFormLaskBlock = (LastBlock, sendBlockLines) => {
  let tmp = [];
  for (let i = 0; i < sendBlockLines.length; i++) {
    for (block of LastBlock) if (block.y === sendBlockLines[i]) tmp.push(block);
  }
  return tmp;
};

const receiveBlockFromSender = (sender, sendBlocks, blockLines) => {
  users = users.map((item) =>
    item.socketID !== sender
      ? updateReceivedUser(item, sendBlocks, blockLines)
      : item
  );
  for (let i = 0; i < users.length; i++)
    if (users[i].socketID !== sender) {
    }
  const data = {
    users: users,
  };
  socketIO.emit("sendBlockEvent", data);
};

const updateReceivedUser = (item, sendBlocks, blockLines) => {
  return {
    ...item,
    itemGroundBlock: updateGroundBlockAtReceive(
      item.itemGroundBlock,
      sendBlocks,
      blockLines
    ),
  };
};

const updateGroundBlockAtReceive = (GroundBlock, sendBlocks, blockLines) => {
  for (block of GroundBlock) block.y -= blockLines;

  let tmpBlock = [];
  sendBlocks = convertBlock(sendBlocks, blockLines);

  for (let i = 0; i < blockLines; i++) {
    for (let j = 1; j <= BOARD_SIZE_WIDTH; j++) {
      tmpBlock.push({ x: j, y: BOARD_SIZE_HEIGHT - i });
    }
  }

  for (block of sendBlocks) {
    for (item of tmpBlock)
      if (item.x === block.x && item.y === block.y) {
        item.x = 100;
        item.y = 100;
      }
  }

  for (block of tmpBlock)
    if (block.x < 100 && block.y < 100) GroundBlock.push(block);

  return GroundBlock;
};

const convertBlock = (sendBlocks, blockLines) => {
  let delta = BOARD_SIZE_HEIGHT;
  for (block of sendBlocks)
    delta = Math.min(delta, BOARD_SIZE_HEIGHT - block.y);
  for (block of sendBlocks) block.y += delta;

  if (blockLines === 2) {
    for (block of sendBlocks) {
      if (block.y === BOARD_SIZE_HEIGHT) block.y = BOARD_SIZE_HEIGHT - 1;
      else block.y = BOARD_SIZE_HEIGHT;
    }
  } else if (blockLines === 3) {
    for (block of sendBlocks) {
      if (block.y === BOARD_SIZE_HEIGHT) block.y = BOARD_SIZE_HEIGHT - 2;
      else if (block.y === BOARD_SIZE_HEIGHT - 2) block.y = BOARD_SIZE_HEIGHT;
    }
  }
  // else {
  //   for (block of sendBlocks) {
  //     if (block.y === BOARD_SIZE_HEIGHT) block.y = BOARD_SIZE_HEIGHT - 3;
  //     else if (block.y === BOARD_SIZE_HEIGHT - 2)
  //       block.y = BOARD_SIZE_HEIGHT - 1;
  //     else if (block.y === BOARD_SIZE_HEIGHT - 1)
  //       block.y = BOARD_SIZE_HEIGHT - 2;
  //     else block.y = BOARD_SIZE_HEIGHT;
  //   }
  // }

  return sendBlocks;
};

const newBlockGenerateItem = (item) => {
  let newBlockBody = item.itemPreBody;
  let newBlockType = item.itemPreType;
  let tmpBlock = generateRandomDomino();
  return {
    ...item,
    itemGroundBlock: insertBlockBodyToGroundBody(
      item.itemGroundBlock,
      item.itemBlockBody
    ),
    itemLastBlock: item.itemBlockBody,
    itemPreBody: tmpBlock.body,
    itemPreType: tmpBlock.num,

    itemBlockBody: newBlockBody,
    itemBlockType: newBlockType,
    itemIsNeccessaryBlock: false,
    actionTime: ACTION_INIT_TIME,
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
    actionTime: 0,
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
      actionTime: ACTION_INIT_TIME,
    };
  } else {
    return {
      ...item,
      itemIsNeccessaryBlock: true,
      actionTime: ACTION_INIT_TIME,
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
    if (users.length < 2) {
      let newUser = createUser(data);
      users.push(newUser);
      console.log(newUser.userName, " is connected...", newUser.socketID);
      console.log("There are ", users.length, " users...");
      socketIO.emit("newUserResponse", newUser);
    } else {
      console.log("There is full users.");
      let response = {
        socketID: data.socketID,
        msg: "There is full users.",
      };
      // socketIO.emit("newUserResponseError", response);
    }
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
    // TODO
    // let start_time = Date.now();
    // console.log("b_start =>", start_time);
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
    let end_time = Date.now();
    // console.log("end   =>", end_time);
  });

  socket.on("dropBlock", (data) => {
    users = users.map((item) =>
      item.socketID === data.socketID ? dropBlock(item) : item
    );
  });

  socket.on("loseStateGet", () => {
    clearInterval(broadcast);
    console.log("Game Over");
  });
});

client_http.listen(F_PORT, () => {
  console.log(`Client listening on ${F_PORT}`);
});
