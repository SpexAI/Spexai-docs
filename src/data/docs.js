// src/data/docs.js
export const docsData = {
  public: {
    sections: [
      {
        title: "Getting Started",
        items: [
          {
            id: "getting-started",
            title: "Introduction",
            content: `
# Welcome to SpexAI Documentation

SpexAI is a powerful AI platform designed to help you build and deploy intelligent solutions. This documentation will guide you through everything you need to know to get started with SpexAI.

## Quick Start

1. Create an account at [SpexAI](https://spexai.com)
2. Get your API key from the dashboard
3. Start integrating SpexAI into your projects
            `,
          },
        ],
      },
      {
        title: "1. Executive Overview",
        items: [
          {
            id: "problem-statement",
            title: "Problem Statement",
            content: `# The AI Implementation Challenge

## Current Industry Challenges

Organizations face significant obstacles implementing AI solutions effectively:

![AI Implementation Challenges](https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800)

### Key Pain Points

* **Development Complexity**
  - 78% of AI projects never reach production
  - Average implementation time: 12-18 months
  - Requires specialized ML expertise

* **Resource Intensity**
  - Average team size: 8-12 specialists
  - Typical budget: $500K - $2M per project
  - High ongoing maintenance costs

* **Integration Difficulties**
  - Complex infrastructure requirements
  - Data pipeline management
  - Security and compliance hurdles

Organizations face significant obstacles implementing AI solutions effectively:

### Market Impact Analysis

| Challenge Area     | Industry Average | Business Impact       |
|-------------------|------------------|----------------------|
| Time to Market    | 18 months        | Lost opportunities   |
| Project Costs     | $1.5M            | Budget overruns      |
| Success Rate      | < 40%            | Wasted resources     |
| Team Size         | 12 people        | Resource strain      |


### Technical Barriers

\`\`\`javascript
// Traditional Implementation Requirements
const traditionalApproach = {
  infrastructure: {
    compute: 'High-Performance Clusters',
    storage: 'Petabyte Scale',
    networking: 'Low Latency'
  },
  team: [
    'ML Engineers',
    'Data Scientists',
    'DevOps Specialists',
    'Domain Experts'
  ],
  timeline: {
    planning: '3-4 months',
    development: '6-8 months',
    testing: '2-3 months',
    deployment: '1-2 months'
  }
};
\`\`\`

> "The complexity of AI implementation remains the single biggest barrier to adoption in enterprise environments." - Industry Analysis 2024`,
          },
          {
            id: "solution-overview",
            title: "Solution Overview",
            content: `# The SpexAI Solution

![SpexAI Platform Overview](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800)

## Revolutionary Approach

SpexAI transforms AI implementation through:

1. **Automated Intelligence**
   * Self-configuring models
   * Adaptive learning systems
   * Autonomous optimization

2. **Simplified Integration**
   * No-code deployment
   * Pre-built connectors
   * Automated data handling

3. **Enterprise Ready**
   * Bank-grade security
   * Scalable architecture
   * Compliance frameworks

### Quick Start Example

\`\`\`javascript
// Initialize SpexAI
const spexai = new SpexAI({
  apiKey: 'your-key',
  environment: 'production'
});

// Deploy a model in 3 lines
const model = await spexai.createModel({
  type: 'prediction',
  data: yourDataset
});

// Start processing
const results = await model.predict(newData);
\`\`\`

## Performance Comparison

| Metric | Traditional | SpexAI |
|--------|------------|---------|
| Setup Time | Weeks | Minutes |
| Integration | Manual | Automated |
| Maintenance | Complex | Automated |
| Scaling | Manual | Automatic |

> "SpexAI reduced our AI implementation time by 80% while improving accuracy by 45%" - Enterprise Customer`,
          },
          {
            id: "key-benefits",
            title: "Key Benefits",
            content: `# Platform Benefits

![Benefits Overview](https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800)

## Quantifiable Advantages

### Time & Cost Impact
* 90% faster deployment
* 80% cost reduction
* 75% fewer resources required
* 95% automated maintenance

## Performance Metrics

| Area | Improvement | Business Impact |
|------|------------|-----------------|
| Development | 90% faster | Rapid time to market |
| Resources | 75% reduction | Lower operational costs |
| Accuracy | 45% increase | Better outcomes |
| Maintenance | 95% automated | Reduced overhead |

### ROI Calculator

\`\`\`javascript
// Simple ROI Calculator
function calculateROI(traditional, spexai) {
  const savings = {
    timeSaved: traditional.time - spexai.time,
    costReduction: traditional.cost - spexai.cost,
    resourceSavings: traditional.team - spexai.team
  };
  
  return {
    ...savings,
    annualSavings: savings.costReduction * 12,
    roi: ((savings.costReduction * 12) / spexai.cost * 100).toFixed(2) + '%'
  };
}

// Example calculation
const roi = calculateROI(
  { time: 120, cost: 200000, team: 10 },
  { time: 12, cost: 40000, team: 2 }
);
\`\`\`

## Key Outcomes

1. **Market Advantage**
   * First-to-market capabilities
   * Competitive differentiation
   * Rapid innovation

2. **Resource Optimization**
   * Reduced team requirements
   * Lower operational costs
   * Improved efficiency

3. **Risk Mitigation**
   * Enhanced security
   * Compliance automation
   * Quality assurance

> "Our ROI exceeded 300% in the first year alone" - Financial Services Client`,
          },
          {
            id: "core-features",
            title: "Core Features Highlights",
            content: `# Core Platform Features

![Feature Overview](https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800)

## Feature Categories

### 1. Model Management
\`\`\`javascript
// Automated Model Lifecycle
const modelLifecycle = {
  training: {
    type: 'automated',
    optimization: 'continuous',
    validation: 'real-time'
  },
  deployment: {
    method: 'one-click',
    scaling: 'automatic',
    monitoring: 'continuous'
  },
  maintenance: {
    updates: 'automatic',
    performance: 'self-optimizing',
    health: 'self-healing'
  }
};
\`\`\`

### 2. Data Processing

| Feature | Capability | Impact |
|---------|------------|---------|
| Cleansing | Automated | 99.9% accuracy |
| Validation | Real-time | Instant feedback |
| Transformation | Intelligent | Optimal format |
| Integration | Automatic | Seamless flow |

### 3. Enterprise Security

* **Data Protection**
  - End-to-end encryption
  - Role-based access
  - Audit logging
  - Compliance automation

* **Infrastructure Security**
  - Zero-trust architecture
  - Multi-region deployment
  - DDoS protection
  - Auto-scaling firewalls

### 4. Integration Options

\`\`\`javascript
// Available Integration Methods
const integrations = {
  api: {
    rest: 'Standard REST API',
    graphql: 'Complex Queries',
    grpc: 'High Performance'
  },
  sdk: {
    python: 'Data Science',
    javascript: 'Web Integration',
    java: 'Enterprise',
    go: 'Performance'
  },
  plugins: {
    jupyter: 'Data Science',
    vscode: 'Development',
    tableau: 'Business Intelligence'
  }
};
\`\`\`

## Performance Specifications

| Metric | Value | Notes |
|--------|-------|-------|
| Throughput | 1M+ req/sec | Auto-scaling |
| Latency | <100ms | Global CDN |
| Availability | 99.99% | Multi-region |
| Security | Enterprise-grade | SOC2, HIPAA, GDPR |

> "The feature set is comprehensive yet intuitive - exactly what enterprise teams need." - Technical Director`,
          },
        ],
      },
      {
        title: "2. Product Highlights",
        items: [
          {
            id: "platform-overview",
            title: "Platform Overview",
            content: `# Platform Overview Content`,
          },
          {
            id: "key-capabilities",
            title: "Key Capabilities",
            content: `# Key Capabilities Content`,
          },
          {
            id: "integration-overview",
            title: "Integration Overview",
            content: `# Integration Overview Content`,
          },
          {
            id: "security-framework",
            title: "Security Framework Overview",
            content: `# Security Framework Content`,
          },
        ],
      },
      {
        title: "3. Use Cases",
        items: [
          {
            id: "industry-applications",
            title: "Industry Applications Overview",
            content: `# Industry Applications Content`,
          },
          {
            id: "implementation-process",
            title: "General Implementation Process",
            content: `# Implementation Process Content`,
          },
          {
            id: "success-metrics",
            title: "Sample Success Metrics",
            content: `# Success Metrics Content`,
          },
          {
            id: "value-proposition",
            title: "Value Proposition Summary",
            content: `# Value Proposition Content`,
          },
        ],
      },
      {
        title: "4. Technical Overview",
        items: [
          {
            id: "high-level-architecture",
            title: "High-Level Architecture",
            content: `# Architecture Content`,
          },
          {
            id: "workflow-examples",
            title: "Basic Workflow Examples",
            content: `# Workflow Examples Content`,
          },
          {
            id: "integration-possibilities",
            title: "Integration Possibilities",
            content: `# Integration Possibilities Content`,
          },
          {
            id: "performance-overview",
            title: "Performance Overview",
            content: `# Performance Overview Content`,
          },
        ],
      },
      {
        title: "5. Product Preview",
        items: [
          {
            id: "ui-screenshots",
            title: "Selected UI Screenshots",
            content: `# UI Screenshots Content`,
          },
          {
            id: "feature-previews",
            title: "Key Feature Previews",
            content: `# Feature Previews Content`,
          },
          {
            id: "sample-dashboards",
            title: "Sample Dashboards",
            content: `# Sample Dashboards Content`,
          },
        ],
      },
    ],
  },
  protected: {
    sections: [
      {
        title: "Technical Documentation",
        items: [
          {
            id: "system-architecture",
            title: "System Architecture",
            content: `
# System Architecture

## Overview
Detailed system architecture and implementation details.

## Components
- Component A
- Component B
- Component C

## Integration Details
Comprehensive integration documentation and examples.
            `,
          },
          {
            id: "api-documentation",
            title: "API Documentation",
            content: `
# API Documentation

## Authentication
Detailed API authentication methods and security protocols.

## Endpoints
Complete list of API endpoints and their usage.

## Examples
Code examples in multiple languages.
            `,
          },
        ],
      },
    ],
  },
  nda: {
    sections: [
      {
        title: "1. Comprehensive Problem & Solution Analysis",
        items: [
          {
            id: "detailed-problem",
            title: "Detailed Problem Space Analysis",
            content: `# Detailed Problem Analysis Content`,
          },
          {
            id: "technical-solution",
            title: "Technical Solution Architecture",
            content: `# Technical Solution Content`,
          },
        ],
      },
      {
        title: "2. Detailed Product Architecture",
        items: [
          {
            id: "complete-architecture",
            title: "Complete Platform Architecture",
            content: `# Complete Architecture Content`,
          },
        ],
      },
    ],
  },
};
