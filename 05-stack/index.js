const { streamTasks } = require("../common");

const [task1, task2] = streamTasks(require("path").join(__dirname, "input"));

function isLetter(str) {
  return str.length === 1 && str.match(/[a-z]/i);
}

task1((reader) => {
  let isRearranging = false;
  let stacks = [];
  let currentStack = 0;

  const rearrangeTemplate = new RegExp("move (.+) from (.+) to (.+)");

  reader.on("line", function (line) {
    if (!line.length) {
      isRearranging = true;
    } else {
      if (isRearranging) {
        const rearrangeCommands = line.match(rearrangeTemplate);
        const [numberOf, fromStack, toStack] = rearrangeCommands
          .slice(1)
          .map(Number);
        for (i = 0; i < numberOf; ++i) {
          if (stacks[fromStack - 1] === undefined) {
            break;
          }
          const value = stacks[fromStack - 1].shift();
          stacks[toStack - 1].unshift(value);
        }
      } else {
        const items = line.split(/[[\]]/);
        for (const item of items) {
          if (!item.length) {
            continue;
          } else if (isLetter(item)) {
            if (!stacks[currentStack]) {
              stacks[currentStack] = [item];
            } else {
              stacks[currentStack].push(item);
            }
            ++currentStack;
          } else {
            let margin = item.length;
            while (margin > 0) {
              margin -= 1; // <- Counting as 1 marging between stacks
              if (margin <= 0) {
                break;
              }
              margin -= 3; // <- Counting as 1 skipping stack
              ++currentStack;
            }
          }
        }
        currentStack = 0;
      }
    }
  });

  reader.on("close", function () {
    for (const stack of stacks) {
      console.log("Stack top:", stack[0]);
    }
  });
});

task2((reader) => {
  let isRearranging = false;
  let stacks = [];
  let currentStack = 0;

  const rearrangeTemplate = new RegExp("move (.+) from (.+) to (.+)");

  reader.on("line", function (line) {
    if (!line.length) {
      isRearranging = true;
    } else {
      if (isRearranging) {
        const rearrangeCommands = line.match(rearrangeTemplate);
        const [numberOf, fromStack, toStack] = rearrangeCommands
          .slice(1)
          .map(Number);
        const multipleStacks = [];
        for (i = 0; i < numberOf; ++i) {
          if (stacks[fromStack - 1] === undefined) {
            break;
          }
          const value = stacks[fromStack - 1].shift();
          multipleStacks.push(value);
        }
        for (i = multipleStacks.length - 1; i >= 0; --i) {
          value = multipleStacks[i];
          stacks[toStack - 1].unshift(value);
        }
      } else {
        const items = line.split(/[[\]]/);
        for (const item of items) {
          if (!item.length) {
            continue;
          } else if (isLetter(item)) {
            if (!stacks[currentStack]) {
              stacks[currentStack] = [item];
            } else {
              stacks[currentStack].push(item);
            }
            ++currentStack;
          } else {
            let margin = item.length;
            while (margin > 0) {
              margin -= 1; // <- Counting as 1 marging between stacks
              if (margin <= 0) {
                break;
              }
              margin -= 3; // <- Counting as 1 skipping stack
              ++currentStack;
            }
          }
        }
        currentStack = 0;
      }
    }
  });

  reader.on("close", function () {
    for (const stack of stacks) {
      console.log("Stack top:", stack[0]);
    }
  });
});
