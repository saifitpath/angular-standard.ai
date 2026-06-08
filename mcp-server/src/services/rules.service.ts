import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Describes a single markdown rule document loaded from the rules directory. */
export interface RuleDocument {
  /** File name including extension (e.g. `angular-rules.md`). */
  fileName: string;
  /** Absolute path to the file on disk. */
  absolutePath: string;
  /** Raw markdown content. */
  content: string;
}

/**
 * Resolves the repository root by walking up from this module's location.
 * The MCP server lives at `<repo>/mcp-server/src/services/`, so the repo root
 * is three levels above the `src` directory.
 */
export function resolveRepoRoot(): string {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(currentDir, '..', '..', '..');
}

/**
 * Service responsible for reading company Angular standards from the central
 * `rules/` directory. All MCP tools that need rule content should use this
 * service so rules remain a single source of truth across Angular projects.
 */
export class RulesService {
  private readonly rulesDirectory: string;

  constructor(repoRoot?: string) {
    this.rulesDirectory = path.join(repoRoot ?? resolveRepoRoot(), 'rules');
  }

  /** Returns the absolute path to the rules directory. */
  getRulesDirectory(): string {
    return this.rulesDirectory;
  }

  /**
   * Reads every `.md` file in the rules directory and returns their contents.
   * Files are sorted alphabetically for deterministic output.
   */
  async getAllRules(): Promise<RuleDocument[]> {
    const entries = await readdir(this.rulesDirectory, { withFileTypes: true });
    const markdownFiles = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));

    const documents: RuleDocument[] = [];

    for (const fileName of markdownFiles) {
      const absolutePath = path.join(this.rulesDirectory, fileName);
      const content = await readFile(absolutePath, 'utf-8');
      documents.push({ fileName, absolutePath, content });
    }

    return documents;
  }

  /**
   * Reads a specific rule file by name. Throws if the file does not exist.
   */
  async getRuleByName(fileName: string): Promise<RuleDocument> {
    const absolutePath = path.join(this.rulesDirectory, fileName);
    const content = await readFile(absolutePath, 'utf-8');
    return { fileName, absolutePath, content };
  }

  /**
   * Concatenates all rule documents into a single markdown string with headers.
   * Useful for tools that need the full standards context in one block.
   */
  async getAllRulesAsMarkdown(): Promise<string> {
    const documents = await this.getAllRules();
    return documents
      .map((doc) => `# ${doc.fileName}\n\n${doc.content}`)
      .join('\n\n---\n\n');
  }
}
