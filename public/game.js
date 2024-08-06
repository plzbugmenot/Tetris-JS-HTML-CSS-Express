const gameBoard = document.getElementById("game-board");
const preBoard = document.getElementById("pre-game-board");

const gameBoard2 = document.getElementById("game-board-other");
const preBoard2 = document.getElementById("pre-game-board-other");

const sendBlockBoard = document.getElementById("footer-board");

const NameBoard1 = document.getElementById("user1-title");
const NameBoard2 = document.getElementById("user2-title");

const stateBoard = document.getElementById("state-start");

/*********GAME Setting*************/
let gameOver = false;
const FRAME = 10;

const DROP = "DROP";
const DOWN = "DOWN";
const LEFT = "LEFT";
const RIGHT = "RIGHT";

const SPACE = "SPACE";

const WIN = "WIN";
const LOSE = "LOSE";
const GAME = "GAME";

const READY = "READY";
let GAME_STATE = READY;

const LIMIT_LEVEL = 3;

let users = [];
let state = "";

let BlockBody = [];
let blockType = 0;
let GroundBlock = [];
let preBody = [];
let preType;
let userName1;
let level1;

let BlockBody2 = [];
let blockType2 = 0;
let GroundBlock2 = [];
let preBody2 = [];
let preType2;
let userName2;
let level2;

let who = "";

const USER1 = "USER1";
const USER2 = "USER2";

let sendStateBlocks = [];

const stateText = ["", "Wait Another Player...", "Please Press Enter..."];

/********* Transfer *************/

socket.on("connect", () => {
  console.log("connected with server.");
});

socket.on("newUserResponseError", (response) => {
  if (response.socketID === socket.id) alert(response.msg);
});

socket.on("sendBlockEvent", (data) => {
  users = data.users;
  for (item of users) init(item);
});

socket.on("readyStateEmit", () => {
  console.log("GAME_STATE => ", GAME_STATE);
  GAME_STATE = READY;
});

socket.on("stateOfUsers", (data) => {
  users = data.users;
  sendStateBlocks = data.sendStateBlocks;

  GAME_STATE = data.gameState;
  if (GAME_STATE === GAME) setStateBoardText(0);
  convertSendStateBlocks(sendStateBlocks);

  for (item of users) init(item);

  updatePreBlock(preBody);
  updatePreBlock(preBody2);

  drawDataFromServer();
  drawStateDataFromServer();
});

socket.on("newUserResponse", (data) => {
  initData(data.newUser);

  setStateBoardText(data.size);
  // if (data.size === 1) {
  //   console.log("await another player...");
  // } else if (data.size === 2) {
  //   console.log("presss Enter");
  // }
});

const setStateBoardText = (size) => {
  stateBoard.innerHTML = "";
  let leveltxt1 = document.createElement("div");
  leveltxt1.innerHTML = stateText[size];
  leveltxt1.classList.add("state-text");
  stateBoard.appendChild(leveltxt1);
};

const sendMessage = () => {
  const input = document.getElementById("name");
  const data = {
    userName: input.value,
    socketID: socket.id,
  };
  if (data.userName.trim()) {
    socket.emit("newUser", data);
  } else {
    if (!data.userName.trim()) alert("Input user name.");
  }
};

const initData = (newUser) => {
  if (newUser.socketID === socket.id) BlockBody = newUser.BlockBody;
  else BlockBody2 = newUser.BlockBody;
};

const init = (user) => {
  if (user.socketID === socket.id) {
    BlockBody = user.itemBlockBody;
    blockType = user.itemBlockType;
    GroundBlock = user.itemGroundBlock;
    state = user.state;
    preBody = user.itemPreBody;
    preType = user.itemPreType;
    who = user.who;
    userName1 = user.userName;
    who === USER1 ? (level1 = user.level) : (level2 = user.level);

    if (state === LOSE) {
      console.log("Lose State get... ready state");
      socket.emit("loseStateGet");
      GAME_STATE = READY;
      setStateBoardText(2);
    }
  } else {
    BlockBody2 = user.itemBlockBody;
    blockType2 = user.itemBlockType;
    GroundBlock2 = user.itemGroundBlock;
    preBody2 = user.itemPreBody;
    preType2 = user.itemPreType;
    userName2 = user.userName;
    user.who === USER1 ? (level1 = user.level) : (level2 = user.level);
  }
  if (level1 === LIMIT_LEVEL || level2 === LIMIT_LEVEL) {
    if (who === USER1) {
      if (level1 === LIMIT_LEVEL) alert("Win");
      else alert("Lose");
    } else {
      if (level2 === LIMIT_LEVEL) alert("Win");
      else alert("Lose");
    }
  }
};

