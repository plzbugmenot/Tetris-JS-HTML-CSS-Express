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
    drawGroundBlock2(gameBoard2, GroundBlock2);
    drawBlock(preBoard2, preBody2, preType2);
  }
  sendBlockBoard.innerHTML = "";
  drawBlock(sendBlockBoard, sendStateBlocks, 6);
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

const drawGroundBlock2 = (drawBoard, drawGroundBlock) => {
  for (segment of drawGroundBlock) {
    const dominoElement = document.createElement("div");
    dominoElement.style.gridRowStart = segment.y;
    dominoElement.style.gridColumnStart = segment.x;
    dominoElement.classList.add("init-block-2");
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
};
