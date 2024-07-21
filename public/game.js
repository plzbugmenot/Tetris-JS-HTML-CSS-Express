const gamebody = document.getElementById("game-body");
const registerbody = document.getElementById("register");
const roombody = document.getElementById("room-body");

const roomList = document.getElementById("rooms");

const gameBoard = document.getElementById("game-board");
const preBoard = document.getElementById("pre-game-board");

const gameBoard2 = document.getElementById("game-board-other");
const preBoard2 = document.getElementById("pre-game-board-other");

const sendBlockBoard = document.getElementById("footer-board");

const NameBoard1 = document.getElementById("user1-title");
const NameBoard2 = document.getElementById("user2-title");

const stateBoard = document.getElementById("state-start");
const roomNameBoard = document.getElementById("pre-state-board");

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

socket.on("registerResponse", (data) => {
  addRoomItemToRoomBody(data);
});

socket.on("stateOfUsers", (data) => {
  // data: gameRoom
  // room: state roomName, roomID, sendStateBlock, users[], User1, User2

  for (room of data.gameRooms)
    if (room.roomID === localStorage.getItem("roomID")) {
      roomName = room.roomName;
      users = room.users;
      sendStateBlocks = room.sendStateBlocks;
      GAME_STATE = room.state;

      if (GAME_STATE === GAME) setStateBoardText(0);
      convertSendStateBlocks(sendStateBlocks);

      for (item of users) init(item);

      updatePreBlock(preBody);
      updatePreBlock(preBody2);

      if (GAME_STATE === GAME) drawDataFromServer();
      drawStateDataFromServer();
    }
});

socket.on("createRoomResponse", (data) => {
  // console.log("cre res =>", data);
  if (data.socketID === socket.id) {
    localStorage.setItem("roomID", data.roomID);
    roombody.classList.remove("show-body");
    roombody.classList.add("hide-body");
    gamebody.classList.remove("hide-body");
    gamebody.classList.add("show-body");
  }
});

socket.on("joinRoomResponse", (data) => {
  // console.log("join res =>", data);
  if (data.socketID === socket.id) {
    localStorage.setItem("roomID", data.roomID);
    roombody.classList.remove("show-body");
    roombody.classList.add("hide-body");
    gamebody.classList.remove("hide-body");
    gamebody.classList.add("show-body");
  }
});

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
  drawBlock(sendBlockBoard, sendStateBlocks, 7);
};

const convertSendStateBlocks = (sendStateBlocks) => {
  if (who === USER2) for (block of sendStateBlocks) block.x = 30 - block.x;
};

const getInputData = () => {
  document.addEventListener("keydown", handleSet, false);
};

const handleSet = (event) => {
  if (event.ctrlKey && event.key === "s") {
    event.preventDefault();
  }

  if (event.key === "Control") setEventByInputKey(DROP);
  else if (event.key === "ArrowDown") setEventByInputKey(DOWN); // rotate
  else if (event.key === "ArrowRight") setEventByInputKey(RIGHT); // move right
  else if (event.key === "ArrowLeft") setEventByInputKey(LEFT); // move left
  else if (event.key === "s") setEventByInputKey(DOWN); // rotate
  else if (event.key === "d") setEventByInputKey(RIGHT); // move right
  else if (event.key === "a") setEventByInputKey(LEFT); // move left
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

  roomNameBoard.innerHTML = "";
  let roomNametxt = document.createElement("div");
  roomNametxt.innerHTML = roomName;
  roomNametxt.classList.add("room-name-text");
  roomNameBoard.appendChild(roomNametxt);
};

const addRoomItemToRoomBody = (data) => {
  // data: gameRoom
  // room: state roomName, roomID, sendStateBlock, users[], User1, User2
  roomList.innerHTML = "";
  for (room of data.gameRooms) {
    let newRoom = document.createElement("div");

    // add game number
    let roomName = document.createElement("div");
    roomName.innerHTML = room.roomName;
    newRoom.classList.add("room-item-level");
    newRoom.appendChild(roomName);

    // add title  player1 vs player2
    let Title = document.createElement("div");
    let tmpTitle =
      room.users.length === 2
        ? room.users[0].userName + " : " + room.users[1].userName
        : room.users[0].userName;
    Title.innerHTML = tmpTitle;
    Title.classList.add("room-item-title");
    newRoom.appendChild(Title);

    //add btns
    let btnGroup = document.createElement("div");
    let btnJoin = document.createElement("div");
    btnJoin.innerHTML = "Join";
    btnJoin.classList.add("room-item-btn");
    btnJoin.onclick = () => {
      if (room.users.length === 2) return;
      const data = {
        roomID: room.roomID,
        userName: localStorage.getItem("userName"),
        socketID: socket.id,
      };
      socket.emit("joinRoom", data);
    };
    btnGroup.appendChild(btnJoin);

    let btnView = document.createElement("div");
    btnView.innerHTML = "View";
    btnView.classList.add("room-item-btn");
    btnGroup.appendChild(btnView);
    btnGroup.classList.add("room-item-btnGroup");
    btnView.onclick = () => {
      localStorage.setItem("roomID", room.roomID);
      who = USER1;
      localStorage.setItem("view", socket.id);
      roombody.classList.remove("show-body");
      roombody.classList.add("hide-body");
      gamebody.classList.remove("hide-body");
      gamebody.classList.add("show-body");
    };
    newRoom.appendChild(btnGroup);

    // new room add
    newRoom.classList.add("room-item");

    roomList.appendChild(newRoom);
  }
};
