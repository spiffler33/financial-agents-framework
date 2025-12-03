---
layout: default
title: "Part 2: Dimensions That Scale"
nav_order: 5
---

## Part 2: Dimensions That Scale Architectural Requirements

Part 1 established the territory: what LLM agents actually are, how they behave, and how financial infrastructure works. Now we can address the central question: how much architecture do you need?

The answer is not "as much as possible" or "whatever's fastest to build." Both mistakes are costly. Over-engineer an advisory chatbot with enterprise-grade controls and you'll spend eighteen months building infrastructure for a system where the user makes every decision. Under-engineer an autonomous execution system and you'll learn about your architectural gaps from your risk committee—or your regulator.

The architectural requirements for AI agents in financial systems scale along three dimensions: **autonomy level**, **action irreversibility**, and **regulatory surface area**. Understanding where your system sits on each dimension tells you what you need to build.

> **Interactive Artifact:** [Architectural Assessment Tool](#interactive-artifacts) — assess your system's architectural requirements

---

### Dimension 1: Autonomy Level

The first question is simple: who decides?

| Level | Description | Example | Architectural Implication |
|-------|-------------|---------|---------------------------|
| Advisory | Agent provides information; human decides and acts | Financial planning app recommending insurance coverage | Lightest architecture; focus on accuracy and helpfulness |
| Supervised Execution | Agent proposes actions; human approves; system executes | Limits allocation recommendations reviewed by risk managers | Medium architecture; explanation layer, approval gates |
| Autonomous Execution | Agent decides and executes without per-action human approval | Algorithmic portfolio rebalancing agent | Full architecture; all layers critical |

**Advisory** systems inform but never act. A financial planning app that analyzes a user's situation and recommends insurance products is advisory—the user decides whether to purchase, and the purchase happens through separate channels. The agent's mistakes result in bad advice that users can evaluate, question, or ignore.

**Supervised execution** adds a crucial element: the agent's output becomes an action if a human approves it. Consider limits allocation—how institutions distribute risk capacity across trading desks, strategies, and counterparties. A bank with $500M of credit exposure appetite toward a particular counterparty must decide how to slice that limit across business lines. An agent proposing limits allocation isn't executing trades directly; it's recommending the constraints within which trading happens. A risk manager reviews the proposal, potentially modifies it, and approves before it takes effect. The agent proposes; the human disposes; then the system implements.

**Autonomous execution** removes the per-action human gate. An algorithmic rebalancing agent monitoring a portfolio might detect drift from target allocations and execute trades to correct it—without waiting for approval on each trade. Humans set the parameters and boundaries; the agent operates within them. Mistakes become executed positions.

The autonomy spectrum isn't about capability—it's about accountability. As autonomy increases, the window for human judgment shrinks. Advisory systems give humans full decision authority. Supervised systems give humans veto power. Autonomous systems give humans only the ability to set boundaries in advance and intervene after the fact.

---

### Dimension 2: Action Irreversibility

The second question: what happens when something goes wrong?

| Level | Description | Example | Architectural Implication |
|-------|-------------|---------|---------------------------|
| Reversible | Actions can be undone trivially | Drafting a report; generating analysis | Light validation; recovery is easy |
| Costly to Reverse | Actions can be undone but with friction or cost | Executed trade (can offset but not cancel); submitted application | Pre-action validation critical; monitoring required |
| Irreversible | Actions cannot be undone | Settlement finality; regulatory filing after deadline | Strongest gates; human approval for edge cases |

**Reversible** actions have trivial undo costs. A financial planning app generating a coverage recommendation produces output that exists only until the user closes the session. Wrong output means wasted time, not lasting damage.

**Costly to reverse** is where most financial actions live. An executed trade can't be un-executed, but you can enter an offsetting trade. You'll pay transaction costs, maybe absorb market movement, and your trading record will show both legs—but you can get back to neutral. A submitted loan application can be withdrawn, but the inquiry might affect credit scoring. The action happened; you're managing consequences, not erasing history.

**Irreversible** actions admit no correction. Once a trade settles—ownership transferred, securities delivered, cash paid—that transaction is final. You own what you bought; you no longer own what you sold. Regulatory filings submitted after deadlines can't be unfiled. Margin calls that trigger liquidation produce positions that existed, however briefly.

Irreversibility compounds with time. A trade is costly to reverse between execution and settlement; after settlement, it's simply history. This creates architectural implications: systems handling actions that cross irreversibility thresholds need stronger pre-action gates than systems that can always roll back.

---

### Dimension 3: Regulatory Surface Area

The third question: what must you prove, and to whom?

| Level | Description | Example | Architectural Implication |
|-------|-------------|---------|---------------------------|
| Light | General consumer protection; no finance-specific AI regulation | Internal analytics tool; general-purpose assistant | Basic logging; standard software practices |
| Medium | Industry-specific requirements (suitability, disclosure, record-keeping) | Robo-advisor; customer-facing financial planning | Explanation layer; audit trails; suitability documentation |
| Heavy | Full regulatory stack (MiFID II, Dodd-Frank, SOX, prudential supervision) | Institutional trading system; bank capital allocation | Complete observation and explanation layers; demonstrable controls; regulatory examination readiness |

**Light** regulatory surface doesn't mean unregulated—consumer protection laws apply to almost everything. But an internal tool that helps analysts summarize research doesn't trigger the apparatus of financial services regulation. You need good software practices, not regulatory examination readiness.

**Medium** regulatory surface covers most consumer-facing financial products. A robo-advisor recommending portfolio allocations must document suitability—why this recommendation for this customer given their circumstances. Record-keeping requirements specify what must be preserved and for how long. Disclosure requirements govern what users must be told. The agent needs to explain its reasoning in terms that satisfy these requirements.

**Heavy** regulatory surface applies to systems operating at institutional scale or in heavily supervised domains. Institutional trading systems face best execution requirements (can you demonstrate you got reasonable prices?), trade reporting obligations, surveillance for market manipulation, and potential examination by multiple regulators across jurisdictions. The observation and explanation layers aren't nice-to-haves—they're the evidence that keeps you licensed.

Regulatory surface area is partially a function of who your users are (retail vs. institutional), what actions you take (advice vs. execution), and which jurisdictions you operate in. The same underlying functionality can face light or heavy regulation depending on context.

---

### These Dimensions Correlate—But Can Diverge

In practice, these three dimensions often move together. Autonomous execution in financial markets almost always involves irreversible actions (executed trades) and heavy regulation (institutional oversight). Advisory consumer apps typically have reversible outputs (recommendations the user can ignore) and lighter regulatory requirements.

But the dimensions can diverge, and recognizing divergence prevents both over-engineering and under-engineering.

Consider a **chatbot serving institutional clients**—answering questions about market structure, explaining product mechanics, summarizing research. It's advisory (no execution), outputs are reversible (just information), but the regulatory surface may be heavy. Suitability requirements, record-keeping obligations, and supervisory expectations apply because of *who the users are*, not because of what the agent does. You need robust observation and explanation layers for a system that never executes anything.

Or consider an **internal portfolio analytics tool** that autonomously runs calculations, updates dashboards, and flags positions that breach thresholds. It's autonomous (no human approval per calculation), but outputs are reversible (flagging an issue doesn't execute a trade), and regulatory surface is light (internal tooling, not client-facing). You don't need the full apparatus of an autonomous trading system.

