import axios from "axios";

const api = axios.create({
  baseURL: "https://brandon-s-puppy-crud-app-1.onrender.com/api",
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export default api;