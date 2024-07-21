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
