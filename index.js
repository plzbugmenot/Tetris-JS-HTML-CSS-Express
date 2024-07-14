const PORT = process.env.REACT_APP_SERVER_PORT || 8800;
const F_PORT = process.env.REACT_APP_CLIENT_PORT || 3500;

const express = require("express");
const server = express();
const cors = require("cors");
const { stat } = require("fs");
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

/************************
    Aurthor: ARMY
    Date: July 12, 2024
    Tool: Express, node, socket, html, css, javaScript
 ***********************/

/************************
   ___ ___ ___  _   _
    |  |_   |  |_> <_ 
    |  |__  |  | \  _>
 _______________________>>>>
 ***********************/

/*********TETRIS Setting*************/

let users = [];
const BOARD_SIZE_HEIGHT = 21;
const BOARD_SIZE_WIDTH = 10;
const TIMEperS = 50;

const FRAME = 20; // every 20ms render

const DOWN = "DOWN";
const LEFT = "LEFT";
const RIGHT = "RIGHT";

const TEAM1 = "TEAM1";
const TEAM2 = "TEAM2";

const WIN = "WIN";
const LOSE = "LOSE";
const GAME = "GAME";

const READY = "READY";
let GAME_STATE;

const INIT_LEVEL = 0;
const ACTION_INIT_TIME = 15;
const ACTION_INIT_TIME_SEND = 1;
const SEND_WIDTH = 2 * BOARD_SIZE_WIDTH;

const USER1 = "USER1";
const USER2 = "USER2";

let DOMINO_1 = [];
let DOMINO_2 = [];
let DOMINO_3 = [];
let DOMINO_4 = [];
let DOMINO_5 = [];
let DOMINO_6 = [];
let DOMINO_7 = [];
let DOMINOS = [];

let User1;
let User2;

let sendStateBlocks = [];

let broadcast;

