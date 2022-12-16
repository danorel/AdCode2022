const { streamTasks } = require("../common");

const [task1, task2] = streamTasks(require("path").join(__dirname, "input"));

const VALVE_TEMPLATES = [
  new RegExp("Valve (.+) has flow rate=(.+); tunnels lead to valves (.+)"),
  new RegExp("Valve (.+) has flow rate=(.+); tunnel leads to valve (.+)"),
];

function ValveMap(index, mapping) {
  this.index = index ? index : new Map();
  this.mapping = mapping ? mapping : new Map();
}

ValveMap.prototype.addValve = function (valve) {
  this.index.set(valve.name, valve);
  this.mapping.set(valve.name, valve.neighbours);
};

ValveMap.prototype.clone = function () {
  const indexCopy = new Map(JSON.parse(JSON.stringify(Array.from(this.index))));
  const mappingCopy = new Map(
    JSON.parse(JSON.stringify(Array.from(this.mapping)))
  );
  const clone = new ValveMap(indexCopy, mappingCopy);
  return clone;
};

function Valve(name, flowRate, neighbours) {
  this.name = name;
  this.flowRate = Number(flowRate);
  this.neighbours = neighbours.split(", ");
  this.open = false;
}

const parseFile = () => {
  const valves = new ValveMap();

  const parseLine = (line) => {
    for (const template of VALVE_TEMPLATES) {
      const args = line.match(template);
      if (args) {
        const params = args.slice(1, 4);
        valves.addValve(new Valve(...params));
      }
    }
  };

  const search = (
    timeLeft,
    valves,
    prevValve,
    currValve,
    accFlowRate,
    timeFlowRate,
    path
  ) => {
    if (timeLeft === 0) {
      return [path, timeFlowRate, accFlowRate, valves];
    }
    let currPath = null;
    let currTimeRate = -Infinity;
    let currAccFlowRate = -Infinity;
    let currValves = null;
    if (!currValve.open) {
      const nextValves = valves.clone();
      const nextValve = nextValves.index.get(currValve.name);
      nextValve.open = true;
      [currPath, currTimeRate, currAccFlowRate, currValves] = search(
        timeLeft - 1,
        nextValves,
        currValve,
        nextValve,
        accFlowRate + currValve.flowRate,
        timeFlowRate + accFlowRate,
        path?.concat([nextValve.name])
      );
    }
    let maxNeighbourPath = null;
    let maxNeighbourTimeRate = -Infinity;
    let maxNeighbourAccFlowRate = -Infinity;
    let maxNeighbourValves = null;
    for (const currValveNeighbour of currValve.neighbours) {
      const neighbourValve = valves.index.get(currValveNeighbour);
      if (prevValve?.name == neighbourValve?.name) {
        continue;
      }
      const [
        neighbourPath,
        neighbourTimeRate,
        neighbourAccFlowRate,
        neighbourValves,
      ] = search(
        timeLeft - 1,
        valves,
        currValve,
        neighbourValve,
        accFlowRate,
        timeFlowRate + accFlowRate,
        path?.concat([neighbourValve.name])
      );
      if (maxNeighbourTimeRate < neighbourTimeRate) {
        maxNeighbourPath = neighbourPath;
        maxNeighbourTimeRate = neighbourTimeRate;
        maxNeighbourAccFlowRate = neighbourAccFlowRate;
        maxNeighbourValves = neighbourValves;
      }
    }
    if (maxNeighbourTimeRate > currTimeRate) {
      return [
        maxNeighbourPath,
        maxNeighbourTimeRate,
        maxNeighbourAccFlowRate,
        maxNeighbourValves,
      ];
    }
    return [currPath, currTimeRate, currAccFlowRate, currValves];
  };

  const greedySearch = (
    timeLeft,
    currValves,
    currValve,
    accFlowRate,
    timeFlowRate
  ) => {
    if (timeLeft <= 0) {
      return timeFlowRate;
    }
    let maxNeighboursFlowRate = -Infinity;
    let maxNeighbourValve = null;
    for (const currValveNeighbour of currValve.neighbours) {
      const neighbourValve = currValves.index.get(currValveNeighbour);
      if (!neighbourValve.open) {
        if (maxNeighboursFlowRate < neighbourValve.flowRate) {
          maxNeighboursFlowRate = neighbourValve.flowRate;
          maxNeighbourValve = neighbourValve;
        }
      }
    }
    if (!currValve.open) {
      if (maxNeighboursFlowRate < currValve.flowRate) {
        const nextValves = currValves.copy();
        const nextValve = nextValves.index.get(currValve.name);
        nextValve.open = true;
        return greedySearch(
          timeLeft - 1,
          nextValves,
          nextValve,
          accFlowRate + nextValve.flowRate,
          timeFlowRate + accFlowRate
        );
      }
    }
    return greedySearch(
      timeLeft - 1,
      currValves,
      maxNeighbourValve,
      accFlowRate,
      timeFlowRate + accFlowRate
    );
  };

  return { parseLine, search, valves };
};

task1((reader) => {
  const { parseLine, search, valves } = parseFile();

  reader.on("line", function (line) {
    parseLine(line);
  });

  reader.on("close", function () {
    let totalPreassure = 0;
    let totalPath = ["AA"];
    let path = [],
      lastValves = valves,
      accFlowRate = 0,
      timeFlowRate = 0;
    for (let i = 0; i < 3; ++i) {
      let prevValve = lastValves.index.get(totalPath[i * 10 - 1]);
      let currValve = lastValves.index.get(totalPath[i * 10]);
      [path, timeFlowRate, accFlowRate, lastValves] = search(
        10,
        lastValves,
        prevValve,
        currValve,
        accFlowRate,
        timeFlowRate,
        []
      );
      totalPreassure = timeFlowRate;
      totalPath = totalPath.concat(path);
    }
    totalPath.shift();
    console.log("Path", totalPath);
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
