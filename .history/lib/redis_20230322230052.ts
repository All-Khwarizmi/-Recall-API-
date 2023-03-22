import { createClient } from "redis";
import { env } from "~/env.mjs";

const client = createClient({
  password: env.,
  socket: {
    host: env.REDIS_HOST,
    port: ,
  },
});


