const hostApi = process.env.NODE_ENV === "development" ? "http://localhost" : "https://www.covid19watch.info";
const portApi = process.env.NODE_ENV === "development" ? 8080 : "";
const baseURLApi = `${hostApi}${portApi ? `:${portApi}` : ``}`;

export default {
  hostApi,
  portApi,
  baseURLApi,
  remote: "https://www.covid19watch.info",
  isBackend: process.env.REACT_APP_BACKEND,
  auth: {
    email: 'admin@flatlogic.com',
    password: 'password'
  }
};