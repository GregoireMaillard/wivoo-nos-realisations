import crypto from 'node:crypto';

export const SESSION_COOKIE = 'wivoo_admin_session';
export const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 jours (en secondes)

/**
 * L'authentification n'est active que si ADMIN_PASSWORD est défini.
 * → En production (Vercel), la variable est définie : /admin est protégé.
 * → En local (npm run dev sans la variable), /admin reste ouvert pour le dev.
 * Cohérent avec le reste du back-office (persistance, cooldown).
 */
export function authEnabled(): boolean {
  return !!process.env.ADMIN_PASSWORD;
}

function secret(): string {
  return process.env.ADMIN_PASSWORD || '';
}

function hmac(value: string): string {
  return crypto.createHmac('sha256', secret()).update(value).digest('hex');
}

/** Jeton de session signé : "<expiration_ms>.<signature_hmac>". */
export function createToken(): string {
  const exp = String(Date.now() + COOKIE_MAX_AGE * 1000);
  return `${exp}.${hmac(exp)}`;
}

/** Vérifie la signature et la non-expiration du jeton (comparaison à temps constant). */
export function verifyToken(token: string | undefined): boolean {
  if (!token || !secret()) return false;
  const dot = token.indexOf('.');
  if (dot < 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = hmac(payload);
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  return Number(payload) > Date.now();
}

/** Comparaison à temps constant du mot de passe saisi avec ADMIN_PASSWORD. */
export function passwordMatches(input: string): boolean {
  if (!secret()) return false;
  const a = crypto.createHash('sha256').update(input).digest();
  const b = crypto.createHash('sha256').update(secret()).digest();
  return crypto.timingSafeEqual(a, b);
}
