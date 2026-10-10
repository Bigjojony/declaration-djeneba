import type { APIRoute } from "astro";
import { getRedis } from "../../lib/redis";

export const prerender = false;

/**
 * POST /api/reponse
 * Reçoit la réponse et la stocke dans Upstash Redis.
 * Une seule ligne par personne : le champ du hash = identifiant de session,
 * donc chaque clic met à jour la ligne au lieu d'en créer une nouvelle.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const data: any = await request.json().catch(() => ({}));

    const sid =
      typeof data?.sessionId === "string" && data.sessionId
        ? data.sessionId
        : globalThis.crypto?.randomUUID?.() ?? `anon-${Date.now()}-${Math.random()}`;

    const entry = {
      sid,
      reponse: data?.reponse ?? null,
      clicsNon: data?.clicsNon ?? 0,
      historique: Array.isArray(data?.historique) ? data.historique : [],
      date: new Date().toISOString(),
      ua: request.headers.get("user-agent") ?? null,
      ip: (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || null,
    };

    const redis = getRedis();
    await redis.hset("reponses", { [sid]: entry });

    return new Response(JSON.stringify({ ok: true, sid }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};
