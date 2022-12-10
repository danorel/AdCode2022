const { streamTasks } = require("../common");

const [task1, task2] = streamTasks(require("path").join(__dirname, "input"));

task1((reader) => {
  const commands = [];

  reader.on("line", function (line) {
    const command = line.split(" ");
    commands.push(command);
  });

  reader.on("close", function () {
    let strength = 0;
    const periods = [20, 60, 100, 140, 180, 220];

    let cycle = 0;
    let currTick = 1;

    for (const command of commands) {
      let prevTick = currTick;
      const isAddx = command.length === 2;
      ++cycle;
      if (isAddx) {
        ++cycle;
        const [_, amount] = command;
        currTick += Number(amount);
      }
      const period = periods.at(0);
      if (period === cycle) {
        periods.shift();
        strength += period * currTick;
      } else if (period === cycle - 1) {
        periods.shift();
        strength += period * prevTick;
      }
    }

    console.log("Signal strength", strength);
  });
});

task2((reader) => {
  const commands = [];

  reader.on("line", function (line) {
    const command = line.split(" ");
    commands.push(command);
  });

  reader.on("close", function () {
    const crt = new Array(6).fill("");

    let cycle = 0;
    let currTick = 1;

    for (const command of commands) {
      let line = Math.floor(cycle / 40);
      let pixel = cycle % 40;
      crt[line] += Math.abs(pixel - currTick) <= 1 ? "#" : " ";
      const isAddx = command.length === 2;
      ++cycle;
      if (isAddx) {
        line = Math.floor(cycle / 40);
        pixel = cycle % 40;
        crt[line] += Math.abs(pixel - currTick) <= 1 ? "#" : " ";
        const [_, amount] = command;
        currTick += Number(amount);
        ++cycle;
      }
    }

    console.log(crt.join("\n"));
  });
});
