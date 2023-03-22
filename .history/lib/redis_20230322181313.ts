import { createClient } from "redis";
import { env } from "~/env.mjs";

const client = createClient({env.REDIS_URL});
