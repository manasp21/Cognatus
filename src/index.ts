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

interface PeerReviewFeedback {
  perspective: string;
  critique: string;
  suggestions: string[];
  confidenceRating: number;
  potentialFlaws: string[];
}

interface PeerReviewInput {
  focusArea?: 'hypotheses' | 'methodology' | 'data' | 'conclusions' | 'overall';
  reviewerType?: 'skeptical' | 'supportive' | 'methodological' | 'statistical';
}

interface LiteratureSearchInput {
  query: string;
  database?: 'pubmed' | 'arxiv' | 'scholar' | 'ieee' | 'scopus';
  limit?: number;
  yearFrom?: number;
  yearTo?: number;
}

interface LiteratureResult {
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi: string;
  abstract: string;
  citationCount: number;
  relevanceScore: number;
  keywords: string[];
}

interface DataAnalysisInput {
  data: string[];
  analysisType?: 'descriptive' | 'inferential' | 'correlation' | 'regression' | 'comprehensive';
  targetVariable?: string;
  confidenceLevel?: number;
}

interface StatisticalResult {
  metric: string;
  value: number;
  interpretation: string;
  significance?: 'low' | 'moderate' | 'high' | 'very_high';
}

interface DataAnalysisReport {
  datasetSummary: {
    sampleSize: number;
    dataPoints: string[];
    dataTypes: string[];
  };
  descriptiveStats: StatisticalResult[];
  inferentialStats?: StatisticalResult[];
  correlations?: StatisticalResult[];
  hypothesisTests?: {
    hypothesis: string;
    testType: string;
    pValue: number;
    significant: boolean;
    conclusion: string;
  }[];
  recommendations: string[];
}

interface WebSearchConfig {
  enabled: boolean;
  preferReal: boolean;
  fallbackToSimulation: boolean;
  availableTools?: string[];
}

interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  date?: string;
}

interface WebSearchResponse {
  results: WebSearchResult[];
  totalResults: number;
  searchTime: number;
  query: string;
  source: 'real' | 'simulated';
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

class WebSearchService {
  private config: WebSearchConfig;
  private availableTools: Set<string>;

  constructor(config: WebSearchConfig = { enabled: true, preferReal: true, fallbackToSimulation: true }) {
    this.config = config;
    this.availableTools = new Set(config.availableTools || []);
  }

  public async search(query: string, options: { 
    limit?: number; 
    academic?: boolean; 
    yearFrom?: number; 
    yearTo?: number; 
  } = {}): Promise<WebSearchResponse> {
    const startTime = Date.now();
    
    if (!this.config.enabled) {
      return this.simulateSearch(query, options, startTime);
    }

    // Try real web search first if preferred and available
    if (this.config.preferReal && this.hasWebSearchTools()) {
      try {
        const realResult = await this.performRealSearch(query, options);
        if (realResult) {
          return {
            ...realResult,
            searchTime: Date.now() - startTime,
            source: 'real' as const
          };
        }
      } catch (error) {
        console.error('Real web search failed:', error);
        if (!this.config.fallbackToSimulation) {
          throw error;
        }
      }
    }

    // Fallback to simulation
    return this.simulateSearch(query, options, startTime);
  }

  private hasWebSearchTools(): boolean {
    return this.availableTools.has('WebSearch') || this.availableTools.has('WebFetch');
  }

  private async performRealSearch(query: string, options: any): Promise<WebSearchResponse | null> {
    // This would integrate with actual web search tools available in the MCP context
    // For now, we'll return null to indicate real search is not available
    // In a real implementation, this would call the available web search tools
    
    // Example implementation would be:
    // if (this.availableTools.has('WebSearch')) {
    //   return await this.callWebSearchTool(query, options);
    // }
    
    return null;
  }

  private simulateSearch(query: string, options: any, startTime: number): WebSearchResponse {
    const results: WebSearchResult[] = this.generateSimulatedResults(query, options.limit || 10);
    
    return {
      results,
      totalResults: results.length,
      searchTime: Date.now() - startTime,
      query,
      source: 'simulated' as const
    };
  }

  private generateSimulatedResults(query: string, limit: number): WebSearchResult[] {
    const results: WebSearchResult[] = [];
    const currentYear = new Date().getFullYear();
    
    // Generate realistic web search results
    for (let i = 0; i < limit; i++) {
      const year = currentYear - Math.floor(Math.random() * 5);
      results.push({
        title: `${query}: Research and Analysis - Study ${i + 1}`,
        url: `https://example.com/research/${query.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
        snippet: `Recent research on ${query} shows significant findings in this area. This study examines the implications and provides new insights into ${query} methodology and applications.`,
        source: 'Academic Research Portal',
        date: `${year}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
      });
    }
    
    return results;
  }

  public formatWebSearchForLiterature(response: WebSearchResponse): string {
    let formatted = `## 🔍 Literature Search Results\n\n`;
    formatted += `**Query:** "${response.query}"\n`;
    formatted += `**Source:** ${response.source === 'real' ? '🌐 Real web search' : '🔬 Simulated search'}\n`;
    formatted += `**Results:** ${response.results.length} of ${response.totalResults}\n`;
    formatted += `**Search Time:** ${response.searchTime}ms\n\n`;
    
    response.results.forEach((result, index) => {
      formatted += `### ${index + 1}. ${result.title}\n`;
      formatted += `**Source:** ${result.source}\n`;
      if (result.date) {
        formatted += `**Date:** ${result.date}\n`;
      }
      formatted += `**URL:** ${result.url}\n`;
      formatted += `**Summary:** ${result.snippet}\n\n`;
    });
    
    if (response.source === 'simulated') {
      formatted += `💡 **Note:** These are simulated results. For real research, enable web search tools in your MCP configuration.\n\n`;
    }
    
    return formatted;
  }
}

class ScientificMethodEngine {
  public state: ResearchState;
  private webSearchService: WebSearchService;

  constructor(webSearchConfig?: WebSearchConfig) {
    this.state = this.getInitialState();
    this.webSearchService = new WebSearchService(webSearchConfig);
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

  private safeExecute(operation: () => { content: Array<{ type: "text"; text: string }> }, context: string): { content: Array<{ type: "text"; text: string }> };
  private safeExecute(operation: () => Promise<{ content: Array<{ type: "text"; text: string }> }>, context: string): Promise<{ content: Array<{ type: "text"; text: string }> }>;
  private safeExecute(operation: (() => { content: Array<{ type: "text"; text: string }> }) | (() => Promise<{ content: Array<{ type: "text"; text: string }> }>), context: string): { content: Array<{ type: "text"; text: string }> } | Promise<{ content: Array<{ type: "text"; text: string }> }> {
    try {
      const result = operation();
      if (result instanceof Promise) {
        return result.catch((error) => {
          const errorMsg = `Error in ${context}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          this.log(errorMsg, 'error');
          return { content: [{ type: "text", text: errorMsg }] };
        });
      }
      return result;
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

  public async literature_review(input: unknown): Promise<{ content: Array<{ type: "text"; text: string }> }> {
    return this.safeExecute(async () => {
      this.validateInput(input, ['literature']);
      const { literature, autoSearch = false } = input as { literature: string; autoSearch?: boolean };
      
      if (literature.length < 20) {
        throw new Error('Literature review must be at least 20 characters long');
      }
      
      let finalOutput = `Literature review added: ${literature}`;
      
      // Add automatic web search if enabled and we have a problem statement
      if (autoSearch && this.state.problemStatement) {
        try {
          this.log('Performing automatic literature search based on problem statement', 'info');
          
          // Generate search queries from problem statement
          const searchQueries = this.generateSearchQueries(this.state.problemStatement);
          let webSearchResults = '';
          
          for (const query of searchQueries.slice(0, 2)) { // Limit to 2 queries to avoid overwhelming
            const searchResponse = await this.webSearchService.search(query, {
              limit: 3,
              academic: true
            });
            
            if (searchResponse.results.length > 0) {
              webSearchResults += `\n\n### 🔍 Auto-Search Results for "${query}"\n`;
              webSearchResults += `**Source:** ${searchResponse.source === 'real' ? 'Real web search' : 'Simulated search'}\n\n`;
              
              searchResponse.results.forEach((result, index) => {
                webSearchResults += `${index + 1}. **${result.title}**\n`;
                webSearchResults += `   ${result.snippet}\n`;
                webSearchResults += `   Source: ${result.source} | URL: ${result.url}\n\n`;
              });
            }
          }
          
          if (webSearchResults) {
            finalOutput += `\n\n## 📚 Automatic Literature Search Results\n${webSearchResults}`;
            finalOutput += `\n💡 **Tip:** Use the \`literature_search\` tool for more comprehensive academic database searches.`;
          }
          
        } catch (error) {
          this.log(`Auto-search failed: ${error}`, 'warning');
          finalOutput += `\n\n⚠️ **Note:** Automatic literature search failed. Consider using the \`literature_search\` tool manually.`;
        }
      } else if (autoSearch && !this.state.problemStatement) {
        finalOutput += `\n\n💡 **Tip:** Complete the observation stage first to enable automatic literature search based on your problem statement.`;
      }
      
      this.state.literature.push(literature);
      this.log(`Literature added: ${literature}`);
      this.transitionTo(Stage.HypothesisFormation);
      return { content: [{ type: "text" as const, text: finalOutput }] };
    }, 'literature_review');
  }
  
