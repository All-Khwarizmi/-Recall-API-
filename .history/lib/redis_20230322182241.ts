import { createClient } from "redis";
import { env } from "~/env.mjs";

export const client = createClient({ url: env.REDIS_URL });





