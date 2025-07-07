# Cognatus MCP Server: Dark Matter Research Example

This example demonstrates the full capabilities of the Cognatus MCP server for complex scientific research using the question: **"Why haven't we still found dark matter?"**

## Complete Research Workflow

### 1. Initial Problem Definition
```
Use: scientific_thinking
Input: "Why haven't we still found dark matter despite decades of research and multiple detection methods?"
```

### 2. Literature Search Strategy
```
Use: literature_search
Input: "dark matter detection methods WIMPs axions sterile neutrinos"
```
*Note: Agent must use external web search tools with the provided optimized queries*

### 3. Multiple Hypothesis Generation
```
Use: hypothesis_generation
Input: [
  "Dark matter particles have interaction cross-sections below current detector sensitivity",
  "Dark matter consists of non-particle entities like primordial black holes or modified gravity",
  "Current detection methods assume wrong particle physics models",
  "Dark matter undergoes self-interactions that complicate detection signatures",
  "Experimental systematic errors mask genuine dark matter signals"
]
```

### 4. Research Methodology Planning
```
Use: research_methodology_guidance
Input: {
  "researchQuestion": "Why haven't we detected dark matter particles yet?",
  "field": "particle physics and cosmology",
  "methodologyType": "mixed-methods"
}
```

### 5. Comprehensive Data Analysis Strategy
```
Use: data_analysis_guidance
Input: {
  "data": ["XENON1T_data", "LUX_results", "DAMA_modulation", "CoGeNT_signals", "null_results"],
  "analysisType": "comprehensive",
  "targetVariable": "detection_significance"
}
```

### 6. Peer Review Preparation
```
Use: peer_review_guidance
Input: {
  "focusArea": "methodology",
  "reviewerType": "skeptical"
}
```

### 7. Research Ethics and Integrity
```
Use: meta_research_guidance
Input: {
  "focusArea": "bias",
  "researchStage": "analysis",
  "institution": "particle physics collaboration"
}
```

### 8. Advanced Methodology for Theoretical Aspects
```
Use: research_methodology_guidance
Input: {
  "researchQuestion": "Could modified gravity theories explain observations without dark matter?",
  "methodologyType": "theoretical"
}
```

### 9. Computational Modeling Guidance
```
Use: research_methodology_guidance
Input: {
  "researchQuestion": "How to model dark matter self-interactions in galactic simulations?",
  "methodologyType": "computational"
}
```

### 10. Meta-Analysis Planning
```
Use: research_methodology_guidance
Input: {
  "researchQuestion": "What do combined results from all dark matter experiments tell us?",
  "methodologyType": "meta-analysis"
}
```

### 11. Hypothesis Evidence Tracking
```
Use: score_hypothesis
Input: {
  "hypothesisId": "hypothesis_1",
  "score": 0.3
}

Use: score_hypothesis
Input: {
  "hypothesisId": "hypothesis_2", 
  "score": 0.7
}
```

### 12. Breakthrough Detection
```
Use: check_for_breakthrough
```

### 13. Research State Overview
```
Use: get_state
```

## Expected Capabilities Demonstration

### Ethical Research Guidance
- **No fake papers**: Only provides search strategies, requires agent to use real web search
- **No simulated results**: Guides analysis methodology without performing calculations
- **Research integrity**: Emphasizes proper citation, conflict disclosure, bias mitigation

### Comprehensive Methodology Support
- **Quantitative**: Experimental design for particle detectors, statistical analysis of signals
- **Qualitative**: Literature synthesis, theoretical framework development
- **Mixed-methods**: Combining observational data with theoretical predictions
- **Theoretical**: Mathematical modeling of dark matter interactions
- **Computational**: N-body simulations, Monte Carlo detector modeling
- **Meta-analysis**: Synthesizing results across multiple experiments

### Multi-dimensional Research Support
- **Technical**: Detector physics, data analysis, systematic uncertainties
- **Theoretical**: Beyond Standard Model physics, modified gravity theories
- **Observational**: Astronomical evidence, galactic dynamics
- **Statistical**: Signal detection, background modeling, frequentist vs Bayesian approaches
- **Collaborative**: Large-scale collaboration management, data sharing protocols

### Research Integrity Framework
- **Bias mitigation**: Addressing confirmation bias in dark matter research
- **Reproducibility**: Open data sharing, code availability, protocol documentation
- **Ethics**: Proper attribution, conflict management, responsible speculation
- **Publication**: Avoiding publication bias toward positive results

## Key Ethical Principles Demonstrated

1. **Guidance Only**: All tools provide frameworks and methodology guidance
2. **Agent Responsibility**: User/agent performs actual research, calculations, and literature search
3. **No Fake Content**: Zero generation of fake papers, authors, citations, or data
4. **Versatile Support**: Works across all research domains and methodologies
5. **Research Integrity**: Emphasizes ethical research practices throughout

This comprehensive workflow demonstrates how Cognatus provides scaffolding for complex scientific research while maintaining complete ethical integrity and requiring agents to perform the actual intellectual work.