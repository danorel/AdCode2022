const { streamTasks } = require("../common");

const [task1, task2] = streamTasks(require("path").join(__dirname, "test"));

const template = new RegExp(
  "Sensor at x=(.+), y=(.+): closest beacon is at x=(.+), y=(.+)"
);

const parseFile = () => {
  const sensors = [];
  const beacons = [];

  const paddingC = 0;
  const paddingR = 0;

  const parseLine = (line) => {
    const match = line.match(template);
    const [sensorX, sensorY, beaconX, beaconY] = match.slice(1, 5).map(Number);
    beacons.push([beaconX, beaconY]);
    sensors.push([sensorX, sensorY]);
  };

  const findMapConstraint = (sensors, beacons, aggregation, i) => {
    return aggregation(
      ...sensors.map((sensor) => sensor[i]),
      ...beacons.map((beacon) => beacon[i])
    );
  };

  const findPoints = (sensor, radius, shiftC, shiftR) => {
    const points = [];

    for (
      let c = sensor[0] - radius + shiftC;
      c <= sensor[0] + radius + shiftC;
      ++c
    ) {
      for (
        let r = sensor[1] - radius + shiftR;
        r <= sensor[1] + radius + shiftR;
        ++r
      ) {
        const diffC = Math.abs(sensor[0] - c + shiftC);
        const diffR = Math.abs(sensor[1] - r + shiftR);
        if (diffC + diffR === radius) {
          points.push([r, c]);
        }
      }
    }

    return points;
  };

  /**
   * Node.js is out of memory with this approach.
   * Problem: big matrix
   * @returns map
   */
  const buildPartialMapForNRow = (N, period) => {
    const fromC = findMapConstraint(sensors, beacons, Math.min, 0);
    const toC = findMapConstraint(sensors, beacons, Math.max, 0);

    const closestSensors = [];
    for (let c = fromC; c <= toC; c += period) {
      let minSensor = null;
      let minDistance = +Infinity;
      for (const sensor of sensors) {
        const rDistance = Math.abs(sensor[1] - N);
        const cDistance = Math.abs(sensor[0] - c);
        const distance = rDistance + cDistance;
        if (!minDistance || minDistance > distance) {
          minDistance = distance;
          minSensor = sensor;
        }
      }
      if (
        !closestSensors.some(
          (sensor) => sensor[0] === minSensor[0] && sensor[1] === minSensor[1]
        )
      ) {
        closestSensors.push(minSensor);
      }
    }

    const closestBeacons = [];
    for (let c = fromC; c <= toC; c += period) {
      let minBeacon = null;
      let minDistance = +Infinity;
      for (const beacon of beacons) {
        const rDistance = Math.abs(beacon[1] - N);
        const cDistance = Math.abs(beacon[0] - c);
        const distance = rDistance + cDistance;
        if (!minDistance || minDistance > distance) {
          minDistance = distance;
          minBeacon = beacon;
        }
      }
      if (
        !closestBeacons.some(
          (beacon) => beacon[0] === minBeacon[0] && beacon[1] === minBeacon[1]
        )
      ) {
        closestBeacons.push(minBeacon);
      }
    }

    const minC = findMapConstraint(closestSensors, closestBeacons, Math.min, 0);
    const maxC = findMapConstraint(closestSensors, closestBeacons, Math.max, 0);

    const minR = findMapConstraint(closestSensors, closestBeacons, Math.min, 1);
    const maxR = findMapConstraint(closestSensors, closestBeacons, Math.max, 1);

    const shiftC = 0 - minC + paddingC / 2;
    const shiftR = 0 - minR + paddingR / 2;

    const width = maxC - minC + 1 + paddingC;
    const height = maxR - minR + 1 + paddingR;

    const map = [...Array(height)].map((_) => [...Array(width)].fill("."));

    for (const beacon of closestBeacons) {
      map[beacon[1] + shiftR][beacon[0] + shiftC] = "B";
    }

    for (const sensor of closestSensors) {
      map[sensor[1] + shiftR][sensor[0] + shiftC] = "S";
      let radius = 1;
      let found = false;
      while (true) {
        const points = findPoints(sensor, radius, shiftC, shiftR);
        for (const [r, c] of points) {
          if (c < 0 || r < 0 || c >= width || r >= height) {
            continue;
          }
          if (map[r][c] === "B") {
            found = true;
          } else {
            if (map[r][c] !== "S" && map[r][c] !== "B") {
              map[r][c] = "#";
            }
          }
        }
        if (found) {
          break;
        } else {
          ++radius;
        }
      }
    }

    return map;
  };

  /**
   * Node.js is out of memory with this approach.
   * Problem: big matrix
   * @returns map
   */
  const buildFullMap = () => {
    const minC = findMapConstraint(sensors, beacons, Math.min, 0);
    const maxC = findMapConstraint(sensors, beacons, Math.max, 0);

    const minR = findMapConstraint(sensors, beacons, Math.min, 1);
    const maxR = findMapConstraint(sensors, beacons, Math.max, 1);

    const shiftC = 0 - minC + paddingC / 2;
    const shiftR = 0 - minR + paddingR / 2;

    const width = maxC - minC + 1 + paddingC;
    const height = maxR - minR + 1 + paddingR;

    const map = [...Array(height)].map((_) => [...Array(width)].fill("."));

    for (const beacon of beacons) {
      map[beacon[1] + shiftR][beacon[0] + shiftC] = "B";
    }

    for (const sensor of sensors) {
      map[sensor[1] + shiftR][sensor[0] + shiftC] = "S";
      let radius = 1;
      let found = false;
      while (true) {
        const points = findPoints(sensor, radius, shiftC, shiftR);
        for (const [r, c] of points) {
          if (c < 0 || r < 0 || c >= width || r >= height) {
            continue;
          }
          if (map[r][c] === "B") {
            found = true;
          } else {
            if (map[r][c] !== "S") {
              map[r][c] = "#";
            }
          }
        }
        if (found) {
          break;
        } else {
          ++radius;
        }
      }
    }

    return map;
  };

  return {
    parseLine,
    buildFullMap,
    buildPartialMapForNRow,
    paddingC,
    paddingR,
  };
};

task1((reader) => {
  const {
    parseLine,
    buildFullMap,
    buildPartialMapForNRow,
    paddingC,
    paddingR,
  } = parseFile();

  reader.on("line", function (line) {
    parseLine(line);
  });

  reader.on("close", function () {
    const N = 10;
    const period = 1;
    const map = buildPartialMapForNRow(N, period);
    const length = map[N + paddingR / 2].filter(
      (element) => element === "#"
    ).length;
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
