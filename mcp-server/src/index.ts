#!/usr/bin/env node

/**
 * angular-standard-ai MCP Server
 *
 * Central Model Context Protocol server for company-wide Angular standards.
 * Exposes tools for reading rules, analyzing requirements, validating code,
 * checking folder structure, and reviewing pull requests.
 *
 * Transport: stdio (JSON-RPC over stdin/stdout)
 * IMPORTANT: Use console.error() for logging — stdout is reserved for MCP protocol messages.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { RequirementService } from './services/requirement.service.js';
import { RulesService } from './services/rules.service.js';
import { StructureService } from './services/structure.service.js';
import {
  ValidationService,
  type SourceFileInput,
} from './services/validation.service.js';

/** MCP server metadata — name must match configuration in client apps. */
const SERVER_NAME = 'angular-standard-ai';
const SERVER_VERSION = '1.0.0';

/** Shared service instances reused across all tool handlers. */
const rulesService = new RulesService();
const structureService = new StructureService();
const validationService = new ValidationService(structureService);
const requirementService = new RequirementService(rulesService, structureService);

/** Zod schema for a single source file passed to validation/review tools. */
const sourceFileSchema = z.object({
  filePath: z
    .string()
    .describe('Relative file path (e.g. src/app/features/payments/payment-list.component.ts)'),
  content: z.string().describe('Full source code content of the file'),
});

/** Creates the MCP server instance with all tools registered. */
function createServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  registerGetAngularRules(server);
  registerRequirementTaker(server);
  registerValidateAngularCode(server);
  registerValidateProjectStructure(server);
  registerReviewAngularPr(server);

  return server;
}

/**
 * Tool: get_angular_rules
 * Returns all markdown rule documents from the central rules/ directory.
 */
function registerGetAngularRules(server: McpServer): void {
  server.registerTool(
    'get_angular_rules',
    {
      description:
        'Read and return all markdown rule files from the central rules/ directory. ' +
        'Use this as the single source of truth for Angular company standards.',
      inputSchema: z.object({
        fileName: z
          .string()
          .optional()
          .describe(
            'Optional: return a single rule file by name (e.g. "signals.md"). Omit to return all rules.',
          ),
      }),
    },
    async ({ fileName }) => {
      if (fileName) {
        const doc = await rulesService.getRuleByName(fileName);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  fileName: doc.fileName,
                  path: doc.absolutePath,
                  content: doc.content,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      const documents = await rulesService.getAllRules();
      const payload = {
        rulesDirectory: rulesService.getRulesDirectory(),
        ruleCount: documents.length,
        rules: documents.map((doc) => ({
          fileName: doc.fileName,
          path: doc.absolutePath,
          content: doc.content,
        })),
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }],
      };
    },
  );
}

/**
 * Tool: requirement_taker
 * Transforms a free-text requirement into a structured implementation plan.
 */
function registerRequirementTaker(server: McpServer): void {
  server.registerTool(
    'requirement_taker',
    {
      description:
        'Transform a user requirement into a structured plan: feature name, impacted files, ' +
        'implementation plan, acceptance criteria, risks, and Angular architecture considerations.',
      inputSchema: z.object({
        requirement: z
          .string()
          .min(10)
          .describe('The user requirement or ticket description to analyze'),
      }),
    },
    async ({ requirement }) => {
      const analysis = await requirementService.analyze(requirement);

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(analysis, null, 2),
          },
        ],
      };
    },
  );
}

/**
 * Tool: validate_angular_code
 * Validates Angular source code against company standards.
 * Returns PASSED or FAILED with detailed violations.
 */
function registerValidateAngularCode(server: McpServer): void {
  server.registerTool(
    'validate_angular_code',
    {
      description:
        'Validate Angular code against company standards. Checks for prohibited patterns ' +
        '(.subscribe in components, BehaviorSubject/Subject state, non-standalone components, ' +
        'direct HTTP in components, folder structure) and signal best practices.',
      inputSchema: z.object({
        files: z
          .array(sourceFileSchema)
          .min(1)
          .describe('Array of source files to validate'),
      }),
    },
    async ({ files }) => {
      const result = validationService.validateFiles(files as SourceFileInput[]);

      const output = {
        status: result.status,
        summary: result.summary,
        violationCount: result.violations.length,
        errors: result.violations.filter((v) => v.severity === 'error'),
        warnings: result.violations.filter((v) => v.severity === 'warning'),
        violations: result.violations,
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(output, null, 2) }],
      };
    },
  );
}

