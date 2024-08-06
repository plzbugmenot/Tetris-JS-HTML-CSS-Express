const l1IIIl1I1II1IllIll1ll1IIll11111ll = () => {
  gameBoard.innerHTML = "";
  preBoard.innerHTML = "";
  if (BlockBody)
    llIlllIll111l11Illll1lIll1I1l1I1(gameBoard, BlockBody, blockType);
  l1111llllIlI11lll1I1IlI1llIIll111(gameBoard, GroundBlock);
  llIlllIll111l11Illll1lIll1I1l1I1(preBoard, preBody, preType);

  gameBoard2.innerHTML = "";
  preBoard2.innerHTML = "";
  if (BlockBody2) {
    llIlllIll111l11Illll1lIll1I1l1I1(gameBoard2, BlockBody2, blockType2);
    l1111llllIlI11lll1I1IlI1llIIll111(gameBoard2, GroundBlock2);
    llIlllIll111l11Illll1lIll1I1l1I1(preBoard2, preBody2, preType2);
  }

  sendBlockBoard.innerHTML = "";
  llIlllIll111l11Illll1lIll1I1l1I1(sendBlockBoard, sendStateBlocks, 7);
};

const llIlllIll111l11Illll1lIll1I1l1I1 = (
  drawBoard,
  drawBlockBody,
  blockType
) => {
  for (segment of drawBlockBody) {
    const dominoElement = document.createElement("div");
    dominoElement.style.gridRowStart = segment.y;
    dominoElement.style.gridColumnStart = segment.x;
    dominoElement.classList.add(`domino-${blockType + 1}`);
    drawBoard.appendChild(dominoElement);
  }
};

const l1111llllIlI11lll1I1IlI1llIIll111 = (drawBoard, drawGroundBlock) => {
  for (segment of drawGroundBlock) {
    const dominoElement = document.createElement("div");
    dominoElement.style.gridRowStart = segment.y;
    dominoElement.style.gridColumnStart = segment.x;
    dominoElement.classList.add("init-block");
    drawBoard.appendChild(dominoElement);
  }
};

const l1llll1I11Il1lII1I11III1lI1IIlII1 = () => {
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

const IllI1II1l1lIlll11lI1I111l1II111l = (data) => {
  roomList.innerHTML = "";
  for (room of data.gameRooms) {
    let newRoom = document.createElement("div");

    let roomName = document.createElement("div");
    roomName.innerHTML = room.roomName;
    newRoom.classList.add("room-item-level");
    newRoom.appendChild(roomName);

    let Title = document.createElement("div");
    let tmpTitle =
      room.users.length === 2
        ? room.users[0].userName + " : " + room.users[1].userName
        : room.users[0].userName;
    Title.innerHTML = tmpTitle;
    Title.classList.add("room-item-title");
    newRoom.appendChild(Title);

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
      socket.emit("IlI1IlllII1ll1l1llII1I1I1IIIlIlI", data);
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

    newRoom.classList.add("room-item");

    roomList.appendChild(newRoom);
  }
};
