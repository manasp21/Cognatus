#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
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
  public state: ResearchState;

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
      const errorMsg = `Invalid transition from ${this.state.currentStage} to ${nextStage}. Allowed transitions: ${allowedTransitions.join(', ')}`;
      this.log(errorMsg, 'error');
      throw new Error(errorMsg);
    }
  }

  private validateInput(input: unknown, expectedFields: string[]): void {
    if (!input || typeof input !== 'object') {
      throw new Error('Input must be a valid object');
    }
    
    for (const field of expectedFields) {
      if (!(field in input) || (input as any)[field] == null || (input as any)[field] === '') {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  private safeExecute(operation: () => { content: Array<{ type: "text"; text: string }> }, context: string): { content: Array<{ type: "text"; text: string }> } {
    try {
      return operation();
    } catch (error) {
      const errorMsg = `Error in ${context}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.log(errorMsg, 'error');
      return { content: [{ type: "text", text: errorMsg }] };
    }
  }

  public observation(input: unknown): { content: Array<{ type: "text"; text: string }> } {
    return this.safeExecute(() => {
      this.validateInput(input, ['problemStatement']);
      const { problemStatement } = input as { problemStatement: string };
      
      if (problemStatement.length < 10) {
        throw new Error('Problem statement must be at least 10 characters long');
      }
      
      this.state.problemStatement = problemStatement;
      this.log(`Observation recorded: ${problemStatement}`);
      this.transitionTo(Stage.LiteratureReview);
      return { content: [{ type: "text", text: `Observation recorded. Current stage: ${this.state.currentStage}` }] };
    }, 'observation');
  }

  public literature_review(input: unknown): { content: Array<{ type: "text"; text: string }> } {
    return this.safeExecute(() => {
      this.validateInput(input, ['literature']);
      const { literature } = input as { literature: string };
      
      if (literature.length < 20) {
        throw new Error('Literature review must be at least 20 characters long');
      }
      
      this.state.literature.push(literature);
      this.log(`Literature added: ${literature}`);
      this.transitionTo(Stage.HypothesisFormation);
      return { content: [{ type: "text", text: `Literature added. Current stage: ${this.state.currentStage}` }] };
    }, 'literature_review');
  }

  public hypothesis_formation(input: unknown): { content: Array<{ type: "text"; text: string }> } {
    return this.safeExecute(() => {
      this.validateInput(input, ['hypothesis']);
      const { hypothesis } = input as { hypothesis: string };
      
      if (hypothesis.length < 15) {
        throw new Error('Hypothesis must be at least 15 characters long');
      }
      
      const newHypothesis: Hypothesis = {
        id: this.generateId(),
        description: hypothesis,
        evidenceScore: 0,
      };
      this.state.hypotheses.push(newHypothesis);
      this.log(`Hypothesis formed: ${hypothesis}`);
      this.transitionTo(Stage.ExperimentDesign);
      return { content: [{ type: "text", text: `Hypothesis formed. Current stage: ${this.state.currentStage}` }] };
    }, 'hypothesis_formation');
  }

  public hypothesis_generation(input: unknown): { content: Array<{ type: "text"; text: string }> } {
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

  public experiment_design(input: unknown): { content: Array<{ type: "text"; text: string }> } {
    const { experiment } = input as { experiment: string };
    this.state.experiments.push(experiment);
    this.log(`Experiment designed: ${experiment}`);
    this.transitionTo(Stage.DataCollection);
    return { content: [{ type: "text", text: `Experiment designed. Current stage: ${this.state.currentStage}` }] };
  }

  public data_collection(input: unknown): { content: Array<{ type: "text"; text: string }> } {
    const { data } = input as { data: string };
    this.state.data.push(data);
    this.log(`Data collected: ${data}`);
    this.transitionTo(Stage.Analysis);
    return { content: [{ type: "text", text: `Data collected. Current stage: ${this.state.currentStage}` }] };
  }

  public analysis(input: unknown): { content: Array<{ type: "text"; text: string }> } {
    const { analysis } = input as { analysis: string };
    this.state.analysis = analysis;
    this.log(`Analysis performed: ${analysis}`);
    this.transitionTo(Stage.Conclusion);
    return { content: [{ type: "text", text: `Analysis performed. Current stage: ${this.state.currentStage}` }] };
  }

  public conclusion(input: unknown): { content: Array<{ type: "text"; text: string }> } {
    const { conclusion } = input as { conclusion: string };
    this.state.conclusions.push(conclusion);
    this.log(`Conclusion drawn: ${conclusion}`);
    return { content: [{ type: "text", text: `Conclusion drawn. Research complete.` }] };
  }
  
  public literature_search(input: unknown): { content: Array<{ type: "text"; text: string }> } {
    const { query } = input as { query: string };
    this.log(`Searched literature for: ${query}`);
    return { content: [{ type: "text", text: `Literature search for "${query}" recorded.` }] };
  }

  public data_analysis(input: unknown): { content: Array<{ type: "text"; text: string }> } {
    const { data } = input as { data: string[] };
    this.log(`Data analysis performed on: ${data.join(', ')}`);
    return { content: [{ type: "text", text: `Data analysis recorded.` }] };
  }

  public peer_review_simulation(input: unknown): { content: Array<{ type: "text"; text: string }> } {
    this.log(`Peer review simulation recorded.`);
    return { content: [{ type: "text", text: `Peer review simulation recorded.` }] };
  }

  public get_state(): { content: Array<{ type: "text"; text: string }> } {
    return this.safeExecute(() => {
      const stateInfo = {
        currentStage: this.state.currentStage,
        problemStatement: this.state.problemStatement,
        literatureCount: this.state.literature.length,
        hypothesesCount: this.state.hypotheses.length,
        experimentsCount: this.state.experiments.length,
        dataPointsCount: this.state.data.length,
        hasAnalysis: !!this.state.analysis,
        conclusionsCount: this.state.conclusions.length,
        averageEvidenceScore: this.state.hypotheses.length > 0 
          ? (this.state.hypotheses.reduce((sum, h) => sum + h.evidenceScore, 0) / this.state.hypotheses.length).toFixed(2)
          : "N/A"
      };
      
      const nextSteps = STAGE_TRANSITIONS[this.state.currentStage];
      const stageDescription = `\n\nCurrent Stage: ${this.state.currentStage}\nNext Available Stages: ${nextSteps.join(', ') || 'None (research complete)'}\n\nDetailed State:\n${JSON.stringify(stateInfo, null, 2)}`;
      
      return { content: [{ type: "text", text: stageDescription }] };
    }, 'get_state');
  }

  public score_hypothesis(input: unknown): { content: Array<{ type: "text"; text: string }> } {
    return this.safeExecute(() => {
      this.validateInput(input, ['hypothesisId', 'score']);
      const { hypothesisId, score } = input as { hypothesisId: string; score: number };
      
      if (score < 0 || score > 1) {
        throw new Error('Evidence score must be between 0 and 1');
      }
      
      const hypothesis = this.state.hypotheses.find(h => h.id === hypothesisId);
      if (!hypothesis) {
        throw new Error(`Hypothesis with ID ${hypothesisId} not found.`);
      }
      
      hypothesis.evidenceScore = score;
      this.log(`Hypothesis ${hypothesisId} scored with ${score}.`);
      return { content: [{ type: "text", text: `Hypothesis ${hypothesisId} evidence score updated to ${score}.` }] };
    }, 'score_hypothesis');
  }

  public check_for_breakthrough(): { content: Array<{ type: "text"; text: string }> } {
    return this.safeExecute(() => {
      if (this.state.hypotheses.length === 0) {
        return { content: [{ type: "text", text: "No hypotheses to check for breakthrough. Please form hypotheses first." }] };
      }
      
      const totalEvidenceScore = this.state.hypotheses.reduce((sum, h) => sum + h.evidenceScore, 0);
      const averageEvidenceScore = totalEvidenceScore / this.state.hypotheses.length;
      
      let breakthroughStatus = "";
      if (averageEvidenceScore >= 0.8) {
        breakthroughStatus = " 🎉 POTENTIAL BREAKTHROUGH DETECTED! High confidence in hypotheses.";
      } else if (averageEvidenceScore >= 0.6) {
        breakthroughStatus = " ⚡ Strong evidence supporting current hypotheses.";
      } else if (averageEvidenceScore >= 0.4) {
        breakthroughStatus = " 📊 Moderate evidence. More research needed.";
      } else {
        breakthroughStatus = " 🔍 Low evidence. Consider refining hypotheses.";
      }
      
      this.log(`Current average evidence score: ${averageEvidenceScore.toFixed(2)}`);
      return { content: [{ type: "text", text: `Current average evidence score across all hypotheses: ${averageEvidenceScore.toFixed(2)}.${breakthroughStatus}` }] };
    }, 'check_for_breakthrough');
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

  // Primary unified scientific thinking tool
  server.tool(
    "scientific_thinking",
    "Complete scientific research process with sequential 7-stage workflow",
    { 
      stage: z.enum(["observation", "literature_review", "hypothesis_formation", "experiment_design", "data_collection", "analysis", "conclusion"]).optional().describe("Specific stage to execute, or omit to run the next stage in sequence"),
      input: z.string().describe("Input data for the specified stage (e.g., problem statement for observation, literature for literature_review, etc.)")
    },
    async (input: { stage?: string; input: string }) => {
      try {
        const currentStage = input.stage || engine.state.currentStage;
        
        // Provide guidance on the current stage
        const stageGuidance = {
          [Stage.Observation]: "🔍 OBSERVATION: Define your research problem clearly and concisely.",
          [Stage.LiteratureReview]: "📚 LITERATURE REVIEW: Add relevant background research and existing studies.",
          [Stage.HypothesisFormation]: "💡 HYPOTHESIS FORMATION: Create testable hypotheses based on observations and literature.",
          [Stage.ExperimentDesign]: "⚗️ EXPERIMENT DESIGN: Design methodology to test your hypotheses.",
          [Stage.DataCollection]: "📊 DATA COLLECTION: Gather evidence from experiments or observations.",
          [Stage.Analysis]: "🔬 ANALYSIS: Analyze collected data and evaluate hypothesis support.",
          [Stage.Conclusion]: "✅ CONCLUSION: Draw final conclusions and implications for research."
        };
        
        let result;
        switch (currentStage) {
          case Stage.Observation:
            result = engine.observation({ problemStatement: input.input });
            break;
          case Stage.LiteratureReview:
            result = engine.literature_review({ literature: input.input });
            break;
          case Stage.HypothesisFormation:
            result = engine.hypothesis_formation({ hypothesis: input.input });
            break;
          case Stage.ExperimentDesign:
            result = engine.experiment_design({ experiment: input.input });
            break;
          case Stage.DataCollection:
            result = engine.data_collection({ data: input.input });
            break;
          case Stage.Analysis:
            result = engine.analysis({ analysis: input.input });
            break;
          case Stage.Conclusion:
            result = engine.conclusion({ conclusion: input.input });
            break;
          default:
            return { content: [{ type: "text", text: `Invalid stage: ${currentStage}. Valid stages: observation, literature_review, hypothesis_formation, experiment_design, data_collection, analysis, conclusion` }] };
        }
        
        // Add stage guidance to the result
        const guidanceText = stageGuidance[currentStage as Stage] || "";
        const nextSteps = STAGE_TRANSITIONS[engine.state.currentStage];
        const nextStepText = nextSteps.length > 0 ? `\n\nNext available stages: ${nextSteps.join(', ')}` : "\n\n🎉 Research workflow complete!";
        
        return {
          content: [
            { type: "text", text: `${guidanceText}\n\n${result.content[0].text}${nextStepText}` }
          ]
        };
      } catch (error) {
        return { content: [{ type: "text", text: `Error in scientific thinking workflow: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
      }
    }
  );

  // Individual stage tools for granular control
  server.tool(
    "observation",
    "Problem identification",
    { problemStatement: z.string() },
    async (input: ObservationInput) => engine.observation(input)
  );

  server.tool(
    "literature_review",
    "Background research",
    { literature: z.string() },
    async (input: LiteratureReviewInput) => engine.literature_review(input)
  );

  server.tool(
    "hypothesis_formation",
    "Generate a single testable hypothesis",
    { hypothesis: z.string() },
    async (input: HypothesisFormationInput) => engine.hypothesis_formation(input)
  );

  server.tool(
    "hypothesis_generation",
    "Create multiple competing hypotheses",
    { hypotheses: z.array(z.string()) },
    async (input: HypothesisGenerationInput) => engine.hypothesis_generation(input)
  );

  server.tool(
    "experiment_design",
    "Design testing methodology",
    { experiment: z.string() },
    async (input: ExperimentDesignInput) => engine.experiment_design(input)
  );

  server.tool(
    "data_collection",
    "Gather evidence",
    { data: z.string() },
    async (input: DataCollectionInput) => engine.data_collection(input)
  );

  server.tool(
    "analysis",
    "Analyze results",
    { analysis: z.string() },
    async (input: AnalysisInput) => engine.analysis(input)
  );

  server.tool(
    "conclusion",
    "Draw conclusions and refine theory",
    { conclusion: z.string() },
    async (input: ConclusionInput) => engine.conclusion(input)
  );

  server.tool(
    "literature_search",
    "Search academic databases",
    { query: z.string() },
    async (input: LiteratureSearchInput) => engine.literature_search(input)
  );

  server.tool(
    "data_analysis",
    "Statistical analysis of results",
    { data: z.array(z.string()) },
    async (input: DataAnalysisInput) => engine.data_analysis(input)
  );

  server.tool(
    "peer_review_simulation",
    "Validate findings from multiple perspectives",
    {},
    async () => engine.peer_review_simulation({})
  );

  server.tool(
    "score_hypothesis",
    "Assign an evidence score to a specific hypothesis",
    { hypothesisId: z.string(), score: z.number().min(0).max(1) },
    async (input: ScoreHypothesisInput) => engine.score_hypothesis(input)
  );

  server.tool(
    "check_for_breakthrough",
    "Check the current average evidence score across all hypotheses",
    {},
    async () => engine.check_for_breakthrough()
  );

  server.tool(
    "get_state",
    "Get the current state of the research",
    {},
    async () => engine.get_state()
  );

  return server;
}

// Create and start the server
const server = createCognatusServer({ config: {} });
const transport = new StdioServerTransport();
server.connect(transport);

console.error("Cognatus MCP Server running on stdio");
