import { createClient } from "redis";
import { env } from "~/env.mjs";

const client = createClient({
  password: env.REDIS_PWD,
  socket: {
    host: env.REDIS_HOST,
    port: ,
  },
});


