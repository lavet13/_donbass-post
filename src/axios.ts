import axios from "axios";
import Cookies from "js-cookie";

const workplacePostApi = axios.create({
  baseURL: "https://workplace-post.ru/api/",
  withCredentials: true,
});

workplacePostApi.interceptors.request.use((config) => {
  const token = Cookies.get("auth-token");
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

export { workplacePostApi };
