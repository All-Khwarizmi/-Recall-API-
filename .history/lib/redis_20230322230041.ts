import { createClient } from "redis";
import { env } from "~/env.mjs";

const client = createClient({
  password: "<password>",
  socket: {
    host: e,
    port: ,
  },
});


