const { streamTasks } = require("../common");

const [task1, task2] = streamTasks(require("path").join(__dirname, "input"));

const findPacketMarker = function (sequence, size) {
  let position = 0;
  let left = 0,
    right = 0,
    isMarkerAppeared = false;
  const packetFreqs = new Map();
  while (!isMarkerAppeared && left <= right) {
    const packetToAdd = sequence.charAt(right);
    if (packetFreqs.size === size) {
      const isAllFreqsOnes = [...packetFreqs.values()].every(
        (freq) => freq === 1
      );
      if (isAllFreqsOnes) {
        isMarkerAppeared = true;
        position = right;
      } else {
        const packetToRemove = sequence.charAt(left);
        const packetFreq = packetFreqs.get(packetToRemove);
        if (packetFreq === 1) {
          packetFreqs.delete(packetToRemove);
        } else {
          packetFreqs.set(packetToRemove, packetFreq - 1);
        }
        left++;
      }
    } else {
      const packetFreq = packetFreqs.get(packetToAdd);
      if (packetFreq) {
        packetFreqs.set(packetToAdd, packetFreq + 1);
      } else {
        packetFreqs.set(packetToAdd, 1);
      }
      ++right;
    }
  }
  return position;
};

task1((reader) => {
  let position = 0;

  reader.on("line", function (line) {
    position = findPacketMarker(line, 4);
  });

  reader.on("close", function () {
    console.log("Position", position);
  });
});

task2((reader) => {
  let position = 0;

  reader.on("line", function (line) {
    position = findPacketMarker(line, 14);
  });

  reader.on("close", function () {
    console.log("Position", position);
  });
});
