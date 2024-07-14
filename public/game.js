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
const LIMIT_LEVEL = 10;
const USER1 = "USER1";
const USER2 = "USER2";
const stateText = ["", "Wait Another Player...", "Please Press Space..."];

/*********GAME Setting*************/
let gameOver = false;

let GAME_STATE = READY;
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

let UserHash = "";

let who = "";

let sendStateBlocks = [];

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
    socket.emit("Il1I111lII1l1Il1lIl1I111lII1lIIlll", data);
  } else {
    if (!data.userName.trim()) alert("Input user name.");
  }
};

const initData = (newUser, hash) => {
  if (newUser.socketID === socket.id) {
    BlockBody = newUser.BlockBody;
    UserHash = hash;
    localStorage.setItem("UserHash", UserHash);
  } else BlockBody2 = newUser.BlockBody;
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
      socket.emit(
        "I111I111l11111II111I111l111111I",
        localStorage.getItem("UserHash")
      );
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

const convertSendStateBlocks = (sendStateBlocks) => {
  if (who === USER2) for (block of sendStateBlocks) block.x = 30 - block.x;
};
