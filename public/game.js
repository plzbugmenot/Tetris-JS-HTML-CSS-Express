const gameBoard = document.getElementById("game-board");
const preBoard = document.getElementById("pre-game-board");

const gameBoard2 = document.getElementById("game-board-other");
const preBoard2 = document.getElementById("pre-game-board-other");

const sendBlockBoard = document.getElementById("footer-board");
/*********GAME Setting*************/
let gameOver = false;
const FRAME = 10;

const DROP = "DROP";
const DOWN = "DOWN";
const LEFT = "LEFT";
const RIGHT = "RIGHT";

const WIN = "WIN";
const LOSE = "LOSE";
const GAME = "GAME";

let users = [];
let state = "";

let BlockBody = [];
let blockType = 0;
let GroundBlock = [];
let preBody = [];
let preType;

let BlockBody2 = [];
let blockType2 = 0;
let GroundBlock2 = [];
let preBody2 = [];
let preType2;

let who = "i'm ";

const USER1 = "USER1";
const USER2 = "USER2";

let sendStateBlocks = [];

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

socket.on("stateOfUsers", (data) => {
  users = data.users;
  sendStateBlocks = data.sendStateBlocks;
  convertSendStateBlocks(sendStateBlocks);

  for (item of users) init(item);

  updatePreBlock(preBody);
  updatePreBlock(preBody2);

  drawDataFromServer();
});

socket.on("newUserResponse", (newUser) => {
  initData(newUser);
});

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
    if (state === LOSE) {
      socket.emit("loseStateGet");
      alert("Lose");
    }
  } else {
    BlockBody2 = user.itemBlockBody;
    blockType2 = user.itemBlockType;
    GroundBlock2 = user.itemGroundBlock;
    preBody2 = user.itemPreBody;
    preType2 = user.itemPreType;
  }
  // updatePreBlock(preBody);
  // updatePreBlock(preBody2);
  // drawDataFromServer();
};

/*********  ACTION  *************/
let gamePlay = setInterval(() => {
  mainLoop();
}, FRAME);

const mainLoop = () => {
  getInputData();
};

const getInputData = () => {
  document.addEventListener("keydown", handleSet, false);
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
  // console.log("who =>", who);
  sendBlockBoard.innerHTML = "";
  drawBlock(sendBlockBoard, sendStateBlocks, 6);
};

const convertSendStateBlocks = (sendStateBlocks) => {
  if (who === USER2) for (block of sendStateBlocks) block.x = 30 - block.x;
};

const handleSet = (event) => {
  // let start_time = Date.now();
  // console.log("f_start =>", start_time);
  // console.log(event);
  if (event.key === "Control") setEventByInputKey(DROP);
  else if (event.key === "ArrowDown") setEventByInputKey(DOWN); // rotate
  else if (event.key === "ArrowRight") setEventByInputKey(RIGHT); // move right
  else if (event.key === "ArrowLeft") setEventByInputKey(LEFT); // move left
  else if (event.key === "s") setEventByInputKey(DOWN); // rotate
  else if (event.key === "d") setEventByInputKey(RIGHT); // move right
  else if (event.key === "a") setEventByInputKey(LEFT); // move left
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
