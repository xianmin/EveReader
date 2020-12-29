import axios from "./http";
import { baseURL } from "./http";

const api = {
  getBookList() {
    return axios.get(`${baseURL}/api/booklist`);
  },
};

export default api;
