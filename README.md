# Cognatus MCP Server

An MCP server implementation that provides a sequential thinking process for scientific research.

## Features

- **Sequential Scientific Process:** Each stage builds on the previous one
- **Hypothesis Tracking:** Store and manage multiple hypotheses with evidence
- **Evidence Collection:** Systematically gather supporting/contradicting data
- **Breakthrough Detection:** Identify patterns and anomalies for novel discoveries
- **Multi-perspective Analysis:** Simulate peer review and alternative viewpoints
- **Hybrid Web Search Integration:** Real web search capabilities with automatic fallback to simulation
- **Intelligent Literature Discovery:** Automatic web search based on problem statements

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

### Web Search Integration

Cognatus supports hybrid web search capabilities that enhance literature review and research with real web data. Configure web search by adding the following to your MCP server configuration:

```json
{
  "mcpServers": {
    "cognatus": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/cognatus-server"],
      "env": {
        "WEB_SEARCH_ENABLED": "true",
        "WEB_SEARCH_PREFER_REAL": "true",
        "WEB_SEARCH_FALLBACK": "true"
      }
    }
  }
}
```

**Web Search Features:**
- **Real-time Literature Search**: Access current research via web search APIs
- **Automatic Fallback**: Falls back to simulation if web search is unavailable
- **Problem-based Auto-search**: Automatically searches web when `autoSearch=true` in literature review
- **Hybrid Results**: Combines real web results with academic database simulations

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
