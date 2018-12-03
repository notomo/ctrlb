import { Di } from "./ctrlb/di";

const config = Di.get("Config");

const saveOptions = async () => {
  const hostForm = document.getElementById("host") as HTMLInputElement;
  const host = hostForm.value;

  const statusLabel = document.getElementById("status") as HTMLElement;

  await config.saveHost(host).catch(() => {
    statusLabel.textContent = "Failed saving options.";
  });
  statusLabel.textContent = "Options saved.";

  setTimeout(() => {
    statusLabel.textContent = "";
  }, 750);
};

const saveButton = document.getElementById("save") as HTMLInputElement;
saveButton.addEventListener("click", saveOptions);

const restoreOptions = async () => {
  const defaultLabel = document.getElementById("default") as HTMLElement;
  defaultLabel.textContent = config.DEFAULT_HOST;

  const host = await config.getHost();
  const hostForm = document.getElementById("host") as HTMLInputElement;
  hostForm.value = host;
};
document.addEventListener("DOMContentLoaded", restoreOptions);
