import { RulesService } from './rules.service.js';
import { StructureService } from './structure.service.js';

/** Structured output from the requirement_taker tool. */
export interface RequirementAnalysis {
  featureName: string;
  filesImpacted: string[];
  implementationPlan: string[];
  acceptanceCriteria: string[];
  risks: string[];
  angularArchitectureConsiderations: string[];
}

/**
 * Transforms a free-text user requirement into a structured implementation plan
 * aligned with company Angular standards. The analysis is rule-driven: it reads
 * the central rules/ documents to ensure consistency across all Angular projects.
 */
export class RequirementService {
  private readonly rulesService: RulesService;
  private readonly structureService: StructureService;

  constructor(rulesService?: RulesService, structureService?: StructureService) {
    this.rulesService = rulesService ?? new RulesService();
    this.structureService = structureService ?? new StructureService();
  }

  /**
   * Analyzes a user requirement and returns a structured plan.
   * Uses heuristics on the requirement text combined with loaded rules context.
   */
  async analyze(requirement: string): Promise<RequirementAnalysis> {
    const rules = await this.rulesService.getAllRules();
    const featureName = this.extractFeatureName(requirement);
    const filesImpacted = this.inferImpactedFiles(requirement, featureName);
    const structureViolations = this.structureService.validatePaths(filesImpacted);

    return {
      featureName,
      filesImpacted,
      implementationPlan: this.buildImplementationPlan(requirement, featureName, rules),
      acceptanceCriteria: this.buildAcceptanceCriteria(requirement, featureName),
      risks: this.identifyRisks(requirement, structureViolations.length > 0),
      angularArchitectureConsiderations: this.buildArchitectureConsiderations(rules),
    };
  }

  /**
   * Derives a kebab-case feature name from the requirement text.
   * Falls back to "new-feature" when no clear name can be inferred.
   */
  private extractFeatureName(requirement: string): string {
    // Look for explicit feature mentions: "feature: payments", "for the payments module"
    const explicitMatch = requirement.match(
      /(?:feature|module|page)\s*[:\-]?\s*['"]?([a-z][a-z0-9-]*)/i,
    );
    if (explicitMatch?.[1]) {
      return explicitMatch[1].toLowerCase().replace(/\s+/g, '-');
    }

    // Extract capitalized words and convert to kebab-case
    const capitalizedWords = requirement.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g);
    if (capitalizedWords?.[0]) {
      return capitalizedWords[0].toLowerCase().replace(/\s+/g, '-');
    }

    // Use first significant noun phrase (3+ letter words)
    const words = requirement
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

    if (words.length > 0) {
      return words.slice(0, 2).join('-');
    }

    return 'new-feature';
  }

  /** Infers likely file paths based on requirement keywords. */
  private inferImpactedFiles(requirement: string, featureName: string): string[] {
    const files: string[] = [];
    const lower = requirement.toLowerCase();

    // Always include feature route entry when building a feature
    files.push(`src/app/features/${featureName}/${featureName}.routes.ts`);

    if (/component|page|screen|view|ui|display|show|render/.test(lower)) {
      const pageName = this.extractPageName(requirement) ?? `${featureName}-page`;
      files.push(`src/app/features/${featureName}/pages/${pageName}/${pageName}.component.ts`);
      files.push(`src/app/features/${featureName}/pages/${pageName}/${pageName}.component.html`);
      files.push(`src/app/features/${featureName}/pages/${pageName}/${pageName}.component.scss`);
    }

    if (/service|api|http|fetch|endpoint|data/.test(lower)) {
      files.push(`src/app/features/${featureName}/data-access/${featureName}-api.service.ts`);
    }

    if (/shared|reusable|design system|button|dialog|table|input/.test(lower)) {
      const componentName = this.extractComponentName(requirement) ?? 'ui-component';
      files.push(`src/app/shared/ui/${componentName}/${componentName}.component.ts`);
    }

    if (/model|interface|type/.test(lower)) {
      files.push(`src/app/features/${featureName}/models/${featureName}.model.ts`);
    }

    return [...new Set(files)];
  }

