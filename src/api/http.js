import axios from "axios";

const baseURL = process.env.VUE_APP_API;

const instance = axios.create({
  baseURL: baseURL,
  timeout: 1000,
});

instance.interceptors.response.use(
  (res) =>
    res.status === 200 ? Promise.resolve(res.data) : Promise.reject(res),
  (error) => Promise.reject(error)
);

export { baseURL };
export default instance;
