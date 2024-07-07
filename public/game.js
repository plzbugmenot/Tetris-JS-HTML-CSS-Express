const gameBoard = document.getElementById("game-board");

/*********GAME Setting*************/
let gameOver = false;
const FRAME = 100;

const DROP = "DROP";
const DOWN = "DOWN";
const LEFT = "LEFT";
const RIGHT = "RIGHT";

let BlockBody = [];
let blockType = 0;
let initialGroundBlock = [];
let users = [];

/********* Transfer *************/

socket.on("connect", () => {
  console.log("connected with server.");
});

socket.on("newUserResponseError", (data) => {
  alert(data);
});

socket.on("stateOfUsers", (data) => {
  users = data.users;
  for (item of users) if (item.socketID === socket.id) init(item);
  draw();
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
    if (!data.userName.trim()) alert("select your team.");
    else alert("Input user name.");
  }
};

const initData = (newUser) => {
  BlockBody = newUser.BlockBody;
};

const init = (user) => {
  BlockBody = user.BlockBody;
  blockType = user.blockType;
  initialGroundBlock = user.groundBlock;
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

const draw = () => {
  gameBoard.innerHTML = "";
  drawBlock(gameBoard, BlockBody, blockType);
  drawGroundBlock(gameBoard, initialGroundBlock);
};

const handleSet = (event) => {
  // console.log(event);
  if (event.key === "Control") setDirection(DROP);
  else if (event.key === "ArrowDown") setDirection(DOWN); // change direction
  else if (event.key === "ArrowRight") setDirection(RIGHT); // move right
  else if (event.key === "ArrowLeft") setDirection(LEFT); // move left
};

const setDirection = (direction) => {
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

const drawGroundBlock = (gameBoard, initialGroundBlock) => {
  for (segment of initialGroundBlock) {
    const dominoElement = document.createElement("div");
    dominoElement.style.gridRowStart = segment.y;
    dominoElement.style.gridColumnStart = segment.x;
    dominoElement.classList.add("init-block");
    gameBoard.appendChild(dominoElement);
  }
};
