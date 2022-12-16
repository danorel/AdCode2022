const { streamTasks } = require("../common");

const [task1, task2] = streamTasks(require("path").join(__dirname, "input"));

const template = new RegExp(
  "Sensor at x=(.+), y=(.+): closest beacon is at x=(.+), y=(.+)"
);

const parseFile = () => {
  const sensors = [];
  const beacons = [];

  const findClosestBeacon = {};

  const fromObjectToCoordinates = (object) => {
    return `${object[0]}x${object[1]}`;
  };

  const fromCoordinatesToObject = (coordinates) => {
    return coordinates.split("x").map(Number);
  };

  const parseLine = (line) => {
    const match = line.match(template);
    const [sensorX, sensorY, beaconX, beaconY] = match.slice(1, 5).map(Number);

    const sensor = [sensorX, sensorY];
    const beacon = [beaconX, beaconY];

    sensors.push(sensor);
    beacons.push(beacon);

    findClosestBeacon[fromObjectToCoordinates(sensor)] = beacon;
  };

  const findMapConstraint = (aggregation, i) => {
    return aggregation(
      ...sensors.map((sensor) => sensor[i]),
      ...beacons.map((beacon) => beacon[i])
    );
  };

  const findMapConstraints = () => {
    const minC = findMapConstraint(Math.min, 0);
    const maxC = findMapConstraint(Math.max, 0);
    return { minC, maxC };
  };

  const manhattanDistance = (sensor, beacon) => {
    return Math.abs(sensor[0] - beacon[0]) + Math.abs(sensor[1] - beacon[1]);
  };

  const canBeaconBeDeployed = (possibleBeacon) => {
    for (const sensor of sensors) {
      const closestBeacon = findClosestBeacon[fromObjectToCoordinates(sensor)];

      if (
        closestBeacon[0] === possibleBeacon[0] &&
        closestBeacon[1] === possibleBeacon[1]
      ) {
        return true;
      }

      const closestDistance = manhattanDistance(sensor, closestBeacon);
      const possibleDistance = manhattanDistance(sensor, possibleBeacon);

      if (possibleDistance <= closestDistance) {
        return false;
      }
    }

    return true;
  };

  return {
    parseLine,
    findMapConstraints,
    canBeaconBeDeployed,
  };
};

task1((reader) => {
  const { parseLine, findMapConstraints, canBeaconBeDeployed } = parseFile();

  reader.on("line", function (line) {
    parseLine(line);
  });

  reader.on("close", function () {
    let length = 0;
    const N = 10;
    const { minC, maxC } = findMapConstraints();
    for (let c = minC; c <= maxC; ++c) {
      const possibleBeacon = [c, N];
      if (!canBeaconBeDeployed(possibleBeacon)) {
        ++length;
      }
    }
    console.log("Length", length);
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
