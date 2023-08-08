import { Centrifuge } from "centrifuge";
import { env } from "~/env.mjs";

export const centrifuge = new Centrifuge(env.NEXT_PUBLIC_CENTRIFUGO_URL);

centrifuge.on("connected", function () {
  console.log("Connected to Centrifugo!");
});

centrifuge.on("disconnected", function (reason) {
  console.error("Disconnected from Centrifugo:", reason);
});

centrifuge.on("error", function (error) {
  console.error("Error in Centrifugo:", error);
});
