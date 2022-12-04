const { streamTasks } = require("../common");

const [
  task1,
  task2
] = streamTasks(require("path").join(__dirname, "input"));

task1((reader) => {
  let [acc, max] = [0, -Infinity];

  reader.on("line", function (line) {
    if (!line.length) {
      if (acc > max) {
        max = acc;
      }
      acc = 0;
    } else {
      acc += Number(line);
    }
  });

  reader.on("close", function () {
    console.log('Max', max)
  });
});

task2((reader) => {
  let [acc, accs] = [0, []];

  reader.on("line", function (line) {
    if (!line.length) {
      accs.push(acc)
      acc = 0;
    } else {
      acc += Number(line);
    }
  });

  reader.on("close", function () {
    accs.sort((a, b) => b - a);
    top3 = accs.slice(0, 3).reduce((acc, v) => acc + v, 0);
    console.log('Total', top3)
  });
});