const init = () => {
  // -.--
  DOMINO_1 = [
    { x: 4, y: 1 },
    { x: 6, y: 1 },
    { x: 5, y: 1 },
    { x: 7, y: 1 },
  ];
  // --
  // --
  DOMINO_2 = [
    { x: 5, y: 1 },
    { x: 6, y: 1 },
    { x: 5, y: 2 },
    { x: 6, y: 2 },
  ];
  // _ . _
  // |
  DOMINO_3 = [
    { x: 5, y: 1 },
    { x: 7, y: 1 },
    { x: 6, y: 1 },
    { x: 5, y: 2 },
  ];
  // _ . _
  //      |
  DOMINO_4 = [
    { x: 5, y: 1 },
    { x: 7, y: 1 },
    { x: 6, y: 1 },
    { x: 7, y: 2 },
  ];
  // |_
  // |
  DOMINO_5 = [
    { x: 5, y: 2 },
    { x: 7, y: 2 },
    { x: 6, y: 2 },
    { x: 6, y: 1 },
  ];
  //   _
  // _|
  DOMINO_6 = [
    { x: 6, y: 1 },
    { x: 7, y: 1 },
    { x: 6, y: 2 },
    { x: 5, y: 2 },
  ];
  //  _
  //   |_
  DOMINO_7 = [
    { x: 5, y: 1 },
    { x: 6, y: 1 },
    { x: 6, y: 2 },
    { x: 7, y: 2 },
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

let level1, level2;

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

  if (sendStateBlocks.length) {
    sendStateBlocks = sendStateBlocks.map((item) =>
      item.actionTime === 0
        ? {
            ...item,
            Blocks: updateSendBlocks(item.Blocks, item.sender),
            position:
              item.sender === User1 ? item.position + 1 : item.position - 1,
            actionTime: ACTION_INIT_TIME_SEND,
          }
        : {
            ...item,
            actionTime: item.actionTime - 1,
          }
    );

    for (item of sendStateBlocks) {
      if (item.sender === User1 && item.position === SEND_WIDTH - 1) {
        receiveBlockFromSender(item.sender, item.Blocks, item.lines);
        item.position += 10;
      }
      if (item.sender === User2 && item.position === 1) {
        receiveBlockFromSender(item.sender, item.Blocks, item.lines);
        item.position -= 10;
      }
    }

    //
    sendStateBlocks = sendStateBlocks.filter(
      (item) => item.position <= SEND_WIDTH && item.position >= 0
    );
  }

  level1 = users[0].level;
  level2 = users[1].level;
};

const updateSendBlocks = (sendBlocks, sender) => {
  if (sender === User1) for (block of sendBlocks) block.x += 1;
  else for (block of sendBlocks) block.x -= 1;
  return sendBlocks;
};

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
  users.length === 0 ? (User1 = data.socketID) : (User2 = data.socketID);
  let tmp = generateRandomDomino();
  let preDomino = generateRandomDomino();
  return {
    userName: data.userName || "user",
    socketID: data.socketID,
    who: users.length === 0 ? USER1 : USER2,

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

const updateUser = (data, iswin) => {
  let tmp = generateRandomDomino();
  let preDomino = generateRandomDomino();
  let newLevel = iswin === GAME ? data.level + 1 : data.level;

  return {
    ...data,
    itemBlockBody: tmp.body,
    itemBlockType: tmp.num,
    itemPreBody: preDomino.body,
    itemPreType: preDomino.num,
    itemGroundBlock: getinitialGroundBlocks(newLevel),
    itemLastBlock: [],

    itemIsNeccessaryBlock: false,

    state: GAME,
    level: newLevel,
  };
};

const isGameOver = (GroundBlock) => {
  let state = GAME;
  if (GroundBlock) for (block of GroundBlock) if (block.y === 1) state = LOSE;
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
  if (tmpGround)
    for (block of tmpGround) tmpNumber[block.y] = tmpNumber[block.y] + 1;
  for (let i = 0; i < tmpNumber.length; i++)
    if (tmpNumber[i] === BOARD_SIZE_WIDTH) {
      tmpGround = tmpGround.filter((block) => block.y != i);
      tmpGround = tmpGround.map((block) =>
        block.y < i ? { x: block.x, y: block.y + 1 } : block
      );
      sendBlockLines.push(i);
    }

  let sendBlocks = getSendBlockFromLastBlock(
    item.itemLastBlock,
    sendBlockLines
  );

  if (sendBlockLines.length >= 2 && sendBlocks.length) {
    let tmptmp = getSendBlocksForSendState(sendBlocks, sendBlockLines.length);
    pushSendBlockToSendState(item.socketID, tmptmp, sendBlockLines.length);

    sendBlockLines = [];
  }

  return {
    ...item,
    itemGroundBlock: tmpGround,
  };
};

// sender, sendBlocks, lines
const pushSendBlockToSendState = (sender, sendBlocks, lines) => {
  if (sender === User2) {
    for (block of sendBlocks) block.x += 20;
  }
  const sendStateBlock = {
    sender: sender,
    Blocks: sendBlocks,
    lines: lines,
    position: sender === User1 ? 0 : SEND_WIDTH,
    actionTime: ACTION_INIT_TIME_SEND,
  };
  sendStateBlocks.push(sendStateBlock);
};

const getSendBlockFromLastBlock = (LastBlock, sendBlockLines) => {
  let sendBlocks = [];
  for (let i = 0; i < sendBlockLines.length; i++) {
    for (block of LastBlock)
      if (block.y === sendBlockLines[i]) sendBlocks.push(block);
  }
  return sendBlocks;
};

const receiveBlockFromSender = (sender, sendBlocks, blockLines) => {
  users = users.map((item) =>
    item.socketID !== sender
      ? {
          ...item,
          itemBlockBody: [],
          itemIsNeccessaryBlock: true,
          itemGroundBlock: updateGroundBlockAtReceive(
            item.itemGroundBlock,
            sendBlocks,
            blockLines
          ),
        }
      : item
  );
};

const updateReceivedUser = (item, sendBlocks, blockLines) => {
  let tmp = item.itemGroundBlock;
  return {
    ...item,
    itemGroundBlock: updateGroundBlockAtReceive(tmp, sendBlocks, blockLines),
  };
};

const updateGroundBlockAtReceive = (GroundBlock, sendBlocks, blockLines) => {
  for (block of GroundBlock) block.y -= blockLines;

  let minX = 100;
  for (block of sendBlocks) minX = Math.min(minX, block.x);
  for (block of sendBlocks) {
    block.x = block.x - minX + 1;
    block.y = BOARD_SIZE_HEIGHT - blockLines + block.y;
  }
  for (block of sendBlocks) GroundBlock.push(block);
  return GroundBlock;
};

const getSendBlocksForSendState = (sendBlocks, blockLines) => {
  let tmpBlock = [];
  let GroundBlock = [];
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

  let minY = 100;
  for (block of tmpBlock)
    if (block.x < 100 && block.y < 100) {
      GroundBlock.push(block);
      minY = block.y;
    }
  for (block of GroundBlock) block.y = block.y - minY + 1;

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

const rotateBlock = (tmpBlockBody, GroundBlock) => {
  let _x = tmpBlockBody[2].x;
  let _y = tmpBlockBody[2].y;

  if (availableRotateBlock(tmpBlockBody, GroundBlock, _x, _y))
    tmpBlockBody = tmpBlockBody.map((item) => getRotateDomino(item, _x, _y));

  return tmpBlockBody;
};

const availableRotateBlock = (BlockBody, GroundBlock, _x, _y) => {
  let flag = true;

  for (block of BlockBody) {
    let tmpBlock = {
      x: block.x,
      y: block.y,
    };
    tmpBlock = getRotateDomino(tmpBlock, _x, _y);
    if (tmpBlock.x < 1 || tmpBlock.x > BOARD_SIZE_WIDTH || tmpBlock.y < 0)
      flag = false;
    for (gblock of GroundBlock) {
      if (tmpBlock.x === gblock.x && tmpBlock.y === gblock.y) flag = false;
    }
  }
  return flag;
};

const getRotateDomino = (item, _x, _y) => {
  let x1 = item.x;
  let y1 = item.y;
  item.x = _x + (y1 - _y);
  item.y = _y - (x1 - _x);
  return item;
};

const moveBlockHorizental = (BlockBody, GroundBlock, direction) => {
  // move block to Right or Left as input value
  let moveValue = direction === RIGHT ? 1 : -1;
  if (availableMoveBlockHorizental(BlockBody, GroundBlock, moveValue))
    for (domi of BlockBody) {
      domi.x += moveValue;
    }
  return BlockBody;
};

const availableMoveBlockHorizental = (BlockBody, GroundBlock, moveValue) => {
  let flag = true;
  for (domi of BlockBody) {
    let tmpx = domi.x + moveValue;
    let tmpy = domi.y;
    if (tmpx < 1 || tmpx > BOARD_SIZE_WIDTH) flag = false;

    for (block of GroundBlock) {
      if (block.x === tmpx && block.y === tmpy) flag = false;
    }
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

const isExistSameUser = (id) => {
  // if true, u can create
  let tmp = true;
  for (item of users) if (item.socketID === id) tmp = false;
  return tmp;
};

/***************** SOCKET **********************/
socketIO.on("connect", (socket) => {
  console.log("connected with client");

  socket.on("newUser", (data) => {
    if (isExistSameUser(data.socketID) && users.length < 2) {
      let newUser = createUser(data);
      users.push(newUser);
      console.log(newUser.userName, " is connected...", newUser.socketID);
      console.log("There are ", users.length, " users...");
      const sendData = {
        newUser: newUser,
        size: users.length,
      };
      socketIO.emit("newUserResponse", sendData);
    }
  });

  socket.on("test", () => {
    console.log("working now");
  });

  socket.on("changeDirection", (data) => {
    users = users.map((item) =>
      item.socketID === data.socketID && item.itemBlockType != 1
        ? {
            ...item,
            itemBlockBody: rotateBlock(
              item.itemBlockBody,
              item.itemGroundBlock
            ),
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
              item.itemGroundBlock,
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

  socket.on("loseStateGet", () => {
    GAME_STATE = READY;
    socket.emit("readyStateEmit");
    clearInterval(broadcast);

    users = users.map((item) => updateUser(item, item.state));
    sendStateBlocks = [];
    // console.log(users[0].level, "vs", users[1].level);
    // console.log(users[0].who, "vs", users[1].who);
  });

  socket.on("startGameWithCouplePlayer", () => {
    if (users.length === 2) {
      broadcast = setInterval(() => {
        mainLoop();
        let sendStateBlocksDomino = [];
        for (block of sendStateBlocks) {
          for (item of block.Blocks) sendStateBlocksDomino.push(item);
        }

        GAME_STATE = GAME;
        const data = {
          users: users,
          gameState: GAME_STATE,
          sendStateBlocks: sendStateBlocksDomino,
        };
        socketIO.emit("stateOfUsers", data);
      }, FRAME);
    }
  });
});

client_http.listen(F_PORT, () => {
  console.log(`Client listening on ${F_PORT}`);
});