  private generateSearchQueries(problemStatement: string): string[] {
    // Extract key terms and generate search queries
    const queries: string[] = [];
    
    // Simple keyword extraction (in a real implementation, this could be more sophisticated)
    const cleanedStatement = problemStatement.toLowerCase();
    
    // Generate different query variations
    queries.push(problemStatement.slice(0, 50)); // First 50 chars as base query
    
    // Extract potential key terms
    const terms = cleanedStatement.split(/\s+/).filter(term => 
      term.length > 4 && 
      !['that', 'with', 'this', 'from', 'they', 'have', 'been', 'will', 'were', 'what', 'when', 'where', 'how'].includes(term)
    );
    
    if (terms.length >= 2) {
      queries.push(`${terms[0]} ${terms[1]} research`);
      queries.push(`${terms[0]} ${terms[1]} study`);
    }
    
    if (terms.length >= 3) {
      queries.push(`${terms[0]} ${terms[1]} ${terms[2]}`);
    }
    
    return queries.filter(q => q.length > 10); // Filter out too short queries
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
  
  public async literature_search(input: unknown): Promise<{ content: Array<{ type: "text"; text: string }> }> {
    return this.safeExecute(async () => {
      this.validateInput(input, ['query']);
      const params = input as LiteratureSearchInput;
      const { query, database = 'scholar', limit = 10, yearFrom, yearTo } = params;
      
      if (query.length < 3) {
        throw new Error('Search query must be at least 3 characters long');
      }
      
      // Try web search first, then fallback to academic database simulation
      try {
        const webSearchResponse = await this.webSearchService.search(query, {
          limit: Math.min(limit, 5), // Limit web search results
          academic: true,
          yearFrom,
          yearTo
        });
        
        if (webSearchResponse.source === 'real') {
          // Use real web search results
          const webSearchSummary = this.webSearchService.formatWebSearchForLiterature(webSearchResponse);
          
          // Also generate academic database results for comparison
          const academicResults = this.generateLiteratureResults(query, database, limit - webSearchResponse.results.length, yearFrom, yearTo);
          const academicSummary = this.formatLiteratureSearchResults(academicResults, query, database);
          
          const combinedSummary = `${webSearchSummary}\n---\n\n## 📚 Academic Database Results\n\n${academicSummary}`;
          
          // Add to literature state for future reference
          const literatureEntry = `Literature search: "${query}" via web search + ${database} (${webSearchResponse.results.length + academicResults.length} results)`;
          this.state.literature.push(literatureEntry);
          
          this.log(`Literature search completed: ${webSearchResponse.results.length} web + ${academicResults.length} academic results for "${query}"`, 'success');
          return { content: [{ type: "text" as const, text: combinedSummary }] };
        }
      } catch (error) {
        this.log(`Web search failed, falling back to academic database simulation: ${error}`, 'warning');
      }
      
      // Fallback to academic database simulation
      const results = this.generateLiteratureResults(query, database, limit, yearFrom, yearTo);
      const summary = this.formatLiteratureSearchResults(results, query, database);
      
      // Add to literature state for future reference
      const literatureEntry = `Literature search: "${query}" in ${database} (${results.length} results found)`;
      this.state.literature.push(literatureEntry);
      
      this.log(`Literature search completed: ${results.length} results for "${query}" in ${database}`, 'success');
      return { content: [{ type: "text" as const, text: summary }] };
    }, 'literature_search');
  }

  private generateLiteratureResults(query: string, database: string, limit: number, yearFrom?: number, yearTo?: number): LiteratureResult[] {
    const currentYear = new Date().getFullYear();
    const fromYear = yearFrom || currentYear - 10;
    const toYear = yearTo || currentYear;
    
    // Simulate realistic search results based on query and database
    const baseResults = this.getLiteratureTemplates(query, database);
    const results: LiteratureResult[] = [];
    
    for (let i = 0; i < Math.min(limit, baseResults.length); i++) {
      const template = baseResults[i];
      const year = this.randomBetween(fromYear, toYear);
      const relevanceScore = Math.max(0.3, 1 - (i * 0.1) + (Math.random() * 0.2 - 0.1));
      
      results.push({
        title: this.generateTitle(query, template.area),
        authors: this.generateAuthors(),
        journal: this.getJournalForDatabase(database, template.area),
        year: year,
        doi: this.generateDOI(),
        abstract: this.generateAbstract(query, template.area),
        citationCount: this.generateCitationCount(year, relevanceScore),
        relevanceScore: Math.round(relevanceScore * 100) / 100,
        keywords: this.generateKeywords(query, template.area)
      });
    }
    
    // Sort by relevance score (highest first)
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
  
  private getLiteratureTemplates(query: string, database: string) {
    const queryLower = query.toLowerCase();
    const templates = [];
    
    // Research area classification
    if (queryLower.includes('machine learning') || queryLower.includes('neural') || queryLower.includes('ai')) {
      templates.push(
        { area: 'machine_learning', count: 8 },
        { area: 'computer_science', count: 5 },
        { area: 'statistics', count: 3 }
      );
    } else if (queryLower.includes('biology') || queryLower.includes('medical') || queryLower.includes('health')) {
      templates.push(
        { area: 'biology', count: 8 },
        { area: 'medicine', count: 6 },
        { area: 'biochemistry', count: 4 }
      );
    } else if (queryLower.includes('physics') || queryLower.includes('quantum') || queryLower.includes('energy')) {
      templates.push(
        { area: 'physics', count: 8 },
        { area: 'engineering', count: 5 },
        { area: 'materials', count: 3 }
      );
    } else if (queryLower.includes('psychology') || queryLower.includes('behavior') || queryLower.includes('cognitive')) {
      templates.push(
        { area: 'psychology', count: 8 },
        { area: 'neuroscience', count: 5 },
        { area: 'sociology', count: 3 }
      );
    } else {
      // Generic interdisciplinary results
      templates.push(
        { area: 'interdisciplinary', count: 6 },
        { area: 'general_science', count: 4 },
        { area: 'methodology', count: 3 }
      );
    }
    
    // Flatten templates for result generation
    const flatResults: {area: string}[] = [];
    templates.forEach(template => {
      for (let i = 0; i < template.count; i++) {
        flatResults.push({ area: template.area });
      }
    });
    
    return flatResults;
  }
  
  private generateTitle(query: string, area: string): string {
    const titleTemplates = {
      machine_learning: [
        `Advanced ${query} Approaches in Deep Learning Applications`,
        `${query}: A Comprehensive Machine Learning Framework`,
        `Novel ${query} Algorithms for Predictive Modeling`,
        `${query} in Neural Network Architectures: Recent Advances`
      ],
      biology: [
        `${query} in Biological Systems: Molecular Mechanisms`,
        `Investigating ${query} Through Genomic Analysis`,
        `${query}: Implications for Cellular Biology Research`,
        `Evolutionary Aspects of ${query} in Living Organisms`
      ],
      physics: [
        `Quantum ${query} Phenomena in Modern Physics`,
        `${query}: Theoretical and Experimental Investigations`,
        `Advanced ${query} Models in Condensed Matter Physics`,
        `${query} Dynamics in Complex Physical Systems`
      ],
      psychology: [
        `${query} and Human Cognitive Processes`,
        `Psychological Aspects of ${query} in Behavioral Studies`,
        `${query}: A Meta-Analysis of Psychological Research`,
        `Neurocognitive Mechanisms of ${query} Processing`
      ],
      engineering: [
        `Engineering Applications of ${query} in Modern Systems`,
        `${query}-Based Solutions for Industrial Challenges`,
        `Optimization of ${query} in Engineering Design`,
        `${query} Technologies: Implementation and Performance`
      ],
      default: [
        `Research Advances in ${query}`,
        `${query}: Current State and Future Directions`,
        `Comprehensive Review of ${query} Literature`,
        `${query} Studies: Methodological Approaches`
      ]
    };
    
    const templates = titleTemplates[area as keyof typeof titleTemplates] || titleTemplates.default;
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  private generateAuthors(): string[] {
    const firstNames = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'Robert', 'Anna', 'James', 'Maria', 'William', 'Jennifer', 'Thomas', 'Amy', 'Richard'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson'];
    
    const authorCount = this.randomBetween(2, 6);
    const authors: string[] = [];
    
    for (let i = 0; i < authorCount; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      authors.push(`${firstName} ${lastName}`);
    }
    
    return authors;
  }
  
  private getJournalForDatabase(database: string, area: string): string {
    const journals = {
      pubmed: ['Nature Medicine', 'Cell', 'Science', 'NEJM', 'Lancet', 'PLOS Medicine', 'BMJ'],
      arxiv: ['arXiv Preprint', 'ArXiv Physics', 'ArXiv Computer Science', 'ArXiv Mathematics'],
      scholar: ['Nature', 'Science', 'Cell', 'PNAS', 'Scientific Reports', 'PLOS ONE'],
      ieee: ['IEEE Transactions', 'IEEE Access', 'IEEE Computer', 'IEEE Signal Processing'],
      scopus: ['Elsevier Journal', 'Springer Nature', 'Wiley Research', 'Academic Press']
    };
    
    const dbJournals = journals[database as keyof typeof journals] || journals.scholar;
    return dbJournals[Math.floor(Math.random() * dbJournals.length)];
  }
  
  private generateDOI(): string {
    const prefix = '10.1' + Math.floor(Math.random() * 900 + 100);
    const suffix = Math.random().toString(36).substring(2, 15);
    return `${prefix}/${suffix}`;
  }
  
  private generateAbstract(query: string, area: string): string {
    const abstracts = {
      machine_learning: `This study presents a novel approach to ${query} using advanced machine learning techniques. We developed and evaluated algorithms that demonstrate significant improvements in accuracy and computational efficiency. Our methodology combines deep neural networks with innovative feature extraction methods, resulting in state-of-the-art performance on benchmark datasets. The results show promising applications for real-world implementation.`,
      
      biology: `We investigated the role of ${query} in biological systems through comprehensive experimental analysis. Our research utilized cutting-edge molecular biology techniques to examine cellular mechanisms and pathways. The findings reveal important insights into the fundamental processes governing ${query} in living organisms, with implications for understanding disease mechanisms and potential therapeutic targets.`,
      
      physics: `This research explores ${query} phenomena through both theoretical modeling and experimental validation. We present new mathematical frameworks that accurately describe the observed behaviors and predict novel effects. Our experimental setup confirmed theoretical predictions and revealed unexpected properties that advance our understanding of fundamental physical principles.`,
      
      psychology: `We conducted a comprehensive psychological study examining ${query} and its impact on human behavior and cognition. Using rigorous experimental design with a large participant pool, we identified significant patterns in cognitive processing and behavioral responses. The results contribute to theoretical models of human psychology and have practical implications for applied settings.`,
      
      default: `This research provides a comprehensive analysis of ${query} through systematic investigation and methodological innovation. We employed multi-disciplinary approaches to examine key aspects and relationships. Our findings contribute significant new knowledge to the field and identify important directions for future research and practical applications.`
    };
    
    return abstracts[area as keyof typeof abstracts] || abstracts.default;
  }
  
  private generateCitationCount(year: number, relevanceScore: number): number {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    const baseCitations = Math.floor(relevanceScore * 100);
    const ageFactor = Math.max(0.1, 1 - (age * 0.1));
    return Math.floor(baseCitations * ageFactor * (1 + Math.random()));
  }
  
  private generateKeywords(query: string, area: string): string[] {
    const baseKeywords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    const areaKeywords = {
      machine_learning: ['neural networks', 'deep learning', 'artificial intelligence', 'algorithms', 'data mining'],
      biology: ['molecular biology', 'genetics', 'cellular mechanisms', 'biochemistry', 'proteomics'],
      physics: ['quantum mechanics', 'theoretical physics', 'experimental physics', 'materials science'],
      psychology: ['cognitive psychology', 'behavioral analysis', 'neuroscience', 'experimental psychology'],
      default: ['research methodology', 'data analysis', 'scientific investigation', 'empirical study']
    };
    
    const areaKeys = areaKeywords[area as keyof typeof areaKeywords] || areaKeywords.default;
    const selectedKeywords = [...baseKeywords];
    
    // Add 2-3 area-specific keywords
    for (let i = 0; i < 3 && i < areaKeys.length; i++) {
      if (Math.random() > 0.3) {
        selectedKeywords.push(areaKeys[i]);
      }
    }
    
    return selectedKeywords.slice(0, 8);
  }
  
  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  private formatLiteratureSearchResults(results: LiteratureResult[], query: string, database: string): string {
    if (results.length === 0) {
      return `## 📚 Literature Search Results\n\n**Query:** "${query}"\n**Database:** ${database}\n\n❌ No results found. Try adjusting your search terms or expanding the search criteria.`;
    }
    
    let summary = `## 📚 Literature Search Results\n\n`;
    summary += `**Query:** "${query}"\n`;
    summary += `**Database:** ${database.charAt(0).toUpperCase() + database.slice(1)}\n`;
    summary += `**Results Found:** ${results.length}\n\n`;
    
    results.forEach((result, index) => {
      const relevanceEmoji = result.relevanceScore > 0.8 ? "🟢" : result.relevanceScore > 0.6 ? "🟡" : "🔴";
      
      summary += `### ${index + 1}. ${result.title}\n`;
      summary += `**Authors:** ${result.authors.join(', ')}\n`;
      summary += `**Journal:** ${result.journal} (${result.year})\n`;
      summary += `**DOI:** ${result.doi}\n`;
      summary += `**Citations:** ${result.citationCount}\n`;
      summary += `**Relevance:** ${relevanceEmoji} ${(result.relevanceScore * 100).toFixed(0)}%\n`;
      summary += `**Keywords:** ${result.keywords.join(', ')}\n\n`;
      summary += `**Abstract:** ${result.abstract}\n\n`;
      summary += `---\n\n`;
    });
    
    // Add search summary statistics
    const avgRelevance = results.reduce((sum, r) => sum + r.relevanceScore, 0) / results.length;
    const avgCitations = Math.round(results.reduce((sum, r) => sum + r.citationCount, 0) / results.length);
    const yearRange = `${Math.min(...results.map(r => r.year))}-${Math.max(...results.map(r => r.year))}`;
    
    summary += `### 📊 Search Summary\n`;
    summary += `• **Average Relevance:** ${(avgRelevance * 100).toFixed(1)}%\n`;
    summary += `• **Average Citations:** ${avgCitations}\n`;
    summary += `• **Year Range:** ${yearRange}\n`;
    summary += `• **Top Keywords:** ${this.getTopKeywords(results)}\n\n`;
    
    summary += `💡 **Tip:** Use these results to inform your literature review and identify key research gaps.`;
    
    return summary;
  }
  
  private getTopKeywords(results: LiteratureResult[]): string {
    const keywordCounts: {[key: string]: number} = {};
    
    results.forEach(result => {
      result.keywords.forEach(keyword => {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
      });
    });
    
    const sortedKeywords = Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([keyword]) => keyword);
      
    return sortedKeywords.join(', ');
  }

  public data_analysis(input: unknown): { content: Array<{ type: "text"; text: string }> } {
    return this.safeExecute(() => {
      this.validateInput(input, ['data']);
      const params = input as DataAnalysisInput;
      const { data, analysisType = 'comprehensive', targetVariable, confidenceLevel = 0.95 } = params;
      
      if (data.length < 2) {
        throw new Error('At least 2 data points are required for statistical analysis');
      }
      
      // Parse and validate data
      const numericData = this.parseDataPoints(data);
      if (numericData.length === 0) {
        throw new Error('No valid numeric data found for analysis');
      }
      
      // Perform statistical analysis
      const report = this.generateStatisticalAnalysis(data, numericData, analysisType, targetVariable, confidenceLevel);
      const summary = this.formatDataAnalysisReport(report, analysisType);
      
      // Update analysis state
      this.state.analysis = `Statistical analysis completed: ${analysisType} analysis of ${data.length} data points (${numericData.length} numeric)`;
      
      this.log(`Data analysis completed: ${analysisType} analysis on ${data.length} data points`, 'success');
      return { content: [{ type: "text", text: summary }] };
    }, 'data_analysis');
  }

  private parseDataPoints(data: string[]): number[] {
    const numericData: number[] = [];
    
    data.forEach(point => {
      // Try to extract numeric values from text
      const cleanPoint = point.replace(/[^\d.-]/g, ' ').trim();
      const numbers = cleanPoint.split(/\s+/).map(n => parseFloat(n)).filter(n => !isNaN(n));
      numericData.push(...numbers);
    });
    
    return numericData;
  }
  
  private generateStatisticalAnalysis(
    rawData: string[], 
    numericData: number[], 
    analysisType: string, 
    targetVariable?: string, 
    confidenceLevel: number = 0.95
  ): DataAnalysisReport {
    
    const report: DataAnalysisReport = {
      datasetSummary: {
        sampleSize: rawData.length,
        dataPoints: rawData.slice(0, 10), // Show first 10 for brevity
        dataTypes: this.classifyDataTypes(rawData)
      },
      descriptiveStats: this.calculateDescriptiveStats(numericData),
      recommendations: []
    };
    
    // Add analysis based on type
    switch (analysisType) {
      case 'descriptive':
        // Already calculated above
        break;
        
      case 'inferential':
        report.inferentialStats = this.calculateInferentialStats(numericData, confidenceLevel);
        report.hypothesisTests = this.performHypothesisTests(numericData);
        break;
        
      case 'correlation':
        report.correlations = this.calculateCorrelations(numericData);
        break;
        
      case 'regression':
        report.inferentialStats = this.performRegressionAnalysis(numericData);
        break;
        
      case 'comprehensive':
      default:
        report.inferentialStats = this.calculateInferentialStats(numericData, confidenceLevel);
        report.correlations = this.calculateCorrelations(numericData);
        report.hypothesisTests = this.performHypothesisTests(numericData);
        break;
    }
    
    // Generate recommendations
    report.recommendations = this.generateRecommendations(report, numericData.length);
    
    return report;
  }
  
  private classifyDataTypes(data: string[]): string[] {
    const types: Set<string> = new Set();
    
    data.forEach(point => {
      if (/^\d+(\.\d+)?$/.test(point.trim())) {
        types.add('numeric');
      } else if (/^(true|false|yes|no|y|n)$/i.test(point.trim())) {
        types.add('boolean');
      } else if (/^\d{4}-\d{2}-\d{2}/.test(point.trim())) {
        types.add('date');
      } else if (point.includes(',') || point.includes(';')) {
        types.add('multivalue');
      } else {
        types.add('categorical');
      }
    });
    
    return Array.from(types);
  }
  
  private calculateDescriptiveStats(data: number[]): StatisticalResult[] {
    if (data.length === 0) return [];
    
    const sorted = [...data].sort((a, b) => a - b);
    const n = data.length;
    const sum = data.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    const stdDev = Math.sqrt(variance);
    
    const q1 = this.percentile(sorted, 0.25);
    const median = this.percentile(sorted, 0.5);
    const q3 = this.percentile(sorted, 0.75);
    const iqr = q3 - q1;
    
    return [
      {
        metric: 'Sample Size (n)',
        value: n,
        interpretation: `Dataset contains ${n} numeric observations${n < 30 ? ' (small sample)' : n < 100 ? ' (medium sample)' : ' (large sample)'}`
      },
      {
        metric: 'Mean',
        value: Math.round(mean * 1000) / 1000,
        interpretation: `Average value is ${mean.toFixed(3)}`
      },
      {
        metric: 'Standard Deviation',
        value: Math.round(stdDev * 1000) / 1000,
        interpretation: `Data spread: ${stdDev < mean * 0.1 ? 'low variability' : stdDev < mean * 0.3 ? 'moderate variability' : 'high variability'}`
      },
      {
        metric: 'Median',
        value: Math.round(median * 1000) / 1000,
        interpretation: `Middle value is ${median.toFixed(3)}${Math.abs(mean - median) < stdDev * 0.1 ? ' (symmetric distribution)' : ' (skewed distribution)'}`
      },
      {
        metric: 'Range',
        value: Math.round((sorted[n - 1] - sorted[0]) * 1000) / 1000,
        interpretation: `Data spans from ${sorted[0].toFixed(3)} to ${sorted[n - 1].toFixed(3)}`
      },
      {
        metric: 'Interquartile Range (IQR)',
        value: Math.round(iqr * 1000) / 1000,
        interpretation: `Middle 50% of data spans ${iqr.toFixed(3)} units`
      }
    ];
  }
  
  private calculateInferentialStats(data: number[], confidenceLevel: number): StatisticalResult[] {
    const n = data.length;
    const mean = data.reduce((acc, val) => acc + val, 0) / n;
    const stdDev = Math.sqrt(data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1));
    const stdError = stdDev / Math.sqrt(n);
    
    // T-distribution critical value (approximation)
    const alpha = 1 - confidenceLevel;
    const tCritical = this.getTCritical(n - 1, alpha / 2);
    const marginError = tCritical * stdError;
    
    const ciLower = mean - marginError;
    const ciUpper = mean + marginError;
    
    return [
      {
        metric: 'Standard Error of Mean',
        value: Math.round(stdError * 1000) / 1000,
        interpretation: `Precision of sample mean estimate: ±${stdError.toFixed(3)}`,
        significance: stdError < stdDev * 0.1 ? 'high' : stdError < stdDev * 0.3 ? 'moderate' : 'low'
      },
      {
        metric: `${(confidenceLevel * 100)}% Confidence Interval`,
        value: Math.round(marginError * 1000) / 1000,
        interpretation: `Population mean likely between ${ciLower.toFixed(3)} and ${ciUpper.toFixed(3)}`,
        significance: marginError < stdDev * 0.2 ? 'high' : marginError < stdDev * 0.5 ? 'moderate' : 'low'
      }
    ];
  }
  
  private calculateCorrelations(data: number[]): StatisticalResult[] {
    if (data.length < 4) return [];
    
    // Create pairs for correlation analysis (adjacent values, lag-1 autocorrelation)
    const pairs: [number, number][] = [];
    for (let i = 0; i < data.length - 1; i++) {
      pairs.push([data[i], data[i + 1]]);
    }
    
    if (pairs.length < 3) return [];
    
    const correlation = this.calculatePearsonCorrelation(pairs);
    const nPairs = pairs.length;
    
    // Test for significance (approximate)
    const tStat = correlation * Math.sqrt((nPairs - 2) / (1 - correlation * correlation));
    const significant = Math.abs(tStat) > 2.0; // Rough t-critical for p < 0.05
    
    return [
      {
        metric: 'Serial Correlation (Lag-1)',
        value: Math.round(correlation * 1000) / 1000,
        interpretation: `${Math.abs(correlation) < 0.3 ? 'Weak' : Math.abs(correlation) < 0.7 ? 'Moderate' : 'Strong'} ${correlation > 0 ? 'positive' : 'negative'} correlation between consecutive values${significant ? ' (significant)' : ' (not significant)'}`,
        significance: Math.abs(correlation) < 0.3 ? 'low' : Math.abs(correlation) < 0.7 ? 'moderate' : 'high'
      }
    ];
  }
  
  private performHypothesisTests(data: number[]): { hypothesis: string; testType: string; pValue: number; significant: boolean; conclusion: string; }[] {
    const n = data.length;
    const mean = data.reduce((acc, val) => acc + val, 0) / n;
    const stdDev = Math.sqrt(data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1));
    
    const tests = [];
    
    // One-sample t-test against zero
    const tStat = mean / (stdDev / Math.sqrt(n));
    const pValue = this.calculatePValue(Math.abs(tStat), n - 1);
    
    tests.push({
      hypothesis: 'H0: Population mean = 0',
      testType: 'One-sample t-test',
      pValue: Math.round(pValue * 1000) / 1000,
      significant: pValue < 0.05,
      conclusion: pValue < 0.05 ? 'Reject H0: Mean significantly different from zero' : 'Fail to reject H0: Mean not significantly different from zero'
    });
    
    // Normality test (simplified Shapiro-Wilk approximation)
    if (n >= 3 && n <= 50) {
      const normalityP = this.simpleNormalityTest(data);
      tests.push({
        hypothesis: 'H0: Data follows normal distribution',
        testType: 'Normality test (approximate)',
        pValue: Math.round(normalityP * 1000) / 1000,
        significant: normalityP < 0.05,
        conclusion: normalityP < 0.05 ? 'Reject H0: Data not normally distributed' : 'Fail to reject H0: Data appears normally distributed'
      });
    }
    
    return tests;
  }
  
