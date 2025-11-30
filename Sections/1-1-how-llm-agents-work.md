---
layout: page
title: "1.1 How LLM Agents Actually Work"
parent: "Part 1: The Current State"
nav_order: 1
---

# Part 1: The Current State — Agents and Financial Infrastructure

## 1.1 How LLM Agents Actually Work

Before examining how autonomous agents might operate within financial systems, we must establish precisely what an "agent" means in the context of large language models. The term carries baggage from robotics and robotic process automation—connotations that obscure more than they illuminate. LLM-based agents are fundamentally different: they are orchestration patterns built around language models, not autonomous executors.

### The Core Abstraction: Observe-Think-Act

An LLM agent is a software system that uses a language model as its reasoning engine within a loop structure. The canonical pattern, formalized by Yao et al. (2022) as ReAct (Reasoning and Acting), interleaves reasoning traces with action selection:

```
[User Query]
  ↓
Thought: I need to find X. Let me use tool Y.
Action: tool_name(parameters)
  ↓
[Tool Execution — external to LLM]
  ↓
Observation: Tool returned Z.
  ↓
Thought: Based on Z, I should now...
  ↓
[Repeat until complete]
```

This loop continues until the agent determines it has sufficient information to respond, or until some termination condition is met. Each iteration adds tokens to the context: the thought, the action, the observation. The context grows monotonically within a session.

The critical insight is that **the language model never executes anything**. When Claude or GPT-4 "calls a tool," it generates structured text—typically JSON—specifying which tool to invoke and with what parameters. The actual execution happens in your orchestration code, external to the model. This is not an implementation detail; it is the fundamental architectural constraint that makes controlled deployment possible.

