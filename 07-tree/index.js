const { streamTasks } = require("../common");

const [task1, task2] = streamTasks(require("path").join(__dirname, "input"));

const CD_TEMPLATE = new RegExp("\\$ cd (.+)");
const LS_TEMPLATE = new RegExp("\\$ ls");
const DIR_TEMPLATE = new RegExp("dir (.+)");
const FILE_TEMPLATE = new RegExp("(.+) (.+)");

const TEMPLATES = [
  ["CD", CD_TEMPLATE],
  ["LS", LS_TEMPLATE],
  ["DIR", DIR_TEMPLATE],
  ["FILE", FILE_TEMPLATE],
];

const parseProgram = function () {
  const fileSystem = new Map([["/", new Map()]]);

  let location = fileSystem;
  let pwd = "/";

  const parseCommandLine = function (line) {
    let currentCommand, currentArgs;

    for (const [command, template] of TEMPLATES) {
      const isActiveTemplate = line.match(template);
      if (isActiveTemplate) {
        currentCommand = command;
        currentArgs = isActiveTemplate.slice(1);
        break;
      }
    }

    switch (currentCommand) {
      case "CD": {
        const [nextDir] = currentArgs;
        if (nextDir === "..") {
          const nextPwd = pwd.split("/").slice(1, -1);
          if (nextPwd.length === 0) {
            pwd = "/";
          } else {
            pwd = "/" + nextPwd.join("/");
          }
          const pwdDirs = pwd.split("/").map((v) => (v === "" ? "/" : v));
          const pwdIncludesRoot = pwdDirs.some((dir) => dir === "/");
          if (!pwdIncludesRoot) {
            pwdDirs.unshift("/");
          }
          location = fileSystem;
          for (const pwdDir of pwdDirs) {
            if (pwdDir === "/") {
              location = fileSystem.get("/");
            } else {
              location = location.get(pwdDir);
            }
          }
        } else {
          if (nextDir === "/") {
            location = fileSystem.get("/");
            pwd = "/";
          } else {
            location = location.get(nextDir);
            if (pwd === "/") {
              pwd = `/${nextDir}`;
            } else {
              pwd = `${pwd}/${nextDir}`;
            }
          }
        }
        break;
      }
      case "DIR": {
        const [newDir] = currentArgs;
        location.set(newDir, new Map());
        break;
      }
      case "FILE": {
        const [newFileSize, newFile] = currentArgs;
        location.set(newFile, Number(newFileSize));
        break;
      }
    }
  };

  return { parseCommandLine, fileSystem };
};

const findDirSpace = (
  currentStructure,
  filesPassedThreshold,
  threshold = 100000
) => {
  if (!currentStructure) {
    return 0;
  }
  let dirSpace = 0;
  for (const currentDirOrFile of currentStructure) {
    if (isFile(currentDirOrFile)) {
      const [_, fileSize] = currentDirOrFile;
      dirSpace += fileSize;
    } else {
      const [_, dirStructure] = currentDirOrFile;
      dirSpace += findDirSpace(dirStructure, filesPassedThreshold, threshold);
    }
  }
  if (filesPassedThreshold) {
    if (dirSpace <= threshold) {
      filesPassedThreshold.push(dirSpace);
    }
  }
  return dirSpace;
};

const isFile = function (currentDirOrFile) {
  const [_, fileSizeOrChildDir] = currentDirOrFile;
  return typeof fileSizeOrChildDir === "number";
};

task1((reader) => {
  const { parseCommandLine, fileSystem } = parseProgram();

  reader.on("line", function (line) {
    parseCommandLine(line);
  });

  reader.on("close", function () {
    const filesSpacePassedThreshold = [];

    console.log(
      "Total dir space:",
      findDirSpace(fileSystem.get("/"), filesSpacePassedThreshold, 100000)
    );

    const totalSpace = filesSpacePassedThreshold.reduce(
      (totalSpace, fileSpace) => totalSpace + fileSpace,
      0
    );

    console.log("Total space of files lt 100000", totalSpace);
  });
});

task2((reader) => {
  const { parseCommandLine, fileSystem } = parseProgram();

  reader.on("line", function (line) {
    parseCommandLine(line);
  });

  reader.on("close", function () {
    let minDirSpace = +Infinity;

    const diskSpace = 70000000;
    const updateSpace = 30000000;

    const totalSpace = findDirSpace(fileSystem.get("/"));

    const findDirSpaceToDelete = (currentStructure) => {
      if (!currentStructure) {
        return 0;
      }
      let dirSpace = 0;
      for (const currentDirOrFile of currentStructure) {
        if (isFile(currentDirOrFile)) {
          const [_, fileSize] = currentDirOrFile;
          dirSpace += fileSize;
        } else {
          const [_, dirStructure] = currentDirOrFile;
          dirSpace += findDirSpaceToDelete(dirStructure);
        }
      }
      if (totalSpace + updateSpace - dirSpace <= diskSpace) {
        if (minDirSpace > dirSpace) {
          minDirSpace = dirSpace;
        }
      }
      return dirSpace;
    };

    console.log("Total dir space:", findDirSpaceToDelete(fileSystem.get("/")));
    console.log("Min dir space:", minDirSpace);
  });
});
