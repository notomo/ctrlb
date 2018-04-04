import { Config } from "./ctrlb/config";

const config = new Config();

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

function restoreOptions() {
  const defaultLabel = document.getElementById("default") as HTMLElement;
  const hostForm = document.getElementById("host") as HTMLInputElement;
  defaultLabel.textContent = config.DEFAULT_HOST;
  config
    .getHost()
    .then(host => {
      hostForm.value = host;
    })
    .catch(e => {
      console.log(e);
    });
}
document.addEventListener("DOMContentLoaded", restoreOptions);
