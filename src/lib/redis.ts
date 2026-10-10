import { Redis } from "@upstash/redis";

/**
 * Client Upstash Redis.
 * Les variables sont injectées par l'intégration Vercel "Upstash for Redis"
 * (on accepte aussi les anciens noms KV_REST_API_*).
 * En local, mets-les dans .env (voir .env.example).
 */
export function getRedis(): Redis {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ??
    process.env.KV_REST_API_URL ??
    import.meta.env.UPSTASH_REDIS_REST_URL ??
    import.meta.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ??
    process.env.KV_REST_API_TOKEN ??
    import.meta.env.UPSTASH_REDIS_REST_TOKEN ??
    import.meta.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error(
      "Upstash Redis non configuré : renseigne UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN",
    );
  }
  return new Redis({ url, token });
}

/**
 * Clé secrète pour accéder à la page /r/<clé> qui liste les réponses.
 */
export function getAdminKey(): string | undefined {
  return process.env.ADMIN_KEY ?? import.meta.env.ADMIN_KEY;
}
