declare var require: any;

export const environment = {
  production: false,
  serverUrl: "https://datawarehouseapi.dylanwarrell.com:443",
  appVersion: require("../../package.json").version,
};
