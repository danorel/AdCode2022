const { streamTasks } = require("../common");

const [task1, task2] = streamTasks(require("path").join(__dirname, "test"));

const ROCKS = [
  "####",
  ".#.\n###\n.#.",
  "..#\n..#\n###",
  "#\n#\n#\n#",
  "##\n##",
];

function indexesOf(string, regex) {
  var match,
    indexes = {};

  regex = new RegExp(regex);

  while ((match = regex.exec(string))) {
    if (!indexes[match[0]]) indexes[match[0]] = [];
    indexes[match[0]].push(match.index);
  }

  return indexes;
}

const parseFile = (size, factor) => {
  let jetVectors = [],
    ji = 0;

  const map = [...Array(factor * size + 1)].map((_) => [...Array(9)].fill("."));
  const bottom = factor * size;

  const parseLine = (line) => {
    jetVectors = line
      .split("")
      .map((jetDirection) => (jetDirection === ">" ? 1 : -1));
  };

  const findHeight = (rock) => {
    const [_, [row]] = rock;
    for (let r = row; r >= 0; --r) {
      const anyRockIndex = map[r].findIndex((object) => object === "#");
      if (anyRockIndex === -1) {
        return r + 1;
      }
    }
    return 0;
  };

  const isFalling = (rock) => {
    const [shape, [row, col]] = rock;
    const parts = shape.split("\n");
    const { "#": bottomCols } = indexesOf(parts.at(-1), /#/g);
    const nextRow = row + 1;
    const bottomFalling = bottomCols.every(
      (bottom) => map[nextRow][col + bottom] === "."
    );
    if (shape === ".#.\n###\n.#.") {
      const { "#": middleCols } = indexesOf(parts.at(1), /#/g);
      const [left, _, right] = middleCols;
      const sidesFalling =
        map[row][col + left] === "." && map[row][col + right] === ".";
      return bottomFalling && sidesFalling;
    }
    return bottomFalling;
  };

  const blow = (rock) => {
    let [shape, [row, col]] = rock;
    if (ji === jetVectors.length) {
      ji = 0;
    }
    const cols = [];
    const parts = shape.split("\n");
    for (const part of parts) {
      const { "#": partCols } = indexesOf(part, /#/g);
      const minCol = partCols.at(0);
      const maxCol = partCols.at(-1);
      cols.push([minCol, maxCol]);
    }
    const jet = jetVectors[ji];
    let currRow = row - (parts.length - 1);
    for (const [minCol, maxCol] of cols) {
      if (map[currRow][col + (jet > 0 ? maxCol : minCol) + jet] !== ".") {
        ++ji;
        return;
      }
      ++currRow;
    }
    rock[1][1] = col + jet;
    ++ji;
  };

  const move = (rock) => {
    rock[1][0] += 1;
  };

  const fix = (rock) => {
    const [shape, [row, col]] = rock;
    const parts = shape.split("\n");
    const height = parts.length - 1;
    for (let r = 0; r < parts.length; ++r) {
      for (let c = 0; c < parts[r].length; ++c) {
        if (parts[r][c] === "#") {
          map[row + r - height][col + c] = "#";
        }
      }
    }
  };

  const buildMap = () => {
    // Building map contour and shape
    map[bottom][0] = "+";
    map[bottom][8] = "+";
    for (c = 1; c <= 7; ++c) {
      map[bottom][c] = "-";
    }
    for (r = 0; r < bottom; ++r) {
      map[r][0] = "|";
      map[r][8] = "|";
    }
    // Modelling rock falling down
    let ri = 0,
      lastHeight = bottom;
    while (ri < size) {
      const rockShape = ROCKS[ri % 5];
      const rockRow = lastHeight - 4;
      const rockCol = 3;
      const rock = [rockShape, [rockRow, rockCol]];
      while (true) {
        blow(rock);
        if (!isFalling(rock)) {
          break;
        }
        move(rock);
      }
      fix(rock);
      lastHeight = findHeight(rock);
      ++ri;
    }
    return [map, lastHeight];
  };

  const findSimilarity = (map, targetDefinition, count = 7) => {
    const rows = [];
    for (let r = bottom - 1; r >= count; --r) {
      const rowDefinitions = [];
      for (let i = count - 1; i >= 0; --i) {
        rowDefinitions.push(map[r - i].join(""));
      }
      const rowDefinition = rowDefinitions.join("\n");
      if (rowDefinition === targetDefinition) {
        rows.push(r);
      }
    }
    return rows;
  };

  return { parseLine, buildMap, findSimilarity };
};

task1((reader) => {
  const { parseLine, buildMap } = parseFile(2022, 3);

  reader.on("line", function (line) {
    parseLine(line);
  });

  reader.on("close", function () {
    const [map, lastHeight] = buildMap();
    console.log("size", map.length - lastHeight - 1);
  });
});

task2((reader) => {
  const { parseLine, buildMap, findSimilarity } = parseFile(2022, 2);

  reader.on("line", function (line) {
    parseLine(line);
  });

  reader.on("close", function () {
    const [map, lastHeight] = buildMap();
    console.log(
      "findSimilarity",
      findSimilarity(
        map,
        "|....#..|\n|..#.#..|\n|..#.#..|\n|#####..|\n|..###..|\n|...#...|\n|..####.|",
        7
      )
    );
    console.log("size", map.length - lastHeight - 1);
  });
});
