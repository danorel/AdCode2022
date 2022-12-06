const streamFileReading = function (filePath) {
  return require("readline").createInterface({
    input: require("fs").createReadStream(filePath),
  });
};

const streamTasks = function (filePath, N = 2) {
  return [...Array(N)].map(
    () => (callback) => callback(streamFileReading(filePath))
  );
};

module.exports = {
  streamFileReading,
  streamTasks,
};
