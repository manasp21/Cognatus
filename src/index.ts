#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk";
import { createStatelessServer } from "@smithery/sdk";
import { z } from "zod";
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

  interface ObservationInput { problemStatement: string; }
interface LiteratureReviewInput { literature: string; }
interface HypothesisFormationInput { hypothesis: string; }
interface HypothesisGenerationInput { hypotheses: string[]; }
interface ExperimentDesignInput { experiment: string; }
interface DataCollectionInput { data: string; }
interface AnalysisInput { analysis: string; }
interface ConclusionInput { conclusion: string; }
interface LiteratureSearchInput { query: string; }
interface DataAnalysisInput { data: string[]; }
interface ScoreHypothesisInput { hypothesisId: string; score: number; }

export const configSchema = z.object({});

export function createCognatusServer({ config }: { config: z.infer<typeof configSchema> }) {
  const server = new McpServer({
    name: "cognatus-server",
    version: "1.0.0",
  });

  const engine = new ScientificMethodEngine();

  server.tool(
    "observation",
    "Problem identification",
    z.object({ problemStatement: z.string() }),
    async (input: ObservationInput) => engine.observation(input)
  );

  server.tool(
    "literature_review",
    "Background research",
    z.object({ literature: z.string() }),
    async (input: LiteratureReviewInput) => engine.literature_review(input)
  );

  server.tool(
    "hypothesis_formation",
    "Generate a single testable hypothesis",
    z.object({ hypothesis: z.string() }),
    async (input: HypothesisFormationInput) => engine.hypothesis_formation(input)
  );

  server.tool(
    "hypothesis_generation",
    "Create multiple competing hypotheses",
    z.object({ hypotheses: z.array(z.string()) }),
    async (input: HypothesisGenerationInput) => engine.hypothesis_generation(input)
  );

  server.tool(
    "experiment_design",
    "Design testing methodology",
    z.object({ experiment: z.string() }),
    async (input: ExperimentDesignInput) => engine.experiment_design(input)
  );

  server.tool(
    "data_collection",
    "Gather evidence",
    z.object({ data: z.string() }),
    async (input: DataCollectionInput) => engine.data_collection(input)
  );

  server.tool(
    "analysis",
    "Analyze results",
    z.object({ analysis: z.string() }),
    async (input: AnalysisInput) => engine.analysis(input)
  );

  server.tool(
    "conclusion",
    "Draw conclusions and refine theory",
    z.object({ conclusion: z.string() }),
    async (input: ConclusionInput) => engine.conclusion(input)
  );

  server.tool(
    "literature_search",
    "Search academic databases",
    z.object({ query: z.string() }),
    async (input: LiteratureSearchInput) => engine.literature_search(input)
  );

  server.tool(
    "data_analysis",
    "Statistical analysis of results",
    z.object({ data: z.array(z.string()) }),
    async (input: DataAnalysisInput) => engine.data_analysis(input)
  );

  server.tool(
    "peer_review_simulation",
    "Validate findings from multiple perspectives",
    z.object({}),
    async () => engine.peer_review_simulation({})
  );

  server.tool(
    "score_hypothesis",
    "Assign an evidence score to a specific hypothesis",
    z.object({ hypothesisId: z.string(), score: z.number().min(0).max(1) }),
    async (input: ScoreHypothesisInput) => engine.score_hypothesis(input)
  );

  server.tool(
    "check_for_breakthrough",
    "Check the current average evidence score across all hypotheses",
    z.object({}),
    async () => engine.check_for_breakthrough()
  );

  server.tool(
    "get_state",
    "Get the current state of the research",
    z.object({}),
    async () => engine.get_state()
  );

  return server.server;
}

const { app } = createStatelessServer(createCognatusServer);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.error(`Cognatus MCP Server running on port ${PORT}`);
});
