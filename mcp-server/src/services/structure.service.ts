/**
 * Describes a single folder-structure violation detected during path validation.
 */
export interface StructureViolation {
  /** The file path that failed validation. */
  filePath: string;
  /** Human-readable explanation of why the path is not approved. */
  message: string;
  /** Suggested corrected path when one can be inferred. */
  suggestion?: string;
}

/**
 * Approved path patterns for Angular application files.
 *
 * Primary patterns (strict — used by validate_project_structure):
 *   - src/app/features/<feature>/...
 *   - src/app/shared/ui/...
 *   - src/app/shared/data-access/...
 *
 * Secondary patterns (allowed with architect approval — used by review tools):
 *   - src/app/core/...
 *   - src/app/layout/...
 */
const APPROVED_PATH_PATTERNS: RegExp[] = [
  /^src\/app\/features\/[a-z0-9]+(?:-[a-z0-9]+)*\//,
  /^src\/app\/shared\/ui\//,
  /^src\/app\/shared\/data-access\//,
];

/** Extended patterns that are valid but require explicit architectural scope. */
const EXTENDED_PATH_PATTERNS: RegExp[] = [
  /^src\/app\/core\//,
  /^src\/app\/layout\//,
];

/** Common anti-patterns mapped to suggested corrections. */
const KNOWN_BAD_PATTERNS: Array<{
  pattern: RegExp;
  message: string;
  suggestion: (filePath: string) => string | undefined;
}> = [
  {
    pattern: /^src\/app\/components\//,
    message: 'Components must not live directly under src/app/components/.',
    suggestion: (p) => p.replace(/^src\/app\/components\//, 'src/app/features/<feature>/components/'),
  },
  {
    pattern: /^src\/services\//,
    message: 'Services must not live under src/services/.',
    suggestion: (p) => p.replace(/^src\/services\//, 'src/app/shared/data-access/'),
  },
  {
    pattern: /^src\/app\/[a-z0-9-]+\/[^/]+\.component\.ts$/,
    message: 'Feature components must live under src/app/features/<feature>/.',
    suggestion: (p) => {
      const match = p.match(/^src\/app\/([a-z0-9-]+)\/(.+)$/);
      if (!match) return undefined;
      return `src/app/features/${match[1]}/${match[2]}`;
    },
  },
];

/**
 * Normalizes a file path for consistent validation:
 * - Converts backslashes to forward slashes
 * - Removes leading `./`
 * - Lowercases only the directory segments (not filenames) for comparison
 */
export function normalizeFilePath(filePath: string): string {
  return filePath.replace(/\\/g, '/').replace(/^\.\//, '');
}

/**
 * Service for validating that generated or modified file paths conform to the
 * company's approved Angular folder structure.
 */
export class StructureService {
  /**
   * Validates a list of file paths against approved locations.
   * Returns all violations found (empty array means all paths are valid).
   */
  validatePaths(filePaths: string[]): StructureViolation[] {
    const violations: StructureViolation[] = [];

    for (const rawPath of filePaths) {
      const filePath = normalizeFilePath(rawPath);

      if (this.isApprovedPath(filePath)) {
        continue;
      }

      const knownViolation = this.matchKnownBadPattern(filePath);
      if (knownViolation) {
        violations.push(knownViolation);
        continue;
      }

      violations.push({
        filePath,
        message:
          'File path is outside approved locations. Allowed: src/app/features/<feature>/, src/app/shared/ui/, src/app/shared/data-access/.',
        suggestion: this.inferSuggestion(filePath),
      });
    }

    return violations;
  }

  /** Returns true when the path matches a primary or extended approved pattern. */
  isApprovedPath(filePath: string): boolean {
    const normalized = normalizeFilePath(filePath);
    return (
      APPROVED_PATH_PATTERNS.some((pattern) => pattern.test(normalized)) ||
      EXTENDED_PATH_PATTERNS.some((pattern) => pattern.test(normalized))
    );
  }

  /** Returns true only for strict primary approved patterns (no core/layout). */
  isStrictlyApprovedPath(filePath: string): boolean {
    const normalized = normalizeFilePath(filePath);
    return APPROVED_PATH_PATTERNS.some((pattern) => pattern.test(normalized));
  }

  private matchKnownBadPattern(filePath: string): StructureViolation | undefined {
    for (const { pattern, message, suggestion } of KNOWN_BAD_PATTERNS) {
      if (pattern.test(filePath)) {
        return {
          filePath,
          message,
          suggestion: suggestion(filePath),
        };
      }
    }
    return undefined;
  }

  private inferSuggestion(filePath: string): string | undefined {
    if (filePath.endsWith('.component.ts') || filePath.endsWith('.component.html')) {
      return `src/app/features/<feature>/pages/${pathBasename(filePath)}`;
    }
    if (filePath.endsWith('.service.ts')) {
      return `src/app/shared/data-access/${pathBasename(filePath)}`;
    }
    return undefined;
  }
}

/** Extracts the final path segment from a normalized file path. */
function pathBasename(filePath: string): string {
  const segments = filePath.split('/');
  return segments[segments.length - 1] ?? filePath;
}
