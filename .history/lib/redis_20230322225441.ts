import { createClient } from "redis";
import { env } from "~/env.mjs";

const client = createClient({
  password: "<password>",
  socket: {
    host: "redis-12473.c293.eu-central-1-1.ec2.cloud.redislabs.com",
    port: 12473,
  },
});


