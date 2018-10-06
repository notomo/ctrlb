const promisify = require("util").promisify;
const exec = promisify(require("child_process").exec);
const readFileSync = require("fs").readFileSync;

const EXTENSION_ID = process.env.EXTENSION_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const CLIENT_ID = process.env.CLIENT_ID;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const webstoreCommand = "./node_modules/.bin/webstore";
const version = JSON.parse(readFileSync("./dist/manifest.json"))["version"];
const zipFilePath = `./ext/chrome/ctrlb-${version}.zip`;

exec(
  `${webstoreCommand} upload --source ${zipFilePath} --extension-id ${EXTENSION_ID} --client-secret ${CLIENT_SECRET} --client-id ${CLIENT_ID} --refresh-token ${REFRESH_TOKEN}`
)
  .then(({ stdout, stderr }) => {
    console.log(stdout);
    return exec(
      `${webstoreCommand} publish --extension-id ${EXTENSION_ID} --client-secret ${CLIENT_SECRET} --client-id ${CLIENT_ID} --refresh-token ${REFRESH_TOKEN}`
    );
  })
  .then(({ stdout, stderr }) => {
    console.log(stdout);
  })
  .catch(e => {
    console.log(e);
  });
