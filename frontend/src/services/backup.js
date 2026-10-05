import { getLeads } from "./api";

const BACKUP_VERSION = 1;
const BACKUP_APP = "EventLead AI";

export async function createBackupData() {
  const leads = await getLeads();

  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    created_at: new Date().toISOString(),
    leads,
  };
}

export async function downloadBackup() {
  const backup = await createBackupData();

  const json = JSON.stringify(backup, null, 2);

  const blob = new Blob([json], { type: "application/json" });

  const url = URL.createObjectURL(blob);

  const date = new Date();

  const timestamp =
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0") +
    "_" +
    String(date.getHours()).padStart(2, "0") +
    "-" +
    String(date.getMinutes()).padStart(2, "0") +
    "-" +
    String(date.getSeconds()).padStart(2, "0");

  const link = document.createElement("a");

  link.href = url;
  link.download = `eventlead_backup_${timestamp}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  const backupTime = new Date().toISOString();

  localStorage.setItem("eventlead_last_backup", backupTime);

  return backup;
}

export function getLastBackupTime() {
  return localStorage.getItem("eventlead_last_backup");
}

export function isAutomaticBackupEnabled() {
  return localStorage.getItem("eventlead_auto_backup") === "true";
}

export function setAutomaticBackup(enabled) {
  localStorage.setItem("eventlead_auto_backup", String(enabled));
}

export async function createAutomaticBackup() {
  const backup = await createBackupData();

  localStorage.setItem("eventlead_latest_backup", JSON.stringify(backup));

  localStorage.setItem("eventlead_last_backup", backup.created_at);

  return backup;
}

export function getLatestAutomaticBackup() {
  const backup = localStorage.getItem("eventlead_latest_backup");

  if (!backup) {
    return null;
  }

  try {
    return JSON.parse(backup);
  } catch {
    return null;
  }
}

export function selectBackupFile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = ".json,application/json";

    input.onchange = async (event) => {
      const file = event.target.files?.[0];

      if (!file) {
        reject(new Error("No backup file selected"));
        return;
      }

      try {
        const text = await file.text();
        const backup = JSON.parse(text);

        resolve(backup);
      } catch {
        reject(new Error("Invalid backup file"));
      }
    };

    input.click();
  });
}
