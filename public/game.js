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

const LIMIT_LEVEL = 10;

let users = [];
let state = "";

let BlockBody = [];
let blockType = 0;
let GroundBlock = [];
let preBody = [];
let preType;
let userName1 = "";
let level1;

let BlockBody2 = [];
let blockType2 = 0;
let GroundBlock2 = [];
let preBody2 = [];
let preType2;
let userName2 = "";
let level2;

const USER1 = "USER1";
const USER2 = "USER2";
let who = "";
let roomName = "";

let sendStateBlocks = [];

const stateText = ["", "Wait Another Player...", "Please Press Enter..."];
registerbody.classList.add("show-body");
gamebody.classList.add("hide-body");
roombody.classList.add("hide-body");

/********* Transfer *************/

const setStateBoardText = (size) => {
  stateBoard.innerHTML = "";
  let leveltxt1 = document.createElement("div");
  leveltxt1.innerHTML = stateText[size];
  leveltxt1.classList.add("state-text");
  stateBoard.appendChild(leveltxt1);
};

const btnRegister = () => {
  const input = document.getElementById("name");
  const data = {
    userName: input.value,
    socketID: socket.id,
  };
  if (data.userName.trim()) {
    localStorage.setItem("userName", input.value);

    registerbody.classList.add("hide-body");
    roombody.classList.remove("hide-body");
    roombody.classList.add("show-body");

    socket.emit("register");
  } else {
    if (!data.userName.trim()) alert("Input user name.");
  }
};

const btnCreateRoom = () => {
  const input = document.getElementById("roomName");
  const data = {
    roomName: input.value,
    userName: localStorage.getItem("userName"),
    socketID: socket.id,
  };
  if (data.roomName.trim()) {
    roombody.classList.remove("show-body");

    gamebody.classList.add("hide-body");
    roombody.classList.add("show-body");

    socket.emit("createRoom", data);
  } else {
    if (!data.roomName.trim()) alert("Input Room name.");
  }
};

const init = (user) => {
  // view mode
  if (localStorage.getItem("view") === socket.id) {
    if (user.who === USER1) {
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
        const data = {
          roomID: localStorage.getItem("roomID"),
        };
        socket.emit("loseStateGet", data);
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
  }
  // game mode
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
      const data = {
        roomID: localStorage.getItem("roomID"),
      };
      socket.emit("loseStateGet", data);
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

const convertSendStateBlocks = (sendStateBlocks) => {
  if (who === USER2) for (block of sendStateBlocks) block.x = 30 - block.x;
};

const getInputData = () => {
  document.addEventListener("keydown", handleSet, false);
};

const handleSet = (event) => {
  if (event.ctrlKey && event.key === "s") event.preventDefault();

  if (event.key === "Control") setEventByInputKey(DROP);
  else if (event.key === "ArrowDown" || event.key === "s")
    setEventByInputKey(DOWN); // rotate
  else if (event.key === "ArrowRight" || event.key === "d")
    setEventByInputKey(RIGHT); // move right
  else if (event.key === "ArrowLeft" || event.key === "a")
    setEventByInputKey(LEFT); // move left
  // else if (event.key === "s") setEventByInputKey(DOWN); // rotate
  // else if (event.key === "d") setEventByInputKey(RIGHT); // move right
  // else if (event.key === "a") setEventByInputKey(LEFT); // move left
  else if (event.key === " ") {
    const data = {
      roomID: localStorage.getItem("roomID"),
    };
    socket.emit("startGameWithCouplePlayer", data);
  }
};

const setEventByInputKey = (direction) => {
  if (GAME_STATE === READY) return;
  const data = {
    roomID: localStorage.getItem("roomID"),
    socketID: socket.id,
    direction: direction,
  };
  if (direction === DOWN) socket.emit("changeDirection", data);
  else if (direction === RIGHT || direction === LEFT)
    socket.emit("moveBlock", data);
  else if (direction === DROP) socket.emit("dropBlock", data);
};
