const readFileSync = require("fs").readFileSync;

const version = JSON.parse(readFileSync("./dist/manifest.json"))["version"];
console.log(version);