/**
 * Tool: validate_project_structure
 * Validates that file paths are within approved Angular folder locations.
 */
function registerValidateProjectStructure(server: McpServer): void {
  server.registerTool(
    'validate_project_structure',
    {
      description:
        'Validate that generated file paths are within approved locations: ' +
        'src/app/features/<feature>/, src/app/shared/ui/, src/app/shared/data-access/.',
      inputSchema: z.object({
        filePaths: z
          .array(z.string())
          .min(1)
          .describe('Array of relative file paths to validate'),
      }),
    },
    async ({ filePaths }) => {
      const result = validationService.validatePathsOnly(filePaths);

      const output = {
        status: result.status,
        summary: result.summary,
        approvedPatterns: [
          'src/app/features/<feature>/',
          'src/app/shared/ui/',
          'src/app/shared/data-access/',
        ],
        violations: result.violations.map((v) => ({
          rule: v.rule,
          filePath: v.snippet,
          message: v.message,
        })),
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(output, null, 2) }],
      };
    },
  );
}

/**
 * Tool: review_angular_pr
 * Comprehensive PR review combining architecture, signals, structure,
 * maintainability, and performance analysis.
 */
function registerReviewAngularPr(server: McpServer): void {
  server.registerTool(
    'review_angular_pr',
    {
      description:
        'Review Angular code changes and return architecture issues, signal violations, ' +
        'folder structure violations, maintainability concerns, and performance concerns.',
      inputSchema: z.object({
        files: z
          .array(sourceFileSchema)
          .min(1)
          .describe('Array of changed source files in the pull request'),
        prDescription: z
          .string()
          .optional()
          .describe('Optional PR description or ticket context for additional review context'),
      }),
    },
    async ({ files, prDescription }) => {
      const sourceFiles = files as SourceFileInput[];
      const validationResult = validationService.validateFiles(sourceFiles);

      const architectureIssues = validationService.getArchitectureViolations(sourceFiles);
      const signalViolations = validationService.getSignalViolations(sourceFiles);
      const maintainabilityConcerns = validationService.getMaintainabilityConcerns(sourceFiles);
      const performanceConcerns = validationService.getPerformanceConcerns(sourceFiles);

      const folderStructureViolations = validationResult.violations.filter(
        (v) => v.rule === 'APPROVED_FOLDER_STRUCTURE',
      );

      const errorCount =
        architectureIssues.filter((v) => v.severity === 'error').length +
        signalViolations.filter((v) => v.severity === 'error').length +
        folderStructureViolations.length;

      const review = {
        verdict: errorCount === 0 ? 'APPROVE_WITH_NOTES' : 'REQUEST_CHANGES',
        summary: validationResult.summary,
        prDescription: prDescription ?? null,
        architectureIssues,
        signalViolations,
        folderStructureViolations,
        maintainabilityConcerns,
        performanceConcerns,
        totals: {
          errors: errorCount,
          warnings:
            maintainabilityConcerns.length +
            performanceConcerns.length +
            validationResult.violations.filter((v) => v.severity === 'warning').length,
        },
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(review, null, 2) }],
      };
    },
  );
}

/** Bootstraps the MCP server with stdio transport. */
async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();

  // stderr only — stdout carries MCP JSON-RPC messages
  console.error(`[${SERVER_NAME}] v${SERVER_VERSION} starting on stdio transport...`);
  console.error(`[${SERVER_NAME}] Rules directory: ${rulesService.getRulesDirectory()}`);

  await server.connect(transport);

  console.error(`[${SERVER_NAME}] Ready — waiting for client connections.`);
}

main().catch((error: unknown) => {
  console.error(`[${SERVER_NAME}] Fatal error:`, error);
  process.exit(1);
});
