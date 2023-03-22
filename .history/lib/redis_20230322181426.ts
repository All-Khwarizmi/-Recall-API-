import { createClient } from "redis";
import { env } from "~/env.mjs";

export const client = createClient({ url: env.REDIS_URL });

client.on("error", (err) => console.log("Redis Client Error", err));

await client.connect();

await client.set("key", "value");
const value = await client.get("key");
console.log(value);
await client.disconnect();
