const { streamTasks } = require("../common");

const [task1, task2] = streamTasks(require("path").join(__dirname, "input"));

const templates = [
  ["NAME", new RegExp("Monkey (.+):")],
  ["ITEMS", new RegExp("  Starting items: (.+)")],
  ["OPERATION", new RegExp("  Operation: new = old (.+) (.+)")],
  ["TEST", new RegExp("  Test: divisible by (.+)")],
  ["TRUE", new RegExp("    If true: throw to monkey (.+)")],
  ["FALSE", new RegExp("    If false: throw to monkey (.+)")],
];

const calculator = (a, b, operator, mod) => {
  switch (operator) {
    case "*": {
      return mod ? (a * b) % mod : a * b;
    }
    case "/": {
      return mod ? (a / b) % mod : a / b;
    }
    case "+": {
      return mod ? (a + b) % mod : a + b;
    }
    case "-": {
      return mod ? (a - b) % mod : a - b;
    }
    default: {
      throw Error("Unknown operator");
    }
  }
};

const parseMonkeysInFile = function () {
  let monkey = {};
  const monkeys = [];

  const parseMonkeyInLine = function (line) {
    let currentCommand, currentArgs;

    for (const [command, template] of templates) {
      const parsedTemplate = line.match(template);
      if (parsedTemplate) {
        currentCommand = command;
        currentArgs = parsedTemplate.slice(1);
        break;
      }
    }

    switch (currentCommand) {
      case "NAME": {
        const [name] = currentArgs;
        monkey = { ...monkey, name };
        break;
      }
      case "ITEMS": {
        const [collection] = currentArgs;
        const items = collection.split(", ").map(Number);
        monkey = { ...monkey, items };
        break;
      }
      case "OPERATION": {
        const [operator, literal] = currentArgs;
        monkey = {
          ...monkey,
          calculateWorry: function (old, mod) {
            if (literal === "old") {
              return calculator(old, old, operator, mod);
            }
            return calculator(old, Number(literal), operator, mod);
          },
        };
        break;
      }
      case "TEST": {
        const [mod] = currentArgs;
        monkey = {
          ...monkey,
          checkMod: function (worryLevel) {
            return worryLevel % mod === 0;
          },
          getMod: function () {
            return mod;
          },
        };
        break;
      }
      case "TRUE": {
        const [throwToName] = currentArgs;
        monkey = {
          ...monkey,
          throwToTrue: function (item) {
            const monkeyTo = monkeys.find(
              (monkey) => monkey.name === throwToName
            );
            monkeyTo.items.push(item);
          },
        };
        break;
      }
      case "FALSE": {
        const [throwToName] = currentArgs;
        monkey = {
          ...monkey,
          throwToFalse: function (item) {
            const monkeyTo = monkeys.find(
              (monkey) => monkey.name === throwToName
            );
            monkeyTo.items.push(item);
          },
        };
        break;
      }
      default: {
        monkey = {
          ...monkey,
          hasItems: function () {
            return this.items.length !== 0;
          },
          inspectCount: 0,
          inspect: function (modOrDivisor, divisor = false) {
            ++this.inspectCount;
            const oldWorry = this.items.shift();
            if (divisor) {
              const newWorry = this.calculateWorry(oldWorry);
              return Math.floor(newWorry / modOrDivisor);
            } else {
              const newWorry = this.calculateWorry(oldWorry, modOrDivisor);
              return newWorry;
            }
          },
        };
        monkeys.push(monkey);
        monkey = {};
      }
    }
  };

  return { parseMonkeyInLine, monkeys };
};

const findMonkeysBusiness = (
  monkeys,
  rounds,
  modOrDivisor,
  divisor = false
) => {
  for (let round = 1; round <= rounds; ++round) {
    for (const monkey of monkeys) {
      while (monkey.hasItems()) {
        const item = monkey.inspect(modOrDivisor, divisor);
        if (monkey.checkMod(item)) {
          monkey.throwToTrue(item);
        } else {
          monkey.throwToFalse(item);
        }
      }
    }
  }
  monkeys.sort(
    (monkeyA, monkeyB) => monkeyB.inspectCount - monkeyA.inspectCount
  );
  const inspectCounts = monkeys
    .slice(0, 2)
    .map((monkey) => monkey.inspectCount);
  return inspectCounts[0] * inspectCounts[1];
};

task1((reader) => {
  const { parseMonkeyInLine, monkeys } = parseMonkeysInFile();

  reader.on("line", function (line) {
    parseMonkeyInLine(line);
  });

  reader.on("close", function () {
    console.log("monkey business", findMonkeysBusiness(monkeys, 20, 3, true));
  });
});

task2((reader) => {
  const { parseMonkeyInLine, monkeys } = parseMonkeysInFile();

  reader.on("line", function (line) {
    parseMonkeyInLine(line);
  });

  reader.on("close", function () {
    let gcd = 1;
    for (const monkey of monkeys) {
      const mod = monkey.getMod();
      gcd *= mod;
    }
    console.log(
      "monkey business",
      findMonkeysBusiness(monkeys, 10000, gcd, false)
    );
  });
});
