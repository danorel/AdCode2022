const { streamTasks } = require("../common");

const [task1, task2] = streamTasks(require("path").join(__dirname, "input"));

const winMap = {
  A: "Y", // Rock loses Paper
  B: "Z", // Paper loses Scissors
  C: "X", // Scissors loses Rock
};

const losingMap = {
  A: "Z", // Rock beats Scissors
  B: "X", // Paper beats Rock
  C: "Y", // Scissors beats Paper
};

const drawMap = {
  A: "X", // Rock beats Rock
  B: "Y", // Paper beats Paper
  C: "Z", // Scissors beats Scissors
};

const tableMap = {
  Z: 3,
  Y: 2,
  X: 1,
};

task1((reader) => {
  let score = 0;

  reader.on("line", function (line) {
    const [enemy, me] = line.split(" ");
    const isLose = losingMap[enemy] === me;
    const isDraw = drawMap[enemy] === me;
    if (isLose) {
        // score += 0; <- Just omit this accumulation
    } else if (isDraw) {
        score += 3;
    } else {
        score += 6;
    }
    score += tableMap[me];
  });

  reader.on("close", function () {
    console.log('Score', score)
  });
});

task2((reader) => {
  let score = 0;

  reader.on("line", function (line) {
    let me = undefined;
    const [enemy, result] = line.split(" ");
    if (result === "X") {
      // score += 0; <- Just omit this accumulation
      me = losingMap[enemy];
    } else if (result === "Y") {
        score += 3;
        me = drawMap[enemy];
    } else {
        score += 6;
        me = winMap[enemy];
    }
    score += tableMap[me];
  });

  reader.on("close", function () {
    console.log('Score', score)
  });
});
