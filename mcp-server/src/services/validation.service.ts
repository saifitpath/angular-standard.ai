import { StructureService, type StructureViolation } from './structure.service.js';

/** Severity level for a code-standard violation. */
export type ViolationSeverity = 'error' | 'warning';

/** A single violation detected during Angular code validation. */
export interface CodeViolation {
  /** Rule identifier (e.g. `NO_SUBSCRIBE_IN_COMPONENT`). */
  rule: string;
  severity: ViolationSeverity;
  message: string;
  /** Optional line number when the violation can be located in source. */
  line?: number;
  /** Optional snippet of offending code. */
  snippet?: string;
}

/** Overall validation result returned by validate_angular_code. */
export interface ValidationResult {
  status: 'PASSED' | 'FAILED';
  violations: CodeViolation[];
  summary: string;
}

/** Input shape for validating a single source file. */
export interface SourceFileInput {
  /** Relative path within the Angular project (e.g. src/app/features/payments/...). */
  filePath: string;
  /** Full TypeScript/HTML source content. */
  content: string;
}

/**
 * Declarative rule definition used by the validation engine.
 * Each rule provides a detector function that returns violations for a given file.
 */
interface ValidationRule {
  id: string;
  severity: ViolationSeverity;
  description: string;
  /** Returns violations when the rule is broken; empty array when compliant. */
  detect: (file: SourceFileInput) => CodeViolation[];
}

/**
 * Shared validation engine for Angular company standards.
 * Used by validate_angular_code and review_angular_pr tools.
 */
export class ValidationService {
  private readonly structureService: StructureService;
  private readonly rules: ValidationRule[];

  constructor(structureService?: StructureService) {
    this.structureService = structureService ?? new StructureService();
    this.rules = this.buildRules();
  }

  /**
   * Validates one or more source files against all company Angular rules.
   * Returns PASSED when no error-severity violations are found.
   */
  validateFiles(files: SourceFileInput[]): ValidationResult {
    const violations: CodeViolation[] = [];

    for (const file of files) {
      for (const rule of this.rules) {
        violations.push(...rule.detect(file));
      }

      // Folder structure is validated per file path
      const structureViolations = this.structureService.validatePaths([file.filePath]);
      violations.push(...this.mapStructureViolations(structureViolations));
    }

    const errors = violations.filter((v) => v.severity === 'error');
    const status: ValidationResult['status'] = errors.length === 0 ? 'PASSED' : 'FAILED';

    return {
      status,
      violations,
      summary: this.buildSummary(status, violations),
    };
  }

  /** Validates file paths only (no source content required). */
  validatePathsOnly(filePaths: string[]): ValidationResult {
    const structureViolations = this.structureService.validatePaths(filePaths);
    const violations = this.mapStructureViolations(structureViolations);
    const errors = violations.filter((v) => v.severity === 'error');
    const status: ValidationResult['status'] = errors.length === 0 ? 'PASSED' : 'FAILED';

    return {
      status,
      violations,
      summary: this.buildSummary(status, violations),
    };
  }

  /** Returns signal-related violations only (for PR review categorization). */
  getSignalViolations(files: SourceFileInput[]): CodeViolation[] {
    const signalRuleIds = new Set([
      'NO_SUBSCRIBE_IN_COMPONENT',
      'NO_BEHAVIOR_SUBJECT_IN_COMPONENT',
      'NO_SUBJECT_IN_COMPONENT',
      'PREFER_TOSIGNAL',
    ]);

    const allViolations: CodeViolation[] = [];
    for (const file of files) {
      for (const rule of this.rules) {
        if (signalRuleIds.has(rule.id)) {
          allViolations.push(...rule.detect(file));
        }
      }
    }
    return allViolations;
  }

  /** Returns architecture-related violations (standalone, HTTP, structure). */
  getArchitectureViolations(files: SourceFileInput[]): CodeViolation[] {
    const architectureRuleIds = new Set([
      'STANDALONE_COMPONENT',
      'NO_HTTP_IN_COMPONENT',
      'APPROVED_FOLDER_STRUCTURE',
    ]);

    const allViolations: CodeViolation[] = [];
    for (const file of files) {
      for (const rule of this.rules) {
        if (architectureRuleIds.has(rule.id)) {
          allViolations.push(...rule.detect(file));
        }
      }
    }
    return allViolations;
  }

