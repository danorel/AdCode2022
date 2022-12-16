const { streamTasks } = require("../common");

const [task1, task2] = streamTasks(require("path").join(__dirname, "test"));

const VALVE_TEMPLATES = [
  new RegExp("Valve (.+) has flow rate=(.+); tunnels lead to valves (.+)"),
  new RegExp("Valve (.+) has flow rate=(.+); tunnel leads to valve (.+)"),
];

const createValve = (source, rate, destination) => {
  const isVisited = false;
  const destinations = destination.split(", ");
  return [source, Number(rate), destinations, isVisited];
};

const parseFile = () => {
  const valves = {};

  const parseLine = (line) => {
    for (const template of VALVE_TEMPLATES) {
      const args = line.match(template);
      if (args) {
        const valve = createValve(...args.slice(1, 4));
        valves[valve[0]] = valve;
      }
    }
  };

  const deepGreedySearch = (
    clock,
    currValves,
    currSource,
    currAccPreassure,
    currTotalPreassure,
    path
  ) => {
    if (clock === 30) {
      return [path, currTotalPreassure];
    }
    const currValve = currValves[currSource];
    const [_, currRate, destinations, isCurrOpened] = currValve;
    let currentMaxTotalPreassure = -Infinity;
    let currentMaxPath = null;
    for (const nextSource of destinations) {
      const [_a, nextRate, _b, isNextOpened] = currValves[nextSource];
      if (isNextOpened && isCurrOpened) {
        continue;
      }
      let isCurrOpening = false;
      if (isNextOpened) {
        isCurrOpening = !isCurrOpened;
      }
      if (currRate > nextRate) {
        isCurrOpening = !isCurrOpened;
      }
      let nextValves = currValves;
      if (isCurrOpening) {
        nextValves = JSON.parse(JSON.stringify(currValves));
        const nextValve = nextValves[currSource];
        nextValve[3] = true;
      }
      const [nextPath, nextMaxTotalPreassure] = deepGreedySearch(
        clock + 1,
        nextValves,
        isCurrOpening ? currSource : nextSource,
        isCurrOpening ? currAccPreassure + currRate : currAccPreassure,
        currTotalPreassure + currAccPreassure,
        isCurrOpening ? path.concat([currSource]) : path.concat([nextSource])
      );
      if (nextMaxTotalPreassure > currentMaxTotalPreassure) {
        currentMaxTotalPreassure = nextMaxTotalPreassure;
        currentMaxPath = nextPath;
      }
    }
    return [currentMaxPath, currentMaxTotalPreassure];
  };

  return { parseLine, deepGreedySearch, valves };
};

task1((reader) => {
  const { parseLine, deepGreedySearch, valves } = parseFile();

  reader.on("line", function (line) {
    parseLine(line);
  });

  reader.on("close", function () {
    const [path, totalPreassure] = deepGreedySearch(
      0,
      valves,
      "AA",
      0,
      0,
      []
    );
    console.log("Path", path);
    console.log("Preassure", totalPreassure);
  });
});

task2((reader) => {
  // Define variables here...

  reader.on("line", function (line) {
    // Preprocess input here...
  });

  reader.on("close", function () {
    // Print output here...
  });
});
