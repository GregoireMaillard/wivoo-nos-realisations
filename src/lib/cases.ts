import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
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
 * Lit les réalisations en privilégiant l'état le plus à jour.
 * - En local (pas de GITHUB_TOKEN) : lit le fichier (= readCases).
 * - En production : lit `cases.json` directement depuis GitHub (dernier commit),
 *   et non le bundle déployé. Évite à l'admin d'afficher l'ancien état pendant
 *   le ~1 min de redéploiement Vercel. En cas d'échec, retombe sur le bundle.
 *
 * À réserver aux pages d'administration. Les pages publiques (statiques)
 * utilisent readCases() au build.
 */
export async function readCasesLive(): Promise<Case[]> {
  const token  = process.env.GITHUB_TOKEN;
  const repo   = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !repo) return readCases();

  try {
    const url = `https://api.github.com/repos/${repo}/contents/${GITHUB_FILE_PATH}?ref=${branch}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.raw',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (!res.ok) return readCases();
    return JSON.parse(await res.text());
  } catch {
    return readCases();
  }
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

// ─── Upload d'images ────────────────────────────────────────────────────────

/** Taille maximale d'une image uploadée depuis le back-office (4 Mo). */
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const IMAGE_DIR = 'public/case-images';

export interface NewImage {
  filename: string; // ex. "chatbot-genai-banque-ab12.jpg"
  base64: string;   // contenu encodé base64 (sans préfixe data:)
}

/** Extension normalisée à partir du type MIME, ou null si non supporté. */
export function imageExtension(file: File): string | null {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png',
    'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif',
    'image/svg+xml': 'svg',
  };
  return map[file.type] ?? null;
}

/** Valide un fichier uploadé. Retourne un message d'erreur ou null si OK. */
export function validateImageFile(file: unknown): string | null {
  if (!(file instanceof File) || file.size === 0) return 'Une image est requise.';
  if (file.size > MAX_IMAGE_BYTES) return 'Image trop lourde (4 Mo maximum).';
  if (!imageExtension(file)) return 'Format non supporté (JPG, PNG, WebP, GIF, AVIF ou SVG).';
  return null;
}

/**
 * Transforme un fichier (déjà validé) en NewImage + chemin public.
 * Le nom de fichier dérive du slug + un suffixe court pour éviter les collisions.
 */
export async function buildImageUpload(file: File, slug: string): Promise<{ image: NewImage; path: string }> {
  const ext = imageExtension(file) ?? 'jpg';
  const suffix = Date.now().toString(36).slice(-4);
  const filename = `${slug}-${suffix}.${ext}`;
  const base64 = Buffer.from(await file.arrayBuffer()).toString('base64');
  return { image: { filename, base64 }, path: `/case-images/${filename}` };
}

/**
 * Persiste les réalisations, en committant éventuellement une nouvelle image
 * dans le MÊME commit (atomique).
 * - Local : writeFileSync du JSON + écriture de l'image dans public/case-images/.
 * - Prod : un unique commit GitHub (API Git Data) contenant cases.json + l'image.
 *   Un seul commit, un seul rebuild — pas d'état intermédiaire incohérent.
 * Avec image = null, se comporte comme une simple sauvegarde du JSON.
 */
export async function writeCasesWithImage(cases: Case[], image: NewImage | null): Promise<void> {
  const jsonContent = JSON.stringify(cases, null, 2);

  if (process.env.GITHUB_TOKEN) {
    await commitFilesToGitHub(jsonContent, image);
  } else {
    writeFileSync(DATA_PATH, jsonContent, 'utf-8');
    if (image) {
      const dir = join(process.cwd(), IMAGE_DIR);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, image.filename), Buffer.from(image.base64, 'base64'));
    }
  }
}

/** Commit atomique de cases.json (+ image optionnelle) via l'API Git Data. */
async function commitFilesToGitHub(jsonContent: string, image: NewImage | null): Promise<void> {
  const token  = process.env.GITHUB_TOKEN;
  const repo   = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !repo) throw new Error('Configuration GitHub manquante (GITHUB_TOKEN / GITHUB_REPO).');

  const api = `https://api.github.com/repos/${repo}/git`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };

  // Le blob image est créé une seule fois (réutilisable entre tentatives).
  let imageBlobSha: string | undefined;
  if (image) {
    const blobRes = await fetch(`${api}/blobs`, {
      method: 'POST', headers,
      body: JSON.stringify({ content: image.base64, encoding: 'base64' }),
    });
    if (!blobRes.ok) throw new Error(`Création du blob image échouée (HTTP ${blobRes.status}).`);
    imageBlobSha = (await blobRes.json()).sha;
  }

  // 2 tentatives : si la branche bouge entre la lecture du ref et le PATCH,
  // GitHub renvoie 422 (non fast-forward) → on relit et on réessaie une fois.
  for (let attempt = 0; attempt < 2; attempt++) {
    const refRes = await fetch(`${api}/ref/heads/${branch}`, { headers });
    if (!refRes.ok) throw new Error(`Lecture de la branche échouée (HTTP ${refRes.status}).`);
    const latestCommitSha = (await refRes.json()).object.sha;

    const commitRes = await fetch(`${api}/commits/${latestCommitSha}`, { headers });
    if (!commitRes.ok) throw new Error(`Lecture du commit échouée (HTTP ${commitRes.status}).`);
    const baseTreeSha = (await commitRes.json()).tree.sha;

    const treeEntries: Array<Record<string, string>> = [
      { path: GITHUB_FILE_PATH, mode: '100644', type: 'blob', content: jsonContent },
    ];
    if (image && imageBlobSha) {
      treeEntries.push({ path: `${IMAGE_DIR}/${image.filename}`, mode: '100644', type: 'blob', sha: imageBlobSha });
    }

    const treeRes = await fetch(`${api}/trees`, {
      method: 'POST', headers,
      body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries }),
    });
    if (!treeRes.ok) throw new Error(`Création de l'arbre échouée (HTTP ${treeRes.status}).`);
    const newTreeSha = (await treeRes.json()).sha;

    const newCommitRes = await fetch(`${api}/commits`, {
      method: 'POST', headers,
      body: JSON.stringify({
        message: 'chore(admin): mise à jour des réalisations',
        tree: newTreeSha,
        parents: [latestCommitSha],
      }),
    });
    if (!newCommitRes.ok) throw new Error(`Création du commit échouée (HTTP ${newCommitRes.status}).`);
    const newCommitSha = (await newCommitRes.json()).sha;

    const updateRes = await fetch(`${api}/refs/heads/${branch}`, {
      method: 'PATCH', headers,
      body: JSON.stringify({ sha: newCommitSha, force: false }),
    });
    if (updateRes.ok) return;
    if (updateRes.status === 422 && attempt === 0) continue; // concurrent → retry
    if (updateRes.status === 422) throw new ConcurrentEditError();
    const detail = await updateRes.text();
    throw new Error(`Mise à jour de la branche échouée (HTTP ${updateRes.status}). ${detail}`);
  }
  throw new ConcurrentEditError();
}

export const SECTOR_COLORS: Record<string, { hex: string; bg: string }> = {
  Product: { hex: '#6d28d9', bg: '#f5f3ff' },
  AI:      { hex: '#0891b2', bg: '#ecfeff' },
  Data:    { hex: '#059669', bg: '#f0fdf4' },
  Design:  { hex: '#db2777', bg: '#fdf2f8' },
};