/*********  ACTION  *************/
let gamePlay = setInterval(() => {
  mainLoop();
}, FRAME);

const mainLoop = () => {
  getInputData();
};

const updatePreBlock = (preBlock) => {
  let down = 0;
  for (block of preBlock) down = Math.max(down, block.y);
  let delta = 3 - down;
  for (block of preBlock) block.y += delta;
};

const drawDataFromServer = () => {
  gameBoard.innerHTML = "";
  preBoard.innerHTML = "";
  if (BlockBody) drawBlock(gameBoard, BlockBody, blockType);
  drawGroundBlock(gameBoard, GroundBlock);
  drawBlock(preBoard, preBody, preType);

  gameBoard2.innerHTML = "";
  preBoard2.innerHTML = "";
  if (BlockBody2) {
    drawBlock(gameBoard2, BlockBody2, blockType2);
    drawGroundBlock(gameBoard2, GroundBlock2);
    drawBlock(preBoard2, preBody2, preType2);
  }
  sendBlockBoard.innerHTML = "";
  console.log("sendStateBlocks ==>", sendStateBlocks);
  drawBlock(sendBlockBoard, sendStateBlocks, 6);
};

const convertSendStateBlocks = (sendStateBlocks) => {
  if (who === USER2) for (block of sendStateBlocks) block.x = 30 - block.x;
};

const getInputData = () => {
  document.addEventListener("keydown", handleSet, false);
};

const handleSet = (event) => {
  if (event.key === "Control") setEventByInputKey(DROP);
  else if (event.key === "ArrowDown") setEventByInputKey(DOWN); // rotate
  else if (event.key === "ArrowRight") setEventByInputKey(RIGHT); // move right
  else if (event.key === "ArrowLeft") setEventByInputKey(LEFT); // move left
  else if (event.key === "s") setEventByInputKey(DOWN); // rotate
  else if (event.key === "d") setEventByInputKey(RIGHT); // move right
  else if (event.key === "a") setEventByInputKey(LEFT); // move left
  else if (event.key === " ") {
    if (GAME_STATE === GAME) return;
    socket.emit("startGameWithCouplePlayer");
    setStateBoardText(0);
  }
};

const setEventByInputKey = (direction) => {
  const data = {
    socketID: socket.id,
    direction: direction,
  };
  if (direction === DOWN) socket.emit("changeDirection", data);
  else if (direction === RIGHT || direction === LEFT)
    socket.emit("moveBlock", data);
  else if (direction === DROP) socket.emit("dropBlock", data);
};

const drawBlock = (drawBoard, drawBlockBody, blockType) => {
  for (segment of drawBlockBody) {
    const dominoElement = document.createElement("div");
    dominoElement.style.gridRowStart = segment.y;
    dominoElement.style.gridColumnStart = segment.x;
    dominoElement.classList.add(`domino-${blockType + 1}`);
    drawBoard.appendChild(dominoElement);
  }
};

const drawGroundBlock = (drawBoard, drawGroundBlock) => {
  for (segment of drawGroundBlock) {
    const dominoElement = document.createElement("div");
    dominoElement.style.gridRowStart = segment.y;
    dominoElement.style.gridColumnStart = segment.x;
    dominoElement.classList.add("init-block");
    drawBoard.appendChild(dominoElement);
  }
};

const drawStateDataFromServer = () => {
  NameBoard1.innerHTML = "";
  let nameText = document.createElement("div");
  nameText.innerHTML = userName1;
  NameBoard1.appendChild(nameText);

  NameBoard2.innerHTML = "";
  nameText = document.createElement("div");
  nameText.innerHTML = userName2;
  NameBoard2.appendChild(nameText);
  let LevelBoard1, LevelBoard2;
  if (who === USER1) {
    LevelBoard1 = document.getElementById("user1-level");
    LevelBoard2 = document.getElementById("user2-level");
  } else {
    LevelBoard1 = document.getElementById("user2-level");
    LevelBoard2 = document.getElementById("user1-level");
  }

  // if (Date.now() % 1000 < 50) console.log(level1, " vs ", level2);
  LevelBoard1.innerHTML = "";
  for (let i = 0; i < level1; i++) {
    let leveltxt1 = document.createElement("div");
    let tmpText = "*";
    leveltxt1.innerHTML = tmpText;
    leveltxt1.classList.add("level-item");
    LevelBoard1.appendChild(leveltxt1);
  }

  LevelBoard2.innerHTML = "";
  for (let i = 0; i < level2; i++) {
    let leveltxt2 = document.createElement("div");
    let tmpText = "*";
    leveltxt2.innerHTML = tmpText;
    leveltxt2.classList.add("level-item");
    LevelBoard2.appendChild(leveltxt2);
  }
};
