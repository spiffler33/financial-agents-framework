---
layout: default
title: Home
nav_order: 1
---

# Architectural Constraints for Autonomous Agents in Financial Systems

**A Design Constraints Framework for Financial AI Systems**

---

## What This Is

A practitioner's framework for thinking about how AI agents should be architected when they interact with financial systems. The framework helps **right-size architecture** based on three scaling dimensions:

- **Autonomy level** — Is the agent advising humans or executing actions?
- **Action irreversibility** — Can mistakes be undone, or are they permanent?
- **Regulatory surface area** — What audit, explainability, and compliance requirements apply?

---

## Reading Order

### Part 1: The Current State — Agents and Financial Infrastructure

| Section | Title | Status |
|:--------|:------|:-------|
| [1.1]({{ site.baseurl }}/Sections/1-1-how-llm-agents-work/) | How LLM Agents Actually Work | Complete |
| [1.2]({{ site.baseurl }}/Sections/1-2-characteristics/) | Characteristics of LLM Agents That Inform Architecture | Complete |
| [1.3]({{ site.baseurl }}/Sections/1-3-financial-infrastructure/) | How Financial Infrastructure Actually Works | Complete |

### Part 2: Dimensions That Scale Architectural Requirements
*Coming soon*

### Part 3: The Eight Layers — A Scalable Framework
*Coming soon*

### Part 4-7: Interface Boundaries, Mapping, Testing, Conclusions
*Coming soon*

---

## Interactive Artifacts

| Artifact | Section | Link |
|:---------|:--------|:-----|
| Agent Loop Visualizer | 1.1 | [Open in StackBlitz](https://stackblitz.com/github/spiffler33/financial-agents-framework?file=Sections/1.1/AgentLoopVisuslier_S1_1.jsx) |
| Characteristic Explorer | 1.2 | [Open in StackBlitz](https://stackblitz.com/github/spiffler33/financial-agents-framework?file=Sections/1.2/CharacteristicExplorer_S1_2.jsx) |
| Trade Lifecycle Visualizer | 1.3 | [Open in StackBlitz](https://stackblitz.com/github/spiffler33/financial-agents-framework?file=Sections/1.3/TradeLifecycleVisualizer_S1_3.jsx) |

---

*Written by Spiff. Personal research project, not professional advice.*
