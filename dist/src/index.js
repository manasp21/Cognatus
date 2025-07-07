#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
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
            const errorMsg = `Invalid transition from ${this.state.currentStage} to ${nextStage}. Allowed transitions: ${allowedTransitions.join(', ')}`;
            this.log(errorMsg, 'error');
            throw new Error(errorMsg);
        }
    }
    validateInput(input, expectedFields) {
        if (!input || typeof input !== 'object') {
            throw new Error('Input must be a valid object');
        }
        for (const field of expectedFields) {
            if (!(field in input) || input[field] == null || input[field] === '') {
                throw new Error(`Missing required field: ${field}`);
            }
        }
    }
    safeExecute(operation, context) {
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
        }
        catch (error) {
            const errorMsg = `Error in ${context}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            this.log(errorMsg, 'error');
            return { content: [{ type: "text", text: errorMsg }] };
        }
    }
    observation(input) {
        return this.safeExecute(() => {
            this.validateInput(input, ['problemStatement']);
            const { problemStatement } = input;
            if (problemStatement.length < 10) {
                throw new Error('Problem statement must be at least 10 characters long');
            }
            this.state.problemStatement = problemStatement;
            this.log(`Observation recorded: ${problemStatement}`);
            this.transitionTo(Stage.LiteratureReview);
            return { content: [{ type: "text", text: `Observation recorded. Current stage: ${this.state.currentStage}` }] };
        }, 'observation');
    }
    literature_review(input) {
        return this.safeExecute(() => {
            this.validateInput(input, ['literature']);
            const { literature, autoSearch = false } = input;
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
            }
            else if (autoSearch && !this.state.problemStatement) {
                finalOutput += `### ⚠️ Search Guidance Unavailable\n`;
                finalOutput += `Complete the observation stage first to get automated search query suggestions based on your problem statement.\n\n`;
            }
            this.state.literature.push(literature);
            this.log(`Literature added: ${literature}`);
            this.transitionTo(Stage.HypothesisFormation);
            return { content: [{ type: "text", text: finalOutput }] };
        }, 'literature_review');
    }
    generateSearchQueries(problemStatement) {
        // Extract key terms and generate search queries
        const queries = [];
        // Simple keyword extraction (in a real implementation, this could be more sophisticated)
        const cleanedStatement = problemStatement.toLowerCase();
        // Generate different query variations
        queries.push(problemStatement.slice(0, 50)); // First 50 chars as base query
        // Extract potential key terms
        const terms = cleanedStatement.split(/\s+/).filter(term => term.length > 4 &&
            !['that', 'with', 'this', 'from', 'they', 'have', 'been', 'will', 'were', 'what', 'when', 'where', 'how'].includes(term));
        if (terms.length >= 2) {
            queries.push(`${terms[0]} ${terms[1]} research`);
            queries.push(`${terms[0]} ${terms[1]} study`);
        }
        if (terms.length >= 3) {
            queries.push(`${terms[0]} ${terms[1]} ${terms[2]}`);
        }
        return queries.filter(q => q.length > 10); // Filter out too short queries
    }
    hypothesis_formation(input) {
        return this.safeExecute(() => {
            this.validateInput(input, ['hypothesis']);
            const { hypothesis } = input;
            if (hypothesis.length < 15) {
                throw new Error('Hypothesis must be at least 15 characters long');
            }
            const newHypothesis = {
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
        return this.safeExecute(() => {
            this.validateInput(input, ['query']);
            const { query } = input;
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
            return { content: [{ type: "text", text: searchGuidance }] };
        }, 'literature_search');
    }
    generateAcademicSearchQueries(query) {
        const queries = [];
        // Base academic query
        queries.push(`${query} academic research`);
        // Quoted exact phrase for precision
        queries.push(`"${query}" study`);
        // Peer review focused
        queries.push(`${query} peer reviewed`);
        return queries;
    }
    data_analysis(input) {
        return this.safeExecute(() => {
            this.validateInput(input, ['data']);
            const params = input;
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
    parseDataPoints(data) {
        const numericData = [];
        data.forEach(point => {
            // Try to extract numeric values from text
            const cleanPoint = point.replace(/[^\d.-]/g, ' ').trim();
            const numbers = cleanPoint.split(/\s+/).map(n => parseFloat(n)).filter(n => !isNaN(n));
            numericData.push(...numbers);
        });
        return numericData;
    }
    generateStatisticalAnalysis(rawData, numericData, analysisType, targetVariable, confidenceLevel = 0.95) {
        const report = {
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
    classifyDataTypes(data) {
        const types = new Set();
        data.forEach(point => {
            if (/^\d+(\.\d+)?$/.test(point.trim())) {
                types.add('numeric');
            }
            else if (/^(true|false|yes|no|y|n)$/i.test(point.trim())) {
                types.add('boolean');
            }
            else if (/^\d{4}-\d{2}-\d{2}/.test(point.trim())) {
                types.add('date');
            }
            else if (point.includes(',') || point.includes(';')) {
                types.add('multivalue');
            }
            else {
                types.add('categorical');
            }
        });
        return Array.from(types);
    }
    calculateDescriptiveStats(data) {
        if (data.length === 0)
            return [];
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
    calculateInferentialStats(data, confidenceLevel) {
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
    calculateCorrelations(data) {
        if (data.length < 4)
            return [];
        // Create pairs for correlation analysis (adjacent values, lag-1 autocorrelation)
        const pairs = [];
        for (let i = 0; i < data.length - 1; i++) {
            pairs.push([data[i], data[i + 1]]);
        }
        if (pairs.length < 3)
            return [];
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
    performHypothesisTests(data) {
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
    performRegressionAnalysis(data) {
        if (data.length < 4)
            return [];
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
    generateRecommendations(report, dataSize) {
        const recommendations = [];
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
    percentile(sortedData, p) {
        const index = p * (sortedData.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        if (lower === upper) {
            return sortedData[lower];
        }
        return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
    }
    getTCritical(df, alpha) {
        // Simplified t-critical values for common cases
        if (df >= 30)
            return 1.96; // Normal approximation
        const tTable = {
            1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
            6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
            15: 2.131, 20: 2.086, 25: 2.060
        };
        const closestDf = Object.keys(tTable)
            .map(Number)
            .reduce((prev, curr) => Math.abs(curr - df) < Math.abs(prev - df) ? curr : prev);
        return tTable[closestDf] || 2.0;
    }
    calculatePearsonCorrelation(pairs) {
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
    calculatePValue(tStat, df) {
        // Simplified p-value calculation (approximation)
        if (Math.abs(tStat) > 3)
            return 0.001;
        if (Math.abs(tStat) > 2.5)
            return 0.01;
        if (Math.abs(tStat) > 2)
            return 0.05;
        if (Math.abs(tStat) > 1.5)
            return 0.1;
        return 0.2;
    }
    simpleNormalityTest(data) {
        // Simplified normality test based on skewness and kurtosis
        const n = data.length;
        const mean = data.reduce((a, b) => a + b, 0) / n;
        const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);
        const skewness = data.reduce((sum, x) => sum + Math.pow((x - mean) / stdDev, 3), 0) / n;
        const kurtosis = data.reduce((sum, x) => sum + Math.pow((x - mean) / stdDev, 4), 0) / n - 3;
        // Rough approximation: reject normality if |skewness| > 1 or |kurtosis| > 1
        const normalityScore = Math.abs(skewness) + Math.abs(kurtosis);
        if (normalityScore > 2)
            return 0.01;
        if (normalityScore > 1)
            return 0.05;
        if (normalityScore > 0.5)
            return 0.1;
        return 0.5;
    }
    formatDataAnalysisReport(report, analysisType) {
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
    peer_review_guidance(input) {
        return this.safeExecute(() => {
            const params = (input || {});
            const focusArea = params.focusArea || 'overall';
            const reviewerType = params.reviewerType || 'methodological';
            // Check if there's enough research content to review
            if (!this.state.problemStatement && this.state.hypotheses.length === 0 && this.state.data.length === 0) {
                return { content: [{ type: "text", text: "❌ Insufficient research content for peer review. Please complete observation, hypothesis formation, or data collection first." }] };
            }
            const guidance = this.generatePeerReviewGuidance(focusArea, reviewerType);
            this.log(`Peer review guidance provided: ${reviewerType} perspective on ${focusArea}`, 'info');
            return { content: [{ type: "text", text: guidance }] };
        }, 'peer_review_guidance');
    }
    generatePeerReviewGuidance(focusArea, reviewerType) {
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
    getReviewerStyle(reviewerType) {
        const styles = {
            skeptical: "Critical and questioning - challenge assumptions, seek disconfirming evidence",
            supportive: "Constructive and encouraging - identify strengths while suggesting improvements",
            methodological: "Focus on experimental design, procedures, and scientific rigor",
            statistical: "Emphasize data analysis, statistical validity, and quantitative aspects"
        };
        return styles[reviewerType] || styles.methodological;
    }
    getReviewGuidanceByType(reviewerType, focusArea) {
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
    getFocusAreaGuidance(focusArea) {
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
    get_state() {
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
    score_hypothesis(input) {
        return this.safeExecute(() => {
            this.validateInput(input, ['hypothesisId', 'score']);
            const { hypothesisId, score } = input;
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
    check_for_breakthrough() {
        return this.safeExecute(() => {
            if (this.state.hypotheses.length === 0) {
                return { content: [{ type: "text", text: "No hypotheses to check for breakthrough. Please form hypotheses first." }] };
            }
            const totalEvidenceScore = this.state.hypotheses.reduce((sum, h) => sum + h.evidenceScore, 0);
            const averageEvidenceScore = totalEvidenceScore / this.state.hypotheses.length;
            let breakthroughStatus = "";
            if (averageEvidenceScore >= 0.8) {
                breakthroughStatus = " 🎉 POTENTIAL BREAKTHROUGH DETECTED! High confidence in hypotheses.";
            }
            else if (averageEvidenceScore >= 0.6) {
                breakthroughStatus = " ⚡ Strong evidence supporting current hypotheses.";
            }
            else if (averageEvidenceScore >= 0.4) {
                breakthroughStatus = " 📊 Moderate evidence. More research needed.";
            }
            else {
                breakthroughStatus = " 🔍 Low evidence. Consider refining hypotheses.";
            }
            this.log(`Current average evidence score: ${averageEvidenceScore.toFixed(2)}`);
            return { content: [{ type: "text", text: `Current average evidence score across all hypotheses: ${averageEvidenceScore.toFixed(2)}.${breakthroughStatus}` }] };
        }, 'check_for_breakthrough');
    }
}
export const configSchema = z.object({});
export function createCognatusServer({ config }) {
    const server = new McpServer({
        name: "cognatus-server",
        version: "1.0.0",
    });
    const engine = new ScientificMethodEngine();
    // Primary unified scientific thinking tool
    server.tool("scientific_thinking", "Complete scientific research process with sequential 7-stage workflow", {
        stage: z.enum(["observation", "literature_review", "hypothesis_formation", "experiment_design", "data_collection", "analysis", "conclusion"]).optional().describe("Specific stage to execute, or omit to run the next stage in sequence"),
        input: z.string().describe("Input data for the specified stage (e.g., problem statement for observation, literature for literature_review, etc.)")
    }, async (input) => {
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
            const guidanceText = stageGuidance[currentStage] || "";
            const nextSteps = STAGE_TRANSITIONS[engine.state.currentStage];
            const nextStepText = nextSteps.length > 0 ? `\n\nNext available stages: ${nextSteps.join(', ')}` : "\n\n🎉 Research workflow complete!";
            return {
                content: [
                    { type: "text", text: `${guidanceText}\n\n${result.content[0].text}${nextStepText}` }
                ]
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: `Error in scientific thinking workflow: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
        }
    });
    // Individual stage tools for granular control
    server.tool("observation", "Problem identification", { problemStatement: z.string() }, async (input) => engine.observation(input));
    server.tool("literature_review", "Background research with web search guidance recommendations", {
        literature: z.string(),
        autoSearch: z.boolean().optional().describe("Enable web search guidance based on problem statement")
    }, async (input) => engine.literature_review(input));
    server.tool("hypothesis_formation", "Generate a single testable hypothesis", { hypothesis: z.string() }, async (input) => engine.hypothesis_formation(input));
    server.tool("hypothesis_generation", "Create multiple competing hypotheses", { hypotheses: z.array(z.string()) }, async (input) => engine.hypothesis_generation(input));
    server.tool("experiment_design", "Design testing methodology", { experiment: z.string() }, async (input) => engine.experiment_design(input));
    server.tool("data_collection", "Gather evidence", { data: z.string() }, async (input) => engine.data_collection(input));
    server.tool("analysis", "Analyze results", { analysis: z.string() }, async (input) => engine.analysis(input));
    server.tool("conclusion", "Draw conclusions and refine theory", { conclusion: z.string() }, async (input) => engine.conclusion(input));
    server.tool("literature_search", "Generate optimized search queries and provide guidance for academic literature search - requires agent to use external web search tools", {
        query: z.string().describe("Search query terms")
    }, async (input) => engine.literature_search(input));
    server.tool("data_analysis", "Statistical analysis of results", { data: z.array(z.string()) }, async (input) => engine.data_analysis(input));
    server.tool("peer_review_guidance", "Provides guidance for conducting peer review - agent performs the actual review using specified style and focus", {
        focusArea: z.enum(["hypotheses", "methodology", "data", "conclusions", "overall"]).optional().describe("Specific research area to focus the review on"),
        reviewerType: z.enum(["skeptical", "supportive", "methodological", "statistical"]).optional().describe("Type of reviewer approach style to adopt")
    }, async (input) => engine.peer_review_guidance(input));
    server.tool("score_hypothesis", "Assign an evidence score to a specific hypothesis", { hypothesisId: z.string(), score: z.number().min(0).max(1) }, async (input) => engine.score_hypothesis(input));
    server.tool("check_for_breakthrough", "Check the current average evidence score across all hypotheses", {}, async () => engine.check_for_breakthrough());
    server.tool("get_state", "Get the current state of the research", {}, async () => engine.get_state());
    return server;
}
// Create and start the server
const server = createCognatusServer({ config: {} });
const transport = new StdioServerTransport();
server.connect(transport);
console.error("Cognatus MCP Server running on stdio");
