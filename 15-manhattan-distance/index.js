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

  const manhattanDistance = (sensor, beacon) => {
    return Math.abs(sensor[0] - beacon[0]) + Math.abs(sensor[1] - beacon[1]);
  };

  const findSensorProjection = (sensor, N) => {
    const closestBeacon = findClosestBeacon[fromObjectToCoordinates(sensor)];
    const closestDistance = manhattanDistance(sensor, closestBeacon);
    const distanceFromN = Math.abs(N - sensor[1]);
    const distanceRange = closestDistance - distanceFromN;
    if (distanceRange <= 0) {
      return undefined;
    }
    return [sensor[0] - distanceRange, sensor[0] + distanceRange];
  };

  const findProjectionsLength = (N) => {
    let sensorProjections = [];
    for (const sensor of sensors) {
      const sensorProjection = findSensorProjection(sensor, N);
      sensorProjections.push(sensorProjection);
    }
    sensorProjections = sensorProjections.filter(
      (projection) => projection !== undefined
    );
    sensorProjections.sort(
      (projectionA, projectionB) => projectionA[0] - projectionB[0]
    );
    let i = 0;
    while (i < sensorProjections.length - 1) {
      if (sensorProjections[i][1] >= sensorProjections[i + 1][0]) {
        const sensorA = sensorProjections[i];
        const sensorB = sensorProjections[i + 1];
        sensorProjections.splice(i, 2);
        const min = Math.min(sensorA[0], sensorB[0]);
        const max = Math.max(sensorA[1], sensorB[1]);
        sensorProjections.splice(i, 0, [min, max]);
      } else {
        ++i;
      }
    }
    return sensorProjections;
  };

  const findObjectsLengthOnN = (N) => {
    const objectsOnN = [...beacons, ...sensors].filter(
      (object) => object[1] === N
    );
    const coordinatesOnN = [
      ...new Set(
        objectsOnN.map((beaconOnN) => fromObjectToCoordinates(beaconOnN))
      ),
    ];
    const objectsOnNUnique = coordinatesOnN.map((coordinate) =>
      fromCoordinatesToObject(coordinate)
    );
    return objectsOnNUnique.length;
  };

  return {
    parseLine,
    findProjectionsLength,
    findObjectsLengthOnN,
  };
};

task1((reader) => {
  const { parseLine, findProjectionsLength, findObjectsLengthOnN } =
    parseFile();

  reader.on("line", function (line) {
    parseLine(line);
  });

  reader.on("close", function () {
    const N = 2000000;
    const projections = findProjectionsLength(N);
    const prejectionsLength = projections.reduce(
      (count, projection) =>
        count + (Math.abs(projection[1] - projection[0]) + 1),
      0
    );
    const objectsLength = findObjectsLengthOnN(N);
    console.log("Length", prejectionsLength - objectsLength);
  });
});

task2((reader) => {
  const { parseLine, findProjectionsLength } =
    parseFile();

  reader.on("line", function (line) {
    parseLine(line);
  });

  reader.on("close", function () {
    let x = null;
    for (let N = 0; N <= 4000000; ++N) {
      const projections = findProjectionsLength(N);
      for (let i = 0; i < projections.length - 1; ++i) {
        if (projections[i + 1][0] - projections[i][1] === 2) {
          x = projections[i + 1][0] - 1;
          y = N;
        }
      }
    }
    console.log("Distress", x * 4000000 + y);
  });
});