  private extractPageName(requirement: string): string | undefined {
    const match = requirement.match(/(?:page|screen)\s*[:\-]?\s*['"]?([a-z][a-z0-9-]*)/i);
    return match?.[1]?.toLowerCase();
  }

  private extractComponentName(requirement: string): string | undefined {
    const match = requirement.match(/(?:component)\s*[:\-]?\s*['"]?([a-z][a-z0-9-]*)/i);
    return match?.[1]?.toLowerCase();
  }

  private buildImplementationPlan(
    requirement: string,
    featureName: string,
    rules: Awaited<ReturnType<RulesService['getAllRules']>>,
  ): string[] {
    const plan: string[] = [
      `Create or extend feature module at src/app/features/${featureName}/.`,
      'Define lazy-loaded routes in the feature routes file.',
      'Implement UI with standalone components using ChangeDetectionStrategy.OnPush.',
      'Use signal()-based state; bridge observables with toSignal() where needed.',
      'Place API logic in data-access services — no HTTP in components.',
    ];

    if (/form|input|submit|validation/.test(requirement.toLowerCase())) {
      plan.push('Implement forms using signal-based or reactive forms per project standards.');
    }

    if (/test|spec/.test(requirement.toLowerCase())) {
      plan.push('Add component and service unit tests following testing fundamentals.');
    }

    // Reference loaded rules for traceability
    const ruleNames = rules.map((r) => r.fileName).join(', ');
    plan.push(`Validate against company rules: ${ruleNames}.`);

    return plan;
  }

  private buildAcceptanceCriteria(requirement: string, featureName: string): string[] {
    const criteria: string[] = [
      `Feature "${featureName}" is accessible via lazy-loaded route.`,
      'All components are standalone with OnPush change detection.',
      'No .subscribe(), BehaviorSubject, or Subject usage in components.',
      'All API calls go through data-access services.',
      'File paths conform to approved folder structure.',
      'npm run typecheck, lint, and build:prod pass without errors.',
    ];

    // Extract numbered or bulleted items from the requirement itself
    const numberedItems = requirement.match(/(?:^\s*\d+[\.\)]\s*.+$)/gm);
    if (numberedItems) {
      criteria.push(...numberedItems.map((item) => item.replace(/^\s*\d+[\.\)]\s*/, '').trim()));
    }

    return criteria;
  }

  private identifyRisks(requirement: string, hasStructureIssues: boolean): string[] {
    const risks: string[] = [];
    const lower = requirement.toLowerCase();

    if (/legacy|migrate|refactor/.test(lower)) {
      risks.push('Migration may introduce regressions in existing feature behavior.');
    }
    if (/api|backend|endpoint/.test(lower)) {
      risks.push('Backend API contract may not be finalized — confirm request/response shapes.');
    }
    if (/third.?party|library|package|npm/.test(lower)) {
      risks.push('New dependency requires explicit approval per company policy.');
    }
    if (hasStructureIssues) {
      risks.push('Inferred file paths may fall outside approved folder structure — review with architect.');
    }
    if (/performance|large|bulk|pagination/.test(lower)) {
      risks.push('Performance impact on list rendering — ensure @for track and pagination strategy.');
    }

    if (risks.length === 0) {
      risks.push('Standard implementation risk — validate with QA before merge.');
    }

    return risks;
  }

  private buildArchitectureConsiderations(
    rules: Awaited<ReturnType<RulesService['getAllRules']>>,
  ): string[] {
    const considerations: string[] = [
      'Use standalone components only — no NgModules.',
      'Prefer signals (signal, computed, input, output) for all component state.',
      'Delegate HTTP/API access to shared/data-access or feature data-access services.',
      'Place reusable UI in src/app/shared/ui/ — never import third-party UI in features.',
      'Use modern template control flow: @if, @for, @switch.',
      'Apply inject() for dependency injection.',
    ];

    // Surface key headings from loaded rules for context
    for (const rule of rules) {
      if (rule.fileName === 'signals.md') {
        considerations.push('Refer to signals.md: use toSignal() when bridging RxJS observables.');
      }
      if (rule.fileName === 'folder-structure.md') {
        considerations.push('Refer to folder-structure.md: keep all feature code under src/app/features/<feature>/.');
      }
    }

    return considerations;
  }
}

/** Common English stop words excluded from feature name extraction. */
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'need', 'want',
  'create', 'build', 'implement', 'add', 'update', 'make', 'user', 'should',
]);
