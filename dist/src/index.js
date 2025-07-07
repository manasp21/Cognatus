#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/dist/server/mcp.js";
import { createStatelessServer } from "@smithery/sdk/dist/server/stateless.js";
import { z } from "zod";
import chalk from 'chalk';
var Stage;
(function (Stage) {
    Stage["Observation"] = "observation";
    Stage["LiteratureReview"] = "literature_review";
    Stage["HypothesisFormation"] = "hypothesis_formation";
    Stage["ExperimentDesign"] = "experiment_design";
    Stage["DataCollection"] = "data_collection";
    Stage["Analysis"] = "analysis";
    Stage["Conclusion"] = "conclusion";
})(Stage || (Stage = {}));
const STAGE_TRANSITIONS = {
    [Stage.Observation]: [Stage.LiteratureReview],
    [Stage.LiteratureReview]: [Stage.HypothesisFormation],
    [Stage.HypothesisFormation]: [Stage.ExperimentDesign, Stage.HypothesisFormation],
    [Stage.ExperimentDesign]: [Stage.DataCollection],
    [Stage.DataCollection]: [Stage.Analysis],
    [Stage.Analysis]: [Stage.Conclusion],
    [Stage.Conclusion]: [],
};
class ScientificMethodEngine {
    state;
    constructor() {
        this.state = this.getInitialState();
    }
    getInitialState() {
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
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    log(message, level = 'info') {
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
    transitionTo(nextStage) {
        const allowedTransitions = STAGE_TRANSITIONS[this.state.currentStage];
        if (allowedTransitions.includes(nextStage)) {
            this.state.currentStage = nextStage;
            this.log(`Transitioned to ${nextStage}`, 'success');
        }
        else {
            throw new Error(`Invalid transition from ${this.state.currentStage} to ${nextStage}. Allowed transitions: ${allowedTransitions.join(', ')}`);
        }
    }
    observation(input) {
        const { problemStatement } = input;
        this.state.problemStatement = problemStatement;
        this.log(`Observation recorded: ${problemStatement}`);
        this.transitionTo(Stage.LiteratureReview);
        return { content: [{ type: "text", text: `Observation recorded. Current stage: ${this.state.currentStage}` }] };
    }
    literature_review(input) {
        const { literature } = input;
        this.state.literature.push(literature);
        this.log(`Literature added: ${literature}`);
        this.transitionTo(Stage.HypothesisFormation);
        return { content: [{ type: "text", text: `Literature added. Current stage: ${this.state.currentStage}` }] };
    }
    hypothesis_formation(input) {
        const { hypothesis } = input;
        const newHypothesis = {
            id: this.generateId(),
            description: hypothesis,
            evidenceScore: 0,
        };
        this.state.hypotheses.push(newHypothesis);
        this.log(`Hypothesis formed: ${hypothesis}`);
        this.transitionTo(Stage.ExperimentDesign);
        return { content: [{ type: "text", text: `Hypothesis formed. Current stage: ${this.state.currentStage}` }] };
    }
    hypothesis_generation(input) {
        const { hypotheses } = input;
        hypotheses.forEach(h => {
            const newHypothesis = {
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
    experiment_design(input) {
        const { experiment } = input;
        this.state.experiments.push(experiment);
        this.log(`Experiment designed: ${experiment}`);
        this.transitionTo(Stage.DataCollection);
        return { content: [{ type: "text", text: `Experiment designed. Current stage: ${this.state.currentStage}` }] };
    }
    data_collection(input) {
        const { data } = input;
        this.state.data.push(data);
        this.log(`Data collected: ${data}`);
        this.transitionTo(Stage.Analysis);
        return { content: [{ type: "text", text: `Data collected. Current stage: ${this.state.currentStage}` }] };
    }
    analysis(input) {
        const { analysis } = input;
        this.state.analysis = analysis;
        this.log(`Analysis performed: ${analysis}`);
        this.transitionTo(Stage.Conclusion);
        return { content: [{ type: "text", text: `Analysis performed. Current stage: ${this.state.currentStage}` }] };
    }
    conclusion(input) {
        const { conclusion } = input;
        this.state.conclusions.push(conclusion);
        this.log(`Conclusion drawn: ${conclusion}`);
        return { content: [{ type: "text", text: `Conclusion drawn. Research complete.` }] };
    }
    literature_search(input) {
        const { query } = input;
        this.log(`Searched literature for: ${query}`);
        return { content: [{ type: "text", text: `Literature search for "${query}" recorded.` }] };
    }
    data_analysis(input) {
        const { data } = input;
        this.log(`Data analysis performed on: ${data.join(', ')}`);
        return { content: [{ type: "text", text: `Data analysis recorded.` }] };
    }
    peer_review_simulation(input) {
        this.log(`Peer review simulation recorded.`);
        return { content: [{ type: "text", text: `Peer review simulation recorded.` }] };
    }
    get_state() {
        return { content: [{ type: "text", text: JSON.stringify(this.state, null, 2) }] };
    }
    score_hypothesis(input) {
        const { hypothesisId, score } = input;
        const hypothesis = this.state.hypotheses.find(h => h.id === hypothesisId);
        if (!hypothesis) {
            throw new Error(`Hypothesis with ID ${hypothesisId} not found.`);
        }
        hypothesis.evidenceScore = score;
        this.log(`Hypothesis ${hypothesisId} scored with ${score}.`);
        return { content: [{ type: "text", text: `Hypothesis ${hypothesisId} evidence score updated to ${score}.` }] };
    }
    check_for_breakthrough() {
        if (this.state.hypotheses.length === 0) {
            return { content: [{ type: "text", text: "No hypotheses to check for breakthrough." }] };
        }
        const totalEvidenceScore = this.state.hypotheses.reduce((sum, h) => sum + h.evidenceScore, 0);
        const averageEvidenceScore = totalEvidenceScore / this.state.hypotheses.length;
        this.log(`Current average evidence score: ${averageEvidenceScore.toFixed(2)}`);
        return { content: [{ type: "text", text: `Current average evidence score across all hypotheses: ${averageEvidenceScore.toFixed(2)}.` }] };
    }
}
export const configSchema = z.object({});
export function createCognatusServer({ config }) {
    const server = new McpServer({
        name: "cognatus-server",
        version: "1.0.0",
    });
    const engine = new ScientificMethodEngine();
    server.tool("observation", "Problem identification", z.object({ problemStatement: z.string() }), async ({ problemStatement }) => engine.observation({ problemStatement }));
    server.tool("literature_review", "Background research", z.object({ literature: z.string() }), async ({ literature }) => engine.literature_review({ literature }));
    server.tool("hypothesis_formation", "Generate a single testable hypothesis", z.object({ hypothesis: z.string() }), async ({ hypothesis }) => engine.hypothesis_formation({ hypothesis }));
    server.tool("hypothesis_generation", "Create multiple competing hypotheses", z.object({ hypotheses: z.array(z.string()) }), async ({ hypotheses }) => engine.hypothesis_generation({ hypotheses }));
    server.tool("experiment_design", "Design testing methodology", z.object({ experiment: z.string() }), async ({ experiment }) => engine.experiment_design({ experiment }));
    server.tool("data_collection", "Gather evidence", z.object({ data: z.string() }), async ({ data }) => engine.data_collection({ data }));
    server.tool("analysis", "Analyze results", z.object({ analysis: z.string() }), async ({ analysis }) => engine.analysis({ analysis }));
    server.tool("conclusion", "Draw conclusions and refine theory", z.object({ conclusion: z.string() }), async ({ conclusion }) => engine.conclusion({ conclusion }));
    server.tool("literature_search", "Search academic databases", z.object({ query: z.string() }), async ({ query }) => engine.literature_search({ query }));
    server.tool("data_analysis", "Statistical analysis of results", z.object({ data: z.array(z.string()) }), async ({ data }) => engine.data_analysis({ data }));
    server.tool("peer_review_simulation", "Validate findings from multiple perspectives", z.object({}), async () => engine.peer_review_simulation({}));
    server.tool("score_hypothesis", "Assign an evidence score to a specific hypothesis", z.object({ hypothesisId: z.string(), score: z.number().min(0).max(1) }), async ({ hypothesisId, score }) => engine.score_hypothesis({ hypothesisId, score }));
    server.tool("check_for_breakthrough", "Check the current average evidence score across all hypotheses", z.object({}), async () => engine.check_for_breakthrough());
    server.tool("get_state", "Get the current state of the research", z.object({}), async () => engine.get_state());
    return server.server;
}
const { app } = createStatelessServer(createCognatusServer);
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.error(`Cognatus MCP Server running on port ${PORT}`);
});
