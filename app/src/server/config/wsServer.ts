import axios from "axios";
import { env } from "~/env.mjs";

export const wsServerApi = axios.create({
  baseURL: env.WS_SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