The framework helps you see these distinctions rather than defaulting to "finance is heavily regulated, therefore maximum architecture."

---

### Assessing Your System

Work through each dimension for your specific use case:

**Autonomy:**
- Does the agent only inform, with humans taking all actions elsewhere? → **Advisory**
- Does the agent propose actions that humans review before execution? → **Supervised**
- Does the agent execute within pre-set boundaries without per-action approval? → **Autonomous**

**Irreversibility:**
- Can you discard the output with no consequences? → **Reversible**
- Can you undo the action, but with cost or friction? → **Costly**
- Is the action final once taken? → **Irreversible**

**Regulatory Surface:**
- General consumer protection, standard software expectations? → **Light**
- Industry-specific requirements, suitability, disclosure, record-keeping? → **Medium**
- Full regulatory examination, multiple supervisors, demonstrable controls? → **Heavy**

The combination determines your architectural profile:

**Light architecture** (basic tool-calling patterns) is appropriate when you're advisory with reversible outputs and light regulatory requirements. The standard agent loop with sensible error handling and logging suffices. You can iterate quickly and add structure as you scale.

**Medium architecture** (key layers required) applies when any dimension reaches the middle tier—supervised execution, costly reversibility, or medium regulatory surface. You need explicit approval workflows, validation before action, and audit trails. Not every layer must be robust, but you can't skip them.

