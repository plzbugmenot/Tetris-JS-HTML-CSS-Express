const gameBoard = document.getElementById("game-board");
const gameBoard2 = document.getElementById("game-board-other");

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

let BlockBody = [];
let blockType = 0;
let GroundBlock = [];
let users = [];
let state = "";

let BlockBody2 = [];
let blockType2 = 0;
let GroundBlock2 = [];

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
  for (item of users) init(item);
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
    if (state === LOSE) {
      socket.emit("loseStateGet");
      alert("Lose");
    }
  } else {
    BlockBody2 = user.itemBlockBody;
    blockType2 = user.itemBlockType;
    GroundBlock2 = user.itemGroundBlock;
  }
  drawDataFromServer();
};

/*********  ACTION  *************/
let gamePlay = setInterval(() => {
  mainLoop();
}, FRAME);

const mainLoop = () => {
  getInputData();
};

const getInputData = () => {
  window.addEventListener("keydown", handleSet, false);
};

const drawDataFromServer = () => {
  gameBoard.innerHTML = "";
  if (BlockBody) drawBlock(gameBoard, BlockBody, blockType);
  drawGroundBlock(gameBoard, GroundBlock);

  gameBoard2.innerHTML = "";
  if (BlockBody2) drawBlock(gameBoard2, BlockBody2, blockType2);
  drawGroundBlock(gameBoard2, GroundBlock2);
};

const handleSet = (event) => {
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
