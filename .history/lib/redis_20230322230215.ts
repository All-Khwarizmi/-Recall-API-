import { createClient } from "redis";
import { env } from "~/env.mjs";

export const client = createClient({
  password: env.REDIS_PWD,
  socket: {
    host: env.REDIS_HOST,
    port: 12473,
  },
});