> **Interactive Artifact:** [Agent Loop Visualizer](#) — *Coming soon*

### Tool Use at the API Level

Modern LLM APIs implement tool use through a multi-turn conversation pattern. The mechanics are straightforward but often misunderstood:

**1. Tool Definition**: Tools are defined as JSON schemas provided in the API request. The model learns available tools from these definitions, not from training.

```json
{
  "name": "execute_trade",
  "description": "Submit a trade order to the execution system",
  "input_schema": {
    "type": "object",
    "properties": {
      "ticker": {"type": "string"},
      "side": {"type": "string", "enum": ["buy", "sell"]},
      "quantity": {"type": "integer"},
      "order_type": {"type": "string", "enum": ["market", "limit"]}
    },
    "required": ["ticker", "side", "quantity", "order_type"]
  }
}
```

**2. Model Response**: When the model determines a tool is needed, it responds with a structured tool-use block and sets `stop_reason` to `tool_use`. This is the interception point.

**3. External Execution**: Your code receives this request, validates it, executes against real systems, and captures the result. The model is suspended, waiting.

**4. Result Injection**: You send the tool result back as a new message. The model incorporates this observation and continues reasoning.

This architecture means every tool invocation passes through your code. Every single one. This is where validation layers, approval workflows, rate limits, and audit logging must live. The model proposes; your infrastructure disposes.

### Context Windows: A Finite and Degrading Resource

Language models operate within a context window—the maximum number of tokens they can consider in a single inference. Current frontier models offer windows ranging from 128K to 1M+ tokens. This appears generous until you trace what accumulates during agent execution:

- System prompt and tool definitions: 500-2,000 tokens
- Each user message: 50-500 tokens
- Each reasoning trace: 100-300 tokens
- Each tool call: 30-100 tokens
- Each tool result: 100-10,000+ tokens (API responses can be large)

A moderately complex agent task involving 15 iterations can easily consume 30,000-50,000 tokens. More critically, research has demonstrated that model performance degrades as context length increases—a phenomenon termed "context rot."

Liu et al. (2024) documented the "Lost in the Middle" effect: when testing models on information retrieval from long contexts, accuracy follows a U-shaped curve. Information at the beginning and end of context is recalled reliably; information in the middle is frequently missed. For agents, this has concrete implications: instructions and constraints specified early in a session may receive diminished attention as the context fills with tool results and intermediate reasoning.

**Financial Systems Implication**: Consider a portfolio rebalancing agent given initial constraints—maximum daily notional, ESG restrictions, compliance reporting thresholds. After 15 iterations of fetching holdings, analyzing candidates, and executing trades, those constraints sit at token position 0-500 in a 40,000 token context. The agent's attention is dominated by recent tool results. Constraints specified 39,000 tokens ago may not be reliably applied to the current decision.

This is not a hypothetical failure mode. It is a predictable consequence of transformer attention mechanics. Any agent architecture for financial systems must externalize critical constraints rather than relying on context persistence.

### Planning Patterns: Tradeoffs in Agent Architecture

Beyond the basic ReAct loop, several architectural patterns have emerged for agent planning. Each presents different tradeoffs relevant to financial deployment:

**ReAct (Reasoning + Acting)**: The foundational pattern. Interleaves single reasoning steps with single actions. Simple to implement, highly adaptive to new information, produces clear reasoning traces. However, it requires an LLM call for every action and provides no lookahead planning—each step is reactive to the last observation.

**Plan-and-Execute**: Separates planning from execution. The model first generates a complete multi-step plan, which is then executed step-by-step. The full plan is visible and validatable before any action occurs. Less adaptive if circumstances change mid-execution, but superior for audit and pre-validation requirements.

**ReWOO (Reasoning Without Observation)**: Plans with variable references, allowing later steps to depend on outputs of earlier steps without re-invoking the LLM. More token-efficient; supports parallelization. Requires careful variable binding logic and is harder to debug.

**Tree of Thoughts**: Explores multiple reasoning paths simultaneously, using search algorithms (BFS, DFS, or MCTS) to evaluate alternatives. Powerful for complex reasoning tasks but computationally expensive and harder to explain—why was this path chosen over that one?

For financial systems, the choice of planning pattern has direct architectural consequences:

| Pattern | Auditability | Pre-Validation | Adaptability | LLM Calls |
|---------|--------------|----------------|--------------|-----------|
| ReAct | Medium | Low | High | High |
| Plan-and-Execute | High | High | Low | Medium |
| ReWOO | High | High | Medium | Low |
| Tree of Thoughts | Low | Medium | High | Very High |

Plan-and-Execute and ReWOO patterns offer better characteristics for regulated environments: the plan exists as an artifact that can be validated, logged, and approved before execution begins. ReAct's pure reactivity, while flexible, makes pre-validation difficult—you don't know what the agent will do until it's about to do it.

### The Model Context Protocol: Emerging Infrastructure

Anthropic's Model Context Protocol (MCP), released November 2024, represents an emerging standard for agent-tool integration. MCP defines a JSON-RPC protocol for communication between AI applications and external data sources, with three server-side primitives—Prompts, Resources, and Tools—standardizing how context flows into models.

The significance for financial systems is twofold. First, MCP provides a standardized integration layer, reducing the custom code required to connect agents to enterprise systems. Second, and more importantly, it establishes clear architectural boundaries: MCP servers expose capabilities, MCP clients (your application) mediate access, and the model operates within defined constraints.

However, MCP introduces its own challenges. As the number of connected tools grows, tool definitions consume increasing context space. Anthropic's own research documents scenarios where tool catalogs and intermediate results consumed 150,000 tokens for a single workflow. Their proposed solution—having agents write code that calls MCP tools rather than calling tools directly—reduces token consumption but increases implementation complexity.

### Summary: What We Actually Have

To summarize the technical reality of LLM agents:

1. **Agents are orchestration patterns**, not autonomous executors. The LLM generates text; your code takes action.

2. **Tool use is always mediated**. Every tool call is an interception point under your control—for validation, logging, approval, or rejection.

3. **Context is finite and degrading**. Long-running agents lose reliable access to early instructions. Critical constraints must be externalized.

4. **Planning patterns trade off adaptability against auditability**. Financial systems should favor patterns that produce validatable plans before execution.

5. **The model proposes; infrastructure disposes**. This is not a limitation to overcome but an architectural feature to leverage.

These characteristics are not temporary limitations awaiting better models. They are structural features of how language models operate. Any framework for deploying agents in financial systems must work with these realities, not against them.

---

**Next:** [Section 1.2 — Characteristics of LLM Agents That Inform Architecture]({% link Sections/1-2-characteristics.md %})
