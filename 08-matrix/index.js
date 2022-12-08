const { streamTasks } = require("../common");

const [task1, task2] = streamTasks(require("path").join(__dirname, "input"));

const isVisible = ([treeR, treeC], forest) => {
  const visibility = [];
  // From north
  for (let r = 0; r < treeR; ++r) {
    if (forest[r][treeC] >= forest[treeR][treeC]) {
      visibility.push(false);
      break;
    }
  }
  // From south
  for (let r = treeR + 1; r < forest.length; ++r) {
    if (forest[r][treeC] >= forest[treeR][treeC]) {
      visibility.push(false);
      break;
    }
  }
  // From east
  for (let c = 0; c < treeC; ++c) {
    if (forest[treeR][c] >= forest[treeR][treeC]) {
      visibility.push(false);
      break;
    }
  }
  // From west
  for (let c = treeC + 1; c < forest[0].length; ++c) {
    if (forest[treeR][c] >= forest[treeR][treeC]) {
      visibility.push(false);
      break;
    }
  }
  return visibility.length !== 4;
};

const getScenicScore = ([treeR, treeC], forest) => {
  let score = 1;
  let foundNorth = false;
  // From north
  for (let r = treeR - 1; r >= 0; --r) {
    if (forest[treeR][treeC] <= forest[r][treeC]) {
      score *= treeR - r;
      foundNorth = true;
      break;
    }
  }
  if (!foundNorth) {
    score *= treeR;
  }
  // From south
  let foundSouth = false;
  for (let r = treeR + 1; r < forest.length; ++r) {
    if (forest[treeR][treeC] <= forest[r][treeC]) {
      score *= r - treeR;
      foundSouth = true;
      break;
    }
  }
  if (!foundSouth) {
    score *= forest.length - 1 - treeR;
  }
  // From west
  let foundWest = false;
  for (let c = treeC - 1; c >= 0; --c) {
    if (forest[treeR][treeC] <= forest[treeR][c]) {
      score *= treeC - c;
      foundWest = true;
      break;
    }
  }
  if (!foundWest) {
    score *= treeC;
  }
  // From east
  let foundEast = false;
  for (let c = treeC + 1; c < forest[0].length; ++c) {
    if (forest[treeR][treeC] <= forest[treeR][c]) {
      score *= c - treeC;
      foundEast = true;
      break;
    }
  }
  if (!foundEast) {
    score *= forest[0].length - 1 - treeC;
  }
  return score;
};

task1((reader) => {
  const forest = [];

  let countVisible = 0;

  reader.on("line", function (line) {
    forest.push(line.split("").map(Number));
  });

  reader.on("close", function () {
    // Interior
    for (let r = 1; r < forest.length - 1; ++r) {
      for (let c = 1; c < forest[r].length - 1; ++c) {
        if (isVisible([r, c], forest)) {
          ++countVisible;
        }
      }
    }
    // Edge
    countVisible += (forest.length - 1) * 2 + (forest[0].length - 1) * 2;
    // Total
    console.log("countVisible", countVisible);
  });
});

task2((reader) => {
  const forest = [];

  reader.on("line", function (line) {
    forest.push(line.split("").map(Number));
  });

  reader.on("close", function () {
    let maxScenicScore = -Infinity;
    for (let r = 1; r < forest.length - 1; ++r) {
      for (let c = 1; c < forest[r].length - 1; ++c) {
        const scenicScore = getScenicScore([r, c], forest);
        if (maxScenicScore < scenicScore) {
          maxScenicScore = scenicScore;
        }
      }
    }
    console.log("maxScenicScore", maxScenicScore);
  });
});
