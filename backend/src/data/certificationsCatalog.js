import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const path = join(__dirname, 'certifications-catalog.json');

const catalog = JSON.parse(readFileSync(path, 'utf-8'));
const bySlug = new Map(catalog.certifications.map((c) => [c.slug, c]));

export const getCatalog = () => catalog;
export const getCertification = (slug) => (slug ? bySlug.get(slug) || null : null);
export const listCertifications = () => catalog.certifications;

export const tierForCatalog = (slug) => {
  const entry = bySlug.get(slug);
  return entry ? entry.tier : 'bronze';
};
