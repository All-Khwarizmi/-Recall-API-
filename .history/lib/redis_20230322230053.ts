import { createClient } from "redis";
import { env } from "~/env.mjs";

const client = createClient({
  password: env.RE,
  socket: {
    host: env.REDIS_HOST,
    port: ,
  },
});


