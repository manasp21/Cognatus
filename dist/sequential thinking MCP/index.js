#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import chalk from 'chalk';
class EvolutionaryEngine {
    evolutionState = null;
    disableLogging;
    constructor() {
        this.disableLogging = (process.env.DISABLE_EVOLUTION_LOGGING || "").toLowerCase() === "true";
    }
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    log(message, level = 'info') {
        if (this.disableLogging)
            return;
        const colors = {
            info: chalk.blue,
            success: chalk.green,
            warning: chalk.yellow,
            error: chalk.red
        };
        const icons = {
            info: '🧬',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        console.error(`${icons[level]} ${colors[level](message)}`);
    }
    startEvolution(input) {
        try {
            const data = input;
            if (!data.problemStatement || typeof data.problemStatement !== 'string') {
                throw new Error('problemStatement is required and must be a string');
            }
            if (!data.consistencyChecks || !Array.isArray(data.consistencyChecks)) {
                throw new Error('consistencyChecks is required and must be an array');
            }
            const consistencyChecks = data.consistencyChecks.map((check, index) => ({
                id: `check_${index + 1}`,
                description: typeof check === 'string' ? check : check.description,
                weight: typeof check === 'object' && check.weight ? check.weight : 1.0
            }));
            this.evolutionState = {
                problemStatement: data.problemStatement,
                consistencyChecks,
                currentGeneration: 0,
                maxGenerations: data.maxGenerations || 5,
                populationSize: data.populationSize || 3,
                convergenceThreshold: data.convergenceThreshold || 0.95,
                solutions: {},
                generationHistory: {},
                bestSolution: null,
                isComplete: false,
                startTime: Date.now()
            };
            this.log(`Evolution started: ${this.evolutionState.problemStatement}`);
            this.log(`Consistency checks: ${consistencyChecks.length}, Max generations: ${this.evolutionState.maxGenerations}`);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            status: 'started',
                            problemStatement: this.evolutionState.problemStatement,
                            consistencyChecks: this.evolutionState.consistencyChecks,
                            currentGeneration: this.evolutionState.currentGeneration,
                            maxGenerations: this.evolutionState.maxGenerations,
                            populationSize: this.evolutionState.populationSize,
                            message: 'Evolution initialized. Ready for solution generation.'
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: error instanceof Error ? error.message : String(error),
                            status: 'failed'
                        }, null, 2)
                    }],
                isError: true
            };
        }
    }
    addSolution(input) {
        try {
            if (!this.evolutionState) {
                throw new Error('Evolution not started. Call start_evolution first.');
            }
            const data = input;
            if (!data.content || typeof data.content !== 'string') {
                throw new Error('Solution content is required and must be a string');
            }
            const parentSolutions = Array.isArray(data.parentSolutions) ? data.parentSolutions : [];
            const solution = {
                id: this.generateId(),
                content: data.content,
                generation: this.evolutionState.currentGeneration,
                scores: {},
                compositeScore: 0,
                parentSolutions,
                timestamp: Date.now()
            };
            this.evolutionState.solutions[solution.id] = solution;
            if (!this.evolutionState.generationHistory[this.evolutionState.currentGeneration]) {
                this.evolutionState.generationHistory[this.evolutionState.currentGeneration] = [];
            }
            this.evolutionState.generationHistory[this.evolutionState.currentGeneration].push(solution.id);
            this.log(`Solution added to generation ${this.evolutionState.currentGeneration}: ${solution.id}`);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            status: 'added',
                            solutionId: solution.id,
                            generation: solution.generation,
                            currentPopulationSize: this.evolutionState.generationHistory[this.evolutionState.currentGeneration].length,
                            targetPopulationSize: this.evolutionState.populationSize,
                            message: `Solution ${solution.id} added to generation ${solution.generation}`
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: error instanceof Error ? error.message : String(error),
                            status: 'failed'
                        }, null, 2)
                    }],
                isError: true
            };
        }
    }
    scoreSolution(input) {
        try {
            if (!this.evolutionState) {
                throw new Error('Evolution not started. Call start_evolution first.');
            }
            const data = input;
            if (!data.solutionId || typeof data.solutionId !== 'string') {
                throw new Error('solutionId is required and must be a string');
            }
            if (!data.checkId || typeof data.checkId !== 'string') {
                throw new Error('checkId is required and must be a string');
            }
            if (typeof data.score !== 'number' || data.score < 0 || data.score > 1) {
                throw new Error('score is required and must be a number between 0 and 1');
            }
            const solution = this.evolutionState.solutions[data.solutionId];
            if (!solution) {
                throw new Error(`Solution ${data.solutionId} not found`);
            }
            const consistencyCheck = this.evolutionState.consistencyChecks.find(c => c.id === data.checkId);
            if (!consistencyCheck) {
                throw new Error(`Consistency check ${data.checkId} not found`);
            }
            solution.scores[data.checkId] = data.score;
            const totalWeightedScore = this.evolutionState.consistencyChecks.reduce((sum, check) => {
                const score = solution.scores[check.id] || 0;
                return sum + (score * check.weight);
            }, 0);
            const totalWeight = this.evolutionState.consistencyChecks.reduce((sum, check) => sum + check.weight, 0);
            solution.compositeScore = totalWeightedScore / totalWeight;
            if (!this.evolutionState.bestSolution || solution.compositeScore > this.evolutionState.bestSolution.compositeScore) {
                this.evolutionState.bestSolution = solution;
                this.log(`New best solution: ${solution.id} (score: ${solution.compositeScore.toFixed(3)})`, 'success');
            }
            const completedScores = Object.keys(solution.scores).length;
            const totalChecks = this.evolutionState.consistencyChecks.length;
            this.log(`Solution ${solution.id} scored ${data.score.toFixed(3)} for ${data.checkId} (${completedScores}/${totalChecks} checks complete)`);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            status: 'scored',
                            solutionId: solution.id,
                            checkId: data.checkId,
                            score: data.score,
                            compositeScore: solution.compositeScore,
                            completedScores: completedScores,
                            totalChecks: totalChecks,
                            isFullyScored: completedScores === totalChecks,
                            message: `Solution ${solution.id} scored for ${data.checkId}`
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: error instanceof Error ? error.message : String(error),
                            status: 'failed'
                        }, null, 2)
                    }],
                isError: true
            };
        }
    }
    evolveGeneration(input) {
        try {
            if (!this.evolutionState) {
                throw new Error('Evolution not started. Call start_evolution first.');
            }
            const currentGenerationSolutions = this.evolutionState.generationHistory[this.evolutionState.currentGeneration] || [];
            if (currentGenerationSolutions.length === 0) {
                throw new Error('No solutions in current generation');
            }
            const solutions = currentGenerationSolutions.map(id => this.evolutionState.solutions[id]);
            const fullyScored = solutions.filter(s => Object.keys(s.scores).length === this.evolutionState.consistencyChecks.length);
            if (fullyScored.length === 0) {
                throw new Error('No fully scored solutions in current generation');
            }
            const crossoverRecommendations = this.evolutionState.consistencyChecks.map(check => {
                const bestForCheck = fullyScored.reduce((best, current) => {
                    const currentScore = current.scores[check.id] || 0;
                    const bestScore = best.scores[check.id] || 0;
                    return currentScore > bestScore ? current : best;
                });
                return {
                    checkId: check.id,
                    bestSolutionId: bestForCheck.id,
                    score: bestForCheck.scores[check.id],
                    relevantContent: this.extractRelevantContent(bestForCheck.content, check.description)
                };
            });
            const avgScore = fullyScored.reduce((sum, s) => sum + s.compositeScore, 0) / fullyScored.length;
            const bestScore = Math.max(...fullyScored.map(s => s.compositeScore));
            const hasConverged = bestScore >= this.evolutionState.convergenceThreshold;
            const maxGenerationsReached = this.evolutionState.currentGeneration >= this.evolutionState.maxGenerations - 1;
            if (hasConverged || maxGenerationsReached) {
                this.evolutionState.isComplete = true;
                const reason = hasConverged ? 'convergence' : 'max_generations';
                this.log(`Evolution complete: ${reason}. Best score: ${bestScore.toFixed(3)}`, 'success');
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                status: 'complete',
                                reason,
                                currentGeneration: this.evolutionState.currentGeneration,
                                bestSolution: this.evolutionState.bestSolution,
                                finalScore: bestScore,
                                averageScore: avgScore,
                                totalTime: Date.now() - this.evolutionState.startTime,
                                message: `Evolution completed after ${this.evolutionState.currentGeneration + 1} generations`
                            }, null, 2)
                        }]
                };
            }
            this.evolutionState.currentGeneration++;
            this.log(`Evolving to generation ${this.evolutionState.currentGeneration}`);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            status: 'evolved',
                            newGeneration: this.evolutionState.currentGeneration,
                            previousGenerationStats: {
                                averageScore: avgScore,
                                bestScore: bestScore,
                                populationSize: fullyScored.length
                            },
                            crossoverRecommendations,
                            guidance: {
                                message: 'Create new solutions by combining the best aspects identified in crossoverRecommendations',
                                populationTarget: this.evolutionState.populationSize,
                                focusAreas: crossoverRecommendations.map(r => `${r.checkId}: Use aspects from solution ${r.bestSolutionId} (score: ${r.score.toFixed(3)})`)
                            }
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: error instanceof Error ? error.message : String(error),
                            status: 'failed'
                        }, null, 2)
                    }],
                isError: true
            };
        }
    }
    extractRelevantContent(content, checkDescription) {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const keywords = checkDescription.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const relevantSentences = sentences.filter(sentence => keywords.some(keyword => sentence.toLowerCase().includes(keyword)));
        return relevantSentences.length > 0 ? relevantSentences.join('. ') + '.' : content.substring(0, 200) + '...';
    }
    getEvolutionStatus() {
        if (!this.evolutionState) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            status: 'not_started',
                            message: 'Evolution not started. Call start_evolution first.'
                        }, null, 2)
                    }]
            };
        }
        const currentGenerationSolutions = this.evolutionState.generationHistory[this.evolutionState.currentGeneration] || [];
        const solutions = currentGenerationSolutions.map(id => this.evolutionState.solutions[id]);
        const fullyScored = solutions.filter(s => Object.keys(s.scores).length === this.evolutionState.consistencyChecks.length);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        status: 'active',
                        currentGeneration: this.evolutionState.currentGeneration,
                        maxGenerations: this.evolutionState.maxGenerations,
                        populationSize: solutions.length,
                        targetPopulationSize: this.evolutionState.populationSize,
                        fullyScored: fullyScored.length,
                        bestSolution: this.evolutionState.bestSolution,
                        isComplete: this.evolutionState.isComplete,
                        runningTime: Date.now() - this.evolutionState.startTime,
                        generationHistory: Object.keys(this.evolutionState.generationHistory).map(gen => ({
                            generation: parseInt(gen),
                            solutionCount: this.evolutionState.generationHistory[parseInt(gen)].length
                        }))
                    }, null, 2)
                }]
        };
    }
}
const START_EVOLUTION_TOOL = {
    name: "start_evolution",
    description: `Initialize an evolutionary solution system for a given problem with consistency checks.

This tool sets up the framework for evolving solutions across multiple generations. The LLM will:
1. Generate initial population of solutions
2. Evaluate solutions against consistency checks
3. Use crossover recommendations to create better solutions
4. Repeat until convergence or max generations

Use this tool to begin the evolutionary process with a clear problem statement and evaluation criteria.`,
    inputSchema: {
        type: "object",
        properties: {
            problemStatement: {
                type: "string",
                description: "The problem or challenge to solve"
            },
            consistencyChecks: {
                type: "array",
                description: "Array of consistency checks (strings or objects with description and weight)",
                items: {
                    oneOf: [
                        { type: "string" },
                        {
                            type: "object",
                            properties: {
                                description: { type: "string" },
                                weight: { type: "number", minimum: 0 }
                            },
                            required: ["description"]
                        }
                    ]
                }
            },
            populationSize: {
                type: "integer",
                description: "Number of solutions per generation (default: 3)",
                minimum: 1,
                default: 3
            },
            maxGenerations: {
                type: "integer",
                description: "Maximum number of generations (default: 5)",
                minimum: 1,
                default: 5
            },
            convergenceThreshold: {
                type: "number",
                description: "Score threshold for convergence (default: 0.95)",
                minimum: 0,
                maximum: 1,
                default: 0.95
            }
        },
        required: ["problemStatement", "consistencyChecks"]
    }
};
const ADD_SOLUTION_TOOL = {
    name: "add_solution",
    description: `Add a new solution to the current generation of the evolutionary system.

Use this tool to contribute solutions to the current generation. Solutions can be:
- Initial solutions (generation 0)
- Evolved solutions based on crossover recommendations
- Variations or mutations of existing solutions

The solution content should directly address the problem statement.`,
    inputSchema: {
        type: "object",
        properties: {
            content: {
                type: "string",
                description: "The solution content addressing the problem statement"
            },
            parentSolutions: {
                type: "array",
                description: "Optional array of parent solution IDs if this is a crossover",
                items: { type: "string" }
            }
        },
        required: ["content"]
    }
};
const SCORE_SOLUTION_TOOL = {
    name: "score_solution",
    description: `Score a solution against a specific consistency check.

Use this tool to evaluate how well a solution performs against each consistency check.
Scores should be between 0.0 (poor) and 1.0 (excellent).

The LLM should evaluate the solution content against the consistency check description and provide an objective score.`,
    inputSchema: {
        type: "object",
        properties: {
            solutionId: {
                type: "string",
                description: "ID of the solution to score"
            },
            checkId: {
                type: "string",
                description: "ID of the consistency check to evaluate against"
            },
            score: {
                type: "number",
                description: "Score between 0.0 and 1.0",
                minimum: 0,
                maximum: 1
            },
            reasoning: {
                type: "string",
                description: "Optional explanation of the scoring rationale"
            }
        },
        required: ["solutionId", "checkId", "score"]
    }
};
const EVOLVE_GENERATION_TOOL = {
    name: "evolve_generation",
    description: `Evolve to the next generation using crossover analysis.

This tool analyzes the current generation's performance and provides crossover recommendations.
It identifies the best-performing solution for each consistency check and suggests how to combine
these aspects into new solutions for the next generation.

Use this after all solutions in the current generation have been fully scored.`,
    inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false
    }
};
const GET_STATUS_TOOL = {
    name: "get_evolution_status",
    description: `Get the current status of the evolutionary system.

Returns detailed information about the current state including:
- Current generation and progress
- Population statistics
- Best solution found so far
- Evolution history

Use this tool to track progress and understand the current state of the evolution.`,
    inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false
    }
};
const server = new Server({
    name: "event-horizon-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
const evolutionEngine = new EvolutionaryEngine();
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [START_EVOLUTION_TOOL, ADD_SOLUTION_TOOL, SCORE_SOLUTION_TOOL, EVOLVE_GENERATION_TOOL, GET_STATUS_TOOL],
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
        case "start_evolution":
            return evolutionEngine.startEvolution(request.params.arguments);
        case "add_solution":
            return evolutionEngine.addSolution(request.params.arguments);
        case "score_solution":
            return evolutionEngine.scoreSolution(request.params.arguments);
        case "evolve_generation":
            return evolutionEngine.evolveGeneration(request.params.arguments);
        case "get_evolution_status":
            return evolutionEngine.getEvolutionStatus();
        default:
            return {
                content: [{
                        type: "text",
                        text: `Unknown tool: ${request.params.name}`
                    }],
                isError: true
            };
    }
});
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Event Horizon MCP Server running on stdio");
}
runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});
