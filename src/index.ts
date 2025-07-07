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

interface PeerReviewInput {
  focusArea?: 'hypotheses' | 'methodology' | 'data' | 'conclusions' | 'overall';
  reviewerType?: 'skeptical' | 'supportive' | 'methodological' | 'statistical';
}

interface LiteratureSearchInput {
  query: string;
}


interface DataAnalysisInput {
  data: string[];
  analysisType?: 'descriptive' | 'inferential' | 'correlation' | 'regression' | 'comprehensive';
  targetVariable?: string;
  confidenceLevel?: number;
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

  public literature_review(input: unknown): { content: Array<{ type: "text"; text: string }> } {
    return this.safeExecute(() => {
      this.validateInput(input, ['literature']);
      const { literature, autoSearch = false } = input as { literature: string; autoSearch?: boolean };
      
      if (literature.length < 20) {
        throw new Error('Literature review must be at least 20 characters long');
      }
      
      let finalOutput = `## 📚 Literature Review\n\n`;
      finalOutput += `**Manual Review Added:** ${literature}\n\n`;
      
      // Provide web search guidance if autoSearch is enabled
      if (autoSearch && this.state.problemStatement) {
        const searchQueries = this.generateSearchQueries(this.state.problemStatement);
        
        finalOutput += `### 🌐 Additional Research Needed\n\n`;
        finalOutput += `Based on your problem statement, please use your web search tools to research the following:\n\n`;
        
        searchQueries.forEach((query, index) => {
          finalOutput += `**${index + 1}.** \`${query}\`\n`;
        });
        
        finalOutput += `\n### 💡 Search Recommendations\n`;
        finalOutput += `• Use academic search engines (Google Scholar, PubMed, arXiv)\n`;
        finalOutput += `• Look for peer-reviewed publications\n`;
        finalOutput += `• Check recent publications (last 5 years)\n`;
        finalOutput += `• Include systematic reviews and meta-analyses\n`;
        finalOutput += `• Verify source credibility and citation counts\n\n`;
        finalOutput += `After completing your web searches, add the findings to your literature review.\n\n`;
        
      } else if (autoSearch && !this.state.problemStatement) {
        finalOutput += `### ⚠️ Search Guidance Unavailable\n`;
        finalOutput += `Complete the observation stage first to get automated search query suggestions based on your problem statement.\n\n`;
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
    return this.safeExecute(() => {
      this.validateInput(input, ['hypotheses']);
      const { hypotheses } = input as { hypotheses: string[] };
      
      if (hypotheses.length === 0) {
        throw new Error('At least one hypothesis must be provided');
      }
      
      const newHypotheses: Hypothesis[] = [];
      hypotheses.forEach(h => {
        const newHypothesis: Hypothesis = {
          id: this.generateId(),
          description: h,
          evidenceScore: 0,
        };
        this.state.hypotheses.push(newHypothesis);
        newHypotheses.push(newHypothesis);
      });
      
      let output = `## 🧠 Multiple Hypotheses Generated\n\n`;
      output += `You now have **${hypotheses.length}** competing hypotheses to test:\n\n`;
      
      newHypotheses.forEach((hyp, index) => {
        output += `**${index + 1}. ID: \`${hyp.id}\`**\n`;
        output += `${hyp.description}\n`;
        output += `*Evidence Score: ${hyp.evidenceScore}/1.0*\n\n`;
      });
      
      output += `### 🎯 Next Steps for Research\n`;
      output += `• **Score Evidence**: Use \`score_hypothesis\` tool with these IDs to assign evidence scores (0.0-1.0)\n`;
      output += `• **Compare & Contrast**: Analyze how these hypotheses compete or complement each other\n`;
      output += `• **Design Experiments**: Create tests to validate or refute each hypothesis\n`;
      output += `• **Gather Data**: Collect evidence that supports or contradicts each hypothesis\n`;
      output += `• **Update Scores**: Revise evidence scores as new data becomes available\n`;
      output += `• **Check Progress**: Use \`check_for_breakthrough\` to assess overall research progress\n\n`;
      
      output += `💡 **Research Strategy**: Test competing hypotheses systematically to identify the most supported explanation.`;
      
      this.log(`Generated ${hypotheses.length} new hypotheses with IDs`);
      this.transitionTo(Stage.HypothesisFormation);
      return { content: [{ type: "text" as const, text: output }] };
    }, 'hypothesis_generation');
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
    return this.safeExecute(() => {
      this.validateInput(input, ['query']);
      const { query } = input as LiteratureSearchInput;
      
      if (query.length < 3) {
        throw new Error('Search query must be at least 3 characters long');
      }
      
      // Generate optimized academic search queries
      const optimizedQueries = this.generateAcademicSearchQueries(query);
      
      let searchGuidance = `## 🔍 Literature Search Request\n\n`;
      searchGuidance += `**Original Query:** "${query}"\n\n`;
      searchGuidance += `### 🌐 Please Use Your Web Search Tools\n\n`;
      searchGuidance += `Use your available web search capabilities to find academic literature. Search for these optimized queries:\n\n`;
      
      optimizedQueries.forEach((searchQuery, index) => {
        searchGuidance += `**${index + 1}.** \`${searchQuery}\`\n`;
      });
      
      searchGuidance += `\n### 💡 Search Tips\n`;
      searchGuidance += `• Your web search should automatically access academic databases\n`;
      searchGuidance += `• Look for peer-reviewed sources and citations\n`;
      searchGuidance += `• Include recent publications when relevant\n`;
      searchGuidance += `• Verify source credibility\n\n`;
      
      searchGuidance += `Please provide the actual research results you find for integration into the literature review.`;
      
      // Add to literature state for tracking
      const literatureEntry = `Literature search requested: "${query}"`;
      this.state.literature.push(literatureEntry);
      
      this.log(`Literature search guidance provided for: "${query}"`, 'info');
      return { content: [{ type: "text" as const, text: searchGuidance }] };
    }, 'literature_search');
  }

  private generateAcademicSearchQueries(query: string): string[] {
    const queries: string[] = [];
    
    // Base academic query
    queries.push(`${query} academic research`);
    
    // Quoted exact phrase for precision
    queries.push(`"${query}" study`);
    
    // Peer review focused
    queries.push(`${query} peer reviewed`);
    
    return queries;
  }


  public data_analysis_guidance(input: unknown): { content: Array<{ type: "text"; text: string }> } {
    return this.safeExecute(() => {
      this.validateInput(input, ['data']);
      const params = input as DataAnalysisInput;
      const { data, analysisType = 'comprehensive', targetVariable, confidenceLevel = 0.95 } = params;
      
      if (data.length < 2) {
        throw new Error('At least 2 data points are required for meaningful analysis');
      }
      
      let guidance = `## 📊 Data Analysis Guidance\n\n`;
      guidance += `**Data Summary:** ${data.length} data points provided\n`;
      guidance += `**Analysis Type Requested:** ${analysisType}\n`;
      guidance += `**Target Variable:** ${targetVariable || 'Not specified'}\n`;
      guidance += `**Confidence Level:** ${(confidenceLevel * 100)}%\n\n`;
      
      // Analyze data characteristics
      const dataTypes = this.classifyDataTypes(data);
      guidance += `### 🔍 Data Characteristics Assessment\n`;
      guidance += `**Detected Data Types:** ${dataTypes.join(', ')}\n`;
      
      // Sample data preview
      const sampleData = data.slice(0, 5);
      guidance += `**Sample Data:** ${sampleData.join(', ')}${data.length > 5 ? '...' : ''}\n\n`;
      
      // Provide analysis guidance based on data type and analysis request
      guidance += this.getAnalysisMethodGuidance(dataTypes, analysisType, data.length);
      guidance += this.getStatisticalTestGuidance(dataTypes, analysisType, data.length);
      guidance += this.getInterpretationGuidance(analysisType);
      
      guidance += `\n### 🎯 Your Next Steps\n`;
      guidance += `1. **Perform the Analysis**: Use your statistical tools to conduct the recommended analysis\n`;
      guidance += `2. **Document Results**: Record your findings and statistical outcomes\n`;
      guidance += `3. **Interpret Findings**: Apply the interpretation framework above\n`;
      guidance += `4. **Update Research**: Use the \`analysis\` tool to record your completed analysis\n\n`;
      
      guidance += `💡 **Remember**: You are the data analyst - use your expertise and statistical software to perform the actual calculations.`;
      
      this.log(`Data analysis guidance provided for ${data.length} data points`, 'info');
      return { content: [{ type: "text" as const, text: guidance }] };
    }, 'data_analysis_guidance');
  }

  private getAnalysisMethodGuidance(dataTypes: string[], analysisType: string, dataSize: number): string {
    let guidance = `### 📈 Recommended Analysis Methods\n`;
    
    if (dataTypes.includes('numeric')) {
      guidance += `**Quantitative Analysis Recommended:**\n`;
      switch (analysisType) {
        case 'descriptive':
          guidance += `• **Descriptive Statistics**: Calculate mean, median, mode, standard deviation, range\n`;
          guidance += `• **Distribution Analysis**: Assess normality, skewness, kurtosis\n`;
          guidance += `• **Visualization**: Create histograms, box plots, scatter plots\n`;
          break;
        case 'inferential':
          guidance += `• **Confidence Intervals**: Estimate population parameters\n`;
          guidance += `• **Hypothesis Testing**: Choose appropriate tests based on data distribution\n`;
          guidance += `• **Power Analysis**: Assess statistical power and effect sizes\n`;
          break;
        case 'correlation':
          guidance += `• **Correlation Analysis**: Pearson (normal data) or Spearman (non-normal)\n`;
          guidance += `• **Regression Analysis**: Linear or non-linear relationships\n`;
          guidance += `• **Multivariate Analysis**: If multiple variables present\n`;
          break;
        case 'comprehensive':
        default:
          guidance += `• **Full Statistical Workup**: Descriptive → Inferential → Relationships\n`;
          guidance += `• **Effect Size Calculations**: Practical significance assessment\n`;
          guidance += `• **Assumption Testing**: Normality, independence, homoscedasticity\n`;
      }
    }
    
    if (dataTypes.includes('categorical')) {
      guidance += `**Categorical Analysis Recommended:**\n`;
      guidance += `• **Frequency Analysis**: Count distributions and percentages\n`;
      guidance += `• **Chi-square Tests**: Independence and goodness of fit\n`;
      guidance += `• **Contingency Tables**: Cross-tabulation analysis\n`;
    }
    
    if (dataTypes.includes('date')) {
      guidance += `**Time Series Analysis Recommended:**\n`;
      guidance += `• **Trend Analysis**: Identify patterns over time\n`;
      guidance += `• **Seasonality Testing**: Detect cyclical patterns\n`;
      guidance += `• **Forecasting Methods**: Project future values\n`;
    }
    
    // Sample size considerations
    if (dataSize < 30) {
      guidance += `\n⚠️ **Small Sample Warning**: n=${dataSize} may limit statistical power. Consider:\n`;
      guidance += `• Non-parametric tests instead of parametric\n`;
      guidance += `• Bootstrap methods for confidence intervals\n`;
      guidance += `• Effect size reporting over significance testing\n`;
    }
    
    return guidance + `\n`;
  }

  private getStatisticalTestGuidance(dataTypes: string[], analysisType: string, dataSize: number): string {
    let guidance = `### 🧪 Statistical Test Selection Guide\n`;
    
    if (dataTypes.includes('numeric')) {
      guidance += `**For Numeric Data:**\n`;
      guidance += `• **One Sample**: t-test (normal) or Wilcoxon signed-rank (non-normal)\n`;
      guidance += `• **Two Groups**: Independent t-test or Mann-Whitney U test\n`;
      guidance += `• **Multiple Groups**: ANOVA (normal) or Kruskal-Wallis (non-normal)\n`;
      guidance += `• **Relationships**: Pearson correlation (normal) or Spearman (non-normal)\n`;
    }
    
    if (dataTypes.includes('categorical')) {
      guidance += `**For Categorical Data:**\n`;
      guidance += `• **Independence**: Chi-square test of independence\n`;
      guidance += `• **Goodness of Fit**: Chi-square goodness of fit test\n`;
      guidance += `• **Small Frequencies**: Fisher's exact test\n`;
    }
    
    guidance += `\n**Test Assumptions to Check:**\n`;
    guidance += `• **Normality**: Shapiro-Wilk test, Q-Q plots\n`;
    guidance += `• **Independence**: Random sampling verification\n`;
    guidance += `• **Equal Variance**: Levene's test, F-test\n`;
    guidance += `• **Sample Size**: Power analysis for adequacy\n`;
    
    return guidance + `\n`;
  }

  private getInterpretationGuidance(analysisType: string): string {
    let guidance = `### 🎯 Results Interpretation Framework\n`;
    
    guidance += `**Statistical Significance vs Practical Significance:**\n`;
    guidance += `• Report both p-values AND effect sizes\n`;
    guidance += `• Consider clinical/practical meaningfulness\n`;
    guidance += `• Discuss confidence intervals, not just point estimates\n\n`;
    
    guidance += `**Common Interpretation Mistakes to Avoid:**\n`;
    guidance += `• Don't confuse correlation with causation\n`;
    guidance += `• Don't over-interpret non-significant results\n`;
    guidance += `• Don't ignore assumptions violations\n`;
    guidance += `• Don't cherry-pick significant results\n\n`;
    
    guidance += `**Reporting Best Practices:**\n`;
    guidance += `• Include descriptive statistics for all variables\n`;
    guidance += `• Report exact p-values (not just p < 0.05)\n`;
    guidance += `• Include effect sizes with confidence intervals\n`;
    guidance += `• Discuss limitations and assumptions\n`;
    
    return guidance;
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
  
  
  
  
  

  public peer_review_guidance(input: unknown): { content: Array<{ type: "text"; text: string }> } {
    return this.safeExecute(() => {
      const params = (input || {}) as PeerReviewInput;
      const focusArea = params.focusArea || 'overall';
      const reviewerType = params.reviewerType || 'methodological';
      
      // Check if there's enough research content to review
      if (!this.state.problemStatement && this.state.hypotheses.length === 0 && this.state.data.length === 0) {
        return { content: [{ type: "text", text: "❌ Insufficient research content for peer review. Please complete observation, hypothesis formation, or data collection first." }] };
      }
      
      const guidance = this.generatePeerReviewGuidance(focusArea, reviewerType);
      
      this.log(`Peer review guidance provided: ${reviewerType} perspective on ${focusArea}`, 'info');
      return { content: [{ type: "text" as const, text: guidance }] };
    }, 'peer_review_guidance');
  }

  private generatePeerReviewGuidance(focusArea: string, reviewerType: string): string {
    let guidance = `## 🔍 Peer Review Guidance\n\n`;
    guidance += `**Review Style:** ${this.getReviewerStyle(reviewerType)}\n`;
    guidance += `**Focus Area:** ${focusArea.charAt(0).toUpperCase() + focusArea.slice(1)}\n\n`;
    
    guidance += `### 🎯 Your Task\n`;
    guidance += `Please conduct a peer review of the research using your own knowledge and analysis.\n\n`;
    
    guidance += `### 📋 Current Research State\n`;
    guidance += `• **Problem Statement:** ${this.state.problemStatement || 'Not defined'}\n`;
    guidance += `• **Literature Sources:** ${this.state.literature.length}\n`;
    guidance += `• **Hypotheses:** ${this.state.hypotheses.length} formulated\n`;
    guidance += `• **Experiments:** ${this.state.experiments.length} designed\n`;
    guidance += `• **Data Points:** ${this.state.data.length} collected\n`;
    guidance += `• **Analysis:** ${this.state.analysis ? 'Completed' : 'Not completed'}\n`;
    guidance += `• **Conclusions:** ${this.state.conclusions.length} drawn\n\n`;
    
    guidance += this.getReviewGuidanceByType(reviewerType, focusArea);
    guidance += this.getFocusAreaGuidance(focusArea);
    
    guidance += `\n### 💡 Review Framework\n`;
    guidance += `Please provide your review covering:\n`;
    guidance += `• **Strengths:** What works well in this research\n`;
    guidance += `• **Weaknesses:** Areas that need improvement\n`;
    guidance += `• **Suggestions:** Specific recommendations for enhancement\n`;
    guidance += `• **Questions:** Critical questions that need addressing\n\n`;
    
    guidance += `**Remember:** You are the peer reviewer - use your expertise and critical thinking to provide authentic, valuable feedback.`;
    
    return guidance;
  }

  private getReviewerStyle(reviewerType: string): string {
    const styles = {
      skeptical: "Critical and questioning - challenge assumptions, seek disconfirming evidence",
      supportive: "Constructive and encouraging - identify strengths while suggesting improvements", 
      methodological: "Focus on experimental design, procedures, and scientific rigor",
      statistical: "Emphasize data analysis, statistical validity, and quantitative aspects"
    };
    return styles[reviewerType as keyof typeof styles] || styles.methodological;
  }

  private getReviewGuidanceByType(reviewerType: string, focusArea: string): string {
    let guidance = `### 🔬 ${reviewerType.charAt(0).toUpperCase() + reviewerType.slice(1)} Review Approach\n`;
    
    switch (reviewerType) {
      case 'skeptical':
        guidance += `As a skeptical reviewer, focus on:\n`;
        guidance += `• **Challenge assumptions** - Question underlying premises\n`;
        guidance += `• **Seek disconfirming evidence** - What contradicts the findings?\n`;
        guidance += `• **Identify biases** - Look for confirmation bias, selection bias\n`;
        guidance += `• **Test alternative explanations** - What else could explain the results?\n`;
        guidance += `• **Question methodology** - Are controls adequate? Are variables properly isolated?\n`;
        break;
      case 'supportive':
        guidance += `As a supportive reviewer, focus on:\n`;
        guidance += `• **Highlight strengths** - What is well-done and innovative?\n`;
        guidance += `• **Constructive suggestions** - How can good work be made even better?\n`;
        guidance += `• **Encourage development** - What promising directions should be pursued?\n`;
        guidance += `• **Practical applications** - How can findings be applied or extended?\n`;
        guidance += `• **Build on positives** - How to amplify successful elements?\n`;
        break;
      case 'methodological':
        guidance += `As a methodological expert, focus on:\n`;
        guidance += `• **Experimental design** - Are procedures scientifically sound?\n`;
        guidance += `• **Control groups** - Are appropriate controls in place?\n`;
        guidance += `• **Variable isolation** - Are confounding factors addressed?\n`;
        guidance += `• **Reproducibility** - Can others replicate this work?\n`;
        guidance += `• **Validity** - Internal and external validity considerations\n`;
        break;
      case 'statistical':
        guidance += `As a statistical reviewer, focus on:\n`;
        guidance += `• **Sample size** - Is it adequate for reliable conclusions?\n`;
        guidance += `• **Statistical tests** - Are appropriate tests being used?\n`;
        guidance += `• **Effect sizes** - Not just significance, but practical importance\n`;
        guidance += `• **Data quality** - Outliers, missing data, measurement error\n`;
        guidance += `• **Confidence intervals** - What is the precision of estimates?\n`;
        break;
    }
    
    return guidance + `\n`;
  }

  private getFocusAreaGuidance(focusArea: string): string {
    let guidance = `### 🎯 Focus Area: ${focusArea.charAt(0).toUpperCase() + focusArea.slice(1)}\n`;
    
    switch (focusArea) {
      case 'hypotheses':
        guidance += `Pay special attention to:\n`;
        guidance += `• **Testability** - Are hypotheses clearly testable?\n`;
        guidance += `• **Specificity** - Are predictions specific and measurable?\n`;
        guidance += `• **Independence** - Are hypotheses truly independent?\n`;
        guidance += `• **Falsifiability** - Can hypotheses be proven wrong?\n`;
        guidance += `• **Evidence basis** - Are hypotheses grounded in literature?\n`;
        break;
      case 'methodology':
        guidance += `Pay special attention to:\n`;
        guidance += `• **Experimental controls** - Adequate control conditions?\n`;
        guidance += `• **Procedure clarity** - Could others follow the methods?\n`;
        guidance += `• **Bias prevention** - Steps to minimize systematic errors?\n`;
        guidance += `• **Ethical considerations** - Research ethics compliance?\n`;
        guidance += `• **Feasibility** - Are methods practically implementable?\n`;
        break;
      case 'data':
        guidance += `Pay special attention to:\n`;
        guidance += `• **Data quality** - Completeness, accuracy, reliability\n`;
        guidance += `• **Collection methods** - Appropriate data gathering?\n`;
        guidance += `• **Sample representation** - Does sample represent population?\n`;
        guidance += `• **Missing data** - How are gaps handled?\n`;
        guidance += `• **Measurement validity** - Do measures capture intended constructs?\n`;
        break;
      case 'conclusions':
        guidance += `Pay special attention to:\n`;
        guidance += `• **Evidence support** - Are conclusions warranted by data?\n`;
        guidance += `• **Overgeneralization** - Claims beyond what data supports?\n`;
        guidance += `• **Alternative explanations** - Other ways to interpret results?\n`;
        guidance += `• **Limitations** - Are study limitations acknowledged?\n`;
        guidance += `• **Implications** - Are broader implications appropriate?\n`;
        break;
      default:
        guidance += `Pay special attention to:\n`;
        guidance += `• **Overall coherence** - Does everything fit together?\n`;
        guidance += `• **Scientific rigor** - Are standards of good science met?\n`;
        guidance += `• **Novelty and significance** - Does this advance knowledge?\n`;
        guidance += `• **Clarity** - Is the work clearly communicated?\n`;
        guidance += `• **Future directions** - What should be done next?\n`;
    }
    
    return guidance;
  }
  

  public get_state(): { content: Array<{ type: "text"; text: string }> } {
    return this.safeExecute(() => {
      let output = `## 📊 Research State Overview\n\n`;
      
      // Current Stage and Progress
      const nextSteps = STAGE_TRANSITIONS[this.state.currentStage];
      output += `**Current Stage:** ${this.state.currentStage}\n`;
      output += `**Next Available Stages:** ${nextSteps.join(', ') || 'None (research complete)'}\n\n`;
      
      // Problem Statement
      output += `### 🎯 Research Focus\n`;
      output += `**Problem Statement:** ${this.state.problemStatement || 'Not defined yet'}\n\n`;
      
      // Literature Review Status
      output += `### 📚 Literature Review\n`;
      output += `**Sources Collected:** ${this.state.literature.length}\n`;
      if (this.state.literature.length > 0) {
        output += `**Recent Entries:** ${this.state.literature.slice(-2).join(', ')}\n`;
      }
      output += `\n`;
      
      // Detailed Hypotheses Section
      output += `### 🧠 Hypotheses (${this.state.hypotheses.length} total)\n`;
      if (this.state.hypotheses.length === 0) {
        output += `*No hypotheses generated yet. Use \`hypothesis_formation\` or \`hypothesis_generation\` tools.*\n\n`;
      } else {
        const avgEvidence = this.state.hypotheses.reduce((sum, h) => sum + h.evidenceScore, 0) / this.state.hypotheses.length;
        output += `**Average Evidence Score:** ${avgEvidence.toFixed(2)}/1.0\n\n`;
        
        this.state.hypotheses.forEach((hyp, index) => {
          const scoreEmoji = hyp.evidenceScore >= 0.7 ? '🟢' : hyp.evidenceScore >= 0.4 ? '🟡' : '🔴';
          output += `**${index + 1}. ID: \`${hyp.id}\`** ${scoreEmoji}\n`;
          output += `${hyp.description}\n`;
          output += `*Evidence Score: ${hyp.evidenceScore}/1.0*\n\n`;
        });
        
        output += `💡 Use \`score_hypothesis\` tool with these IDs to update evidence scores.\n\n`;
      }
      
      // Experiments
      output += `### ⚗️ Experimental Design\n`;
      output += `**Experiments Designed:** ${this.state.experiments.length}\n`;
      if (this.state.experiments.length > 0) {
        output += `**Latest:** ${this.state.experiments[this.state.experiments.length - 1]}\n`;
      }
      output += `\n`;
      
      // Data Collection
      output += `### 📊 Data Collection\n`;
      output += `**Data Points:** ${this.state.data.length}\n`;
      if (this.state.data.length > 0) {
        output += `**Sample:** ${this.state.data.slice(0, 3).join(', ')}${this.state.data.length > 3 ? '...' : ''}\n`;
      }
      output += `\n`;
      
      // Analysis
      output += `### 🔬 Analysis\n`;
      output += `**Status:** ${this.state.analysis ? '✅ Completed' : '❌ Not completed'}\n`;
      if (this.state.analysis) {
        output += `**Summary:** ${this.state.analysis}\n`;
      }
      output += `\n`;
      
      // Conclusions
      output += `### ✅ Conclusions\n`;
      output += `**Conclusions Drawn:** ${this.state.conclusions.length}\n`;
      if (this.state.conclusions.length > 0) {
        output += `**Latest:** ${this.state.conclusions[this.state.conclusions.length - 1]}\n`;
      }
      output += `\n`;
      
      // Research Progress Assessment
      const progress = this.calculateResearchProgress();
      output += `### 📈 Research Progress\n`;
      output += `**Overall Completion:** ${progress}%\n`;
      output += `**Research Quality:** ${this.assessResearchQuality()}\n\n`;
      
      // Next Action Suggestions
      output += `### 🎯 Suggested Next Actions\n`;
      output += this.getSuggestedActions();
      
      return { content: [{ type: "text", text: output }] };
    }, 'get_state');
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

  private assessResearchQuality(): string {
    const avgEvidence = this.state.hypotheses.length > 0 
      ? this.state.hypotheses.reduce((sum, h) => sum + h.evidenceScore, 0) / this.state.hypotheses.length
      : 0;
    
    if (avgEvidence >= 0.7) return "High (strong evidence base)";
    if (avgEvidence >= 0.4) return "Moderate (building evidence)";
    if (this.state.hypotheses.length > 0) return "Developing (needs more evidence)";
    return "Initial (needs hypotheses)";
  }

  private getSuggestedActions(): string {
    let suggestions = "";
    
    if (!this.state.problemStatement) {
      suggestions += "• Define research problem using `observation` tool\n";
    }
    if (this.state.literature.length === 0) {
      suggestions += "• Conduct literature search using `literature_search` tool\n";
    }
    if (this.state.hypotheses.length === 0) {
      suggestions += "• Generate hypotheses using `hypothesis_generation` tool\n";
    }
    if (this.state.hypotheses.length > 0) {
      const unscored = this.state.hypotheses.filter(h => h.evidenceScore === 0);
      if (unscored.length > 0) {
        suggestions += `• Score evidence for ${unscored.length} hypotheses using \`score_hypothesis\` tool\n`;
      }
    }
    if (this.state.experiments.length === 0 && this.state.hypotheses.length > 0) {
      suggestions += "• Design experiments using `experiment_design` tool\n";
    }
    if (this.state.data.length === 0 && this.state.experiments.length > 0) {
      suggestions += "• Collect data using `data_collection` tool\n";
    }
    if (!this.state.analysis && this.state.data.length > 0) {
      suggestions += "• Get analysis guidance using `data_analysis_guidance` tool\n";
    }
    if (this.state.conclusions.length === 0 && this.state.analysis) {
      suggestions += "• Draw conclusions using `conclusion` tool\n";
    }
    if (this.state.hypotheses.length > 0) {
      suggestions += "• Check for breakthroughs using `check_for_breakthrough` tool\n";
    }
    
    return suggestions || "• Continue with current research stage\n";
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

  public research_methodology_guidance(input: unknown): { content: Array<{ type: "text"; text: string }> } {
    return this.safeExecute(() => {
      const params = (input || {}) as { researchQuestion?: string; field?: string; methodologyType?: string };
      const { researchQuestion, field, methodologyType = 'general' } = params;
      
      let guidance = `## 🔬 Research Methodology Guidance\n\n`;
      
      if (researchQuestion) {
        guidance += `**Research Question:** ${researchQuestion}\n`;
      }
      if (field) {
        guidance += `**Research Field:** ${field}\n`;
      }
      guidance += `**Methodology Focus:** ${methodologyType}\n\n`;
      
      guidance += `### 🎯 Methodology Selection Framework\n\n`;
      
      // Provide guidance based on methodology type
      switch (methodologyType) {
        case 'quantitative':
          guidance += this.getQuantitativeMethodologyGuidance();
          break;
        case 'qualitative': 
          guidance += this.getQualitativeMethodologyGuidance();
          break;
        case 'mixed-methods':
          guidance += this.getMixedMethodsGuidance();
          break;
        case 'theoretical':
          guidance += this.getTheoreticalMethodologyGuidance();
          break;
        case 'computational':
          guidance += this.getComputationalMethodologyGuidance();
          break;
        case 'meta-analysis':
          guidance += this.getMetaAnalysisGuidance();
          break;
        default:
          guidance += this.getGeneralMethodologyGuidance(researchQuestion);
      }
      
      guidance += `\n### 🎯 Next Steps for Your Research\n`;
      guidance += `1. **Refine Your Approach**: Choose the most appropriate methodology for your research question\n`;
      guidance += `2. **Design Your Study**: Use the framework above to structure your research design\n`;
      guidance += `3. **Plan Data Collection**: Select appropriate data collection methods\n`;
      guidance += `4. **Consider Ethics**: Ensure your methodology meets ethical standards\n`;
      guidance += `5. **Validate Approach**: Consider pilot studies or expert consultation\n\n`;
      
      guidance += `💡 **Remember**: The best methodology is the one that best answers your specific research question with available resources.`;
      
      this.log(`Research methodology guidance provided: ${methodologyType} approach`, 'info');
      return { content: [{ type: "text" as const, text: guidance }] };
    }, 'research_methodology_guidance');
  }

  private getQuantitativeMethodologyGuidance(): string {
    return `**Quantitative Research Approach**\n\n` +
      `**Best For:**\n` +
      `• Testing hypotheses and theories\n` +
      `• Measuring relationships between variables\n` +
      `• Generalizing findings to larger populations\n` +
      `• Objective measurement and statistical analysis\n\n` +
      
      `**Common Designs:**\n` +
      `• **Experimental**: Controlled manipulation of variables (RCTs, quasi-experiments)\n` +
      `• **Correlational**: Examining relationships without manipulation\n` +
      `• **Survey Research**: Large-scale data collection via questionnaires\n` +
      `• **Longitudinal**: Tracking changes over time\n` +
      `• **Cross-sectional**: Snapshot data at one time point\n\n` +
      
      `**Data Collection Methods:**\n` +
      `• Structured surveys and questionnaires\n` +
      `• Standardized tests and measurements\n` +
      `• Existing datasets and databases\n` +
      `• Laboratory experiments\n` +
      `• Physiological measurements\n\n` +
      
      `**Analysis Approaches:**\n` +
      `• Descriptive statistics (means, frequencies, distributions)\n` +
      `• Inferential statistics (t-tests, ANOVA, regression)\n` +
      `• Multivariate analysis (factor analysis, SEM)\n` +
      `• Time series analysis for longitudinal data\n`;
  }

  private getQualitativeMethodologyGuidance(): string {
    return `**Qualitative Research Approach**\n\n` +
      `**Best For:**\n` +
      `• Exploring complex phenomena in depth\n` +
      `• Understanding meaning and context\n` +
      `• Generating new theories and concepts\n` +
      `• Studying processes and experiences\n\n` +
      
      `**Common Designs:**\n` +
      `• **Ethnography**: Immersive study of cultures and communities\n` +
      `• **Phenomenology**: Understanding lived experiences\n` +
      `• **Grounded Theory**: Developing theories from data\n` +
      `• **Case Study**: In-depth analysis of specific cases\n` +
      `• **Narrative Research**: Exploring stories and life histories\n\n` +
      
      `**Data Collection Methods:**\n` +
      `• In-depth interviews (semi-structured, unstructured)\n` +
      `• Focus groups and group discussions\n` +
      `• Participant observation\n` +
      `• Document analysis (texts, media, artifacts)\n` +
      `• Field notes and reflexive journaling\n\n` +
      
      `**Analysis Approaches:**\n` +
      `• Thematic analysis (identifying patterns and themes)\n` +
      `• Content analysis (systematic categorization)\n` +
      `• Discourse analysis (language and meaning)\n` +
      `• Constant comparative method\n` +
      `• Interpretative phenomenological analysis (IPA)\n`;
  }

  private getMixedMethodsGuidance(): string {
    return `**Mixed-Methods Research Approach**\n\n` +
      `**Best For:**\n` +
      `• Complex research questions requiring multiple perspectives\n` +
      `• Validation and triangulation of findings\n` +
      `• Explaining quantitative results with qualitative insights\n` +
      `• Comprehensive understanding of phenomena\n\n` +
      
      `**Common Designs:**\n` +
      `• **Sequential Explanatory**: Quantitative → Qualitative (explain results)\n` +
      `• **Sequential Exploratory**: Qualitative → Quantitative (test emerging theories)\n` +
      `• **Concurrent Triangulation**: Simultaneous qual/quant data collection\n` +
      `• **Embedded**: One method supports the other within same study\n\n` +
      
      `**Integration Strategies:**\n` +
      `• Data triangulation (comparing different data sources)\n` +
      `• Method triangulation (using multiple methods)\n` +
      `• Joint displays and mixed-methods matrices\n` +
      `• Meta-inferences drawing from both data types\n\n` +
      
      `**Considerations:**\n` +
      `• Requires expertise in both quantitative and qualitative methods\n` +
      `• More time and resource intensive\n` +
      `• Clear integration plan needed from start\n` +
      `• Consider paradigmatic compatibility\n`;
  }

  private getTheoreticalMethodologyGuidance(): string {
    return `**Theoretical Research Approach**\n\n` +
      `**Best For:**\n` +
      `• Developing new theoretical frameworks\n` +
      `• Mathematical modeling and proofs\n` +
      `• Conceptual analysis and synthesis\n` +
      `• Philosophy of science questions\n\n` +
      
      `**Common Approaches:**\n` +
      `• **Mathematical Modeling**: Formal mathematical representations\n` +
      `• **Conceptual Analysis**: Logical examination of concepts\n` +
      `• **Literature Synthesis**: Integrating existing knowledge\n` +
      `• **Thought Experiments**: Hypothetical scenarios for testing ideas\n` +
      `• **Formal Logic**: Proof-based reasoning systems\n\n` +
      
      `**Methods:**\n` +
      `• Systematic literature reviews and meta-synthesis\n` +
      `• Logical argumentation and proof construction\n` +
      `• Model development and validation\n` +
      `• Conceptual mapping and framework building\n` +
      `• Philosophical analysis and critique\n\n` +
      
      `**Validation Approaches:**\n` +
      `• Peer review and expert evaluation\n` +
      `• Logical consistency checking\n` +
      `• Empirical testing of predictions\n` +
      `• Comparison with existing theories\n` +
      `• Mathematical verification\n`;
  }

  private getComputationalMethodologyGuidance(): string {
    return `**Computational Research Approach**\n\n` +
      `**Best For:**\n` +
      `• Complex system modeling and simulation\n` +
      `• Large-scale data analysis\n` +
      `• Algorithm development and testing\n` +
      `• Predictive modeling and forecasting\n\n` +
      
      `**Common Methods:**\n` +
      `• **Agent-Based Modeling**: Simulating individual actors\n` +
      `• **Machine Learning**: Pattern recognition and prediction\n` +
      `• **Network Analysis**: Studying relationships and connections\n` +
      `• **Monte Carlo Methods**: Statistical simulation techniques\n` +
      `• **Optimization Algorithms**: Finding optimal solutions\n\n` +
      
      `**Implementation Considerations:**\n` +
      `• Software selection and programming languages\n` +
      `• Computational resource requirements\n` +
      `• Validation and verification procedures\n` +
      `• Reproducibility and code sharing\n` +
      `• Parameter sensitivity analysis\n\n` +
      
      `**Validation Approaches:**\n` +
      `• Cross-validation and holdout testing\n` +
      `• Comparison with empirical data\n` +
      `• Sensitivity and robustness testing\n` +
      `• Peer code review and replication\n` +
      `• Benchmark comparisons\n`;
  }

  private getMetaAnalysisGuidance(): string {
    return `**Meta-Analysis Research Approach**\n\n` +
      `**Best For:**\n` +
      `• Synthesizing findings across multiple studies\n` +
      `• Quantifying effect sizes and consistency\n` +
      `• Identifying research gaps and trends\n` +
      `• Evidence-based practice recommendations\n\n` +
      
      `**Types:**\n` +
      `• **Quantitative Meta-Analysis**: Statistical aggregation of effect sizes\n` +
      `• **Qualitative Meta-Synthesis**: Thematic synthesis across studies\n` +
      `• **Mixed-Methods Meta-Analysis**: Combining quan and qual findings\n` +
      `• **Network Meta-Analysis**: Comparing multiple interventions\n\n` +
      
      `**Process Steps:**\n` +
      `• Define research question and inclusion criteria\n` +
      `• Systematic literature search and screening\n` +
      `• Data extraction and quality assessment\n` +
      `• Statistical analysis and heterogeneity testing\n` +
      `• Publication bias assessment\n\n` +
      
      `**Quality Considerations:**\n` +
      `• Follow PRISMA guidelines for reporting\n` +
      `• Assess study quality and risk of bias\n` +
      `• Test for publication bias (funnel plots, tests)\n` +
      `• Explore sources of heterogeneity\n` +
      `• Conduct sensitivity analyses\n`;
  }

  private getGeneralMethodologyGuidance(researchQuestion?: string): string {
    let guidance = `**General Methodology Selection Guide**\n\n`;
    
    guidance += `**Choosing Your Research Approach:**\n\n`;
    
    guidance += `**Ask Yourself:**\n`;
    guidance += `• What is the nature of your research question?\n`;
    guidance += `• Are you testing a theory or developing new understanding?\n`;
    guidance += `• Do you need numerical data or rich descriptions?\n`;
    guidance += `• What resources and expertise do you have?\n`;
    guidance += `• What ethical considerations are involved?\n\n`;
    
    guidance += `**Decision Framework:**\n`;
    guidance += `• **"What?" questions** → Descriptive or exploratory studies\n`;
    guidance += `• **"How many?" or "How much?"** → Quantitative approaches\n`;
    guidance += `• **"How?" or "Why?"** → Qualitative or mixed methods\n`;
    guidance += `• **"Does X cause Y?"** → Experimental designs\n`;
    guidance += `• **"What is the relationship?"** → Correlational studies\n\n`;
    
    if (researchQuestion) {
      guidance += `**Analysis of Your Question:**\n`;
      guidance += `"${researchQuestion}"\n\n`;
      guidance += this.analyzeResearchQuestion(researchQuestion);
    }
    
    guidance += `**Universal Considerations:**\n`;
    guidance += `• **Feasibility**: Time, resources, access to participants\n`;
    guidance += `• **Ethics**: IRB approval, informed consent, privacy\n`;
    guidance += `• **Validity**: Internal and external validity threats\n`;
    guidance += `• **Reliability**: Consistency and reproducibility\n`;
    guidance += `• **Generalizability**: Who can your findings apply to?\n\n`;
    
    return guidance;
  }

  private analyzeResearchQuestion(question: string): string {
    const q = question.toLowerCase();
    let analysis = `**Suggested Approach Based on Your Question:**\n`;
    
    if (q.includes('how many') || q.includes('how much') || q.includes('what percentage')) {
      analysis += `• **Quantitative approach** - Your question seeks numerical answers\n`;
      analysis += `• Consider surveys, existing datasets, or measurement studies\n`;
    } else if (q.includes('why') || q.includes('how do') || q.includes('what is the experience')) {
      analysis += `• **Qualitative approach** - Your question seeks understanding and meaning\n`;
      analysis += `• Consider interviews, focus groups, or ethnographic methods\n`;
    } else if (q.includes('does') || q.includes('causes') || q.includes('effect') || q.includes('impact')) {
      analysis += `• **Experimental design** - Your question tests causal relationships\n`;
      analysis += `• Consider RCTs, quasi-experiments, or natural experiments\n`;
    } else if (q.includes('relationship') || q.includes('associated') || q.includes('related')) {
      analysis += `• **Correlational study** - Your question examines associations\n`;
      analysis += `• Consider survey research or secondary data analysis\n`;
    } else if (q.includes('what happens') || q.includes('trends') || q.includes('changes over time')) {
      analysis += `• **Longitudinal design** - Your question involves temporal patterns\n`;
      analysis += `• Consider panel studies or time series analysis\n`;
    } else {
      analysis += `• **Mixed approach might be best** - Your question is complex\n`;
      analysis += `• Consider starting with qualitative exploration, then quantitative validation\n`;
    }
    
    return analysis + `\n`;
  }

  public meta_research_guidance(input: unknown): { content: Array<{ type: "text"; text: string }> } {
    return this.safeExecute(() => {
      const params = (input || {}) as { focusArea?: string; researchStage?: string; institution?: string };
      const { focusArea = 'comprehensive', researchStage, institution } = params;
      
      let guidance = `## 🔬 Meta-Research Guidance: Best Practices for Scientific Integrity\n\n`;
      
      if (researchStage) {
        guidance += `**Research Stage:** ${researchStage}\n`;
      }
      if (institution) {
        guidance += `**Institution Context:** ${institution}\n`;
      }
      guidance += `**Focus Area:** ${focusArea}\n\n`;
      
      guidance += `### 🎯 Core Principles of Research Integrity\n\n`;
      guidance += `**The Foundation:**\n`;
      guidance += `• **Honesty** - Truthful reporting of data, methods, and results\n`;
      guidance += `• **Transparency** - Open sharing of methods, data, and limitations\n`;
      guidance += `• **Accountability** - Taking responsibility for research conduct\n`;
      guidance += `• **Fairness** - Unbiased treatment of data and participants\n`;
      guidance += `• **Respect** - For participants, colleagues, and scientific community\n\n`;
      
      // Provide specific guidance based on focus area
      switch (focusArea) {
        case 'ethics':
          guidance += this.getResearchEthicsGuidance();
          break;
        case 'reproducibility':
          guidance += this.getReproducibilityGuidance();
          break;
        case 'bias':
          guidance += this.getBiasMitigationGuidance();
          break;
        case 'open-science':
          guidance += this.getOpenScienceGuidance();
          break;
        case 'data-management':
          guidance += this.getDataManagementGuidance();
          break;
        case 'publication-ethics':
          guidance += this.getPublicationEthicsGuidance();
          break;
        default:
          guidance += this.getComprehensiveMetaResearchGuidance();
      }
      
      guidance += `\n### 🎯 Implementation Checklist\n`;
      guidance += `**Before Starting Research:**\n`;
      guidance += `• [ ] Obtain necessary ethical approvals (IRB/Ethics Committee)\n`;
      guidance += `• [ ] Register study protocol (if applicable)\n`;
      guidance += `• [ ] Plan data management and sharing strategy\n`;
      guidance += `• [ ] Identify potential conflicts of interest\n`;
      guidance += `• [ ] Establish collaboration agreements\n\n`;
      
      guidance += `**During Research:**\n`;
      guidance += `• [ ] Maintain detailed research logs and documentation\n`;
      guidance += `• [ ] Follow pre-registered protocols without unauthorized deviations\n`;
      guidance += `• [ ] Implement bias prevention measures\n`;
      guidance += `• [ ] Ensure participant safety and confidentiality\n`;
      guidance += `• [ ] Document any protocol modifications with rationale\n\n`;
      
      guidance += `**After Research:**\n`;
      guidance += `• [ ] Report all results, including negative findings\n`;
      guidance += `• [ ] Share data and materials as promised\n`;
      guidance += `• [ ] Acknowledge all contributors appropriately\n`;
      guidance += `• [ ] Comply with publication and funding requirements\n`;
      guidance += `• [ ] Consider broader societal implications\n\n`;
      
      guidance += `💡 **Remember**: Good meta-research practices protect both your research integrity and advance scientific knowledge for society.`;
      
      this.log(`Meta-research guidance provided: ${focusArea} focus`, 'info');
      return { content: [{ type: "text" as const, text: guidance }] };
    }, 'meta_research_guidance');
  }

  private getResearchEthicsGuidance(): string {
    return `### 🛡️ Research Ethics Framework\n\n` +
      `**Human Subjects Research:**\n` +
      `• **Informed Consent**: Clear, voluntary, and ongoing consent processes\n` +
      `• **Risk-Benefit Analysis**: Minimize risks, maximize societal benefits\n` +
      `• **Privacy Protection**: Safeguard participant data and confidentiality\n` +
      `• **Vulnerable Populations**: Extra protections for children, minorities, etc.\n` +
      `• **Cultural Sensitivity**: Respect for diverse backgrounds and values\n\n` +
      
      `**Animal Research Ethics:**\n` +
      `• **3Rs Principle**: Replace, Reduce, Refine animal use\n` +
      `• **IACUC Approval**: Institutional Animal Care and Use Committee oversight\n` +
      `• **Minimizing Suffering**: Proper anesthesia, analgesia, and euthanasia\n` +
      `• **Housing Standards**: Appropriate care and environmental enrichment\n\n` +
      
      `**Environmental Ethics:**\n` +
      `• **Ecological Impact**: Minimize environmental harm from research\n` +
      `• **Sustainability**: Use environmentally responsible methods\n` +
      `• **Waste Management**: Proper disposal of research materials\n` +
      `• **Conservation**: Protect endangered species and ecosystems\n\n` +
      
      `**Professional Ethics:**\n` +
      `• **Conflict of Interest**: Declare and manage financial/personal conflicts\n` +
      `• **Intellectual Property**: Respect copyrights and patent rights\n` +
      `• **Collaboration Ethics**: Fair attribution and data sharing\n` +
      `• **Mentorship**: Responsible training of students and junior researchers\n`;
  }

  private getReproducibilityGuidance(): string {
    return `### 🔄 Reproducibility and Replicability Framework\n\n` +
      `**Study Design for Reproducibility:**\n` +
      `• **Pre-registration**: Register hypotheses and methods before data collection\n` +
      `• **Detailed Protocols**: Provide step-by-step reproducible methods\n` +
      `• **Power Analysis**: Ensure adequate sample sizes for reliable results\n` +
      `• **Randomization**: Proper randomization and blinding procedures\n` +
      `• **Control Groups**: Appropriate controls and comparison conditions\n\n` +
      
      `**Data and Code Management:**\n` +
      `• **Version Control**: Track changes to data, code, and protocols\n` +
      `• **Documentation**: Clear README files and code comments\n` +
      `• **Data Provenance**: Record data sources and processing steps\n` +
      `• **Computational Environment**: Document software versions and dependencies\n` +
      `• **Testing**: Validate code with test cases and peer review\n\n` +
      
      `**Statistical Practices:**\n` +
      `• **Analysis Plans**: Pre-specify statistical analysis approaches\n` +
      `• **Multiple Testing**: Correct for multiple comparisons appropriately\n` +
      `• **Effect Sizes**: Report effect sizes along with p-values\n` +
      `• **Confidence Intervals**: Provide uncertainty estimates\n` +
      `• **Robustness Checks**: Test sensitivity to analytical choices\n\n` +
      
      `**Reporting Standards:**\n` +
      `• **CONSORT/STROBE**: Follow discipline-specific reporting guidelines\n` +
      `• **Complete Methods**: Sufficient detail for independent replication\n` +
      `• **All Results**: Report negative and null findings\n` +
      `• **Limitations**: Acknowledge study limitations honestly\n` +
      `• **Data Availability**: Make data accessible with clear licenses\n`;
  }

  private getBiasMitigationGuidance(): string {
    return `### ⚖️ Bias Prevention and Mitigation Strategies\n\n` +
      `**Selection Bias Prevention:**\n` +
      `• **Random Sampling**: Use probability-based sampling methods\n` +
      `• **Inclusion Criteria**: Define clear, objective inclusion/exclusion criteria\n` +
      `• **Recruitment Strategies**: Avoid systematic exclusion of groups\n` +
      `• **Response Rates**: Monitor and report participation rates\n` +
      `• **Representative Samples**: Ensure samples reflect target populations\n\n` +
      
      `**Information Bias Mitigation:**\n` +
      `• **Blinding**: Blind researchers and participants when possible\n` +
      `• **Standardized Procedures**: Use consistent data collection protocols\n` +
      `• **Validated Instruments**: Use psychometrically sound measures\n` +
      `• **Multiple Sources**: Triangulate data from different sources\n` +
      `• **Inter-rater Reliability**: Train observers and assess agreement\n\n` +
      
      `**Confounding Control:**\n` +
      `• **Randomization**: Random assignment to control confounders\n` +
      `• **Matching**: Match participants on key confounding variables\n` +
      `• **Statistical Control**: Include confounders in analytical models\n` +
      `• **Stratification**: Analyze within homogeneous subgroups\n` +
      `• **Sensitivity Analysis**: Test robustness to unmeasured confounders\n\n` +
      
      `**Cognitive Bias Awareness:**\n` +
      `• **Confirmation Bias**: Actively seek disconfirming evidence\n` +
      `• **Anchoring Bias**: Consider multiple initial hypotheses\n` +
      `• **Availability Bias**: Systematically search for relevant literature\n` +
      `• **Hindsight Bias**: Document predictions before outcome knowledge\n` +
      `• **Publication Bias**: Register studies regardless of expected results\n\n` +
      
      `**Algorithmic Bias (AI/ML Research):**\n` +
      `• **Training Data**: Ensure representative and balanced datasets\n` +
      `• **Feature Selection**: Avoid discriminatory variables\n` +
      `• **Fairness Metrics**: Evaluate algorithmic fairness across groups\n` +
      `• **Bias Testing**: Test for disparate impact and treatment\n` +
      `• **Interpretability**: Make algorithmic decisions transparent\n`;
  }

  private getOpenScienceGuidance(): string {
    return `### 🌐 Open Science Practices\n\n` +
      `**Open Access Publishing:**\n` +
      `• **Preprints**: Share early versions for community feedback\n` +
      `• **Open Access Journals**: Publish in accessible venues when possible\n` +
      `• **Self-Archiving**: Deposit accepted manuscripts in repositories\n` +
      `• **Creative Commons**: Use appropriate open licensing\n` +
      `• **Predatory Journals**: Avoid journals with questionable practices\n\n` +
      
      `**Open Data and Materials:**\n` +
      `• **Data Repositories**: Use discipline-specific or general repositories\n` +
      `• **FAIR Principles**: Make data Findable, Accessible, Interoperable, Reusable\n` +
      `• **Metadata Standards**: Use standardized data documentation\n` +
      `• **Data Sharing Agreements**: Establish clear usage terms\n` +
      `• **Privacy Protection**: De-identify sensitive data appropriately\n\n` +
      
      `**Open Source Tools:**\n` +
      `• **Open Software**: Use and contribute to open source tools\n` +
      `• **Code Sharing**: Make analysis code publicly available\n` +
      `• **Version Control**: Use Git/GitHub for collaborative development\n` +
      `• **Documentation**: Provide clear installation and usage instructions\n` +
      `• **Community Building**: Engage with open source communities\n\n` +
      
      `**Collaborative Practices:**\n` +
      `• **Team Science**: Foster interdisciplinary collaboration\n` +
      `• **Citizen Science**: Engage public participation when appropriate\n` +
      `• **Global Partnerships**: Build international research networks\n` +
      `• **Resource Sharing**: Share equipment, expertise, and infrastructure\n` +
      `• **Capacity Building**: Support training in underserved regions\n`;
  }

  private getDataManagementGuidance(): string {
    return `### 💾 Research Data Management\n\n` +
      `**Data Management Planning:**\n` +
      `• **DMP Requirements**: Create comprehensive data management plans\n` +
      `• **Data Types**: Identify all data types to be collected/generated\n` +
      `• **Storage Requirements**: Estimate storage needs and costs\n` +
      `• **Backup Strategies**: Implement 3-2-1 backup rule (3 copies, 2 media, 1 offsite)\n` +
      `• **Access Controls**: Define who can access data and when\n\n` +
      
      `**Data Collection and Organization:**\n` +
      `• **File Naming**: Use consistent, descriptive naming conventions\n` +
      `• **Folder Structure**: Organize data in logical hierarchies\n` +
      `• **Quality Control**: Implement real-time data validation\n` +
      `• **Version Control**: Track data versions and modifications\n` +
      `• **Chain of Custody**: Document data handling and transfers\n\n` +
      
      `**Security and Privacy:**\n` +
      `• **Encryption**: Encrypt sensitive data at rest and in transit\n` +
      `• **Access Logs**: Monitor and log data access activities\n` +
      `• **De-identification**: Remove or mask personally identifiable information\n` +
      `• **Secure Disposal**: Properly delete data when no longer needed\n` +
      `• **Compliance**: Follow relevant regulations (GDPR, HIPAA, etc.)\n\n` +
      
      `**Long-term Preservation:**\n` +
      `• **File Formats**: Use open, non-proprietary formats when possible\n` +
      `• **Repository Selection**: Choose appropriate long-term repositories\n` +
      `• **Metadata**: Create rich descriptive metadata\n` +
      `• **Digital Preservation**: Plan for format migration and technology changes\n` +
      `• **Retention Policies**: Follow institutional and funder requirements\n`;
  }

  private getPublicationEthicsGuidance(): string {
    return `### 📝 Publication Ethics Framework\n\n` +
      `**Authorship Standards:**\n` +
      `• **ICMJE Criteria**: Substantial contribution, drafting/revision, approval, accountability\n` +
      `• **Author Order**: Establish clear criteria for author sequencing\n` +
      `• **Corresponding Author**: Designate responsible communication contact\n` +
      `• **Acknowledgments**: Credit non-author contributors appropriately\n` +
      `• **Authorship Disputes**: Address conflicts early and transparently\n\n` +
      
      `**Manuscript Preparation:**\n` +
      `• **Originality**: Ensure work is novel and not previously published\n` +
      `• **Plagiarism Prevention**: Properly cite all sources and ideas\n` +
      `• **Data Integrity**: Present data accurately without fabrication\n` +
      `• **Image Ethics**: Avoid inappropriate manipulation of figures\n` +
      `• **Conflict Declaration**: Disclose all potential conflicts of interest\n\n` +
      
      `**Peer Review Process:**\n` +
      `• **Review Ethics**: Provide constructive, unbiased evaluations\n` +
      `• **Confidentiality**: Maintain confidentiality of manuscripts under review\n` +
      `• **Timeliness**: Complete reviews promptly and professionally\n` +
      `• **Competing Interests**: Decline reviews with conflicts of interest\n` +
      `• **Quality Standards**: Uphold scientific rigor in evaluations\n\n` +
      
      `**Post-Publication Responsibilities:**\n` +
      `• **Corrections**: Promptly correct errors and provide errata\n` +
      `• **Retractions**: Retract publications with serious errors or misconduct\n` +
      `• **Data Sharing**: Honor data sharing commitments\n` +
      `• **Response to Criticism**: Engage constructively with legitimate critiques\n` +
      `• **Follow-up Studies**: Conduct replication studies when appropriate\n`;
  }

  private getComprehensiveMetaResearchGuidance(): string {
    return `### 🔬 Comprehensive Meta-Research Framework\n\n` +
      `**Research Lifecycle Management:**\n` +
      `• **Planning Phase**: Systematic review, protocol development, ethics approval\n` +
      `• **Execution Phase**: Data collection, quality control, interim monitoring\n` +
      `• **Analysis Phase**: Pre-specified analysis, sensitivity testing, peer review\n` +
      `• **Dissemination Phase**: Publication, data sharing, community engagement\n` +
      `• **Translation Phase**: Knowledge mobilization and implementation\n\n` +
      
      `**Quality Assurance Systems:**\n` +
      `• **Standard Operating Procedures**: Develop and follow detailed SOPs\n` +
      `• **Training Programs**: Ensure all team members are properly trained\n` +
      `• **Audit Trails**: Maintain complete records of all research activities\n` +
      `• **External Monitoring**: Engage independent monitors for critical studies\n` +
      `• **Continuous Improvement**: Regularly review and update practices\n\n` +
      
      `**Stakeholder Engagement:**\n` +
      `• **Community Involvement**: Engage affected communities in research design\n` +
      `• **Patient and Public Involvement**: Include end-users in health research\n` +
      `• **Policy Makers**: Connect research to policy implications\n` +
      `• **Industry Partners**: Manage relationships transparently\n` +
      `• **International Collaboration**: Foster global research partnerships\n\n` +
      
      `**Innovation and Adaptation:**\n` +
      `• **Emerging Technologies**: Adapt to new tools and methodologies\n` +
      `• **Interdisciplinary Approaches**: Integrate multiple disciplinary perspectives\n` +
      `• **Agile Research**: Adapt methods based on interim findings\n` +
      `• **Capacity Building**: Invest in researcher development\n` +
      `• **Future Planning**: Anticipate and plan for research trends\n`;
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
    "Background research with web search guidance recommendations",
    { 
      literature: z.string(),
      autoSearch: z.boolean().optional().describe("Enable web search guidance based on problem statement")
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
    "Generate optimized search queries and provide guidance for academic literature search - requires agent to use external web search tools",
    { 
      query: z.string().describe("Search query terms")
    },
    async (input: LiteratureSearchInput) => engine.literature_search(input)
  );

  server.tool(
    "data_analysis_guidance",
    "Provides guidance for data analysis - agent performs the actual statistical calculations",
    { data: z.array(z.string()) },
    async (input: DataAnalysisInput) => engine.data_analysis_guidance(input)
  );

  server.tool(
    "peer_review_guidance",
    "Provides guidance for conducting peer review - agent performs the actual review using specified style and focus",
    { 
      focusArea: z.enum(["hypotheses", "methodology", "data", "conclusions", "overall"]).optional().describe("Specific research area to focus the review on"),
      reviewerType: z.enum(["skeptical", "supportive", "methodological", "statistical"]).optional().describe("Type of reviewer approach style to adopt")
    },
    async (input: PeerReviewInput) => engine.peer_review_guidance(input)
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

  server.tool(
    "research_methodology_guidance",
    "Provides comprehensive guidance for selecting and implementing research methodologies across all research domains",
    { 
      researchQuestion: z.string().optional().describe("Your specific research question for tailored methodology recommendations"),
      field: z.string().optional().describe("Research field or discipline"),
      methodologyType: z.enum(["quantitative", "qualitative", "mixed-methods", "theoretical", "computational", "meta-analysis", "general"]).optional().describe("Specific methodology type for focused guidance")
    },
    async (input: { researchQuestion?: string; field?: string; methodologyType?: string }) => engine.research_methodology_guidance(input)
  );

  server.tool(
    "meta_research_guidance",
    "Comprehensive guidance for research integrity, ethics, reproducibility, and best practices across the entire research lifecycle",
    { 
      focusArea: z.enum(["ethics", "reproducibility", "bias", "open-science", "data-management", "publication-ethics", "comprehensive"]).optional().describe("Specific aspect of meta-research to focus on"),
      researchStage: z.string().optional().describe("Current stage of research for tailored guidance"),
      institution: z.string().optional().describe("Institutional context for specific requirements")
    },
    async (input: { focusArea?: string; researchStage?: string; institution?: string }) => engine.meta_research_guidance(input)
  );

  return server;
}

// Create and start the server
const server = createCognatusServer({ config: {} });
const transport = new StdioServerTransport();
server.connect(transport);

console.error("Cognatus MCP Server running on stdio");