  /** Heuristic maintainability checks for PR review. */
  getMaintainabilityConcerns(files: SourceFileInput[]): CodeViolation[] {
    const concerns: CodeViolation[] = [];

    for (const file of files) {
      if (!file.filePath.endsWith('.component.ts')) continue;

      // Detect `: any` usage without justification comment on the same line
      const anyMatches = findLineMatches(file.content, /:\s*any\b(?!\s*\/\/)/g);
      for (const match of anyMatches) {
        concerns.push({
          rule: 'NO_ANY_TYPE',
          severity: 'warning',
          message: 'Avoid `any` types; use explicit interfaces or document justification.',
          line: match.line,
          snippet: match.snippet,
        });
      }

      // Detect legacy structural directives
      if (file.content.includes('*ngIf') || file.content.includes('*ngFor')) {
        concerns.push({
          rule: 'LEGACY_CONTROL_FLOW',
          severity: 'warning',
          message: 'Use modern control flow (@if, @for) instead of *ngIf/*ngFor.',
        });
      }

      // Detect constructor injection instead of inject()
      if (/constructor\s*\([^)]*(?:private|public|protected|readonly)/.test(file.content)) {
        concerns.push({
          rule: 'PREFER_INJECT_FUNCTION',
          severity: 'warning',
          message: 'Prefer inject() over constructor parameter injection.',
        });
      }
    }

    return concerns;
  }

  /** Heuristic performance checks for PR review. */
  getPerformanceConcerns(files: SourceFileInput[]): CodeViolation[] {
    const concerns: CodeViolation[] = [];

    for (const file of files) {
      const isTemplate =
        file.filePath.endsWith('.component.html') ||
        (file.filePath.endsWith('.component.ts') && file.content.includes('template:'));

      if (!isTemplate) continue;

      // @for without track
      if (/@for\s*\([^)]*\)\s*\{/.test(file.content) && !/@for\s*\([^)]*track/.test(file.content)) {
        concerns.push({
          rule: 'FOR_TRACK_REQUIRED',
          severity: 'warning',
          message: '@for blocks must include a track expression for optimal DOM reuse.',
        });
      }

      // Default change detection
      if (
        file.filePath.endsWith('.component.ts') &&
        !file.content.includes('ChangeDetectionStrategy.OnPush')
      ) {
        concerns.push({
          rule: 'ON_PUSH_REQUIRED',
          severity: 'warning',
          message: 'Components should use ChangeDetectionStrategy.OnPush.',
        });
      }

      // Method calls in template (heuristic)
      const templateMethodCalls = findLineMatches(file.content, /\{\{\s*\w+\([^)]*\)\s*\}\}/g);
      for (const match of templateMethodCalls) {
        concerns.push({
          rule: 'AVOID_TEMPLATE_METHODS',
          severity: 'warning',
          message: 'Avoid calling methods in templates; use computed() signals instead.',
          line: match.line,
          snippet: match.snippet,
        });
      }
    }

