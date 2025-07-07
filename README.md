# Cognatus MCP Server

An MCP server implementation that provides a sequential thinking process for scientific research.

## Features

- **Sequential Scientific Process:** Each stage builds on the previous one
- **Hypothesis Tracking:** Store and manage multiple hypotheses with evidence
- **Evidence Collection:** Systematically gather supporting/contradicting data
- **Breakthrough Detection:** Identify patterns and anomalies for novel discoveries
- **Multi-perspective Analysis:** Provides guidance for conducting peer review and alternative viewpoints
- **Ethical Literature Search:** Provides optimized search guidance requiring agents to use real web search tools
- **Research Integrity:** No fake papers, authors, or citations - only authentic research guidance

## Tools

- `scientific_thinking` - Complete scientific research process with sequential 7-stage workflow
- `observation` - Problem identification
- `literature_review` - Background research  
- `hypothesis_formation` - Generate testable hypotheses
- `hypothesis_generation` - Create multiple competing hypotheses
- `experiment_design` - Design testing methodology
- `data_collection` - Gather evidence
- `analysis` - Analyze results
- `conclusion` - Draw conclusions and refine theory
- `literature_search` - Generate optimized search queries and provide guidance for academic literature search. **Requires agent to use external web search tools** - no fake papers generated
- `data_analysis_guidance` - Provides guidance for data analysis - **agent performs the actual statistical calculations**
- `peer_review_guidance` - Provides guidance for conducting peer review with 4 reviewer styles (skeptical, supportive, methodological, statistical) and 5 focus areas (hypotheses, methodology, data, conclusions, overall) - **agent conducts the actual review**
- `research_methodology_guidance` - Comprehensive guidance for selecting and implementing research methodologies across all domains (quantitative, qualitative, mixed-methods, theoretical, computational, meta-analysis)
- `meta_research_guidance` - Research integrity, ethics, reproducibility, and best practices guidance across the entire research lifecycle
- `score_hypothesis` - Assign evidence scores to specific hypotheses for breakthrough detection
- `check_for_breakthrough` - Evaluate current research progress and breakthrough potential
- `get_state` - View comprehensive research state and progress overview

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

### Literature Search Ethics

Cognatus maintains research integrity by **never generating fake papers, authors, or citations**. Instead, it provides:

- **Optimized Search Queries**: Generates targeted academic search terms
- **Database-Specific Guidance**: Tailored recommendations for PubMed, arXiv, Google Scholar, IEEE, and Scopus
- **Search Strategy Tips**: Best practices for academic literature discovery
- **Agent Responsibility**: Requires agents to use their own web search tools for authentic results

**Important**: The `literature_search` tool provides guidance only - actual research must be conducted using real web search capabilities.

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
