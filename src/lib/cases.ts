import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export interface Kpi {
  value: string;
  label: string;
}

export interface Case {
  id: number;
  slug: string;
  sector: 'Product' | 'AI' | 'Data' | 'Design';
  client: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  published: boolean;
  kpis: Kpi[];
  challenge: string;
  solution: string[];
}

const DATA_PATH = join(process.cwd(), 'src/data/cases.json');
const GITHUB_FILE_PATH = 'src/data/cases.json';

export function readCases(): Case[] {
  return JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
}

/**
 * Erreur levée quand une écriture concurrente provoque un conflit de SHA
 * non résolu par le retry. Permet à l'UI d'afficher un message dédié.
 */
export class ConcurrentEditError extends Error {
  constructor() {
    super('CONCURRENT_EDIT');
    this.name = 'ConcurrentEditError';
  }
}

/**
 * Persiste la liste des réalisations.
 * - En local (pas de GITHUB_TOKEN) : écrit directement le fichier JSON.
 * - En production (Vercel, GITHUB_TOKEN présent) : commit le JSON sur GitHub
 *   via l'API Contents. Le push déclenche le redéploiement Vercel automatique,
 *   qui régénère le site statique (~1 min). Le système de fichiers serverless
 *   de Vercel étant en lecture seule, writeFileSync n'y est pas une option.
 */
export async function writeCases(cases: Case[]): Promise<void> {
  const content = JSON.stringify(cases, null, 2);

  if (process.env.GITHUB_TOKEN) {
    await commitToGitHub(content);
  } else {
    writeFileSync(DATA_PATH, content, 'utf-8');
  }
}

/** true si la persistance passe par GitHub (= production), false en local. */
export function isRemotePersistence(): boolean {
  return !!process.env.GITHUB_TOKEN;
}

async function commitToGitHub(content: string): Promise<void> {
  const token  = process.env.GITHUB_TOKEN;
  const repo   = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !repo) {
    throw new Error('Configuration GitHub manquante (GITHUB_TOKEN / GITHUB_REPO).');
  }

  const url = `https://api.github.com/repos/${repo}/contents/${GITHUB_FILE_PATH}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };

  // 2 tentatives : si une écriture concurrente change le SHA entre le GET et
  // le PUT, GitHub renvoie 409 → on relit le SHA et on réessaie une fois.
  for (let attempt = 0; attempt < 2; attempt++) {
    const getRes = await fetch(`${url}?ref=${branch}`, { headers });
    let sha: string | undefined;
    if (getRes.ok) {
      sha = (await getRes.json()).sha;
    } else if (getRes.status !== 404) {
      throw new Error(`Lecture du fichier sur GitHub impossible (HTTP ${getRes.status}).`);
    }

    const putRes = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: 'chore(admin): mise à jour des réalisations',
        content: Buffer.from(content, 'utf-8').toString('base64'),
        branch,
        ...(sha ? { sha } : {}),
      }),
    });

    if (putRes.ok) return;
    if (putRes.status === 409 && attempt === 0) continue; // conflit SHA → retry
    if (putRes.status === 409) throw new ConcurrentEditError();

    const detail = await putRes.text();
    throw new Error(`Écriture sur GitHub échouée (HTTP ${putRes.status}). ${detail}`);
  }

  throw new ConcurrentEditError();
}

export const SECTOR_COLORS: Record<string, { hex: string; bg: string }> = {
  Product: { hex: '#6d28d9', bg: '#f5f3ff' },
  AI:      { hex: '#0891b2', bg: '#ecfeff' },
  Data:    { hex: '#059669', bg: '#f0fdf4' },
  Design:  { hex: '#db2777', bg: '#fdf2f8' },
};
