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

export function readCases(): Case[] {
  return JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
}

export function writeCases(cases: Case[]): void {
  writeFileSync(DATA_PATH, JSON.stringify(cases, null, 2), 'utf-8');
}

export const SECTOR_COLORS: Record<string, { hex: string; bg: string }> = {
  Product: { hex: '#6d28d9', bg: '#f5f3ff' },
  AI:      { hex: '#0891b2', bg: '#ecfeff' },
  Data:    { hex: '#059669', bg: '#f0fdf4' },
  Design:  { hex: '#db2777', bg: '#fdf2f8' },
};
