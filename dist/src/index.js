#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
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
const TOOLS = [
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
const server = new Server({
    name: "cognatus-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
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
    }
    catch (error) {
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
