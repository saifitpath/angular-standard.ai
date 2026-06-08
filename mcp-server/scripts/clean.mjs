/**
 * Removes the dist/ output directory before a fresh TypeScript build.
 */
import { rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');

rmSync(distDir, { recursive: true, force: true });
console.error(`Cleaned ${distDir}`);
