let cha = ["I", "1", "l"];
let LENGTH = 32;
let SIZE = 50;

for (let i = 0; i < SIZE; i++) {
  let tmp = "";
  for (let j = 0; j < LENGTH; j++) {
    tmp += cha[Math.floor(Date.now() * Math.random()) % 3];
  }
  console.log(tmp);
}
