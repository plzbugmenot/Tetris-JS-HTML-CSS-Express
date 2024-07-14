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
    if (GAME_STATE === GAME) return;
    socket.emit(
      "11llII1ll11l1l11l1l1lllIlIlll11",
      localStorage.getItem("UserHash")
    );
    setStateBoardText(0);
  }
};

const setEventByInputKey = (direction) => {
  const data = {
    socketID: socket.id,
    direction: direction,
    hash: localStorage.getItem("UserHash"),
  };
  if (direction === DOWN) socket.emit("llIl1I111l11111Il1l1l1l1IlIllI", data);
  else if (direction === RIGHT || direction === LEFT)
    socket.emit("llIl1I111l11111Il1l1l11l1l1l1lll", data);
  else if (direction === DROP)
    socket.emit("IIII111I111l11111Il1l1l11l1l1l1lll", data);
};
