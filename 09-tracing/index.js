const { streamTasks } = require("../common");

const [task1, task2] = streamTasks(require("path").join(__dirname, "input"));

const createRope = (size) =>
  Array(size)
    .fill(0)
    .map((_) => Array(2).fill(0));

const manhattanDistance = ([sx, sy], [ex, ey]) => {
  return Math.abs(sx - ex) + Math.abs(sy - ey);
};

const isBehind = ([hx, hy], [tx, ty]) => {
  return Math.abs(hx - tx) <= 1 && Math.abs(hy - ty) <= 1;
};

const nextMove = (H, T) => {
  let D = [0, 0];
  if (isBehind(H, T)) {
    return D;
  } else {
    const [tx, ty] = T;
    let minDistance = +Infinity;
    for (let x = -1; x <= 1; ++x) {
      for (let y = -1; y <= 1; ++y) {
        const Td = [tx + x, ty + y];
        const curDistance = manhattanDistance(Td, H);
        if (minDistance > curDistance) {
          minDistance = curDistance;
          D = [x, y];
        }
      }
    }
    return D;
  }
};

const directionToVecMap = {
  R: [0, 1],
  U: [1, 0],
  L: [0, -1],
  D: [-1, 0],
};

const move = (H, T, direction, isHead, hasMoved) => {
  if (isHead) {
    const [dx, dy] = directionToVecMap[direction];
    H[0] += dx;
    H[1] += dy;
  }
  if (isHead || hasMoved) {
    const [dx, dy] = nextMove(H, T);
    T[0] += dx;
    T[1] += dy;
    return dx !== 0 || dy !== 0;
  }
  return false; // Tail not moved!
};

const moveN = (rope, direction, N, trace) => {
  let hasMoved = false,
    isHead = true;
  for (let i = 0; i < N; ++i) {
    for (let r = 1; r < rope.length; ++r) {
      const H = rope[r - 1];
      const T = rope[r];
      isHead = r === 1;
      hasMoved = move(H, T, direction, isHead, hasMoved);
      if (r === rope.length - 1) {
        trace.add(`${T[0]}x${T[1]}`);
      }
    }
  }
};

task1((reader) => {
  const trace = new Set();
  const rope = createRope(2);

  reader.on("line", function (line) {
    const [direction, N] = line.split(" ");
    moveN(rope, direction, Number(N), trace);
  });

  reader.on("close", function () {
    console.log("trace length", trace.size);
  });
});

task2((reader) => {
  const trace = new Set();
  const rope = createRope(10);

  reader.on("line", function (line) {
    const [direction, N] = line.split(" ");
    moveN(rope, direction, Number(N), trace);
  });

  reader.on("close", function () {
    console.log("trace length", trace.size);
  });
});
