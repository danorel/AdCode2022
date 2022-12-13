const { streamTasks } = require("../common");

const [task1, task2] = streamTasks(require("path").join(__dirname, "input"));

const ORDER_TYPES = {
  InOrder: -1,
  NotDetermined: 0,
  NotOrdered: 1,
};

const findOrder = (left, right) => {
  if (typeof left === "number" && typeof right === "number") {
    if (left < right) {
      return ORDER_TYPES.InOrder;
    } else if (left === right) {
      return ORDER_TYPES.NotDetermined;
    } else {
      return ORDER_TYPES.NotOrdered;
    }
  } else {
    let copyLeft = JSON.parse(JSON.stringify(left));
    let copyRight = JSON.parse(JSON.stringify(right));
    if (typeof copyLeft === "number") {
      copyLeft = [copyLeft];
    }
    if (typeof copyRight === "number") {
      copyRight = [copyRight];
    }
    const minLength = Math.min(copyLeft.length, copyRight.length);
    for (let index = 0; index < minLength; ++index) {
      const orderType = findOrder(copyLeft[index], copyRight[index], index);
      if (
        orderType === ORDER_TYPES.InOrder ||
        orderType === ORDER_TYPES.NotOrdered
      ) {
        return orderType;
      }
    }
    if (copyLeft.length > copyRight.length) {
      return ORDER_TYPES.NotOrdered;
    }
    if (copyLeft.length === copyRight.length) {
      return ORDER_TYPES.NotDetermined;
    }
    return ORDER_TYPES.InOrder;
  }
};

const parseFile = () => {
  const pairs = [];
  let pair = [];

  const parseLine = (line) => {
    if (!line) {
      pairs.push(pair);
      pair = [];
    } else {
      pair.push(JSON.parse(line));
    }
  };

  return {
    pairs,
    parseLine,
  };
};

task1((reader) => {
  const { pairs, parseLine } = parseFile();

  reader.on("line", function (line) {
    parseLine(line);
  });

  reader.on("close", function () {
    const indices = [];
    for (let index = 1; index <= pairs.length; ++index) {
      const [left, right] = pairs[index - 1];
      const orderType = findOrder(left, right);
      if (orderType === ORDER_TYPES.InOrder) {
        indices.push(index);
      }
    }
    console.log(
      "count",
      indices.reduce((sum, index) => sum + index, 0)
    );
  });
});

task2((reader) => {
  const { pairs, parseLine } = parseFile();

  reader.on("line", function (line) {
    parseLine(line);
  });

  reader.on("close", function () {
    const list = pairs.flatMap((pair) => pair);
    list.push([[2]]);
    list.push([[6]]);
    list.sort((a, b) => findOrder(a, b));
    const i1 = list.findIndex((e) => JSON.stringify(e) === "[[2]]");
    const i2 = list.findIndex((e) => JSON.stringify(e) === "[[6]]");
    console.log("r", (i1 + 1) * (i2 + 1));
  });
});
