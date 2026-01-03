import axios from "axios";
import Cookies from "js-cookie";
import { AUTH_CONFIG } from "@/config";

const workplacePostApi = axios.create({
  baseURL: "https://workplace-post.ru/api/",
  timeout: 10_000,
});

workplacePostApi.interceptors.request.use((config) => {
  const token = Cookies.get(AUTH_CONFIG.cookieName);
  if (token) {
    config.headers.set(AUTH_CONFIG.headerName, `Bearer ${token}`);
  }
  return config;
});

export { workplacePostApi };
