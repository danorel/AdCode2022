const { streamTasks } = require("../common");

const [
  task1,
  task2
] = streamTasks(require("path").join(__dirname, "input"));

task1((reader) => {
  let count = 0;

  reader.on("line", function (line) {
    const [jobA, jobB] = line.split(",");
    const [fromA, toA] = jobA.split("-").map(Number);
    const [fromB, toB] = jobB.split("-").map(Number);
    if ((toA >= toB && fromA <= toA) || (toB >= toA && fromB <= fromA)) {
      count++;
    }
  })

  reader.on("close", function () {
    console.log("Count", count);
  });
});

task2((reader) => {
  let count = 0;

  reader.on("line", function (line) {
    const [jobA, jobB] = line.split(",");
    const [fromA, toA] = jobA.split("-").map(Number);
    const [fromB, toB] = jobB.split("-").map(Number);
    const sizeA = toA - fromA;
    const sizeB = toB - fromB;
    const elemsA = [...Array(sizeA + 1)].map((_, i) => i + fromA);
    const elemsB = [...Array(sizeB + 1)].map((_, i) => i + fromB);
    if (elemsA.some((elemA) => elemsB.includes(elemA))) {
      count++;
    }
  });

  reader.on("close", function () {
    console.log("Count", count);
  });
});