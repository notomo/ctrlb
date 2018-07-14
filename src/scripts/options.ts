import { Config } from "./ctrlb/config";
import ChromePromise from "chrome-promise";

const storage = new ChromePromise().storage.sync;
const config = new Config(storage);

function saveOptions() {
  const hostForm = document.getElementById("host") as HTMLInputElement;
  const host = hostForm.value as string;
  const statusLabel = document.getElementById("status") as HTMLElement;
  config
    .saveHost(host)
    .then(() => {
      statusLabel.textContent = "Options saved.";
      setTimeout(() => {
        statusLabel.textContent = "";
      }, 750);
    })
    .catch(() => {
      statusLabel.textContent = "Failed saving options.";
    });
}

const saveButton = document.getElementById("save") as HTMLInputElement;
saveButton.addEventListener("click", saveOptions);

async function restoreOptions() {
  const defaultLabel = document.getElementById("default") as HTMLElement;
  const hostForm = document.getElementById("host") as HTMLInputElement;
  defaultLabel.textContent = config.DEFAULT_HOST;
  const host: string = await config.getHost();
  hostForm.value = host;
}
document.addEventListener("DOMContentLoaded", restoreOptions);
