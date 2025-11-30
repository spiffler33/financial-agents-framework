---
layout: page
title: "1.2 Characteristics of LLM Agents"
parent: "Part 1: The Current State"
nav_order: 2
---

## 1.2 Characteristics of LLM Agents That Inform Architecture

Section 1.1 established what LLM agents are: orchestration patterns where a language model proposes actions and external infrastructure executes them. This section examines the operational characteristics of these systems that inform how much infrastructure you need.

These are not warnings about why agents are dangerous. They are engineering constraints to design around—some structural to how language models work, others improving with each generation but still present. The architectural response required depends heavily on context: an advisory chatbot and an autonomous trading system face the same underlying characteristics but need very different mitigations.

> **Interactive Artifact:** [Characteristic Explorer](#) — *Coming soon*

### Hallucination: Confident Falsehood

**Mechanism.** Hallucination occurs when a model generates plausible but false content—inventing facts, misremembering details, or confidently asserting things that contradict its training data or provided context. The mechanism is rooted in how language models work: they predict the most likely next token based on patterns learned during training. When a query falls outside reliable training coverage, or when multiple plausible completions exist, the model doesn't abstain—it generates the most statistically likely continuation, which may be wrong.

Recent theoretical work has formalized this limitation. Xu et al. (2024) proved mathematically that hallucination is inevitable for any LLM used as a general problem solver—the model cannot learn all computable functions and will therefore produce inconsistencies with ground truth on some inputs. This is not a statement about current models being insufficiently trained; it is a result from learning theory about what these architectures can and cannot represent.

OpenAI's own research (2025) identifies a complementary cause: training and evaluation procedures systematically reward confident answers over expressions of uncertainty. Models see only positive examples of fluent language during pretraining, with no explicit "this is false" labels. Evaluation benchmarks reward correct answers and penalize "I don't know"—creating incentive structures that produce overconfident guessing.

**Trajectory.** Hallucination rates are measurably improving. Frontier models hallucinate less frequently than their predecessors on standard benchmarks. However, the theoretical result stands: the rate can decrease but cannot reach zero for general-purpose use. More importantly, hallucination rates vary dramatically by domain—a model may be highly reliable on common topics while confabulating freely on specialized or recent information.

**Scaling by Autonomy Level.**

- *Advisory context:* Hallucination means the user receives incorrect information. A competent user may catch obvious errors; subtle ones may go unnoticed but the user retains decision authority. The failure mode is bad advice.

- *Supervised execution:* Hallucination means a human approver sees a flawed recommendation. If the hallucinated content is plausible (a realistic-looking but incorrect position limit, a fabricated but believable counterparty rating), the human may approve it. The failure mode is an informed human making a decision on false premises.

- *Autonomous execution:* Hallucination means the system takes action based on false beliefs. A hallucinated constraint ("we have $10M in available limit" when the actual limit is $5M) leads directly to positions that violate actual limits. The failure mode is executed trades that cannot be unwound.

**Architectural Response.** External validation is mandatory for any action with consequences. The model's output cannot be trusted as ground truth—it must be verified against authoritative sources before execution. This is the core argument for a separate Validation Layer (Part 3): the agent proposes, but external systems confirm state and check constraints before anything executes.

---

### Context Degradation: The Lost Middle

**Mechanism.** Language models operate within a context window—the maximum tokens they can consider in a single inference. While context windows have expanded dramatically (from 4K to 200K+ tokens), research has documented systematic performance degradation as contexts grow.

Liu et al. (2024) demonstrated the "Lost in the Middle" phenomenon: when tested on tasks requiring retrieval from long contexts, models exhibit a distinctive U-shaped performance curve. Information at the beginning and end of the context is recalled reliably; information in the middle is frequently missed. In their experiments, GPT-3.5-Turbo's performance when critical information was placed mid-context was actually *worse* than its closed-book performance with no context at all.

The mechanism relates to attention patterns and positional encoding. Causal attention means early tokens are processed more frequently, creating primacy bias. Rotary Position Embedding (RoPE), used in many modern models, introduces distance-based decay that diminishes attention to information far from the current generation position. The result: instructions and constraints specified early in a long session receive progressively less attention as the context fills with tool results and intermediate reasoning.

**Trajectory.** This is structural to current transformer architectures. Extended context windows help but don't solve the fundamental attention pattern issue. Research into alternative architectures (state-space models, hybrid approaches) may eventually address this, but for current and near-term systems, the U-shaped curve persists.

**Scaling by Autonomy Level.**

- *Advisory context:* A chatbot that forgets early context may give inconsistent advice across a long conversation. Annoying but recoverable—the user can restate constraints or start fresh.

- *Supervised execution:* If the system forgets constraints while building a recommendation (say, an ESG restriction specified at turn 3 that's ignored by turn 15), the human reviewer would need to independently verify compliance—defeating the purpose of having the agent track constraints.

- *Autonomous execution:* Critical constraints specified at the session start may be effectively invisible by the time the agent reaches execution decisions. A trading mandate specifying "no single position exceeding 5% of portfolio" at token position 500 may not be reliably applied at token position 40,000 when the agent is deciding on its fifteenth trade.

**Architectural Response.** Critical constraints must be externalized, not embedded in prompts. A Policy Layer (Part 3) that evaluates every proposed action against declared constraints—independent of what the agent remembers—ensures that constraints are enforced regardless of context window position. System prompts and early instructions are insufficient for constraints that matter.

---

### Numerical Reasoning: Embedded Calculation Fragility

**Mechanism.** LLMs are language models, not calculators. They process numbers as tokens and "reason" about them through pattern matching on training data, not through symbolic computation. This creates several failure modes:

1. *Arithmetic errors:* Simple calculation mistakes, especially with larger numbers or more decimal places
2. *Unit confusion:* Mixing millions with billions, percentages with basis points, currencies
3. *Logical errors under numerical complexity:* Correct reasoning structure applied with wrong numbers

Recent work on the GSM-Ranges benchmark (2025) quantified this: when numerical values in word problems were systematically varied, logical error rates increased by up to 14 percentage points as numbers moved outside typical training ranges—even though the logical structure of the problems remained identical. The models weren't just making arithmetic errors; their reasoning degraded when facing unfamiliar numerical magnitudes.

A separate finding from Google Research: LLMs struggle to identify errors in their own reasoning chains but can often correct errors when given the specific location. They lack reliable self-monitoring for numerical work.

**Trajectory.** Improving but present. Newer models perform better on arithmetic benchmarks, and techniques like chain-of-thought prompting help. However, the fundamental architecture processes numbers as tokens, not quantities. Significant improvement likely requires architectural changes or hybrid systems with symbolic components.

**Scaling by Autonomy Level.**

- *Advisory context:* A calculation error in a retirement planning estimate may mislead the user, but they might catch gross errors ("you'll need $500 million to retire") and can verify important figures independently.

- *Supervised execution:* Numerical errors in a trade recommendation—wrong notional, incorrect hedge ratio, miscalculated Greeks—may not be obvious to a human reviewer who is pattern-matching against "does this look reasonable?" rather than recomputing.

- *Autonomous execution:* A basis point error in a spread calculation, a decimal place error in position sizing, or a currency confusion in a cross-border trade translates directly into P&L impact. These errors are silent until reconciliation.

**Architectural Response.** Calculations should happen in deterministic code, not in the LLM. The agent can reason about what calculation is needed, but the Execution Layer should perform computations using proper numerical libraries. When the agent outputs "buy 1,000 shares," the Validation Layer should independently verify this against position limits, available capital, and any other numerical constraints—using code, not asking the model to double-check itself.

---

### Adversarial Vulnerability: Prompt Injection and Beyond

**Mechanism.** LLM agents process natural language input, and that input can contain instructions. Prompt injection attacks exploit this by embedding malicious instructions in data the agent processes—emails, documents, web pages, or user inputs. The model cannot reliably distinguish "legitimate user instructions" from "adversarial instructions embedded in content."

The attack surface is substantial:

- *Direct injection:* User input that overrides system instructions ("ignore previous instructions and...")
- *Indirect injection:* Malicious content in documents the agent retrieves or processes
- *Multi-agent propagation:* One compromised agent infects others through inter-agent messages

Research on real-world applications (HouYi, 2024) found 31 of 36 tested LLM-integrated applications vulnerable to prompt injection, including widely-used products. The InjecAgent benchmark specifically tests attacks that induce agents to execute financial transactions or exfiltrate payment data—demonstrating that these are not theoretical concerns.

Perhaps most concerning for multi-agent systems: Prompt Infection (2024) demonstrated LLM-to-LLM prompt injection, where a compromised agent propagates malicious instructions to other agents it communicates with. In interconnected agent systems, a single point of compromise can cascade.

**Trajectory.** This is structural and adversarial—an arms race. Defense techniques exist (input sanitization, instruction hierarchy, prompt shields), but sophisticated attacks consistently achieve greater than 50% bypass rates against state-of-the-art defenses. As defenses improve, attacks adapt. Financial systems, as high-value targets, will face sophisticated attackers.

**Scaling by Autonomy Level.**

- *Advisory context:* An injected instruction might cause the chatbot to give biased advice or leak system prompt details. Problematic for trust, but limited direct harm.

- *Supervised execution:* An attack embedded in a document being analyzed might cause the agent to recommend a specific action that benefits an attacker. The human reviewer sees a seemingly reasonable recommendation with fabricated justification.

- *Autonomous execution:* Successful injection could directly induce unauthorized trades, data exfiltration, or system manipulation. The InjecAgent benchmark explicitly tests "initiate financial transaction to attacker-controlled account" as a direct harm scenario.

**Architectural Response.** Defense in depth. The Identity Layer must verify authorization for every action. The Policy Layer must constrain what actions are possible regardless of what instructions the agent believes it received. The Validation Layer must confirm proposed actions against current state and limits. No single layer can be the sole defense—attackers will find bypasses. The architecture must assume some inputs are hostile and limit blast radius accordingly.

---

### Compound Error Dynamics: The Cascade Problem

**Mechanism.** Many agent tasks involve sequences of dependent steps: reason about state, select an action, execute, observe result, reason again. Even very low per-step error rates compound over long sequences.

The mathematics is straightforward: if each step has probability *p* of success, the probability of completing *n* dependent steps without error is *p^n*. A 99% per-step success rate yields:
- 10 steps: 90% sequence success
- 50 steps: 61% sequence success
- 100 steps: 37% sequence success
- 500 steps: 0.7% sequence success

The MAKER research (2025) made this concrete: solving a task requiring over one million steps with zero errors required an entirely different architecture than standard agent approaches. Standard agents "inevitably become derailed after at most a few hundred steps."

Critically, errors don't remain local. The AgentErrorTaxonomy research found that "error propagation is the primary bottleneck in LLM agent reliability. Early mistakes rarely remain confined; instead, they cascade into subsequent steps, distorting reasoning, compounding misjudgments, and ultimately derailing the entire trajectory."

**Trajectory.** This is mathematical, not a temporary limitation. Better models reduce per-step error rates, but the exponential relationship remains. A 99.9% per-step success rate still yields only 90% sequence success over 100 steps.

**Scaling by Autonomy Level.**

- *Advisory context:* A multi-turn conversation that goes off track can be reset by the user. Annoying but recoverable.

- *Supervised execution:* If the agent's reasoning chain accumulates errors before presenting a recommendation, the final recommendation may be based on corrupted intermediate state. The human sees only the conclusion, not the error-laden path that produced it.

- *Autonomous execution:* A portfolio rebalancing operation across 30 positions isn't 30 independent actions—it's a sequence where each trade affects available capital, position limits, and constraints for subsequent trades. An error at step 5 corrupts the basis for all subsequent decisions.

**Architectural Response.** Long sequences need explicit checkpoints, state verification, and recovery mechanisms. The Observation Layer must capture not just final outcomes but intermediate state, enabling reconstruction and debugging. The Control Layer must support intervention—pause, rollback, human takeover—when something appears to be going wrong. The Validation Layer should verify state at multiple points, not just before final execution.

---

### Overconfidence: The Calibration Gap

**Mechanism.** When LLMs express confidence in their answers—whether through explicit statements ("I'm 95% confident...") or through hedging language—that expressed confidence is poorly calibrated with actual accuracy. Research consistently finds that models are overconfident: they express high confidence even when wrong.

Xiong et al. (2024) found that LLMs "tend to be overconfident, potentially imitating human patterns of expressing confidence." When asked to verbalize confidence, models cluster their responses in the 80-100% range even when their actual accuracy is much lower. Medical domain research confirmed: verbalized confidence "consistently over-estimates model confidence."

The Oxford semantic entropy work (2024) distinguishes between two types of uncertainty: uncertainty about *what to say* versus uncertainty about *how to say it*. Previous approaches couldn't distinguish these. A model might generate highly varied outputs (appearing uncertain) while being consistently wrong, or generate nearly identical outputs (appearing confident) while being correct. The relationship between output variation and accuracy is not straightforward.

**Trajectory.** Improving with capability—larger, more capable models show better calibration—but still far from ideal. Current techniques for eliciting calibrated confidence (sampling multiple responses, self-consistency checking) help but add latency and cost.

**Scaling by Autonomy Level.**

- *Advisory context:* An overconfident recommendation may inappropriately influence user decisions. Users naturally trust confident-sounding advice, creating risk when that confidence is unwarranted.

- *Supervised execution:* If an agent expresses high confidence in a recommendation ("this trade is clearly within risk limits"), a human reviewer may scrutinize it less carefully. Overconfidence transfers from agent to human.

- *Autonomous execution:* If confidence scores are used to gate automation (high confidence → auto-execute, low confidence → human review), miscalibration means risky actions bypass review while safe actions get flagged. The filter is worse than random.

**Architectural Response.** Don't rely on the agent's self-reported confidence. External calibration—comparing agent confidence to actual outcomes over time—can adjust thresholds. Better: design systems that don't depend on confidence calibration at all. The Validation Layer should check constraints regardless of whether the agent claims to be confident. The Control Layer should enable human review based on action characteristics (size, novelty, market conditions), not agent-expressed confidence.

---

### Tool Use Errors: Selection and Parameter Hallucination

**Mechanism.** Agents interact with external systems through tool calls—structured requests that specify which tool to invoke and with what parameters. Errors occur at multiple points:

1. *Tool selection errors:* Choosing the wrong tool for the task (using a quote API when intending to execute, selecting a delete function when meaning to archive)
2. *Parameter hallucination:* Generating parameters that don't exist or don't match the schema (inventing optional fields, using wrong data types)
3. *Result misinterpretation:* Misunderstanding what a tool returned (treating a partial fill as complete, missing an error nested in a success response)

Research on tool hallucination (2024) categorizes these as selection versus usage errors and notes they "significantly impair reliability by leading to hallucinated task outputs."

**Trajectory.** Improving with model capability and better tool documentation. Clear tool schemas, constrained output formats, and few-shot examples significantly reduce error rates. This is an area where engineering practices can meaningfully reduce risk.

**Scaling by Autonomy Level.**

- *Advisory context:* A tool use error might cause a failed lookup or incorrect information retrieval. The chatbot apologizes and tries again, or the user notices inconsistency.

- *Supervised execution:* If the agent calls the wrong tool or passes incorrect parameters, the resulting recommendation is based on wrong data. A human reviewer may not realize the underlying retrieval was flawed.

- *Autonomous execution:* Tool use errors translate directly into system actions. A buy/sell confusion, a wrong ticker symbol, an incorrect quantity—these become real positions. Tool execution failures (partial fills, timeouts) require explicit handling logic.

**Architectural Response.** The Validation Layer must check tool calls before execution—schema validation, parameter bounds checking, confirmation of tool selection appropriateness. The Execution Layer should handle partial failures gracefully and report execution state accurately. The Observation Layer must capture actual tool call/response pairs, not agent summaries of what happened.

---

### Summary: Designing for These Characteristics

These characteristics are not reasons to avoid building agent systems. They are constraints to design around, with architectural responses that scale with risk:

| Characteristic | Nature | Advisory Response | Autonomous Response |
|----------------|--------|-------------------|---------------------|
| Hallucination | Structural (improving) | User judgment | External validation mandatory |
| Context degradation | Structural | Fresh sessions | Externalize critical constraints |
| Numerical errors | Improving | User verification | Deterministic calculation layer |
| Adversarial vulnerability | Structural (arms race) | Basic input handling | Defense in depth, assume hostile |
| Compound errors | Mathematical | Allow user reset | Checkpoints, state verification |
| Overconfidence | Improving | Caveat language | Don't rely on self-reported confidence |
| Tool use errors | Improving | Retry logic | Schema validation, execution monitoring |

The eight-layer framework in Part 3 provides concrete architectural patterns for each of these responses. The layers are not equally critical for every system—Part 2 helps assess which you need.

---

**Previous:** [Section 1.1 — How LLM Agents Actually Work]({% link Sections/1-1-how-llm-agents-work.md %})

**Next:** [Section 1.3 — How Financial Infrastructure Actually Works]({% link Sections/1-3-financial-infrastructure.md %})
