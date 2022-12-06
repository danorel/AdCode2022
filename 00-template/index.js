const { streamTasks } = require("../common");

const [task1, task2] = streamTasks(require("path").join(__dirname, "input"));

task1((reader) => {
  // Define variables here...

  reader.on("line", function (line) {
    // Preprocess input here...
  });

  reader.on("close", function () {
    // Print output here...
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