    return concerns;
  }

  private buildRules(): ValidationRule[] {
    return [
      {
        id: 'NO_SUBSCRIBE_IN_COMPONENT',
        severity: 'error',
        description: 'Components must not call .subscribe() directly.',
        detect: (file) => {
          if (!isComponentFile(file)) return [];
          return findLineMatches(file.content, /\.subscribe\s*\(/g).map((match) => ({
            rule: 'NO_SUBSCRIBE_IN_COMPONENT',
            severity: 'error' as const,
            message: 'Do not use .subscribe() inside components. Use toSignal() or delegate to a service.',
            line: match.line,
            snippet: match.snippet,
          }));
        },
      },
      {
        id: 'NO_BEHAVIOR_SUBJECT_IN_COMPONENT',
        severity: 'error',
        description: 'Components must not use BehaviorSubject for state.',
        detect: (file) => {
          if (!isComponentFile(file)) return [];
          if (!/BehaviorSubject/.test(file.content)) return [];
          return [
            {
              rule: 'NO_BEHAVIOR_SUBJECT_IN_COMPONENT',
              severity: 'error' as const,
              message: 'Do not use BehaviorSubject for component state. Use signal() instead.',
            },
          ];
        },
      },
      {
        id: 'NO_SUBJECT_IN_COMPONENT',
        severity: 'error',
        description: 'Components must not use Subject/ReplaySubject for state.',
        detect: (file) => {
          if (!isComponentFile(file)) return [];
          const violations: CodeViolation[] = [];

          if (/\bSubject\b/.test(file.content) && !/BehaviorSubject/.test(file.content.replace(/BehaviorSubject/g, ''))) {
            violations.push({
              rule: 'NO_SUBJECT_IN_COMPONENT',
              severity: 'error',
              message: 'Do not use Subject for component state. Use signal() instead.',
            });
          }

          if (/ReplaySubject/.test(file.content)) {
            violations.push({
              rule: 'NO_SUBJECT_IN_COMPONENT',
              severity: 'error',
              message: 'Do not use ReplaySubject for component state. Use signal() instead.',
            });
          }

          return violations;
        },
      },
      {
        id: 'STANDALONE_COMPONENT',
        severity: 'error',
        description: 'All components must be standalone.',
        detect: (file) => {
          if (!file.filePath.endsWith('.component.ts')) return [];
          if (/@Component\s*\(\{[^}]*standalone\s*:\s*false/s.test(file.content)) {
            return [
              {
                rule: 'STANDALONE_COMPONENT',
                severity: 'error',
                message: 'Components must be standalone (standalone: false is prohibited).',
              },
            ];
          }
          // NgModule-based components (non-standalone legacy pattern)
          if (/@NgModule/.test(file.content)) {
            return [
              {
                rule: 'STANDALONE_COMPONENT',
                severity: 'error',
                message: 'NgModules are prohibited. Use standalone components.',
              },
            ];
          }
          return [];
        },
      },
      {
        id: 'NO_HTTP_IN_COMPONENT',
        severity: 'error',
        description: 'Components must not make direct HTTP/API calls.',
        detect: (file) => {
          if (!isComponentFile(file)) return [];
          const violations: CodeViolation[] = [];

          if (/import\s*\{[^}]*HttpClient[^}]*\}\s*from\s*['"]@angular\/common\/http['"]/.test(file.content)) {
            violations.push({
              rule: 'NO_HTTP_IN_COMPONENT',
              severity: 'error',
              message: 'Do not import HttpClient in components. Use a data-access service.',
            });
          }

          if (/\bfetch\s*\(/.test(file.content)) {
            violations.push({
              rule: 'NO_HTTP_IN_COMPONENT',
              severity: 'error',
              message: 'Do not call fetch() in components. Use a data-access service.',
            });
          }

          if (/\.(?:get|post|put|patch|delete)\s*\(\s*['"`https?:\/\/]/.test(file.content)) {
            violations.push({
              rule: 'NO_HTTP_IN_COMPONENT',
              severity: 'error',
              message: 'Direct API calls detected in component. Move to a service.',
            });
          }

          return violations;
        },
      },
      {
        id: 'PREFER_TOSIGNAL',
        severity: 'warning',
        description: 'Observables consumed in components should use toSignal().',
        detect: (file) => {
          if (!isComponentFile(file)) return [];
          const hasObservableAssignment = /\.(?:pipe|asObservable)\(/.test(file.content);
          const hasToSignal = /toSignal\s*\(/.test(file.content);
          if (hasObservableAssignment && !hasToSignal) {
            return [
              {
                rule: 'PREFER_TOSIGNAL',
                severity: 'warning',
                message: 'When consuming observables in components, prefer toSignal() from @angular/core/rxjs-interop.',
              },
            ];
          }
          return [];
        },
      },
      {
        id: 'APPROVED_FOLDER_STRUCTURE',
        severity: 'error',
        description: 'Feature files must stay inside approved folder structure.',
        detect: (file) => {
          const structureViolations = this.structureService.validatePaths([file.filePath]);
          return this.mapStructureViolations(structureViolations);
        },
      },
    ];
  }

  private mapStructureViolations(structureViolations: StructureViolation[]): CodeViolation[] {
    return structureViolations.map((v) => ({
      rule: 'APPROVED_FOLDER_STRUCTURE',
      severity: 'error' as const,
      message: v.suggestion ? `${v.message} Suggestion: ${v.suggestion}` : v.message,
      snippet: v.filePath,
    }));
  }

  private buildSummary(status: ValidationResult['status'], violations: CodeViolation[]): string {
    if (status === 'PASSED') {
      const warnings = violations.filter((v) => v.severity === 'warning');
      return warnings.length > 0
        ? `PASSED with ${warnings.length} warning(s).`
        : 'All checks passed. No violations found.';
    }

    const errors = violations.filter((v) => v.severity === 'error');
    const warnings = violations.filter((v) => v.severity === 'warning');
    return `FAILED: ${errors.length} error(s), ${warnings.length} warning(s).`;
  }
}

/** Returns true for Angular component TypeScript files. */
function isComponentFile(file: SourceFileInput): boolean {
  return file.filePath.endsWith('.component.ts');
}

/** Finds regex matches with 1-based line numbers and trimmed line snippets. */
function findLineMatches(
  content: string,
  pattern: RegExp,
): Array<{ line: number; snippet: string }> {
  const results: Array<{ line: number; snippet: string }> = [];
  const lines = content.split('\n');

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index] ?? '';
    if (pattern.test(line)) {
      results.push({ line: index + 1, snippet: line.trim() });
    }
    pattern.lastIndex = 0;
  }

  return results;
}
