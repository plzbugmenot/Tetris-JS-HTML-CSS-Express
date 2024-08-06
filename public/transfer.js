socket.on("connect", () => {
  console.log("connected with server.");
});

socket.on("I1lIl1I1Il1Il111llI11I11l11l11Il", (response) => {
  if (response.socketID === socket.id) alert(response.msg);
});

socket.on("l1I1I11Il111ll11lII11Il1ll1I11lI", (data) => {
  users = data.users;
  for (item of users) lI111I1II1III11111I1ll1l111I1IIl(item);
});

socket.on("1I1lIlllI1llI1l11lll11l1IlIII1Il", () => {
  GAME_STATE = READY;
});

socket.on("I11l1l1lllllII1IlII11llI11IIlII1", (data) => {
  IllI1II1l1lIlll11lI1I111l1II111l(data);
});

socket.on("IlII1I1llI11ll1Illll1IIIllIIIIlI", (data) => {
  for (room of data.gameRooms)
    if (room.roomID === localStorage.getItem("roomID")) {
      roomName = room.roomName;
      users = room.users;
      sendStateBlocks = room.sendStateBlocks;
      GAME_STATE = room.state;

      if (GAME_STATE === GAME) IIIlII1lIlll111llI11lIl1l1lII1l1(0);
      lIlIIIlIIIl1I1II1I1Il1llll11l11l(sendStateBlocks);

      for (item of users) lI111I1II1III11111I1ll1l111I1IIl(item);

      llII1IllI11IIlIl1I1l1l1111lllIl1(preBody);
      llII1IllI11IIlIl1I1l1l1111lllIl1(preBody2);

      if (GAME_STATE === GAME) l1IIIl1I1II1IllIll1ll1IIll11111ll();
      l1llll1I11Il1lII1I11III1lI1IIlII1();
    }
});

socket.on("IIl1lIIlIIlI1lIIIlI11llIIIII11ll", (data) => {
  if (data.socketID === socket.id) {
    localStorage.setItem("roomID", data.roomID);
    roombody.classList.remove("show-body");
    roombody.classList.add("hide-body");
    gamebody.classList.remove("hide-body");
    gamebody.classList.add("show-body");
  }
});

socket.on("Il1llI11I1l1I1llII1lll1II111IlI1", (data) => {
  if (data.socketID === socket.id) {
    localStorage.setItem("roomID", data.roomID);
    roombody.classList.remove("show-body");
    roombody.classList.add("hide-body");
    gamebody.classList.remove("hide-body");
    gamebody.classList.add("show-body");
  }
});