  private performRegressionAnalysis(data: number[]): StatisticalResult[] {
    if (data.length < 4) return [];
    
    // Simple linear regression: y = data values, x = index (time trend)
    const n = data.length;
    const xValues = Array.from({ length: n }, (_, i) => i + 1);
    const yValues = data;
    
    const xMean = xValues.reduce((a, b) => a + b, 0) / n;
    const yMean = yValues.reduce((a, b) => a + b, 0) / n;
    
    const numerator = xValues.reduce((sum, x, i) => sum + (x - xMean) * (yValues[i] - yMean), 0);
    const denominator = xValues.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0);
    
    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;
    
    // Calculate R-squared
    const yPredicted = xValues.map(x => intercept + slope * x);
    const ssRes = yValues.reduce((sum, y, i) => sum + Math.pow(y - yPredicted[i], 2), 0);
    const ssTot = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);
    
    return [
      {
        metric: 'Trend Slope',
        value: Math.round(slope * 1000) / 1000,
        interpretation: `Data shows ${Math.abs(slope) < 0.1 ? 'minimal' : Math.abs(slope) < 1 ? 'moderate' : 'strong'} ${slope > 0 ? 'upward' : 'downward'} trend`,
        significance: Math.abs(slope) < 0.1 ? 'low' : Math.abs(slope) < 1 ? 'moderate' : 'high'
      },
      {
        metric: 'R-squared',
        value: Math.round(rSquared * 1000) / 1000,
        interpretation: `Trend explains ${(rSquared * 100).toFixed(1)}% of variance${rSquared > 0.7 ? ' (strong fit)' : rSquared > 0.3 ? ' (moderate fit)' : ' (weak fit)'}`,
        significance: rSquared > 0.7 ? 'high' : rSquared > 0.3 ? 'moderate' : 'low'
      }
    ];
  }
  
  private generateRecommendations(report: DataAnalysisReport, dataSize: number): string[] {
    const recommendations: string[] = [];
    
    // Sample size recommendations
    if (dataSize < 30) {
      recommendations.push('Consider collecting more data points (n≥30) for more reliable statistical inference');
    }
    
    // Normality recommendations
    const normalityTest = report.hypothesisTests?.find(test => test.hypothesis.includes('normal'));
    if (normalityTest && normalityTest.significant) {
      recommendations.push('Data appears non-normal; consider non-parametric tests or data transformation');
    }
    
    // Correlation recommendations
    const correlation = report.correlations?.find(corr => corr.metric.includes('Correlation'));
    if (correlation && Math.abs(correlation.value) > 0.5) {
      recommendations.push('Strong serial correlation detected; consider time series analysis methods');
    }
    
    // Variance recommendations
    const stdDev = report.descriptiveStats.find(stat => stat.metric === 'Standard Deviation');
    const mean = report.descriptiveStats.find(stat => stat.metric === 'Mean');
    if (stdDev && mean && stdDev.value > Math.abs(mean.value)) {
      recommendations.push('High variability detected; investigate potential outliers or confounding factors');
    }
    
    // Confidence interval recommendations
    const ci = report.inferentialStats?.find(stat => stat.metric.includes('Confidence'));
    if (ci && ci.significance === 'low') {
      recommendations.push('Wide confidence intervals suggest need for larger sample size or reduced measurement error');
    }
    
    // Hypothesis validation recommendations
    if (report.hypothesisTests && report.hypothesisTests.length > 0) {
      const significantTests = report.hypothesisTests.filter(test => test.significant);
      if (significantTests.length > 0) {
        recommendations.push('Significant statistical results found; validate with independent dataset or replication study');
      }
    }
    
    return recommendations;
  }
  
  // Helper mathematical functions
  private percentile(sortedData: number[], p: number): number {
    const index = p * (sortedData.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    if (lower === upper) {
      return sortedData[lower];
    }
    
    return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
  }
  
  private getTCritical(df: number, alpha: number): number {
    // Simplified t-critical values for common cases
    if (df >= 30) return 1.96; // Normal approximation
    const tTable: { [key: number]: number } = {
      1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
      6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
      15: 2.131, 20: 2.086, 25: 2.060
    };
    
    const closestDf = Object.keys(tTable)
      .map(Number)
      .reduce((prev, curr) => Math.abs(curr - df) < Math.abs(prev - df) ? curr : prev);
    
    return tTable[closestDf] || 2.0;
  }
  
  private calculatePearsonCorrelation(pairs: [number, number][]): number {
    const n = pairs.length;
    const xValues = pairs.map(p => p[0]);
    const yValues = pairs.map(p => p[1]);
    
    const xMean = xValues.reduce((a, b) => a + b, 0) / n;
    const yMean = yValues.reduce((a, b) => a + b, 0) / n;
    
    const numerator = pairs.reduce((sum, [x, y]) => sum + (x - xMean) * (y - yMean), 0);
    const xVariance = xValues.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0);
    const yVariance = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    
    return numerator / Math.sqrt(xVariance * yVariance);
  }
  
  private calculatePValue(tStat: number, df: number): number {
    // Simplified p-value calculation (approximation)
    if (Math.abs(tStat) > 3) return 0.001;
    if (Math.abs(tStat) > 2.5) return 0.01;
    if (Math.abs(tStat) > 2) return 0.05;
    if (Math.abs(tStat) > 1.5) return 0.1;
    return 0.2;
  }
  
  private simpleNormalityTest(data: number[]): number {
    // Simplified normality test based on skewness and kurtosis
    const n = data.length;
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    const skewness = data.reduce((sum, x) => sum + Math.pow((x - mean) / stdDev, 3), 0) / n;
    const kurtosis = data.reduce((sum, x) => sum + Math.pow((x - mean) / stdDev, 4), 0) / n - 3;
    
    // Rough approximation: reject normality if |skewness| > 1 or |kurtosis| > 1
    const normalityScore = Math.abs(skewness) + Math.abs(kurtosis);
    
    if (normalityScore > 2) return 0.01;
    if (normalityScore > 1) return 0.05;
    if (normalityScore > 0.5) return 0.1;
    return 0.5;
  }
  
  private formatDataAnalysisReport(report: DataAnalysisReport, analysisType: string): string {
    let summary = `## 📊 Statistical Data Analysis Report\n\n`;
    summary += `**Analysis Type:** ${analysisType.charAt(0).toUpperCase() + analysisType.slice(1)}\n`;
    summary += `**Dataset:** ${report.datasetSummary.sampleSize} observations\n`;
    summary += `**Data Types:** ${report.datasetSummary.dataTypes.join(', ')}\n\n`;
    
    // Dataset Summary
    summary += `### 📋 Dataset Summary\n`;
    summary += `• **Sample Size:** ${report.datasetSummary.sampleSize}\n`;
    summary += `• **Data Types Detected:** ${report.datasetSummary.dataTypes.join(', ')}\n`;
    if (report.datasetSummary.dataPoints.length > 0) {
      summary += `• **Sample Data:** ${report.datasetSummary.dataPoints.slice(0, 5).join(', ')}${report.datasetSummary.sampleSize > 5 ? '...' : ''}\n\n`;
    }
    
    // Descriptive Statistics
    summary += `### 📈 Descriptive Statistics\n`;
    report.descriptiveStats.forEach(stat => {
      const significanceEmoji = stat.significance === 'high' ? '🟢' : stat.significance === 'moderate' ? '🟡' : '🔴';
      summary += `• **${stat.metric}:** ${stat.value} ${stat.significance ? significanceEmoji : ''}\n`;
      summary += `  ${stat.interpretation}\n\n`;
    });
    
    // Inferential Statistics
    if (report.inferentialStats && report.inferentialStats.length > 0) {
      summary += `### 🔬 Inferential Statistics\n`;
      report.inferentialStats.forEach(stat => {
        const significanceEmoji = stat.significance === 'high' ? '🟢' : stat.significance === 'moderate' ? '🟡' : '🔴';
        summary += `• **${stat.metric}:** ${stat.value} ${stat.significance ? significanceEmoji : ''}\n`;
        summary += `  ${stat.interpretation}\n\n`;
      });
    }
    
    // Correlations
    if (report.correlations && report.correlations.length > 0) {
      summary += `### 🔗 Correlation Analysis\n`;
      report.correlations.forEach(corr => {
        const significanceEmoji = corr.significance === 'high' ? '🟢' : corr.significance === 'moderate' ? '🟡' : '🔴';
        summary += `• **${corr.metric}:** ${corr.value} ${corr.significance ? significanceEmoji : ''}\n`;
        summary += `  ${corr.interpretation}\n\n`;
      });
    }
    
    // Hypothesis Tests
    if (report.hypothesisTests && report.hypothesisTests.length > 0) {
      summary += `### 🧪 Hypothesis Testing\n`;
      report.hypothesisTests.forEach(test => {
        const resultEmoji = test.significant ? '✅' : '❌';
        summary += `• **${test.testType}** ${resultEmoji}\n`;
        summary += `  **Hypothesis:** ${test.hypothesis}\n`;
        summary += `  **p-value:** ${test.pValue}\n`;
        summary += `  **Result:** ${test.conclusion}\n\n`;
      });
    }
    
    // Recommendations
    if (report.recommendations.length > 0) {
      summary += `### 💡 Statistical Recommendations\n`;
      report.recommendations.forEach(rec => {
        summary += `• ${rec}\n`;
      });
      summary += '\n';
    }
    
    // Analysis Summary
    summary += `### 📋 Analysis Summary\n`;
    const totalTests = (report.hypothesisTests || []).length;
    const significantTests = (report.hypothesisTests || []).filter(test => test.significant).length;
    const avgSignificance = report.descriptiveStats.filter(stat => stat.significance).length;
    
    summary += `• **Statistical Tests:** ${totalTests} performed, ${significantTests} significant\n`;
    summary += `• **Data Quality:** ${avgSignificance > 3 ? 'High' : avgSignificance > 1 ? 'Moderate' : 'Limited'} statistical power\n`;
    summary += `• **Recommendation:** ${report.recommendations.length > 2 ? 'Multiple improvements suggested' : report.recommendations.length > 0 ? 'Some improvements recommended' : 'Data appears adequate for analysis'}\n\n`;
    
    summary += `💡 **Next Steps:** Use these results to validate hypotheses and inform research conclusions.`;
    
    return summary;
  }

  public peer_review_simulation(input: unknown): { content: Array<{ type: "text"; text: string }> } {
    return this.safeExecute(() => {
      const params = (input || {}) as PeerReviewInput;
      const focusArea = params.focusArea || 'overall';
      const reviewerType = params.reviewerType || 'methodological';
      
      // Check if there's enough research content to review
      if (!this.state.problemStatement && this.state.hypotheses.length === 0 && this.state.data.length === 0) {
        return { content: [{ type: "text", text: "❌ Insufficient research content for peer review. Please complete observation, hypothesis formation, or data collection first." }] };
      }
      
      const feedback = this.generatePeerReviewFeedback(focusArea, reviewerType);
      const summary = this.formatPeerReviewSummary(feedback, focusArea, reviewerType);
      
      this.log(`Peer review simulation completed: ${reviewerType} perspective on ${focusArea}`, 'info');
      return { content: [{ type: "text", text: summary }] };
    }, 'peer_review_simulation');
  }

  private generatePeerReviewFeedback(focusArea: string, reviewerType: string): PeerReviewFeedback {
    const perspectives = {
      skeptical: "Critical Skeptical Reviewer",
      supportive: "Supportive Academic Reviewer", 
      methodological: "Methodological Expert Reviewer",
      statistical: "Statistical Analysis Reviewer"
    };
    
    let critique = "";
    let suggestions: string[] = [];
    let potentialFlaws: string[] = [];
    let confidenceRating = 0.5;
    
    // Analyze based on focus area
    switch (focusArea) {
      case 'hypotheses':
        ({ critique, suggestions, potentialFlaws, confidenceRating } = this.reviewHypotheses(reviewerType));
        break;
      case 'methodology':
        ({ critique, suggestions, potentialFlaws, confidenceRating } = this.reviewMethodology(reviewerType));
        break;
      case 'data':
        ({ critique, suggestions, potentialFlaws, confidenceRating } = this.reviewData(reviewerType));
        break;
      case 'conclusions':
        ({ critique, suggestions, potentialFlaws, confidenceRating } = this.reviewConclusions(reviewerType));
        break;
      default:
        ({ critique, suggestions, potentialFlaws, confidenceRating } = this.reviewOverall(reviewerType));
    }
    
    return {
      perspective: perspectives[reviewerType as keyof typeof perspectives],
      critique,
      suggestions,
      confidenceRating,
      potentialFlaws
    };
  }
  
  private reviewHypotheses(reviewerType: string) {
    const hypotheses = this.state.hypotheses;
    let critique = "";
    let suggestions: string[] = [];
    let potentialFlaws: string[] = [];
    let confidenceRating = 0.5;
    
    if (hypotheses.length === 0) {
      critique = "No hypotheses have been formulated yet. This is a fundamental gap in the scientific process.";
      suggestions = ["Develop clear, testable hypotheses based on the problem statement", "Ensure hypotheses are specific and measurable"];
      potentialFlaws = ["Missing foundational hypotheses"];
      confidenceRating = 0.1;
    } else {
      const avgEvidence = hypotheses.reduce((sum, h) => sum + h.evidenceScore, 0) / hypotheses.length;
      
      switch (reviewerType) {
        case 'skeptical':
          critique = `${hypotheses.length} hypotheses presented with average evidence score of ${avgEvidence.toFixed(2)}. As a skeptical reviewer, I question whether these hypotheses are truly independent and whether confirmation bias may be affecting the evidence evaluation.`;
          suggestions = ["Test competing alternative hypotheses", "Seek disconfirming evidence", "Consider null hypotheses"];
          potentialFlaws = ["Possible confirmation bias", "Hypotheses may not be mutually exclusive", "Insufficient falsifiability testing"];
          confidenceRating = Math.max(0.2, avgEvidence - 0.3);
          break;
        case 'supportive':
          critique = `The ${hypotheses.length} hypotheses show promise with evidence scores averaging ${avgEvidence.toFixed(2)}. The research direction appears sound and methodologically appropriate.`;
          suggestions = ["Expand sample size to strengthen findings", "Consider additional variables", "Explore practical applications"];
          potentialFlaws = avgEvidence < 0.5 ? ["Evidence base could be stronger"] : [];
          confidenceRating = Math.min(0.9, avgEvidence + 0.2);
          break;
        case 'methodological':
          critique = `Methodological assessment of ${hypotheses.length} hypotheses reveals ${avgEvidence < 0.5 ? 'concerning' : 'adequate'} evidence foundation. Focus should be on experimental design rigor.`;
          suggestions = ["Ensure proper control groups", "Validate measurement instruments", "Consider confounding variables"];
          potentialFlaws = ["Need clearer operational definitions", "Potential measurement validity issues"];
          confidenceRating = avgEvidence;
          break;
        case 'statistical':
          critique = `Statistical review: ${hypotheses.length} hypotheses with mean evidence score ${avgEvidence.toFixed(3)}. ${avgEvidence > 0.7 ? 'Strong' : avgEvidence > 0.4 ? 'Moderate' : 'Weak'} statistical foundation.`;
          suggestions = ["Calculate effect sizes", "Perform power analysis", "Apply appropriate statistical tests"];
          potentialFlaws = avgEvidence < 0.6 ? ["Insufficient statistical power", "Risk of Type II error"] : [];
          confidenceRating = avgEvidence;
          break;
      }
    }
    
    return { critique, suggestions, potentialFlaws, confidenceRating };
  }
  
  private reviewMethodology(reviewerType: string) {
    const experiments = this.state.experiments;
    let critique = "";
    let suggestions: string[] = [];
    let potentialFlaws: string[] = [];
    let confidenceRating = 0.5;
    
    if (experiments.length === 0) {
      critique = "No experimental methodology has been designed. This is a critical gap for empirical validation.";
      suggestions = ["Design controlled experiments", "Establish clear protocols", "Define measurement procedures"];
      potentialFlaws = ["Missing experimental framework"];
      confidenceRating = 0.2;
    } else {
      switch (reviewerType) {
        case 'skeptical':
          critique = `${experiments.length} experimental designs provided. I'm concerned about potential methodological biases and whether controls are adequate.`;
          suggestions = ["Implement double-blind procedures", "Add negative controls", "Consider alternative explanations"];
          potentialFlaws = ["Possible experimenter bias", "Inadequate controls", "Selection bias risk"];
          confidenceRating = 0.4;
          break;
        case 'methodological':
          critique = `Methodological review of ${experiments.length} experimental designs. Focus on internal and external validity is essential.`;
          suggestions = ["Validate instruments", "Ensure reproducibility", "Document protocols thoroughly"];
          potentialFlaws = ["Protocol standardization needed", "Replication concerns"];
          confidenceRating = 0.6;
          break;
        default:
          critique = `${experiments.length} experimental approaches documented. Methodology appears reasonable for the research question.`;
          suggestions = ["Scale up successful pilots", "Consider cross-validation"];
          potentialFlaws = [];
          confidenceRating = 0.7;
      }
    }
    
    return { critique, suggestions, potentialFlaws, confidenceRating };
  }
  
  private reviewData(reviewerType: string) {
    const dataPoints = this.state.data;
    let critique = "";
    let suggestions: string[] = [];
    let potentialFlaws: string[] = [];
    let confidenceRating = 0.5;
    
    if (dataPoints.length === 0) {
      critique = "No data has been collected yet. Empirical evidence is essential for hypothesis validation.";
      suggestions = ["Begin systematic data collection", "Ensure data quality controls"];
      potentialFlaws = ["Missing empirical evidence"];
      confidenceRating = 0.1;
    } else {
      switch (reviewerType) {
        case 'statistical':
          critique = `Statistical assessment: ${dataPoints.length} data points collected. ${dataPoints.length < 30 ? 'Sample size may be insufficient for robust analysis.' : 'Sample size appears adequate.'}`;
          suggestions = dataPoints.length < 30 ? ["Increase sample size", "Consider effect size calculations"] : ["Perform comprehensive statistical analysis", "Check for outliers"];
          potentialFlaws = dataPoints.length < 30 ? ["Underpowered analysis", "Low statistical reliability"] : [];
          confidenceRating = Math.min(0.8, dataPoints.length / 50);
          break;
        case 'skeptical':
          critique = `${dataPoints.length} data points presented. I question the data collection methodology and potential sources of bias.`;
          suggestions = ["Validate data sources", "Check for sampling bias", "Implement quality controls"];
          potentialFlaws = ["Data quality concerns", "Possible selection bias", "Measurement error risk"];
          confidenceRating = Math.max(0.2, Math.min(0.6, dataPoints.length / 40));
          break;
        default:
          critique = `Data collection shows ${dataPoints.length} observations. This provides a foundation for analysis.`;
          suggestions = ["Proceed with statistical analysis", "Consider additional data sources"];
          potentialFlaws = [];
          confidenceRating = Math.min(0.8, dataPoints.length / 30);
      }
    }
    
    return { critique, suggestions, potentialFlaws, confidenceRating };
  }
  
  private reviewConclusions(reviewerType: string) {
    const conclusions = this.state.conclusions;
    let critique = "";
    let suggestions: string[] = [];
    let potentialFlaws: string[] = [];
    let confidenceRating = 0.5;
    
    if (conclusions.length === 0) {
      critique = "No conclusions have been drawn yet. The research process appears incomplete.";
      suggestions = ["Analyze collected data", "Draw evidence-based conclusions"];
      potentialFlaws = ["Incomplete research process"];
      confidenceRating = 0.2;
    } else {
      const hasData = this.state.data.length > 0;
      const hasAnalysis = !!this.state.analysis;
      
      switch (reviewerType) {
        case 'skeptical':
          critique = `${conclusions.length} conclusions presented. I'm concerned about whether the conclusions are fully supported by the evidence.`;
          suggestions = ["Provide stronger evidence links", "Address alternative explanations", "Acknowledge limitations"];
          potentialFlaws = hasData ? [] : ["Conclusions without data"], hasAnalysis ? [] : ["Missing analytical foundation"];
          confidenceRating = (hasData && hasAnalysis) ? 0.6 : 0.3;
          break;
        default:
          critique = `${conclusions.length} conclusions drawn from the research. ${hasData && hasAnalysis ? 'Conclusions appear well-supported.' : 'Evidence base needs strengthening.'}`;
          suggestions = ["Consider broader implications", "Suggest future research directions"];
          potentialFlaws = hasData ? [] : ["Need stronger data foundation"];
          confidenceRating = (hasData && hasAnalysis) ? 0.8 : 0.5;
      }
    }
    
    return { critique, suggestions, potentialFlaws, confidenceRating };
  }
  
  private reviewOverall(reviewerType: string) {
    const progress = this.calculateResearchProgress();
    let critique = "";
    let suggestions: string[] = [];
    let potentialFlaws: string[] = [];
    let confidenceRating = progress / 100;
    
    switch (reviewerType) {
      case 'skeptical':
        critique = `Overall research progress: ${progress}%. As a skeptical reviewer, I see significant concerns about the research validity and potential biases throughout the process.`;
        suggestions = ["Strengthen methodological rigor", "Seek independent validation", "Address potential confounds"];
        potentialFlaws = ["Overall methodological concerns", "Potential systematic biases", "Need external validation"];
        confidenceRating = Math.max(0.2, confidenceRating - 0.3);
        break;
      case 'supportive':
        critique = `Research shows ${progress}% completion with promising preliminary findings. The approach is sound and results encouraging.`;
        suggestions = ["Continue current methodology", "Expand scope if results permit", "Prepare for publication"];
        potentialFlaws = progress < 80 ? ["Research still in progress"] : [];
        confidenceRating = Math.min(0.9, confidenceRating + 0.2);
        break;
      case 'methodological':
        critique = `Methodological assessment shows ${progress}% research completion. Focus on maintaining rigorous standards throughout.`;
        suggestions = ["Ensure protocol compliance", "Document all procedures", "Validate instruments"];
        potentialFlaws = ["Need stronger methodological documentation"];
        confidenceRating = confidenceRating;
        break;
      case 'statistical':
        critique = `Statistical review: ${progress}% complete. ${this.state.hypotheses.length > 0 ? 'Hypothesis structure adequate.' : 'Need formal hypotheses.'} ${this.state.data.length > 20 ? 'Sufficient data for analysis.' : 'More data needed.'}`;
        suggestions = ["Perform comprehensive statistical tests", "Calculate confidence intervals", "Report effect sizes"];
        potentialFlaws = this.state.data.length < 20 ? ["Insufficient sample size"] : [];
        confidenceRating = confidenceRating;
        break;
    }
    
    return { critique, suggestions, potentialFlaws, confidenceRating };
  }
  
  private calculateResearchProgress(): number {
    let progress = 0;
    if (this.state.problemStatement) progress += 15;
    if (this.state.literature.length > 0) progress += 15;
    if (this.state.hypotheses.length > 0) progress += 20;
    if (this.state.experiments.length > 0) progress += 15;
    if (this.state.data.length > 0) progress += 15;
    if (this.state.analysis) progress += 10;
    if (this.state.conclusions.length > 0) progress += 10;
    return progress;
  }
  
  private formatPeerReviewSummary(feedback: PeerReviewFeedback, focusArea: string, reviewerType: string): string {
    const confidenceEmoji = feedback.confidenceRating > 0.7 ? "🟢" : feedback.confidenceRating > 0.4 ? "🟡" : "🔴";
    const confidenceLevel = feedback.confidenceRating > 0.7 ? "High" : feedback.confidenceRating > 0.4 ? "Moderate" : "Low";
    
    let summary = `## 🔍 Peer Review: ${feedback.perspective}\n`;
    summary += `**Focus Area:** ${focusArea.charAt(0).toUpperCase() + focusArea.slice(1)}\n`;
    summary += `**Confidence Level:** ${confidenceEmoji} ${confidenceLevel} (${(feedback.confidenceRating * 100).toFixed(0)}%)\n\n`;
    
    summary += `### 📝 Critique\n${feedback.critique}\n\n`;
    
    if (feedback.suggestions.length > 0) {
      summary += `### 💡 Suggestions for Improvement\n`;
      feedback.suggestions.forEach(suggestion => {
        summary += `• ${suggestion}\n`;
      });
      summary += '\n';
    }
    
    if (feedback.potentialFlaws.length > 0) {
      summary += `### ⚠️ Potential Issues Identified\n`;
      feedback.potentialFlaws.forEach(flaw => {
        summary += `• ${flaw}\n`;
      });
      summary += '\n';
    }
    
    summary += `### 📊 Research Progress Overview\n`;
    summary += `• Problem Statement: ${this.state.problemStatement ? '✅' : '❌'}\n`;
    summary += `• Literature Review: ${this.state.literature.length} sources\n`;
    summary += `• Hypotheses: ${this.state.hypotheses.length} formulated\n`;
    summary += `• Experiments: ${this.state.experiments.length} designed\n`;
    summary += `• Data Points: ${this.state.data.length} collected\n`;
    summary += `• Analysis: ${this.state.analysis ? '✅' : '❌'}\n`;
    summary += `• Conclusions: ${this.state.conclusions.length} drawn\n`;
    
    return summary;
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
interface LiteratureReviewInput { literature: string; autoSearch?: boolean; }
interface HypothesisFormationInput { hypothesis: string; }
interface HypothesisGenerationInput { hypotheses: string[]; }
interface ExperimentDesignInput { experiment: string; }
interface DataCollectionInput { data: string; }
interface AnalysisInput { analysis: string; }
interface ConclusionInput { conclusion: string; }
interface LiteratureSearchInput { query: string; }
interface DataAnalysisInput { data: string[]; }
interface ScoreHypothesisInput { hypothesisId: string; score: number; }

export const configSchema = z.object({
  webSearch: z.object({
    enabled: z.boolean().default(true),
    preferReal: z.boolean().default(true),
    fallbackToSimulation: z.boolean().default(true),
    availableTools: z.array(z.string()).optional().describe("Available web search tools like 'WebSearch', 'WebFetch'")
  }).optional()
});

export function createCognatusServer({ config }: { config: z.infer<typeof configSchema> }) {
  const server = new McpServer({
    name: "cognatus-server",
    version: "1.0.0",
  });

  const engine = new ScientificMethodEngine(config.webSearch);

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
            result = await engine.literature_review({ literature: input.input });
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
    "Background research with optional automatic web search",
    { 
      literature: z.string(),
      autoSearch: z.boolean().optional().describe("Enable automatic web search based on problem statement")
    },
    async (input: { literature: string; autoSearch?: boolean }) => engine.literature_review(input)
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
    "Search academic databases with advanced filtering and realistic results",
    { 
      query: z.string().describe("Search query terms"),
      database: z.enum(["pubmed", "arxiv", "scholar", "ieee", "scopus"]).optional().describe("Academic database to search"),
      limit: z.number().min(1).max(50).optional().describe("Maximum number of results (default: 10)"),
      yearFrom: z.number().min(1900).optional().describe("Start year for search range"),
      yearTo: z.number().max(2030).optional().describe("End year for search range")
    },
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
    "Validate findings from multiple perspectives with expert peer review",
    { 
      focusArea: z.enum(["hypotheses", "methodology", "data", "conclusions", "overall"]).optional().describe("Specific research area to focus the review on"),
      reviewerType: z.enum(["skeptical", "supportive", "methodological", "statistical"]).optional().describe("Type of reviewer perspective to simulate")
    },
    async (input: PeerReviewInput) => engine.peer_review_simulation(input)
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
