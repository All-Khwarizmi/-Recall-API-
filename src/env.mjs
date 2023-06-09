import { z } from "zod";

/**
 * Specify your server-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars.
 */
const server = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXTAUTH_SECRET:
    process.env.NODE_ENV === "production"
      ? z.string().min(1)
      : z.string().min(1).optional(),
  NEXTAUTH_URL: z.preprocess(
    // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
    // Since NextAuth.js automatically uses the VERCEL_URL if present.
    (str) => process.env.VERCEL_URL ?? str,
    // VERCEL_URL doesn't include `https` so it cant be validated as a URL
    process.env.VERCEL ? z.string().min(1) : z.string().url()
  ),
  // Add `.min(1) on ID and SECRET if you want to make sure they're not empty
  DISCORD_CLIENT_ID: z.string(),
  DISCORD_CLIENT_SECRET: z.string(),
  REDIS_URL: z.string(),
  API_AUTH_HEADERS_KEY_TEST: z.string(),
  API_AUTH_HEADERS_KEY_ADD_RECALL: z.string(),
  REDIS_PWD: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),
  SENDGRID_API_KEY: z.string(),
  API_AUTH_HEADERS_KEY_GET_USER_RECALLS: z.string(),
  API_AUTH_HEADERS_KEY_GET_USER_TOPIC_RECALL: z.string(),
  API_AUTH_HEADERS_KEY_GET_ALL_RECALLS: z.string(),
  API_AUTH_HEADERS_KEY_DELETE_RECALL: z.string(),
  API_AUTH_HEADERS_KEY_UPDATE_RECALL: z.string(),
  API_AUTH_HEADERS_KEY_GET_RECALLS_OF_DAY: z.string(),
  API_AUTH_HEADERS_SEND_MSG: z.string(),
  API_RECALL_OF_THE_DAY_ENDPOINT: z.string(),
  API_AUTH_HEADERS_TRY_RECALL: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
});

/**
 * Specify your client-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars. To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
const client = z.object({
  NEXT_PUBLIC_API_AUTH_HEADERS_TRY_RECALL: z.string(),
  NEXT_PUBLIC_API_TRY_RECALL_ENDPOINT: z.string(),
  NEXT_PUBLIC_API_AUTH_HEADERS_ADD_RECALL: z.string(),
  NEXT_PUBLIC_API_ADD_RECALL_ENDPOINT: z.string(),
  NEXT_PUBLIC_API_AUTH_HEADERS_KEY_GET_USER_RECALLS: z.string(),
  NEXT_PUBLIC_API_GET_USER_RECALLS_ENDPOINT: z.string(),
  NEXT_PUBLIC_API_GET_USER_RECALLS_ENDPOINT2: z.string(),
  NEXT_PUBLIC_API_AUTH_HEADERS_KEY_DELETE_USER_RECALL: z.string(),
  NEXT_PUBLIC_API_DELETE_USER_RECALL_ENDPOINT: z.string(),
  NEXT_PUBLIC_API_AUTH_HEADERS_KEY_UPDATE_USER_RECALL: z.string(),
  NEXT_PUBLIC_API_UPDATE_USER_RECALL_ENDPOINT : z.string(),

  // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
 * middlewares) or client-side so we need to destruct manually.
 *
 * @type {Record<keyof z.infer<typeof server> | keyof z.infer<typeof client>, string | undefined>}
 */
const processEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
  REDIS_URL: process.env.REDIS_URL,
  API_AUTH_HEADERS_KEY_TEST: process.env.API_AUTH_HEADERS_KEY_TEST,
  API_AUTH_HEADERS_KEY_ADD_RECALL: process.env.API_AUTH_HEADERS_KEY_ADD_RECALL,
  API_AUTH_HEADERS_KEY_GET_USER_RECALLS:
    process.env.API_AUTH_HEADERS_KEY_GET_USER_RECALLS,
  API_AUTH_HEADERS_KEY_GET_USER_TOPIC_RECALL:
    process.env.API_AUTH_HEADERS_KEY_GET_USER_TOPIC_RECALL,
  API_AUTH_HEADERS_KEY_GET_ALL_RECALLS:
    process.env.API_AUTH_HEADERS_KEY_GET_ALL_RECALLS,
  API_AUTH_HEADERS_KEY_DELETE_RECALL:
    process.env.API_AUTH_HEADERS_KEY_DELETE_RECALL,
  API_AUTH_HEADERS_KEY_UPDATE_RECALL:
    process.env.API_AUTH_HEADERS_KEY_UPDATE_RECALL,
  API_AUTH_HEADERS_KEY_GET_RECALLS_OF_DAY:
    process.env.API_AUTH_HEADERS_KEY_GET_RECALLS_OF_DAY,
  REDIS_PWD: process.env.REDIS_PWD,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  API_AUTH_HEADERS_SEND_MSG: process.env.API_AUTH_HEADERS_SEND_MSG,
  API_RECALL_OF_THE_DAY_ENDPOINT: process.env.API_RECALL_OF_THE_DAY_ENDPOINT,
  API_AUTH_HEADERS_TRY_RECALL: process.env.API_AUTH_HEADERS_TRY_RECALL,
  // Auth headers for client side
  NEXT_PUBLIC_API_AUTH_HEADERS_TRY_RECALL:
    process.env.NEXT_PUBLIC_API_AUTH_HEADERS_TRY_RECALL,
  NEXT_PUBLIC_API_AUTH_HEADERS_ADD_RECALL:
    process.env.NEXT_PUBLIC_API_AUTH_HEADERS_ADD_RECALL,
  NEXT_PUBLIC_API_AUTH_HEADERS_KEY_GET_USER_RECALLS:
    process.env.NEXT_PUBLIC_API_AUTH_HEADERS_KEY_GET_USER_RECALLS,
  NEXT_PUBLIC_API_AUTH_HEADERS_KEY_DELETE_USER_RECALL:
    process.env.NEXT_PUBLIC_API_AUTH_HEADERS_KEY_DELETE_USER_RECALL,
  NEXT_PUBLIC_API_AUTH_HEADERS_KEY_UPDATE_USER_RECALL:
    process.env.NEXT_PUBLIC_API_AUTH_HEADERS_KEY_UPDATE_USER_RECALL,
  // Endpoints for client side
  NEXT_PUBLIC_API_TRY_RECALL_ENDPOINT:
    process.env.NEXT_PUBLIC_API_TRY_RECALL_ENDPOINT,
  NEXT_PUBLIC_API_ADD_RECALL_ENDPOINT:
    process.env.NEXT_PUBLIC_API_ADD_RECALL_ENDPOINT,
  NEXT_PUBLIC_API_GET_USER_RECALLS_ENDPOINT:
    process.env.NEXT_PUBLIC_API_GET_USER_RECALLS_ENDPOINT,
  NEXT_PUBLIC_API_GET_USER_RECALLS_ENDPOINT2:
    process.env.NEXT_PUBLIC_API_GET_USER_RECALLS_ENDPOINT2,
  NEXT_PUBLIC_API_DELETE_USER_RECALL_ENDPOINT:
    process.env.NEXT_PUBLIC_API_DELETE_USER_RECALL_ENDPOINT,
  NEXT_PUBLIC_API_UPDATE_USER_RECALL_ENDPOINT:
    process.env.NEXT_PUBLIC_API_UPDATE_USER_RECALL_ENDPOINT,

  // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
};

// Don't touch the part below
// --------------------------

const merged = server.merge(client);

/** @typedef {z.input<typeof merged>} MergedInput */
/** @typedef {z.infer<typeof merged>} MergedOutput */
/** @typedef {z.SafeParseReturnType<MergedInput, MergedOutput>} MergedSafeParseReturn */

let env = /** @type {MergedOutput} */ (process.env);

if (!!process.env.SKIP_ENV_VALIDATION == false) {
  const isServer = typeof window === "undefined";

  const parsed = /** @type {MergedSafeParseReturn} */ (
    isServer
      ? merged.safeParse(processEnv) // on server we can validate all env vars
      : client.safeParse(processEnv) // on client we can only validate the ones that are exposed
  );

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables");
  }

  env = new Proxy(parsed.data, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      // Throw a descriptive error if a server-side env var is accessed on the client
      // Otherwise it would just be returning `undefined` and be annoying to debug
      if (!isServer && !prop.startsWith("NEXT_PUBLIC_"))
        throw new Error(
          process.env.NODE_ENV === "production"
            ? "❌ Attempted to access a server-side environment variable on the client"
            : `❌ Attempted to access server-side environment variable '${prop}' on the client`
        );
      return target[/** @type {keyof typeof target} */ (prop)];
    },
  });
}

export { env };
