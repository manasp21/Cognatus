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
- Implements 13 research tools (observation, literature_review, hypothesis_formation, etc.)
- Uses Zod schemas for input validation
- Integrates with Smithery SDK for stateless server creation

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
- `observation`, `literature_review`, `hypothesis_formation`, `experiment_design`, `data_collection`, `analysis`, `conclusion`

**Research Management Tools:**
- `hypothesis_generation`, `literature_search`, `data_analysis`, `peer_review_simulation`
- `score_hypothesis`, `check_for_breakthrough`, `get_state`