import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, ChevronDown, Brain, Wrench, Eye, MessageSquare, AlertTriangle, Zap, GitBranch, List } from 'lucide-react';

// Main App Component
export default function AgentLoopVisualizer() {
  const [activeTab, setActiveTab] = useState('loop');

  const tabs = [
    { id: 'loop', label: 'Agent Loop', icon: RotateCcw },
    { id: 'tooluse', label: 'Tool Use Mechanics', icon: Wrench },
    { id: 'context', label: 'Context Window', icon: MessageSquare },
    { id: 'planning', label: 'Planning Patterns', icon: GitBranch },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-cyan-400 mb-2">LLM Agent Architecture Visualizer</h1>
          <p className="text-slate-400 text-sm">Interactive exploration of how LLM-based agents actually work</p>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-800 rounded-xl p-6 min-h-[600px]">
          {activeTab === 'loop' && <AgentLoopDemo />}
          {activeTab === 'tooluse' && <ToolUseMechanics />}
          {activeTab === 'context' && <ContextWindowDemo />}
          {activeTab === 'planning' && <PlanningPatterns />}
        </div>
      </div>
    </div>
  );
}

// ============================================
// AGENT LOOP DEMO
// ============================================
function AgentLoopDemo() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [iteration, setIteration] = useState(1);

  const steps = [
    {
      phase: 'INPUT',
      title: 'User Query Received',
      description: 'The agent receives a natural language task from the user.',
      llmState: 'idle',
      example: '"What is the current stock price of AAPL and should I buy based on recent news?"',
      detail: 'The query enters the system. The orchestration layer will pass this to the LLM along with the system prompt and available tools.',
    },
    {
      phase: 'THINK',
      title: 'Reasoning (Thought Generation)',
      description: 'The LLM generates a reasoning trace about how to approach the problem.',
      llmState: 'thinking',
      example: 'Thought: I need to get two pieces of information: 1) the current AAPL stock price, and 2) recent news about Apple. Let me start by getting the stock price.',
      detail: 'This is Chain-of-Thought reasoning. The model explicitly reasons about the problem before acting. This reduces hallucination and improves task decomposition.',
    },
    {
      phase: 'ACT',
      title: 'Action Selection',
      description: 'The LLM selects a tool and generates structured parameters.',
      llmState: 'acting',
      example: 'Action: get_stock_price\nAction Input: {"ticker": "AAPL"}',
      detail: 'The LLM outputs a structured tool call. It does NOT execute anything—it just generates text specifying what tool to call and with what parameters.',
    },
    {
      phase: 'EXECUTE',
      title: 'Tool Execution (External)',
      description: 'The orchestration layer executes the tool call.',
      llmState: 'waiting',
      example: '→ Calling get_stock_price API...\n→ Response: {"price": 178.52, "change": "+1.2%"}',
      detail: 'CRITICAL: The LLM does not execute this. Your application code intercepts the tool call, validates it, executes it against real systems, and captures the result.',
    },
    {
      phase: 'OBSERVE',
      title: 'Observation Integration',
      description: 'The tool result is fed back into the LLM context.',
      llmState: 'observing',
      example: 'Observation: AAPL current price is $178.52, up 1.2% today.',
      detail: 'The observation is appended to the conversation. The LLM now has new information to reason about. Context window grows with each iteration.',
    },
    {
      phase: 'THINK',
      title: 'Re-evaluate & Continue',
      description: 'The LLM decides whether to continue or provide final answer.',
      llmState: 'thinking',
      example: 'Thought: Good, I have the price. Now I need recent news to assess whether to buy. Let me search for Apple news.',
      detail: 'The loop continues. Each iteration adds to context. The agent may take many iterations before reaching a final answer.',
    },
  ];

  useEffect(() => {
    let interval;
    if (isPlaying && step < steps.length - 1) {
      interval = setInterval(() => {
        setStep(s => s + 1);
      }, 2500);
    } else if (step >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, step]);

  const resetDemo = () => {
    setStep(0);
    setIteration(1);
    setIsPlaying(false);
  };

  const currentStep = steps[step];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-cyan-400">The ReAct Agent Loop</h2>
          <p className="text-slate-400 text-sm">Reasoning and Acting interleaved</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => setStep(s => Math.min(s + 1, steps.length - 1))}
            disabled={step >= steps.length - 1}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
          >
            Step
          </button>
          <button
            onClick={resetDemo}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Loop Visualization */}
      <div className="grid grid-cols-5 gap-2">
        {['INPUT', 'THINK', 'ACT', 'EXECUTE', 'OBSERVE'].map((phase, idx) => (
          <div
            key={phase}
            className={`p-3 rounded-lg text-center transition-all ${
              currentStep.phase === phase
                ? 'bg-cyan-600 text-white scale-105 shadow-lg shadow-cyan-600/30'
                : step > idx || (step === steps.length - 1 && idx < 5)
                ? 'bg-slate-600 text-slate-300'
                : 'bg-slate-700 text-slate-500'
            }`}
          >
            <div className="text-xs font-mono">{phase}</div>
          </div>
        ))}
      </div>

      {/* Current Step Detail */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs font-mono ${
                currentStep.phase === 'THINK' ? 'bg-purple-600' :
                currentStep.phase === 'ACT' ? 'bg-amber-600' :
                currentStep.phase === 'EXECUTE' ? 'bg-red-600' :
                currentStep.phase === 'OBSERVE' ? 'bg-green-600' :
                'bg-blue-600'
              }`}>
                {currentStep.phase}
              </span>
              <h3 className="font-semibold">{currentStep.title}</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">{currentStep.description}</p>

            <div className="bg-slate-950 rounded p-3 font-mono text-sm">
              <pre className="whitespace-pre-wrap text-cyan-300">{currentStep.example}</pre>
            </div>
          </div>

          <div className="bg-amber-900/30 border border-amber-600/50 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-amber-400 text-sm">Key Insight</div>
                <p className="text-sm text-slate-300">{currentStep.detail}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture Diagram */}
        <div className="bg-slate-900 rounded-lg p-4">
          <h3 className="font-semibold mb-4 text-slate-300">System Architecture</h3>
          <div className="space-y-3">
            {/* User */}
            <div className={`p-3 rounded-lg border-2 transition-all ${
              currentStep.phase === 'INPUT' ? 'border-cyan-400 bg-cyan-900/30' : 'border-slate-600 bg-slate-800'
            }`}>
              <div className="text-xs text-slate-400">USER</div>
              <div className="font-mono text-sm">Natural Language Query</div>
            </div>

            <div className="flex justify-center">
              <ChevronDown className={currentStep.phase === 'INPUT' ? 'text-cyan-400' : 'text-slate-600'} />
            </div>

            {/* Orchestration Layer */}
            <div className={`p-3 rounded-lg border-2 transition-all ${
              currentStep.phase === 'EXECUTE' ? 'border-red-400 bg-red-900/30' : 'border-slate-600 bg-slate-800'
            }`}>
              <div className="text-xs text-slate-400">ORCHESTRATION LAYER (Your Code)</div>
              <div className="font-mono text-sm">Route, Validate, Execute Tools</div>
            </div>

            <div className="flex justify-center">
              <ChevronDown className={['THINK', 'ACT', 'OBSERVE'].includes(currentStep.phase) ? 'text-cyan-400' : 'text-slate-600'} />
            </div>

            {/* LLM */}
            <div className={`p-3 rounded-lg border-2 transition-all ${
              ['THINK', 'ACT', 'OBSERVE'].includes(currentStep.phase)
                ? 'border-purple-400 bg-purple-900/30'
                : 'border-slate-600 bg-slate-800'
            }`}>
              <div className="text-xs text-slate-400">LLM (e.g., Claude)</div>
              <div className="font-mono text-sm flex items-center gap-2">
                <Brain size={14} />
                {currentStep.llmState === 'thinking' && 'Generating reasoning...'}
                {currentStep.llmState === 'acting' && 'Selecting tool call...'}
                {currentStep.llmState === 'waiting' && 'Waiting for result...'}
                {currentStep.llmState === 'observing' && 'Processing observation...'}
                {currentStep.llmState === 'idle' && 'Ready'}
              </div>
            </div>

            <div className="flex justify-center">
              <ChevronDown className={currentStep.phase === 'EXECUTE' ? 'text-cyan-400' : 'text-slate-600'} />
            </div>

            {/* External Tools */}
            <div className={`p-3 rounded-lg border-2 transition-all ${
              currentStep.phase === 'EXECUTE' ? 'border-green-400 bg-green-900/30' : 'border-slate-600 bg-slate-800'
            }`}>
              <div className="text-xs text-slate-400">EXTERNAL TOOLS</div>
              <div className="font-mono text-sm flex items-center gap-2">
                <Wrench size={14} />
                APIs, Databases, Services
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span>Step {step + 1} of {steps.length}</span>
        <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 transition-all"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// TOOL USE MECHANICS
// ============================================
function ToolUseMechanics() {
  const [stage, setStage] = useState(0);

  const stages = [
    {
      title: '1. Tool Definition (System Prompt)',
      description: 'Tools are defined as JSON schemas in the API request. The LLM sees these definitions and understands what tools are available.',
      code: `{
  "name": "get_stock_price",
  "description": "Get current stock price for a ticker",
  "input_schema": {
    "type": "object",
    "properties": {
      "ticker": {
        "type": "string",
        "description": "Stock ticker symbol (e.g., AAPL)"
      }
    },
    "required": ["ticker"]
  }
}`,
      highlight: 'The LLM learns available tools from their schemas—not from training.'
    },
    {
      title: '2. User Message',
      description: 'The user sends a message that might require tool use.',
      code: `{
  "role": "user",
  "content": "What is Apple's current stock price?"
}`,
      highlight: 'The LLM must decide if any defined tool is relevant to this query.'
    },
    {
      title: '3. LLM Response with Tool Call',
      description: 'The LLM responds with a structured tool_use block instead of text.',
      code: `{
  "role": "assistant",
  "content": [
    {
      "type": "tool_use",
      "id": "toolu_01ABC123",
      "name": "get_stock_price",
      "input": {
        "ticker": "AAPL"
      }
    }
  ],
  "stop_reason": "tool_use"
}`,
      highlight: 'CRITICAL: stop_reason is "tool_use" — the LLM is requesting action, not providing an answer.'
    },
    {
      title: '4. Your Code Executes the Tool',
      description: 'Your orchestration layer intercepts this, validates, and executes.',
      code: `// Your application code (NOT the LLM)
const toolCall = response.content[0];

// Validation layer (you implement this)
if (!isValidTicker(toolCall.input.ticker)) {
  throw new ValidationError("Invalid ticker");
}

// Execution layer (you implement this)
const result = await stockAPI.getPrice(toolCall.input.ticker);
// result = { price: 178.52, change: "+1.2%" }`,
      highlight: 'The LLM has zero execution capability. All tool execution is YOUR code.'
    },
    {
      title: '5. Return Tool Result to LLM',
      description: 'You send the result back as a tool_result message.',
      code: `{
  "role": "user",
  "content": [
    {
      "type": "tool_result",
      "tool_use_id": "toolu_01ABC123",
      "content": "AAPL current price: $178.52 (+1.2%)"
    }
  ]
}`,
      highlight: 'The tool result becomes part of the conversation context for the LLM.'
    },
    {
      title: '6. LLM Generates Final Response',
      description: 'With the tool result in context, the LLM can now answer.',
      code: `{
  "role": "assistant",
  "content": "Apple (AAPL) is currently trading at
$178.52, up 1.2% today.",
  "stop_reason": "end_turn"
}`,
      highlight: 'Only now does the LLM provide a natural language answer to the user.'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-cyan-400">Tool Use at the API Level</h2>
        <p className="text-slate-400 text-sm">Understanding the exact message flow between your code and the LLM</p>
      </div>

      {/* Stage Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {stages.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setStage(idx)}
            className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
              stage === idx
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            Stage {idx + 1}
          </button>
        ))}
      </div>

      {/* Current Stage */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">{stages[stage].title}</h3>
            <p className="text-slate-400 text-sm mb-4">{stages[stage].description}</p>

            <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm font-mono text-green-400">{stages[stage].code}</pre>
            </div>
          </div>

          <div className="bg-cyan-900/30 border border-cyan-600/50 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Zap size={16} className="text-cyan-400 mt-0.5 shrink-0" />
              <p className="text-sm">{stages[stage].highlight}</p>
            </div>
          </div>
        </div>

        {/* Flow Diagram */}
        <div className="bg-slate-900 rounded-lg p-4">
          <h3 className="font-semibold mb-4 text-slate-300">Message Flow</h3>
          <div className="space-y-2">
            {[
              { label: 'Tool Definitions', idx: 0, from: 'You', to: 'API' },
              { label: 'User Message', idx: 1, from: 'User', to: 'API' },
              { label: 'Tool Call Request', idx: 2, from: 'LLM', to: 'API' },
              { label: 'Tool Execution', idx: 3, from: 'Your Code', to: 'External' },
              { label: 'Tool Result', idx: 4, from: 'You', to: 'API' },
              { label: 'Final Response', idx: 5, from: 'LLM', to: 'User' },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2 rounded transition-all ${
                  stage === item.idx
                    ? 'bg-cyan-600/30 border border-cyan-500'
                    : stage > item.idx
                    ? 'bg-slate-700'
                    : 'bg-slate-800 opacity-50'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  stage >= item.idx ? 'bg-cyan-600' : 'bg-slate-600'
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-slate-400">{item.from} → {item.to}</div>
                </div>
                {stage === item.idx && (
                  <ChevronRight className="text-cyan-400" size={16} />
                )}
              </div>
            ))}
          </div>

          {/* Key Insight Box */}
          <div className="mt-4 p-3 bg-red-900/30 border border-red-600/50 rounded-lg">
            <div className="text-xs text-red-400 font-semibold mb-1">FINANCIAL SYSTEMS IMPLICATION</div>
            <p className="text-xs text-slate-300">
              Every tool call is an interception point where you can implement: validation, rate limiting,
              approval workflows, audit logging, and rollback mechanisms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CONTEXT WINDOW DEMO
// ============================================
function ContextWindowDemo() {
  const [messages, setMessages] = useState([
    { type: 'system', tokens: 500, label: 'System Prompt + Tool Definitions' }
  ]);
  const [totalTokens, setTotalTokens] = useState(500);
  const maxTokens = 128000;

  const addMessage = (type) => {
    const tokenCounts = {
      user: Math.floor(Math.random() * 100) + 50,
      thought: Math.floor(Math.random() * 200) + 100,
      toolcall: Math.floor(Math.random() * 50) + 30,
      toolresult: Math.floor(Math.random() * 2000) + 500,
      assistant: Math.floor(Math.random() * 300) + 100,
    };

    const labels = {
      user: 'User Query',
      thought: 'LLM Reasoning (Thought)',
      toolcall: 'Tool Call Request',
      toolresult: 'Tool Result (API Response)',
      assistant: 'Assistant Response',
    };

    const newTokens = tokenCounts[type];
    setMessages(prev => [...prev, { type, tokens: newTokens, label: labels[type] }]);
    setTotalTokens(prev => prev + newTokens);
  };

  const simulateIteration = () => {
    setTimeout(() => addMessage('user'), 0);
    setTimeout(() => addMessage('thought'), 300);
    setTimeout(() => addMessage('toolcall'), 600);
    setTimeout(() => addMessage('toolresult'), 900);
    setTimeout(() => addMessage('thought'), 1200);
    setTimeout(() => addMessage('assistant'), 1500);
  };

  const reset = () => {
    setMessages([{ type: 'system', tokens: 500, label: 'System Prompt + Tool Definitions' }]);
    setTotalTokens(500);
  };

  const getColor = (type) => {
    const colors = {
      system: 'bg-slate-600',
      user: 'bg-blue-600',
      thought: 'bg-purple-600',
      toolcall: 'bg-amber-600',
      toolresult: 'bg-green-600',
      assistant: 'bg-cyan-600',
    };
    return colors[type] || 'bg-slate-600';
  };

  const usagePercent = (totalTokens / maxTokens) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-cyan-400">Context Window Dynamics</h2>
          <p className="text-slate-400 text-sm">Watch the context fill up during agent execution</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={simulateIteration}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors text-sm"
          >
            + Simulate Iteration
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Context Bar */}
      <div className="bg-slate-900 rounded-lg p-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Context Usage</span>
          <span className={usagePercent > 80 ? 'text-red-400' : usagePercent > 50 ? 'text-amber-400' : 'text-green-400'}>
            {totalTokens.toLocaleString()} / {maxTokens.toLocaleString()} tokens ({usagePercent.toFixed(1)}%)
          </span>
        </div>
        <div className="h-8 bg-slate-700 rounded-lg overflow-hidden flex">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`${getColor(msg.type)} transition-all relative group`}
              style={{ width: `${(msg.tokens / maxTokens) * 100}%` }}
              title={`${msg.label}: ${msg.tokens} tokens`}
            >
              <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-slate-900 text-xs p-1 rounded whitespace-nowrap z-10">
                {msg.label}: {msg.tokens} tokens
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3 text-xs">
          {[
            { type: 'system', label: 'System' },
            { type: 'user', label: 'User' },
            { type: 'thought', label: 'Thought' },
            { type: 'toolcall', label: 'Tool Call' },
            { type: 'toolresult', label: 'Tool Result' },
            { type: 'assistant', label: 'Response' },
          ].map(item => (
            <div key={item.type} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${getColor(item.type)}`} />
              <span className="text-slate-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Issues */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400" />
            Context Window Problems
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">•</span>
              <span><strong>Lost in the Middle:</strong> Information in the middle of long contexts is poorly recalled (U-shaped attention)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">•</span>
              <span><strong>Context Rot:</strong> Performance degrades as context grows—diminishing marginal returns</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">•</span>
              <span><strong>Tool Results Bloat:</strong> Large API responses (think: full documents, DB results) rapidly consume context</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">•</span>
              <span><strong>No Persistence:</strong> Context resets between sessions—no long-term memory without external systems</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Zap size={16} className="text-cyan-400" />
            Financial Systems Implications
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong>Transaction History:</strong> Long trading sessions may lose early context (original intent, limits set)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong>Audit Trail:</strong> Can't rely on LLM memory for compliance—need external logging</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong>Position Tracking:</strong> Running position totals may drift without external state management</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong>Multi-Step Workflows:</strong> Complex approval chains may exceed context limits</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Token Economics */}
      <div className="bg-amber-900/30 border border-amber-600/50 rounded-lg p-4">
        <h3 className="font-semibold mb-2 text-amber-400">Cost Implications</h3>
        <p className="text-sm text-slate-300">
          Each token costs money. With Claude, input tokens cost ~$3/million, output ~$15/million.
          A single agent iteration with large tool results could cost $0.01-0.10.
          An agent running 50 iterations on a complex task could cost $0.50-5.00 per query.
          <br/><br/>
          <strong>For financial systems:</strong> Context bloat isn't just a performance issue—it's a direct cost center.
        </p>
      </div>
    </div>
  );
}

// ============================================
// PLANNING PATTERNS
// ============================================
function PlanningPatterns() {
  const [selectedPattern, setSelectedPattern] = useState('react');

  const patterns = {
    react: {
      name: 'ReAct',
      description: 'Reasoning and Acting interleaved. Think one step, act one step, observe, repeat.',
      pros: ['Simple to implement', 'Adapts to new information', 'Natural reasoning trace'],
      cons: ['One LLM call per action', 'No lookahead planning', 'May get stuck in loops'],
      diagram: [
        { label: 'Thought 1', type: 'think' },
        { label: 'Action 1', type: 'act' },
        { label: 'Observation 1', type: 'observe' },
        { label: 'Thought 2', type: 'think' },
        { label: 'Action 2', type: 'act' },
        { label: 'Observation 2', type: 'observe' },
        { label: 'Final Answer', type: 'answer' },
      ],
      financeRisk: 'Each step is reactive—no validation of full plan before execution. Dangerous for multi-step financial operations.',
    },
    planexec: {
      name: 'Plan-and-Execute',
      description: 'Generate full plan first, then execute each step. Separates planning from execution.',
      pros: ['Full plan visible upfront', 'Can validate before executing', 'Fewer LLM calls'],
      cons: ['Plan may become stale', 'Less adaptive to surprises', 'Replanning is expensive'],
      diagram: [
        { label: 'Generate Plan', type: 'plan' },
        { label: 'Step 1', type: 'execute' },
        { label: 'Step 2', type: 'execute' },
        { label: 'Step 3', type: 'execute' },
        { label: 'Verify & Answer', type: 'answer' },
      ],
      financeRisk: 'Better for audit—plan is documented. But plan invalidation mid-execution is challenging.',
    },
    rewoo: {
      name: 'ReWOO',
      description: 'Plan with variable references. Later steps can reference outputs of earlier steps without re-calling LLM.',
      pros: ['More efficient', 'Supports dependencies', 'Parallelizable'],
      cons: ['Complex to implement', 'Variable resolution logic needed', 'Harder to debug'],
      diagram: [
        { label: 'Plan: #E1=Search(X)', type: 'plan' },
        { label: 'Plan: #E2=Lookup(#E1)', type: 'plan' },
        { label: 'Execute #E1', type: 'execute' },
        { label: 'Execute #E2', type: 'execute' },
        { label: 'Synthesize', type: 'answer' },
      ],
      financeRisk: 'Variable substitution must be carefully validated—incorrect bindings could cause wrong parameters.',
    },
    tot: {
      name: 'Tree of Thoughts',
      description: 'Explore multiple reasoning paths simultaneously. Use search (BFS/DFS) to find best path.',
      pros: ['Explores alternatives', 'Can backtrack from dead ends', 'Better for complex reasoning'],
      cons: ['Very expensive (many LLM calls)', 'Complex orchestration', 'Hard to explain path choice'],
      diagram: [
        { label: 'Root Problem', type: 'root' },
        { label: 'Branch A', type: 'branch' },
        { label: 'Branch B', type: 'branch' },
        { label: 'Branch C', type: 'branch' },
        { label: 'A1, A2...', type: 'leaf' },
        { label: 'Evaluate & Select', type: 'answer' },
      ],
      financeRisk: 'Exploration is fine, but only ONE path should execute trades. Clear commitment point needed.',
    },
    lats: {
      name: 'LATS (Language Agent Tree Search)',
      description: 'Combines ReAct with Monte Carlo Tree Search. Uses reflection and environment feedback.',
      pros: ['Self-correcting', 'Learns from failures', 'Systematic exploration'],
      cons: ['Most expensive pattern', 'Complex setup', 'Requires good evaluation function'],
      diagram: [
        { label: 'Select Node', type: 'think' },
        { label: 'Expand (5 actions)', type: 'branch' },
        { label: 'Simulate Outcomes', type: 'execute' },
        { label: 'Reflect on Results', type: 'observe' },
        { label: 'Backpropagate Scores', type: 'think' },
        { label: 'Repeat or Answer', type: 'answer' },
      ],
      financeRisk: 'Simulation step is key—must use paper trading / sandbox. Never simulate on production systems.',
    },
  };

  const current = patterns[selectedPattern];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-cyan-400">Agent Planning Patterns</h2>
        <p className="text-slate-400 text-sm">Different architectures for different complexity levels</p>
      </div>

      {/* Pattern Selector */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(patterns).map(([key, pattern]) => (
          <button
            key={key}
            onClick={() => setSelectedPattern(key)}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedPattern === key
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            {pattern.name}
          </button>
        ))}
      </div>

      {/* Pattern Detail */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">{current.name}</h3>
            <p className="text-slate-400 text-sm mb-4">{current.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-green-400 text-sm font-semibold mb-2">Advantages</h4>
                <ul className="space-y-1">
                  {current.pros.map((pro, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-green-400">+</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-red-400 text-sm font-semibold mb-2">Disadvantages</h4>
                <ul className="space-y-1">
                  {current.cons.map((con, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-red-400">-</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-4">
            <h4 className="text-red-400 text-sm font-semibold mb-2">⚠️ Financial Systems Risk</h4>
            <p className="text-sm">{current.financeRisk}</p>
          </div>
        </div>

        {/* Flow Diagram */}
        <div className="bg-slate-900 rounded-lg p-4">
          <h3 className="font-semibold mb-4 text-slate-300">Execution Flow</h3>
          <div className="space-y-2">
            {current.diagram.map((step, idx) => {
              const colors = {
                think: 'border-purple-500 bg-purple-900/30',
                act: 'border-amber-500 bg-amber-900/30',
                observe: 'border-green-500 bg-green-900/30',
                plan: 'border-blue-500 bg-blue-900/30',
                execute: 'border-orange-500 bg-orange-900/30',
                answer: 'border-cyan-500 bg-cyan-900/30',
                root: 'border-slate-500 bg-slate-700',
                branch: 'border-violet-500 bg-violet-900/30',
                leaf: 'border-slate-500 bg-slate-800',
              };
              return (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-slate-500 text-sm w-6">{idx + 1}.</span>
                  <div className={`flex-1 p-2 rounded border ${colors[step.type]}`}>
                    <span className="text-sm">{step.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comparison Matrix */}
      <div className="bg-slate-900 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Pattern Comparison for Financial Use Cases</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-2">Pattern</th>
                <th className="text-center p-2">LLM Calls</th>
                <th className="text-center p-2">Auditability</th>
                <th className="text-center p-2">Adaptability</th>
                <th className="text-center p-2">Pre-validation</th>
                <th className="text-center p-2">Complexity</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'ReAct', calls: 'High', audit: 'Medium', adapt: 'High', preval: 'Low', complex: 'Low' },
                { name: 'Plan-Exec', calls: 'Medium', audit: 'High', adapt: 'Low', preval: 'High', complex: 'Medium' },
                { name: 'ReWOO', calls: 'Low', audit: 'High', adapt: 'Medium', preval: 'High', complex: 'High' },
                { name: 'ToT', calls: 'Very High', audit: 'Low', adapt: 'High', preval: 'Medium', complex: 'High' },
                { name: 'LATS', calls: 'Very High', audit: 'Medium', adapt: 'Very High', preval: 'Medium', complex: 'Very High' },
              ].map(row => (
                <tr key={row.name} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="p-2 font-medium">{row.name}</td>
                  <td className={`p-2 text-center ${row.calls.includes('High') ? 'text-red-400' : 'text-green-400'}`}>{row.calls}</td>
                  <td className={`p-2 text-center ${row.audit === 'High' ? 'text-green-400' : row.audit === 'Low' ? 'text-red-400' : 'text-amber-400'}`}>{row.audit}</td>
                  <td className={`p-2 text-center ${row.adapt.includes('High') ? 'text-green-400' : 'text-amber-400'}`}>{row.adapt}</td>
                  <td className={`p-2 text-center ${row.preval === 'High' ? 'text-green-400' : row.preval === 'Low' ? 'text-red-400' : 'text-amber-400'}`}>{row.preval}</td>
                  <td className={`p-2 text-center ${row.complex.includes('High') ? 'text-red-400' : 'text-green-400'}`}>{row.complex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          For financial systems: prioritize Auditability and Pre-validation. Plan-and-Execute or ReWOO patterns offer best balance.
        </p>
      </div>
    </div>
  );
}
