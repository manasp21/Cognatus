#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import chalk from 'chalk';

enum Stage {
  Observation = "observation",
  LiteratureReview = "literature_review",
  HypothesisFormation = "hypothesis_formation",
  ExperimentDesign = "experiment_design",
  DataCollection = "data_collection",
  Analysis = "analysis",
  Conclusion = "conclusion",
}

const STAGE_TRANSITIONS: Record<Stage, Stage[]> = {
  [Stage.Observation]: [Stage.LiteratureReview],
  [Stage.LiteratureReview]: [Stage.HypothesisFormation],
  [Stage.HypothesisFormation]: [Stage.ExperimentDesign, Stage.HypothesisFormation],
  [Stage.ExperimentDesign]: [Stage.DataCollection],
  [Stage.DataCollection]: [Stage.Analysis],
  [Stage.Analysis]: [Stage.Conclusion],
  [Stage.Conclusion]: [],
};

interface Hypothesis {
  id: string;
  description: string;
  evidenceScore: number;
}

interface ResearchState {
  currentStage: Stage;
  problemStatement: string | null;
  literature: string[];
  hypotheses: Hypothesis[];
  experiments: string[];
  data: string[];
  analysis: string | null;
  conclusions: string[];
}

class ScientificMethodEngine {
  private state: ResearchState;

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): ResearchState {
    return {
      currentStage: Stage.Observation,
      problemStatement: null,
      literature: [],
      hypotheses: [],
      experiments: [],
      data: [],
      analysis: null,
      conclusions: [],
    };
  }
  
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private log(message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red
    };
    const icons = {
      info: '🔬',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    console.error(`${icons[level]} ${colors[level](message)}`);
  }

  private transitionTo(nextStage: Stage): void {
    const allowedTransitions = STAGE_TRANSITIONS[this.state.currentStage];
    if (allowedTransitions.includes(nextStage)) {
      this.state.currentStage = nextStage;
      this.log(`Transitioned to ${nextStage}`, 'success');
    } else {
      throw new Error(`Invalid transition from ${this.state.currentStage} to ${nextStage}. Allowed transitions: ${allowedTransitions.join(', ')}`);
    }
  }

  public observation(input: unknown): { content: Array<{ type: string; text: string }> } {
    const { problemStatement } = input as { problemStatement: string };
    this.state.problemStatement = problemStatement;
    this.log(`Observation recorded: ${problemStatement}`);
    this.transitionTo(Stage.LiteratureReview);
    return { content: [{ type: "text", text: `Observation recorded. Current stage: ${this.state.currentStage}` }] };
  }

  public literature_review(input: unknown): { content: Array<{ type: string; text: string }> } {
    const { literature } = input as { literature: string };
    this.state.literature.push(literature);
    this.log(`Literature added: ${literature}`);
    this.transitionTo(Stage.HypothesisFormation);
    return { content: [{ type: "text", text: `Literature added. Current stage: ${this.state.currentStage}` }] };
  }

  public hypothesis_formation(input: unknown): { content: Array<{ type: string; text: string }> } {
    const { hypothesis } = input as { hypothesis: string };
    const newHypothesis: Hypothesis = {
      id: this.generateId(),
      description: hypothesis,
      evidenceScore: 0,
    };
    this.state.hypotheses.push(newHypothesis);
    this.log(`Hypothesis formed: ${hypothesis}`);
    this.transitionTo(Stage.ExperimentDesign);
    return { content: [{ type: "text", text: `Hypothesis formed. Current stage: ${this.state.currentStage}` }] };
  }

  public hypothesis_generation(input: unknown): { content: Array<{ type: string; text: string }> } {
    const { hypotheses } = input as { hypotheses: string[] };
    hypotheses.forEach(h => {
      const newHypothesis: Hypothesis = {
        id: this.generateId(),
        description: h,
        evidenceScore: 0,
      };
      this.state.hypotheses.push(newHypothesis);
    });
    this.log(`Generated ${hypotheses.length} new hypotheses.`);
    this.transitionTo(Stage.HypothesisFormation);
    return { content: [{ type: "text", text: `Generated ${hypotheses.length} hypotheses. Current stage: ${this.state.currentStage}` }] };
  }

  public experiment_design(input: unknown): { content: Array<{ type: string; text: string }> } {
    const { experiment } = input as { experiment: string };
    this.state.experiments.push(experiment);
    this.log(`Experiment designed: ${experiment}`);
    this.transitionTo(Stage.DataCollection);
    return { content: [{ type: "text", text: `Experiment designed. Current stage: ${this.state.currentStage}` }] };
  }

  public data_collection(input: unknown): { content: Array<{ type: string; text: string }> } {
    const { data } = input as { data: string };
    this.state.data.push(data);
    this.log(`Data collected: ${data}`);
    this.transitionTo(Stage.Analysis);
    return { content: [{ type: "text", text: `Data collected. Current stage: ${this.state.currentStage}` }] };
  }

  public analysis(input: unknown): { content: Array<{ type: string; text: string }> } {
    const { analysis } = input as { analysis: string };
    this.state.analysis = analysis;
    this.log(`Analysis performed: ${analysis}`);
    this.transitionTo(Stage.Conclusion);
    return { content: [{ type: "text", text: `Analysis performed. Current stage: ${this.state.currentStage}` }] };
  }

  public conclusion(input: unknown): { content: Array<{ type: string; text: string }> } {
    const { conclusion } = input as { conclusion: string };
    this.state.conclusions.push(conclusion);
    this.log(`Conclusion drawn: ${conclusion}`);
    return { content: [{ type: "text", text: `Conclusion drawn. Research complete.` }] };
  }
  
  public literature_search(input: unknown): { content: Array<{ type: string; text: string }> } {
    const { query } = input as { query: string };
    this.log(`Searched literature for: ${query}`);
    return { content: [{ type: "text", text: `Literature search for "${query}" recorded.` }] };
  }

  public data_analysis(input: unknown): { content: Array<{ type: string; text: string }> } {
    const { data } = input as { data: string[] };
    this.log(`Data analysis performed on: ${data.join(', ')}`);
    return { content: [{ type: "text", text: `Data analysis recorded.` }] };
  }

  public peer_review_simulation(input: unknown): { content: Array<{ type: string; text: string }> } {
    this.log(`Peer review simulation recorded.`);
    return { content: [{ type: "text", text: `Peer review simulation recorded.` }] };
  }

  public get_state(): { content: Array<{ type: string; text: string }> } {
    return { content: [{ type: "text", text: JSON.stringify(this.state, null, 2) }] };
  }

  public score_hypothesis(input: unknown): { content: Array<{ type: string; text: string }> } {
    const { hypothesisId, score } = input as { hypothesisId: string; score: number };
    const hypothesis = this.state.hypotheses.find(h => h.id === hypothesisId);
    if (!hypothesis) {
      throw new Error(`Hypothesis with ID ${hypothesisId} not found.`);
    }
    hypothesis.evidenceScore = score;
    this.log(`Hypothesis ${hypothesisId} scored with ${score}.`);
    return { content: [{ type: "text", text: `Hypothesis ${hypothesisId} evidence score updated to ${score}.` }] };
  }

  public check_for_breakthrough(): { content: Array<{ type: string; text: string }> } {
    if (this.state.hypotheses.length === 0) {
      return { content: [{ type: "text", text: "No hypotheses to check for breakthrough." }] };
    }
    const totalEvidenceScore = this.state.hypotheses.reduce((sum, h) => sum + h.evidenceScore, 0);
    const averageEvidenceScore = totalEvidenceScore / this.state.hypotheses.length;
    this.log(`Current average evidence score: ${averageEvidenceScore.toFixed(2)}`);
    return { content: [{ type: "text", text: `Current average evidence score across all hypotheses: ${averageEvidenceScore.toFixed(2)}.` }] };
  }
}

