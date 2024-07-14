socket.on("connect", () => {
  console.log("connected with server.");
});

socket.on("sendBlockEvent", (data) => {
  users = data.users;
  for (item of users) init(item);
});

socket.on("11llII1ll11l1l11l1l1lllIlIllI1l", () => {
  GAME_STATE = READY;
});

socket.on("1l1l1l1llll1lIlIlI1lI1lI1", (data) => {
  users = data.users;
  sendStateBlocks = data.sendStateBlocks;

  GAME_STATE = data.gameState;
  if (GAME_STATE === GAME) setStateBoardText(0);
  convertSendStateBlocks(sendStateBlocks);

  for (item of users) init(item);

  updatePreBlock(preBody);
  updatePreBlock(preBody2);

  drawDataFromServer();
  drawStateDataFromServer();
});

socket.on("llIl1I111lII1l1Il1l1l1l1IlIllI", (data) => {
  initData(data.newUser, data.userHash);
  setStateBoardText(data.size);
});
