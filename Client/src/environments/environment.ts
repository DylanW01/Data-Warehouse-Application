declare var require: any;

export const environment = {
  production: false,
  serverUrl: "http://localhost:8080",
  appVersion: require("../../package.json").version + "-dev",
};
