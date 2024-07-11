const gameBoard = document.getElementById("game-board");

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

/********* Transfer *************/

socket.on("connect", () => {
  console.log("connected with server.");
});

socket.on("newUserResponseError", (response) => {
  if (response.socketID === socket.id) alert(response.msg);
});

socket.on("sendBlockEvent", (data) => {
  users = data.users;
  for (item of users) if (item.socketID === socket.id) init(item);
});

socket.on("stateOfUsers", (data) => {
  users = data.users;
  for (item of users) if (item.socketID === socket.id) init(item);
});

socket.on("newUserResponse", (newUser) => {
  if (newUser.socketID === socket.id) initData(newUser);
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
  BlockBody = newUser.BlockBody;
};

const init = (user) => {
  BlockBody = user.itemBlockBody;
  blockType = user.itemBlockType;
  GroundBlock = user.itemGroundBlock;
  state = user.state;
  if (state === LOSE) {
    socket.emit("loseStateGet");
    alert("Lose");
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
  drawBlock(gameBoard, BlockBody, blockType);
  drawGroundBlock(gameBoard, GroundBlock);
};

const handleSet = (event) => {
  // console.log(event);
  if (event.key === "Control") setEventByInputKey(DROP);
  else if (event.key === "ArrowDown") setEventByInputKey(DOWN); // rotate
  else if (event.key === "ArrowRight") setEventByInputKey(RIGHT); // move right
  else if (event.key === "ArrowLeft") setEventByInputKey(LEFT); // move left
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

const drawBlock = (gameBoard, BlockBody, blockType) => {
  for (segment of BlockBody) {
    const dominoElement = document.createElement("div");
    dominoElement.style.gridRowStart = segment.y;
    dominoElement.style.gridColumnStart = segment.x;
    dominoElement.classList.add(`domino-${blockType + 1}`);
    gameBoard.appendChild(dominoElement);
  }
};

const drawGroundBlock = (gameBoard, GroundBlock) => {
  for (segment of GroundBlock) {
    const dominoElement = document.createElement("div");
    dominoElement.style.gridRowStart = segment.y;
    dominoElement.style.gridColumnStart = segment.x;
    dominoElement.classList.add("init-block");
    gameBoard.appendChild(dominoElement);
  }
};
