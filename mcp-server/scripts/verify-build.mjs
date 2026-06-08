/**
 * Post-build verification script.
 * Ensures TypeScript emitted a runnable MCP entry point at dist/index.js.
 * Exits with code 1 when the expected output is missing.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const primaryEntry = path.join(packageRoot, 'dist', 'index.js');
const alternateEntry = path.join(packageRoot, 'dist', 'src', 'index.js');

/** Recursively collect relative file paths under a directory. */
function listFiles(dir, base = dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath, base));
    } else {
      files.push(path.relative(base, fullPath).replace(/\\/g, '/'));
    }
  }

  return files;
}

function resolveEntryPoint() {
  if (existsSync(primaryEntry)) {
    return { entryPath: primaryEntry, relativePath: 'dist/index.js' };
  }

  if (existsSync(alternateEntry)) {
    return { entryPath: alternateEntry, relativePath: 'dist/src/index.js' };
  }

  return null;
}

const resolved = resolveEntryPoint();

if (!resolved) {
  console.error('BUILD VERIFICATION FAILED');
  console.error('Expected one of:');
  console.error('  - dist/index.js');
  console.error('  - dist/src/index.js');
  console.error('');
  console.error('Run "npm run build" and check tsconfig outDir/rootDir settings.');
  process.exit(1);
}

const distDir = path.join(packageRoot, 'dist');
const jsFiles = listFiles(distDir).filter((file) => file.endsWith('.js'));

console.error('BUILD VERIFICATION PASSED');
console.error(`Entry point : ${resolved.relativePath}`);
console.error(`Absolute    : ${resolved.entryPath}`);
console.error(`JS files    : ${jsFiles.length}`);
console.error('Files:');
for (const file of jsFiles.sort()) {
  const fullPath = path.join(distDir, file);
  const size = statSync(fullPath).size;
  console.error(`  ${file} (${size} bytes)`);
}
