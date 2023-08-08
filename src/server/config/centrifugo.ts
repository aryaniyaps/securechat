import axios from "axios";
import { env } from "~/env.mjs";

export const centrifugeApi = axios.create({
  baseURL: env.CENTRIFUGO_URL,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": env.CENTRIFUGO_API_KEY,
  },
});
