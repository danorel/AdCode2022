const { streamTasks } = require("../common");

const [task1, task2] = streamTasks(require("path").join(__dirname, "input"));

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const parseMap = () => {
  let unitOfPouring = [500, 0];
  const rocks = [];

  const parseRock = (line) => {
    const rawRocks = line.split(" -> ");
    const parsedRocks = rawRocks.map((rockStructure) =>
      rockStructure.split(",").map(Number)
    );
    rocks.push(parsedRocks);
  };

  const shapeRock = (aggregation, coordinate) => {
    return aggregation(
      ...rocks.map((rock) =>
        aggregation(...rock.map((rockEdge) => rockEdge[coordinate]))
      )
    );
  };

  const buildMap = (needFloor = false) => {
    // Gather info about map
    const [minC, maxC] = [shapeRock(Math.min, 0), shapeRock(Math.max, 0)];
    const [minR, maxR] = [shapeRock(Math.min, 1), shapeRock(Math.max, 1)];

    const height = maxR - minR;
    const width = maxC - minC;

    // Normalisation of coordinates
    const normalisedRocks = rocks.map((rock) =>
      rock.map((rockEdge) => [rockEdge[0] - minC, rockEdge[1] - minR])
    );

    // Build map
    // Normalise puring index
    const pouringC = Math.abs(unitOfPouring[0] - minC);
    const pouringR = Math.abs(unitOfPouring[1] - minR);

    const shiftC = needFloor ? 100000 : 2;
    const shiftR = pouringR + 1;

    const paddingC = Math.floor(shiftC / 2);
    const paddingR = shiftR;

    unitOfPouring[0] = 0;
    unitOfPouring[1] = pouringC + paddingC;

    const map = [...Array(height + shiftR + 1 + (needFloor ? 2 : 0))].map((_) =>
      [...Array(width + shiftC + 1)].fill(".")
    );

    for (const normalisedRock of normalisedRocks) {
      for (let edge = 0; edge < normalisedRock.length - 1; ++edge) {
        const fEdge = normalisedRock[edge];
        const sEdge = normalisedRock[edge + 1];
        const isUsingY = fEdge[0] - sEdge[0] !== 0;
        if (isUsingY) {
          const minC = Math.min(fEdge[0], sEdge[0]);
          const maxC = Math.max(fEdge[0], sEdge[0]);
          for (let c = minC; c <= maxC; ++c) {
            map[fEdge[1] + paddingR][c + paddingC] = "#";
          }
        } else {
          const minR = Math.min(fEdge[1], sEdge[1]);
          const maxR = Math.max(fEdge[1], sEdge[1]);
          for (let r = minR; r <= maxR; ++r) {
            map[r + paddingR][fEdge[0] + paddingC] = "#";
          }
        }
      }
    }

    // Build floor if needed
    if (needFloor) {
      const floorR = height + shiftR + 2;
      for (let c = 0; c < map[0].length; ++c) {
        map[floorR][c] = "#";
      }
    }

    return map;
  };

  const simulateSandOnMap = async (
    map,
    horizontalBoundaries = true,
    verbose = false
  ) => {
    let count = 0;
    let reachedEternity = false;
    map[unitOfPouring[0]][unitOfPouring[1]] = "+";
    while (!reachedEternity) {
      let unitOfSand = [1, unitOfPouring[1]];
      map[unitOfSand[0]][unitOfSand[1]] = "o";
      while (true) {
        if (horizontalBoundaries) {
          if (
            unitOfSand[0] <= 0 ||
            unitOfSand[0] >= map.length - 1 ||
            unitOfSand[1] >= map[0].length - 1 ||
            unitOfSand[1] <= 0
          ) {
            reachedEternity = true;
            break;
          }
        }
        if (verbose) {
          await delay(100);
          console.log("-----------------");
          console.log("unitOfSand", unitOfSand);
          console.log(map.map((line) => line.join("")).join("\n"));
        }
        if (
          map[unitOfSand[0] + 1][unitOfSand[1]] === "#" ||
          map[unitOfSand[0] + 1][unitOfSand[1]] === "o"
        ) {
          if (map[unitOfSand[0] + 1][unitOfSand[1] - 1] === ".") {
            // Falling left and down
            map[unitOfSand[0]][unitOfSand[1]] = ".";
            unitOfSand[0] = unitOfSand[0] + 1;
            unitOfSand[1] = unitOfSand[1] - 1;
            map[unitOfSand[0]][unitOfSand[1]] = "o";
          } else if (map[unitOfSand[0] + 1][unitOfSand[1] + 1] === ".") {
            // Falling right and down
            map[unitOfSand[0]][unitOfSand[1]] = ".";
            unitOfSand[0] = unitOfSand[0] + 1;
            unitOfSand[1] = unitOfSand[1] + 1;
            map[unitOfSand[0]][unitOfSand[1]] = "o";
          } else {
            // Blocked
            ++count;
            if (
              unitOfSand[0] - 1 === unitOfPouring[0] &&
              unitOfSand[1] === unitOfPouring[1]
            ) {
              reachedEternity = true;
              break;
            }
            break;
          }
        } else {
          // Falling down
          map[unitOfSand[0]][unitOfSand[1]] = ".";
          unitOfSand[0] = unitOfSand[0] + 1;
          map[unitOfSand[0]][unitOfSand[1]] = "o";
        }
      }
      if (reachedEternity) {
        return { map, count };
      }
    }
  };

  return { parseRock, buildMap, simulateSandOnMap };
};

task1((reader) => {
  const { parseRock, buildMap, simulateSandOnMap } = parseMap();

  reader.on("line", function (line) {
    parseRock(line);
  });

  reader.on("close", async function () {
    const mapNoSand = buildMap();
    const { map, count } = await simulateSandOnMap(mapNoSand, true, false);
    console.log(map.map((line) => line.join("")).join("\n"));
    console.log("count", count);
  });
});

task2((reader) => {
  const { parseRock, buildMap, simulateSandOnMap } = parseMap();

  reader.on("line", function (line) {
    parseRock(line);
  });

  reader.on("close", async function () {
    const mapNoSand = buildMap(true);
    const { map, count } = await simulateSandOnMap(mapNoSand, false, false);
    console.log(map.map((line) => line.join("")).join("\n"));
    console.log("count", count);
  });
});
