const PriorityQueue = require("js-priority-queue");

const { streamTasks } = require("../common");

const [task1, task2] = streamTasks(require("path").join(__dirname, "input"));

const HEIGHTS = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

const NUMERIC_HEIGHTS = HEIGHTS.reduce(
  (heights, height, i) => ({
    ...heights,
    [height]: i,
  }),
  {}
);

const euclidianDistance = ([sx, sy], [ex, ey]) => {
  return Math.pow(ex - sx, 2) + Math.pow(ey - sy, 2);
};

const evaluateDistance = (
  possibleState,
  finalState,
  applyHeuristic = false
) => {
  const cf = possibleState.cost;
  if (applyHeuristic) {
    // TODO: Why A* algorithm performs worse than uninformed search?
    const h = euclidianDistance(
      possibleState.coordinate,
      finalState.coordinate
    );
    return cf + h;
  }
  return cf;
};

const canMove = (grid, [cx, cy], [nx, ny]) => {
  const isInGrid =
    nx >= 0 && nx < grid.length && ny >= 0 && ny < grid[0].length;
  if (!isInGrid) {
    return false;
  }
  if (grid[nx][ny] >= grid[cx][cy]) {
    const elevation = grid[nx][ny] - grid[cx][cy];
    return elevation >= 0 && elevation <= 1;
  }
  return true;
};

const isNarrow = (grid, [cx, cy], [nx, ny]) => {
  const isInGrid =
    nx >= 0 && nx < grid.length && ny >= 0 && ny < grid[0].length;
  if (!isInGrid) {
    return false;
  }
  if (grid[nx][ny] === grid[cx][cy]) {
    return true;
  }
  return false;
};

const findPossibleStates = (grid, currState, term, initialCost = false) => {
  const possibleStates = [];
  const vectors = [
    [-1, 0],
    [0, -1],
    [0, 1],
    [1, 0],
  ];
  const currMove = currState.coordinate;
  for (const vector of vectors) {
    const possibleMove = [currMove[0] + vector[0], currMove[1] + vector[1]];
    if (term(grid, currMove, possibleMove)) {
      const possiblePath = [...currState.path, possibleMove];
      const possibleState = createState(
        possibleMove,
        possiblePath,
        initialCost ? 0 : currState.cost + 1
      );
      possibleStates.push(possibleState);
    }
  }
  return possibleStates;
};

const findClosestStates = (grid, initialState) => {
  const closestStates = [initialState];
  const queue = [initialState];
  const seenCoordinates = new Set();
  seenCoordinates.add(getCoordinateRepr(initialState));
  while (queue.length > 0) {
    const currState = queue.shift();
    const possibleStates = findPossibleStates(grid, currState, isNarrow, true);
    for (const possibleState of possibleStates) {
      const possibleCoordinateRepr = getCoordinateRepr(possibleState);
      if (!seenCoordinates.has(possibleCoordinateRepr)) {
        seenCoordinates.add(possibleCoordinateRepr);
        closestStates.push(possibleState);
        queue.push(possibleState);
      }
    }
  }
  return closestStates;
};

const createState = (coordinates, paths = [], cost = 0) => {
  const coordinate = [...coordinates];
  const path = [...paths];
  return {
    cost,
    coordinate,
    path,
  };
};

const getCoordinateRepr = (state) => {
  return `${state.coordinate[0]}x${state.coordinate[1]}`;
};

const findPathLength = (grid, initialState, finalState) => {
  let minPathLength = +Infinity;
  const bestMovesQueue = new PriorityQueue({
    comparator: function (a, b) {
      return evaluateDistance(a, finalState) - evaluateDistance(b, finalState);
    },
  });
  bestMovesQueue.queue(initialState);
  const seenCoordinates = new Set();
  seenCoordinates.add(getCoordinateRepr(initialState));
  do {
    const bestMove = bestMovesQueue.dequeue();
    if (
      bestMove.coordinate[0] === finalState.coordinate[0] &&
      bestMove.coordinate[1] === finalState.coordinate[1]
    ) {
      if (minPathLength > bestMove.cost) {
        minPathLength = bestMove.cost;
      }
      continue;
    }
    const possibleStates = findPossibleStates(grid, bestMove, canMove);
    for (const possibleState of possibleStates) {
      const possibleCoordinateRepr = getCoordinateRepr(possibleState);
      if (!seenCoordinates.has(possibleCoordinateRepr)) {
        seenCoordinates.add(possibleCoordinateRepr);
        bestMovesQueue.queue(possibleState);
      }
    }
  } while (bestMovesQueue.length > 0);
  return minPathLength;
};

task1((reader) => {
  const grid = [];
  let finalState = undefined;
  let initialState = undefined;

  reader.on("line", function (line) {
    const heights = line.split("").map((height, i) => {
      if (height === "S") {
        initialState = createState([grid.length, i], [[grid.length, i]], 0);
        return NUMERIC_HEIGHTS["a"];
      }
      if (height === "E") {
        finalState = createState([grid.length, i]);
        return NUMERIC_HEIGHTS["z"];
      }
      return NUMERIC_HEIGHTS[height];
    });
    grid.push(heights);
  });

  reader.on("close", function () {
    console.log(
      "min path length",
      findPathLength(grid, initialState, finalState)
    );
  });
});

task2((reader) => {
  const grid = [];
  let finalState = undefined;
  let initialState = undefined;

  reader.on("line", function (line) {
    const heights = line.split("").map((height, i) => {
      if (height === "S") {
        initialState = createState([grid.length, i], [[grid.length, i]], 0);
        return NUMERIC_HEIGHTS["a"];
      }
      if (height === "E") {
        finalState = createState([grid.length, i]);
        return NUMERIC_HEIGHTS["z"];
      }
      return NUMERIC_HEIGHTS[height];
    });
    grid.push(heights);
  });

  reader.on("close", function () {
    let minPathLength = +Infinity;
    const initialStates = findClosestStates(grid, initialState);
    for (const initialState of initialStates) {
      const pathLength = findPathLength(grid, initialState, finalState);
      if (minPathLength > pathLength) {
        minPathLength = pathLength;
      }
    }
    console.log("min path length", minPathLength);
  });
});
