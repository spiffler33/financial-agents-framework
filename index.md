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

| Section | Title | Status |
|:--------|:------|:-------|
| [2]({{ site.baseurl }}/Sections/2-dimensions-that-scale/) | Dimensions That Scale Architectural Requirements | Complete |

### Part 3: The Eight Layers — A Scalable Framework
*Coming soon*

### Part 4-7: Interface Boundaries, Mapping, Testing, Conclusions
*Coming soon*

---

## Interactive Artifacts

Explore the concepts visually:

<iframe
  src="https://stackblitz.com/github/spiffler33/financial-agents-framework/tree/master/artifacts?embed=1&view=preview&hideNavigation=1"
  style="width:100%; height:600px; border:1px solid #333; border-radius:8px;"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

<p style="text-align:center; margin-top:8px;">
  <a href="https://stackblitz.com/github/spiffler33/financial-agents-framework/tree/master/artifacts" target="_blank">Open full screen in StackBlitz ↗</a>
</p>

---

*Written by Spiff. Personal research project, not professional advice.*