const TOOLS: Tool[] = [
  {
    name: "observation",
    description: "Problem identification",
    inputSchema: {
      type: "object",
      properties: {
        problemStatement: { type: "string" },
      },
      required: ["problemStatement"],
    },
  },
  {
    name: "literature_review",
    description: "Background research",
    inputSchema: {
      type: "object",
      properties: {
        literature: { type: "string" },
      },
      required: ["literature"],
    },
  },
  {
    name: "hypothesis_formation",
    description: "Generate a single testable hypothesis",
    inputSchema: {
      type: "object",
      properties: {
        hypothesis: { type: "string" },
      },
      required: ["hypothesis"],
    },
  },
  {
    name: "hypothesis_generation",
    description: "Create multiple competing hypotheses",
    inputSchema: {
      type: "object",
      properties: {
        hypotheses: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["hypotheses"],
    },
  },
  {
    name: "experiment_design",
    description: "Design testing methodology",
    inputSchema: {
      type: "object",
      properties: {
        experiment: { type: "string" },
      },
      required: ["experiment"],
    },
  },
  {
    name: "data_collection",
    description: "Gather evidence",
    inputSchema: {
      type: "object",
      properties: {
        data: { type: "string" },
      },
      required: ["data"],
    },
  },
  {
    name: "analysis",
    description: "Analyze results",
    inputSchema: {
      type: "object",
      properties: {
        analysis: { type: "string" },
      },
      required: ["analysis"],
    },
  },
  {
    name: "conclusion",
    description: "Draw conclusions and refine theory",
    inputSchema: {
      type: "object",
      properties: {
        conclusion: { type: "string" },
      },
      required: ["conclusion"],
    },
  },
  {
    name: "literature_search",
    description: "Search academic databases",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
      },
      required: ["query"],
    },
  },
  {
    name: "data_analysis",
    description: "Statistical analysis of results",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["data"],
    },
  },
  {
    name: "peer_review_simulation",
    description: "Validate findings from multiple perspectives",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "score_hypothesis",
    description: "Assign an evidence score to a specific hypothesis",
    inputSchema: {
      type: "object",
      properties: {
        hypothesisId: { type: "string" },
        score: { type: "number", minimum: 0, maximum: 1 },
      },
      required: ["hypothesisId", "score"],
    },
  },
  {
    name: "check_for_breakthrough",
    description: "Check the current average evidence score across all hypotheses",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "get_state",
    description: "Get the current state of the research",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
];

