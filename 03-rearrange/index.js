const { streamTasks } = require("../common");

const [task1, task2] = streamTasks(require("path").join(__dirname, "input"));

const letterPriorityList = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

const letterPriorityMap = letterPriorityList.reduce(
  (acc, letter, index) => ({
    ...acc,
    [letter]: index + 1,
  }),
  {}
);

task1((reader) => {
  let score = 0;

  reader.on("line", function (line) {
    const compartmentSize = line.length / 2;
    const [compartmentA, compartmentB] = [
      line.slice(0, compartmentSize),
      line.slice(compartmentSize),
    ];
    const setA = new Set(),
      setB = new Set();
    for (const itemA of compartmentA) {
      setA.add(itemA);
    }
    for (const itemB of compartmentB) {
      setB.add(itemB);
    }
    for (const letterA of setA) {
      if (setB.has(letterA)) {
        score += letterPriorityMap[letterA];
      }
    }
  });

  reader.on("close", function () {
    console.log("Score", score);
  });
});

task2((reader) => {
  let score = 0;
  let threesack = [];
  let i = 0;

  reader.on("line", function (line) {
    threesack.push(line);
    if (i % 3 === 2) {
      const sets = [];
      for (const rucksack of threesack) {
        const set = new Set();
        for (const item of rucksack) {
          set.add(item);
        }
        sets.push(set);
      }
      for (const itemA of sets[0]) {
        if (sets[1].has(itemA) && sets[2].has(itemA)) {
          score += letterPriorityMap[itemA];
        }
      }
      threesack = [];
    }
    ++i;
  });

  reader.on("close", function () {
    console.log("Score", score);
  });
});
