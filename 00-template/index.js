const { streamTasks } = require("../common");

const [
  task1,
  task2
] = streamTasks(require("path").join(__dirname, "input"));

task1((reader) => {
  reader.on("line", function (line) {

  });

  reader.on("close", function () {

  });
});

task2((reader) => {
  reader.on("line", function (line) {
    
  });

  reader.on("close", function () {

  });
});