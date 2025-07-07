# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Build and Development
- `npm run build` - Compile TypeScript to JavaScript in dist/src/
- `npm run watch` - Watch mode for development (builds automatically on changes)
- `npm run prepare` - Runs build (executed automatically during npm install)

### Running the Server
- `npx @modelcontextprotocol/cognatus-server` - Run the published package
- `node dist/src/index.js` - Run the built server directly (stdio mode)
- The server runs on stdio transport for MCP communication

## Architecture

### Core Components

**ScientificMethodEngine** - The main engine implementing a state machine for scientific research workflow:
- Manages sequential research stages: Observation → Literature Review → Hypothesis Formation → Experiment Design → Data Collection → Analysis → Conclusion
- Tracks research state including problem statement, literature, hypotheses, experiments, data, and conclusions
- Enforces valid stage transitions via `STAGE_TRANSITIONS` map

**MCP Server Integration** - Built using Model Context Protocol SDK:
- Implements 13+ research tools focused on ethical research guidance
- Uses Zod schemas for input validation
- Integrates with Smithery SDK for stateless server creation
- Provides authentic research workflow without fake content generation

**State Management** - Research state contains:
- `currentStage`: Current research phase
- `hypotheses`: Array of hypotheses with unique IDs and evidence scores
- `literature`, `experiments`, `data`, `conclusions`: Arrays tracking research artifacts

### Key Features

**Primary Unified Tool** - `scientific_thinking` tool provides guided workflow through all 7 research stages with contextual guidance and next-step suggestions

**Sequential Process Enforcement** - Each stage must complete before advancing to the next, with some stages allowing loops (e.g., hypothesis formation can return to itself)

**Enhanced Error Handling** - Robust input validation, error recovery, and detailed error messages for better user experience

**Hypothesis Scoring & Breakthrough Detection** - Evidence scoring (0-1) with automatic breakthrough detection and confidence indicators

**Improved State Management** - Better state tracking with detailed progress information and stage guidance

**Ethical Literature Search** - Provides optimized search query generation and guidance without creating fake academic content. Maintains research integrity by requiring agents to use real web search tools

**Research Integrity Commitment** - Never generates fake papers, authors, DOIs, or citations. All literature search functionality guides users to authentic research sources

## Technology Stack

- **Runtime**: Node.js with TypeScript (ES2022, NodeNext modules)
- **MCP SDK**: @modelcontextprotocol/sdk v1.10.0 for Model Context Protocol implementation
- **Validation**: Zod for input schema validation
- **CLI**: chalk for colored console output, yargs for command-line parsing

## Development Notes

- Entry point is `src/index.ts` which compiles to `dist/src/index.js`
- Server uses stdio transport for MCP communication
- Robust error handling with `safeExecute` wrapper and input validation
- Enhanced logging with colored console output (uses stderr to avoid MCP interference)
- All MCP tools return content in format `{ content: [{ type: "text", text: string }] }`
- Docker deployment supported with updated Dockerfile (renamed from Dockerfile.txt)

## Available Tools

**Primary Tool:**
- `scientific_thinking` - Unified interface for complete 7-stage research workflow

**Individual Stage Tools:**
- `observation` - Problem identification 
- `literature_review` - Background research with optional web search guidance (autoSearch parameter provides search query recommendations)
- `hypothesis_formation`, `experiment_design`, `data_collection`, `analysis`, `conclusion` - Sequential research stages

**Research Management Tools:**
- `hypothesis_generation` - Create multiple competing hypotheses with automatic scoring
- `literature_search` - Ethical literature search guidance providing optimized search queries and database-specific recommendations for PubMed, arXiv, Google Scholar, IEEE, and Scopus. **Requires agents to use external web search tools** - generates no fake content
- `data_analysis` - Advanced statistical analysis including descriptive statistics (mean, median, mode, standard deviation), inferential statistics (t-tests, confidence intervals), correlation analysis (Pearson correlation), regression analysis (linear regression with R-squared), and hypothesis testing (normality tests, significance testing)
- `peer_review_simulation` - Multi-perspective peer review with 4 reviewer types (skeptical, supportive, methodological, statistical) and 5 focus areas (hypotheses, methodology, data, conclusions, overall), providing detailed critique, suggestions, and confidence ratings
- `score_hypothesis`, `check_for_breakthrough`, `get_state`