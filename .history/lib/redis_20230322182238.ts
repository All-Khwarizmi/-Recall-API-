import { createClient } from "redis";
import { env } from "~/env.mjs";

export const client = createClient({ url: env.REDIS_URL });

client.on("error", (err) => console.log("Redis Client Error", err));



