export const prerender = false;

import type { APIRoute } from 'astro';
import { incr, pfadd, visitorHash, analyticsEnabled, KEY_VIEWS, KEY_VISITORS, KEY_CLICKS_TOTAL, keyCaseClicks } from '../../lib/analytics';
import { readCases } from '../../lib/cases';

// Endpoint de tracking (cookieless, agrégé). Toujours 204 — fire-and-forget,
// ne jamais renvoyer d'erreur au client.
export const POST: APIRoute = async ({ request }) => {
  if (!analyticsEnabled()) return new Response(null, { status: 204 });

  let body: { type?: string; slug?: string } = {};
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 204 });
  }

  if (body.type === 'view') {
    await incr(KEY_VIEWS);
    // Visiteur unique (cookieless) : empreinte IP+UA via HyperLogLog. IP non stockée.
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || request.headers.get('x-real-ip') || '';
    const ua = request.headers.get('user-agent') || '';
    await pfadd(KEY_VISITORS, visitorHash(ip, ua));
  } else if (body.type === 'click') {
    const slug = String(body.slug || '').toLowerCase();
    // Slug validé (format + appartenance aux cas connus) pour éviter toute injection de clé.
    if (/^[a-z0-9-]+$/.test(slug) && readCases().some((c) => c.slug === slug)) {
      await incr(KEY_CLICKS_TOTAL);
      await incr(keyCaseClicks(slug));
    }
  }

  return new Response(null, { status: 204 });
};
