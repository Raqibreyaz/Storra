import { apiGet, apiPut } from "./client.js";

export const getAppSettings = async () => {
  return await apiGet("/app-setting");
};

export const updateAppSettings = async (settings) => {
  return await apiPut("/app-setting", settings);
};
