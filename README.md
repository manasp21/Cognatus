# Cognatus MCP Server

An MCP server implementation that provides a sequential thinking process for scientific research.

## Features

- **Sequential Scientific Process:** Each stage builds on the previous one
- **Hypothesis Tracking:** Store and manage multiple hypotheses with evidence
- **Evidence Collection:** Systematically gather supporting/contradicting data
- **Breakthrough Detection:** Identify patterns and anomalies for novel discoveries
- **Multi-perspective Analysis:** Simulate peer review and alternative viewpoints

## Tools

- `observation` - Problem identification
- `literature_review` - Background research  
- `hypothesis_formation` - Generate testable hypotheses
- `experiment_design` - Design testing methodology
- `data_collection` - Gather evidence
- `analysis` - Analyze results
- `conclusion` - Draw conclusions and refine theory
- `hypothesis_generation` - Create multiple competing hypotheses
- `experiment_design` - Design systematic tests
- `literature_search` - Comprehensive academic database search with realistic results from PubMed, arXiv, Google Scholar, IEEE, and Scopus
- `data_analysis` - Advanced statistical analysis including descriptive statistics, inferential statistics, correlation analysis, regression analysis, and hypothesis testing
- `peer_review_simulation` - Multi-perspective peer review with 4 reviewer types (skeptical, supportive, methodological, statistical) and 5 focus areas (hypotheses, methodology, data, conclusions, overall)

## Installation

### NPX (Recommended)

```bash
npx @modelcontextprotocol/cognatus-server
```

### Clone and Build

```bash
git clone <repository-url>
cd cognatus-mcp
npm install
npm run build
```

## Configuration

### Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cognatus": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/cognatus-server"
      ]
    }
  }
}
```

### Docker

```json
{
  "mcpServers": {
    "cognatus": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "mcp/cognatus"
      ]
    }
  }
}
```

### VS Code

For VS Code integration, add to your User Settings (JSON) or `.vscode/mcp.json`:

**NPX Installation:**
```json
{
  "mcp": {
    "servers": {
      "cognatus": {
        "command": "npx",
        "args": [
          "-y",
          "@modelcontextprotocol/cognatus-server"
        ]
      }
    }
  }
}
```

**Docker Installation:**
```json
{
  "mcp": {
    "servers": {
      "cognatus": {
        "command": "docker",
        "args": [
          "run",
          "--rm",
          "-i",
          "mcp/cognatus"
        ]
      }
    }
  }
}
```