**Heavy architecture** (full framework) is necessary when *any* dimension reaches the highest tier—autonomous execution, irreversible actions, or heavy regulatory surface. A single high-scoring dimension can mandate the full architectural stack. An autonomous system with reversible outputs still needs comprehensive controls because you've removed the human gate. A supervised system with irreversible actions needs heavy validation because errors can't be corrected. The highest dimension sets your floor.

---

### Refining the Assessment: Seven Constraint Areas

The three dimensions provide your architectural profile. Seven additional constraint areas help you refine it—identifying where you might need extra attention even within your profile, or where you can simplify.

**Numerical Precision:** How sensitive is your domain to calculation errors? Basis point errors in spread calculations matter more than rounding in portfolio percentages. High sensitivity means calculations must happen in deterministic code, not in the LLM.

**Adversarial Environment:** Who might attack your system, and what would they gain? Consumer-facing systems face casual manipulation attempts. Systems controlling significant capital face sophisticated, well-resourced attackers. Higher adversarial exposure demands defense in depth.

**Systemic Coupling:** Do your agent's actions affect other systems or counterparties? An agent that only affects its own portfolio has containable blast radius. An agent whose actions trigger margin calls, affect counterparty limits, or move markets needs architectural awareness of these connections.

**Time Constraints:** Are there hard deadlines with real consequences? End-of-day settlement cutoffs, options expiry, margin call deadlines—these create forcing functions where "pause and get human review" may not be viable. Time pressure often pushes toward heavier automation, which requires heavier controls.

**Authorization Stakes:** Who bears liability for the agent's actions? If the answer is "the user who received advice," that's different from "the institution that deployed the agent." Higher authorization stakes demand clearer audit trails and explanation capabilities.

These constraint areas don't change your profile level, but they identify where within that profile you need to invest. A medium-architecture system with high adversarial exposure might implement the security aspects of a heavy system while keeping other layers lighter.

---

### What Your Profile Means: The Eight Layers

Part 3 details the eight architectural layers for agent systems in financial contexts. Before diving into each, here's what they are and when they matter:

| Layer | Core Question | One-Line Description |
|-------|---------------|---------------------|
| Intent | What is the agent trying to accomplish? | Captures and preserves the goal driving agent behavior |
| Identity | Who is this agent and who authorized it? | Establishes credentials, authorization chains, accountability |
| Policy | What is this agent permitted to do? | Defines boundaries and constraints independent of the agent |
| Validation | Is this specific action valid given current state? | Real-time verification against live constraints before execution |
| Execution | How does the action get performed? | Interfaces with external systems to take action |
| Observation | What actually happened? | Independent recording of events, not relying on agent self-report |
| Explanation | Why did it happen? | Reconstructable reasoning chains for audit and investigation |
| Control | How do we intervene? | Kill switches, circuit breakers, human override capabilities |

The layers apply with different intensity based on your profile:

| Layer | Advisory | Supervised | Autonomous |
|-------|----------|------------|------------|
| Intent | Required | Required | Required |
| Identity | Light | Required | Required |
| Policy | Light | Required | Required |
| Validation | Light | Required | Critical |
| Execution | N/A | Required | Critical |
| Observation | Light | Required | Critical |
| Explanation | Optional | Required | Critical |
| Control | Light | Required | Critical |

**Advisory systems** need intent capture and basic logging but can implement most layers lightly. There's no execution to validate, no actions to explain to regulators, limited need for kill switches on a system that only informs.

**Supervised systems** need every layer, but standard implementations suffice. The human approval gate provides a checkpoint that reduces (but doesn't eliminate) the need for autonomous controls.

**Autonomous systems** need robust implementations across the board. Every layer becomes critical because there's no human in the loop to catch what the architecture misses.

Part 3 examines each layer in detail—what it does, how to implement it at each intensity level, how it fails, and how it maps to existing financial infrastructure concepts.

---

[← Section 1.3]({{ site.baseurl }}/Sections/1-3-financial-infrastructure/) · [Home]({{ site.baseurl }}/)

**Next:** Part 3 — The Eight Layers *(Coming soon)*
