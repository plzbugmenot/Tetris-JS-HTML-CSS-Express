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
