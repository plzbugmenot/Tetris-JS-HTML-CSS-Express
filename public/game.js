<<<<<<< HEAD
=======
/*********GAME Setting*************/
let gameOver = false;
>>>>>>> 3f2ca1b
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
let userName1 = "";
let level1;

let BlockBody2 = [];
let blockType2 = 0;
let GroundBlock2 = [];
let preBody2 = [];
let preType2;
let userName2 = "";
let level2;

<<<<<<< HEAD
let UserHash = "";

let who = "";

let sendStateBlocks = [];

const setStateBoardText = (size) => {
=======
const USER1 = "USER1";
const USER2 = "USER2";
let who = "";
let roomName = "";

let sendStateBlocks = [];

const stateText = ["", "Wait Another Player...", "Please Press Enter..."];
registerbody.classList.add("show-body");
gamebody.classList.add("hide-body");
roombody.classList.add("hide-body");

const IIIlII1lIlll111llI11lIl1l1lII1l1 = (size) => {
>>>>>>> 3f2ca1b
  stateBoard.innerHTML = "";
  let leveltxt1 = document.createElement("div");
  leveltxt1.innerHTML = stateText[size];
  leveltxt1.classList.add("state-text");
  stateBoard.appendChild(leveltxt1);
};

const I1lIIl111l1lIlll111ll1l1I1ll11II = () => {
  const input = document.getElementById("name");
  const data = {
    userName: input.value,
    socketID: socket.id,
  };
  if (data.userName.trim()) {
<<<<<<< HEAD
    socket.emit("Il1I111lII1l1Il1lIl1I111lII1lIIlll", data);
=======
    localStorage.setItem("userName", input.value);

    registerbody.classList.add("hide-body");
    roombody.classList.remove("hide-body");
    roombody.classList.add("show-body");

    socket.emit("I111II1llllIII11111I11lIlIIl1Ill");
>>>>>>> 3f2ca1b
  } else {
    if (!data.userName.trim()) alert("Input user name.");
  }
};

<<<<<<< HEAD
const initData = (newUser, hash) => {
  if (newUser.socketID === socket.id) {
    BlockBody = newUser.BlockBody;
    UserHash = hash;
    localStorage.setItem("UserHash", UserHash);
  } else BlockBody2 = newUser.BlockBody;
=======
const llII1IIIIIl11lI1l1l1IllIlI1II1l1 = () => {
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

    socket.emit("Il1IllII1I1l1I1Il11II11l1Il1I11l", data);
  } else {
    if (!data.roomName.trim()) alert("Input Room name.");
  }
>>>>>>> 3f2ca1b
};

const lI111I1II1III11111I1ll1l111I1IIl = (user) => {
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
        socket.emit("1IlllIlI1IIl1l1l1III1llIIIllllII", data);
        IIIlII1lIlll111llI11lIl1l1lII1l1(2);
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
<<<<<<< HEAD
      socket.emit(
        "I111I111l11111II111I111l111111I",
        localStorage.getItem("UserHash")
      );
      GAME_STATE = READY;
      setStateBoardText(2);
=======
      const data = {
        roomID: localStorage.getItem("roomID"),
      };
      socket.emit("1IlllIlI1IIl1l1l1III1llIIIllllII", data);
      IIIlII1lIlll111llI11lIl1l1lII1l1(2);
>>>>>>> 3f2ca1b
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

let gamePlay = setInterval(() => {
  l1I1l11lI1IIIlIllI1IIIlI1l1I1I1lI();
}, FRAME);

const l1I1l11lI1IIIlIllI1IIIlI1l1I1I1lI = () => {
  I11II1IllllllIIIllIlIlIlIl1Ill1I();
};

const llII1IllI11IIlIl1I1l1l1111lllIl1 = (preBlock) => {
  let down = 0;
  for (block of preBlock) down = Math.max(down, block.y);
  let delta = 3 - down;
  for (block of preBlock) block.y += delta;
};

<<<<<<< HEAD
const convertSendStateBlocks = (sendStateBlocks) => {
  if (who === USER2) for (block of sendStateBlocks) block.x = 30 - block.x;
};
=======
const lIlIIIlIIIl1I1II1I1Il1llll11l11l = (sendStateBlocks) => {
  if (who === USER2) for (block of sendStateBlocks) block.x = 30 - block.x;
};

const I11II1IllllllIIIllIlIlIlIl1Ill1I = () => {
  document.addEventListener("keydown", I1lII1lIl1lI1II1I1llIlIIl1II1Ill, false);
};

const I1lII1lIl1lI1II1I1llIlIIl1II1Ill = (event) => {
  if (event.ctrlKey && event.key === "s") event.preventDefault();

  if (event.key === "Control") l11ll11IIIII1l1Ill1II1lIIl1Illl1(DROP);
  else if (event.key === "ArrowDown" || event.key === "s")
    l11ll11IIIII1l1Ill1II1lIIl1Illl1(DOWN);
  else if (event.key === "ArrowRight" || event.key === "d")
    l11ll11IIIII1l1Ill1II1lIIl1Illl1(RIGHT);
  else if (event.key === "ArrowLeft" || event.key === "a")
    l11ll11IIIII1l1Ill1II1lIIl1Illl1(LEFT);
  else if (event.key === " ") {
    const data = {
      roomID: localStorage.getItem("roomID"),
    };
    socket.emit("Il11Il1l1IlIII1ll1llll1lII11ll1l", data);
  }
};

const l11ll11IIIII1l1Ill1II1lIIl1Illl1 = (direction) => {
  if (GAME_STATE === READY) return;
  const data = {
    roomID: localStorage.getItem("roomID"),
    socketID: socket.id,
    direction: direction,
  };
  if (direction === DOWN) socket.emit("l1I11IIIIIl1lllII1III1Il111IIlII", data);
  else if (direction === RIGHT || direction === LEFT)
    socket.emit("1lll1Il11l1II11IIIlI1lIllIIII1Il", data);
  else if (direction === DROP)
    socket.emit("IlllIllIlII111ll1I1l1I1lI1lI1l1l", data);
};
>>>>>>> 3f2ca1b