const server = new Server(
  {
    name: "cognatus-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const engine = new ScientificMethodEngine();

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "observation":
        return engine.observation(request.params.arguments);
      case "literature_review":
        return engine.literature_review(request.params.arguments);
      case "hypothesis_formation":
        return engine.hypothesis_formation(request.params.arguments);
      case "hypothesis_generation":
        return engine.hypothesis_generation(request.params.arguments);
      case "experiment_design":
        return engine.experiment_design(request.params.arguments);
      case "data_collection":
        return engine.data_collection(request.params.arguments);
      case "analysis":
        return engine.analysis(request.params.arguments);
      case "conclusion":
        return engine.conclusion(request.params.arguments);
      case "literature_search":
        return engine.literature_search(request.params.arguments);
      case "data_analysis":
        return engine.data_analysis(request.params.arguments);
      case "peer_review_simulation":
        return engine.peer_review_simulation(request.params.arguments);
      case "score_hypothesis":
        return engine.score_hypothesis(request.params.arguments);
      case "check_for_breakthrough":
        return engine.check_for_breakthrough();
      case "get_state":
        return engine.get_state();
      default:
        return {
          content: [{
            type: "text",
            text: `Unknown tool: ${request.params.name}`
          }],
          isError: true
        };
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: error instanceof Error ? error.message : String(error)
      }],
      isError: true
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Cognatus MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
