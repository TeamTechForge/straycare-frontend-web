export const confirmSensitiveAction = (message: string): boolean =>
  localStorage.getItem("dashboardConfirmActions") === "false" ||
  window.confirm(message);
