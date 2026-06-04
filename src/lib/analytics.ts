/**
 * Analytics minimaliste via Upstash Redis (API REST, sans dépendance).
 * Compteurs agrégés, cookieless. Dégrade proprement si non configuré :
 * toutes les fonctions deviennent des no-op et analyticsEnabled() renvoie false.
 *
 * Variables d'env (l'une OU l'autre convention, injectées par l'intégration Vercel) :
 *   KV_REST_API_URL / KV_REST_API_TOKEN   (nommage Vercel)
 *   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN   (nommage Upstash)
 */

import crypto from 'node:crypto';

export const KEY_VIEWS = 'wivoo:views:list';
export const KEY_VISITORS = 'wivoo:visitors'; // HyperLogLog des visiteurs uniques
export const KEY_CLICKS_TOTAL = 'wivoo:clicks:total';
export const keyCaseClicks = (slug: string) => `wivoo:clicks:case:${slug}`;

const VISITOR_SALT = 'wivoo-analytics-v1';

/**
 * Empreinte cookieless d'un visiteur : hash(IP + User-Agent + sel).
 * L'IP n'est jamais stockée — l'empreinte alimente un HyperLogLog (irréversible).
 */
export function visitorHash(ip: string, ua: string): string {
  return crypto.createHash('sha256').update(`${ip}|${ua}|${VISITOR_SALT}`).digest('hex');
}

function config(): { url: string; token: string } {
  // process.env : variables runtime (Vercel prod). import.meta.env : fallback pour
  // le .env local en dev (Astro/Vite n'expose pas .env à process.env).
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL ||
    import.meta.env.KV_REST_API_URL || import.meta.env.UPSTASH_REDIS_REST_URL || '';
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN ||
    import.meta.env.KV_REST_API_TOKEN || import.meta.env.UPSTASH_REDIS_REST_TOKEN || '';
  return { url, token };
}

export function analyticsEnabled(): boolean {
  const { url, token } = config();
  return !!(url && token);
}

/** Exécute une commande Redis via l'API REST Upstash. Renvoie null en cas d'échec. */
async function redis(command: (string | number)[]): Promise<unknown> {
  const { url, token } = config();
  if (!url || !token) return null;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
    });
    if (!res.ok) return null;
    return (await res.json() as { result?: unknown }).result ?? null;
  } catch {
    return null;
  }
}

export async function incr(key: string): Promise<void> {
  await redis(['INCR', key]);
}

export async function mget(keys: string[]): Promise<(string | null)[]> {
  if (!keys.length) return [];
  const result = await redis(['MGET', ...keys]);
  return Array.isArray(result) ? (result as (string | null)[]) : keys.map(() => null);
}

/** Ajoute une empreinte au HyperLogLog (compteur de cardinalité approximatif). */
export async function pfadd(key: string, value: string): Promise<void> {
  await redis(['PFADD', key, value]);
}

/** Cardinalité estimée du HyperLogLog (≈ visiteurs uniques). */
export async function pfcount(key: string): Promise<number> {
  return Number(await redis(['PFCOUNT', key])) || 0;
}
