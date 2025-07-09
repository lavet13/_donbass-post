import axios from "axios";

const workplacePostApi = axios.create({
  baseURL: "https://workplace-post.ru/api/",
});

export { workplacePostApi };
