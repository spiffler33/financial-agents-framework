import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, Shield, Brain, Link2, Gauge, Wrench, ChevronRight, Layers, CheckCircle2, Info } from 'lucide-react';

const characteristics = {
  hallucination: {
    id: 'hallucination',
    name: 'Hallucination',
    subtitle: 'Confident Falsehood',
    icon: Brain,
    nature: 'structural',
    natureLabel: 'Structural (improving)',
    color: 'rose',
    mechanism: 'Models predict the most likely next token based on patterns, not truth. When queries fall outside reliable training coverage, the model generates statistically likely completions that may be false. Xu et al. (2024) proved mathematically this is inevitable for any LLM used as a general problem solver.',
    trajectory: 'Rates are measurably improving with newer models, but the theoretical result stands: the rate can decrease but cannot reach zero. Hallucination varies dramatically by domain.',
    autonomyLevels: {
      advisory: {
        label: 'Advisory',
        failureMode: 'User receives incorrect information. A competent user may catch obvious errors; subtle ones go unnoticed. The failure mode is bad advice.',
        example: 'Chatbot claims a fund has a 5-star rating when it actually has 3 stars.',
        severity: 'low'
      },
      supervised: {
        label: 'Supervised Execution',
        failureMode: 'Human approver sees a flawed recommendation. If hallucinated content is plausible (a realistic-looking but incorrect position limit), the human may approve it. The failure mode is a human making decisions on false premises.',
        example: 'Agent reports counterparty has AA credit rating when it\'s actually BB. Human approves trade based on fabricated rating.',
        severity: 'medium'
      },
      autonomous: {
        label: 'Autonomous Execution',
        failureMode: 'System takes action based on false beliefs. A hallucinated constraint leads directly to positions that violate actual limits. The failure mode is executed trades that cannot be unwound.',
        example: 'Agent believes available limit is $10M when actual limit is $5M. Executes trade that breaches real limits.',
        severity: 'high'
      }
    },
    architecturalResponse: {
      summary: 'External validation is mandatory for any action with consequences. The model\'s output cannot be trusted as ground truth.',
      layers: ['Validation'],
      layerDetails: {
        'Validation': 'Verify all agent claims against authoritative sources before execution. The agent proposes; external systems confirm state and check constraints.'
      }
    }
  },
  contextDegradation: {
    id: 'contextDegradation',
    name: 'Context Degradation',
    subtitle: 'The Lost Middle',
    icon: Layers,
    nature: 'structural',
    natureLabel: 'Structural',
    color: 'amber',
    mechanism: 'Liu et al. (2024) demonstrated the "Lost in the Middle" phenomenon: models exhibit a U-shaped performance curve where information at the beginning and end of context is recalled reliably, but middle content is frequently missed. This relates to attention patterns and positional encoding in transformers.',
    trajectory: 'This is structural to current transformer architectures. Extended context windows help but don\'t solve the fundamental attention pattern issue.',
    autonomyLevels: {
      advisory: {
        label: 'Advisory',
        failureMode: 'Chatbot forgets early context and gives inconsistent advice across a long conversation. Annoying but recoverable—user can restate constraints or start fresh.',
        example: 'User mentions risk tolerance is "conservative" at start, but bot recommends aggressive options after 20 turns.',
        severity: 'low'
      },
      supervised: {
        label: 'Supervised Execution',
        failureMode: 'System forgets constraints while building a recommendation. An ESG restriction specified at turn 3 is ignored by turn 15. Human reviewer would need to independently verify compliance.',
        example: 'Agent forgets "no tobacco stocks" constraint and includes Philip Morris in recommended portfolio.',
        severity: 'medium'
      },
      autonomous: {
        label: 'Autonomous Execution',
        failureMode: 'Critical constraints specified at session start become invisible by execution time. A mandate specifying "no position exceeding 5%" at token 500 may not be applied at token 40,000.',
        example: 'On 15th trade of rebalancing, agent violates position limit stated at start because constraint is "lost in the middle."',
        severity: 'high'
      }
    },
    architecturalResponse: {
      summary: 'Critical constraints must be externalized, not embedded in prompts. System prompts and early instructions are insufficient for constraints that matter.',
      layers: ['Policy'],
      layerDetails: {
        'Policy': 'Evaluate every proposed action against declared constraints independent of what the agent remembers. Constraints are enforced regardless of context window position.'
      }
    }
  },
  numericalReasoning: {
    id: 'numericalReasoning',
    name: 'Numerical Reasoning',
    subtitle: 'Embedded Calculation Fragility',
    icon: Gauge,
    nature: 'improving',
    natureLabel: 'Improving',
    color: 'blue',
    mechanism: 'LLMs process numbers as tokens and "reason" through pattern matching, not symbolic computation. This creates arithmetic errors, unit confusion (millions vs billions, percentages vs basis points), and logical errors under numerical complexity.',
    trajectory: 'Improving but present. Newer models perform better on benchmarks, and chain-of-thought helps. However, the architecture processes numbers as tokens, not quantities.',
    autonomyLevels: {
      advisory: {
        label: 'Advisory',
        failureMode: 'Calculation error in an estimate may mislead user, but they might catch gross errors ("you\'ll need $500M to retire") and can verify independently.',
        example: 'Retirement calculator says user needs $50,000/year but actually computed $500,000.',
        severity: 'low'
      },
      supervised: {
        label: 'Supervised Execution',
        failureMode: 'Numerical errors in recommendations—wrong notional, incorrect hedge ratio—may not be obvious to a human reviewer pattern-matching against "does this look reasonable?"',
        example: 'Agent recommends 1,000 contracts when correct hedge ratio is 100. Reviewer sees "1,000" and it seems plausible.',
        severity: 'medium'
      },
      autonomous: {
        label: 'Autonomous Execution',
        failureMode: 'A basis point error in spread calculation, decimal place error in sizing, or currency confusion translates directly into P&L impact. Errors are silent until reconciliation.',
        example: 'Cross-border trade executed at 1.25 USD/EUR instead of 1.025 due to decimal confusion. Discovered at settlement.',
        severity: 'high'
      }
    },
    architecturalResponse: {
      summary: 'Calculations should happen in deterministic code, not in the LLM. The agent reasons about what calculation is needed; execution performs computations.',
      layers: ['Validation', 'Execution'],
      layerDetails: {
        'Validation': 'Independently verify numerical outputs against position limits, available capital, and constraints using code—not by asking the model to double-check itself.',
        'Execution': 'Perform all calculations using proper numerical libraries. The agent proposes the operation; deterministic code computes the values.'
      }
    }
  },
  adversarialVulnerability: {
    id: 'adversarialVulnerability',
    name: 'Adversarial Vulnerability',
    subtitle: 'Prompt Injection and Beyond',
    icon: Shield,
    nature: 'structural',
    natureLabel: 'Structural (arms race)',
    color: 'red',
    mechanism: 'LLM agents process natural language that can contain instructions. Prompt injection exploits this by embedding malicious instructions in content the agent processes. The model cannot reliably distinguish legitimate instructions from adversarial ones.',
    trajectory: 'This is structural and adversarial—an arms race. Sophisticated attacks achieve >50% bypass rates against state-of-the-art defenses. Financial systems will face sophisticated attackers.',
    autonomyLevels: {
      advisory: {
        label: 'Advisory',
        failureMode: 'Injected instruction causes chatbot to give biased advice or leak system prompt details. Problematic for trust, but limited direct harm.',
        example: 'Malicious content in scraped webpage causes bot to recommend a specific (attacker-chosen) investment.',
        severity: 'low'
      },
      supervised: {
        label: 'Supervised Execution',
        failureMode: 'Attack embedded in analyzed document causes agent to recommend an action benefiting attacker. Human sees reasonable recommendation with fabricated justification.',
        example: 'PDF contains hidden prompt injection causing agent to recommend buying attacker\'s penny stock with plausible-sounding rationale.',
        severity: 'medium'
      },
      autonomous: {
        label: 'Autonomous Execution',
        failureMode: 'Successful injection directly induces unauthorized trades, data exfiltration, or system manipulation. InjecAgent benchmark tests "initiate transaction to attacker-controlled account."',
        example: 'Compromised market data feed contains injection causing agent to transfer funds to external account.',
        severity: 'high'
      }
    },
    architecturalResponse: {
      summary: 'Defense in depth. No single layer can be the sole defense—attackers will find bypasses. Architecture must assume some inputs are hostile.',
      layers: ['Identity', 'Policy', 'Validation'],
      layerDetails: {
        'Identity': 'Verify authorization for every action. Don\'t trust the agent\'s belief about who authorized what.',
        'Policy': 'Constrain what actions are possible regardless of what instructions the agent believes it received.',
        'Validation': 'Confirm proposed actions against current state and limits. Limit blast radius of successful attacks.'
      }
    }
  },
  compoundErrors: {
    id: 'compoundErrors',
    name: 'Compound Error Dynamics',
    subtitle: 'The Cascade Problem',
    icon: Link2,
    nature: 'structural',
    natureLabel: 'Mathematical',
    color: 'purple',
    mechanism: 'Even low per-step error rates compound over sequences. A 99% per-step success rate yields only 37% sequence success over 100 steps. Errors propagate: early mistakes distort reasoning, compound misjudgments, and derail trajectories.',
    trajectory: 'This is mathematical, not a temporary limitation. Better models reduce per-step error rates, but the exponential relationship remains. 99.9% per-step still yields 90% over 100 steps.',
    autonomyLevels: {
      advisory: {
        label: 'Advisory',
        failureMode: 'Multi-turn conversation goes off track. Annoying but recoverable—user can reset.',
        example: 'After 15 turns of planning, chatbot has drifted to completely irrelevant topic. User starts over.',
        severity: 'low'
      },
      supervised: {
        label: 'Supervised Execution',
        failureMode: 'Agent\'s reasoning chain accumulates errors before presenting recommendation. Human sees only the conclusion, not the error-laden path that produced it.',
        example: 'After 10-step analysis, agent concludes "buy" but step 3 misread a key metric, invalidating everything after.',
        severity: 'medium'
      },
      autonomous: {
        label: 'Autonomous Execution',
        failureMode: 'Portfolio rebalancing across 30 positions isn\'t independent—each trade affects constraints for subsequent trades. Error at step 5 corrupts the basis for all subsequent decisions.',
        example: 'Error in trade 5 of 30 miscalculates available capital. Trades 6-30 all based on wrong state.',
        severity: 'high'
      }
    },
    architecturalResponse: {
      summary: 'Long sequences need explicit checkpoints, state verification, and recovery mechanisms. The architecture must support intervention when things go wrong.',
      layers: ['Validation', 'Observation', 'Control'],
      layerDetails: {
        'Validation': 'Verify state at multiple points, not just before final execution. Insert checkpoints in long sequences.',
        'Observation': 'Capture not just final outcomes but intermediate state, enabling reconstruction and debugging.',
        'Control': 'Support intervention—pause, rollback, human takeover—when something appears to be going wrong.'
      }
    }
  },
  overconfidence: {
    id: 'overconfidence',
    name: 'Overconfidence',
    subtitle: 'The Calibration Gap',
    icon: TrendingUp,
    nature: 'improving',
    natureLabel: 'Improving',
    color: 'orange',
    mechanism: 'LLMs express confidence poorly calibrated with accuracy. Models cluster confidence in the 80-100% range even when actual accuracy is much lower. Training rewards confident answers over uncertainty expressions.',
    trajectory: 'Improving with capability—larger models show better calibration—but still far from ideal. Techniques like self-consistency help but add latency and cost.',
    autonomyLevels: {
      advisory: {
        label: 'Advisory',
        failureMode: 'Overconfident recommendation inappropriately influences user decisions. Users naturally trust confident-sounding advice.',
        example: '"I\'m 95% confident this stock will outperform" when actual model accuracy is 55%.',
        severity: 'low'
      },
      supervised: {
        label: 'Supervised Execution',
        failureMode: 'Agent expresses high confidence ("this trade is clearly within risk limits"), causing human to scrutinize less carefully. Overconfidence transfers to human.',
        example: 'Agent states "definitely within compliance parameters"—reviewer rubber-stamps without checking.',
        severity: 'medium'
      },
      autonomous: {
        label: 'Autonomous Execution',
        failureMode: 'If confidence scores gate automation (high→auto-execute, low→review), miscalibration means risky actions bypass review while safe ones get flagged. Worse than random.',
        example: 'Novel trade type auto-executed at "98% confidence" while routine trades held for review.',
        severity: 'high'
      }
    },
    architecturalResponse: {
      summary: 'Don\'t rely on agent\'s self-reported confidence. Design systems that don\'t depend on confidence calibration at all.',
      layers: ['Validation', 'Control'],
      layerDetails: {
        'Validation': 'Check constraints regardless of whether the agent claims confidence. Confidence is not a validation input.',
        'Control': 'Enable human review based on action characteristics (size, novelty, conditions), not agent-expressed confidence.'
      }
    }
  },
  toolUseErrors: {
    id: 'toolUseErrors',
    name: 'Tool Use Errors',
    subtitle: 'Selection and Parameter Hallucination',
    icon: Wrench,
    nature: 'improving',
    natureLabel: 'Improving',
    color: 'teal',
    mechanism: 'Errors in tool selection (using quote API when meaning to execute), parameter hallucination (inventing fields, wrong types), and result misinterpretation (treating partial fill as complete).',
    trajectory: 'Improving with model capability and better documentation. Clear schemas, constrained formats, and few-shot examples significantly reduce error rates.',
    autonomyLevels: {
      advisory: {
        label: 'Advisory',
        failureMode: 'Tool error causes failed lookup or incorrect retrieval. Chatbot apologizes and retries, or user notices inconsistency.',
        example: 'Agent calls wrong API endpoint, returns stale data. User asks again and gets correct info.',
        severity: 'low'
      },
      supervised: {
        label: 'Supervised Execution',
        failureMode: 'Agent calls wrong tool or passes incorrect parameters. Resulting recommendation based on wrong data. Human may not realize underlying retrieval was flawed.',
        example: 'Agent queried yesterday\'s prices instead of real-time. Recommendation based on stale data looks plausible.',
        severity: 'medium'
      },
      autonomous: {
        label: 'Autonomous Execution',
        failureMode: 'Tool errors translate directly into system actions. Buy/sell confusion, wrong ticker, incorrect quantity become real positions. Partial fills and timeouts need explicit handling.',
        example: 'Agent submits "GOOG" instead of "GOOGL". Wrong share class purchased. Discovered at reconciliation.',
        severity: 'high'
      }
    },
    architecturalResponse: {
      summary: 'Validate tool calls before execution. Handle failures gracefully. Capture actual calls and responses, not agent summaries.',
      layers: ['Validation', 'Execution', 'Observation'],
      layerDetails: {
        'Validation': 'Check tool calls before execution—schema validation, parameter bounds, tool selection appropriateness.',
        'Execution': 'Handle partial failures gracefully. Report execution state accurately. Implement idempotency.',
        'Observation': 'Capture actual tool call/response pairs, not agent summaries of what happened.'
      }
    }
  }
};

const autonomyLevelInfo = {
  advisory: {
    name: 'Advisory',
    description: 'Agent provides information; human decides and acts',
    example: 'Financial planning chatbot, research assistant',
    architectureLevel: 'Light'
  },
  supervised: {
    name: 'Supervised Execution',
    description: 'Agent proposes actions; human approves; system executes',
    example: 'Trade recommendation with approval workflow',
    architectureLevel: 'Medium'
  },
  autonomous: {
    name: 'Autonomous Execution',
    description: 'Agent decides and executes without per-action human approval',
    example: 'Algorithmic rebalancing agent',
    architectureLevel: 'Heavy'
  }
};

const layerColors = {
  'Intent': 'bg-slate-100 text-slate-700 border-slate-300',
  'Identity': 'bg-violet-100 text-violet-700 border-violet-300',
  'Policy': 'bg-amber-100 text-amber-700 border-amber-300',
  'Validation': 'bg-blue-100 text-blue-700 border-blue-300',
  'Execution': 'bg-emerald-100 text-emerald-700 border-emerald-300',
  'Observation': 'bg-cyan-100 text-cyan-700 border-cyan-300',
  'Explanation': 'bg-pink-100 text-pink-700 border-pink-300',
  'Control': 'bg-red-100 text-red-700 border-red-300'
};

const severityColors = {
  low: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  medium: 'bg-amber-50 border-amber-200 text-amber-800',
  high: 'bg-rose-50 border-rose-200 text-rose-800'
};

const severityLabels = {
  low: 'Manageable Risk',
  medium: 'Elevated Risk',
  high: 'Critical Risk'
};

const colorVariants = {
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', icon: 'text-rose-500', activeBg: 'bg-rose-100' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500', activeBg: 'bg-amber-100' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500', activeBg: 'bg-blue-100' },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-500', activeBg: 'bg-red-100' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-500', activeBg: 'bg-purple-100' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-500', activeBg: 'bg-orange-100' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', icon: 'text-teal-500', activeBg: 'bg-teal-100' }
};

export default function CharacteristicExplorer() {
  const [selectedCharacteristic, setSelectedCharacteristic] = useState('hallucination');
  const [selectedAutonomy, setSelectedAutonomy] = useState('advisory');

  const char = characteristics[selectedCharacteristic];
  const colors = colorVariants[char.color];
  const autonomyData = char.autonomyLevels[selectedAutonomy];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">
            Characteristic Explorer
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            LLM agent characteristics are engineering constraints to design around—not warnings.
            The architectural response required depends on <span className="font-medium text-slate-700">autonomy level</span>.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Characteristic Selector */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide px-1">
              Select Characteristic
            </h2>
            <div className="space-y-2">
              {Object.values(characteristics).map((c) => {
                const IconComponent = c.icon;
                const cColors = colorVariants[c.color];
                const isSelected = selectedCharacteristic === c.id;

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCharacteristic(c.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? `${cColors.activeBg} ${cColors.border} border-2 shadow-sm`
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? cColors.bg : 'bg-slate-50'}`}>
                        <IconComponent className={`w-4 h-4 ${isSelected ? cColors.icon : 'text-slate-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium ${isSelected ? cColors.text : 'text-slate-700'}`}>
                          {c.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate">{c.subtitle}</div>
                      </div>
                      <div className={`text-xs px-2 py-0.5 rounded-full ${
                        c.nature === 'structural'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {c.nature === 'structural' ? 'Structural' : 'Improving'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Characteristic Header */}
            <div className={`p-4 rounded-xl border-2 ${colors.border} ${colors.bg}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-white shadow-sm`}>
                  <char.icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className={`text-xl font-semibold ${colors.text}`}>{char.name}</h2>
                    <span className="text-sm text-slate-500">— {char.subtitle}</span>
                  </div>
                  <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    char.nature === 'structural'
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-emerald-200 text-emerald-800'
                  }`}>
                    {char.nature === 'structural' ? (
                      <AlertTriangle className="w-3 h-3" />
                    ) : (
                      <TrendingUp className="w-3 h-3" />
                    )}
                    {char.natureLabel}
                  </div>
                </div>
              </div>
            </div>

            {/* Mechanism & Trajectory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Mechanism</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{char.mechanism}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Trajectory</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{char.trajectory}</p>
              </div>
            </div>

            {/* Autonomy Level Selector */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
                How it manifests by autonomy level
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(autonomyLevelInfo).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedAutonomy(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedAutonomy === key
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {info.name}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-500 mb-4 flex items-center gap-2">
                <Info className="w-3 h-3" />
                <span>{autonomyLevelInfo[selectedAutonomy].description}</span>
                <span className="text-slate-400">•</span>
                <span className="italic">{autonomyLevelInfo[selectedAutonomy].example}</span>
              </div>

              {/* Failure Mode Display */}
              <div className={`rounded-xl border-2 p-4 ${severityColors[autonomyData.severity]}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-medium uppercase tracking-wide px-2 py-0.5 rounded-full ${
                    autonomyData.severity === 'low' ? 'bg-emerald-200 text-emerald-800' :
                    autonomyData.severity === 'medium' ? 'bg-amber-200 text-amber-800' :
                    'bg-rose-200 text-rose-800'
                  }`}>
                    {severityLabels[autonomyData.severity]}
                  </span>
                </div>
                <h4 className="font-medium text-slate-800 mb-2">Failure Mode</h4>
                <p className="text-sm text-slate-700 mb-3">{autonomyData.failureMode}</p>
                <div className="bg-white/60 rounded-lg p-3 border border-current/10">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Example</div>
                  <p className="text-sm text-slate-700 italic">{autonomyData.example}</p>
                </div>
              </div>
            </div>

            {/* Architectural Response */}
            <div className="bg-slate-800 rounded-xl p-4 text-white">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Architectural Response
              </h3>
              <p className="text-slate-200 text-sm mb-4">{char.architecturalResponse.summary}</p>

              <div className="space-y-3">
                <div className="text-xs text-slate-400 uppercase tracking-wide">Relevant Layers</div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {char.architecturalResponse.layers.map((layer) => (
                    <span
                      key={layer}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${layerColors[layer]}`}
                    >
                      {layer}
                    </span>
                  ))}
                </div>

                <div className="space-y-2">
                  {char.architecturalResponse.layers.map((layer) => (
                    <div key={layer} className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                        <span className="text-sm font-medium text-slate-300">{layer} Layer</span>
                      </div>
                      <p className="text-xs text-slate-400 pl-5">
                        {char.architecturalResponse.layerDetails[layer]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-200">
          <p>
            From "Architectural Constraints for Autonomous Agents in Financial Systems" — Section 1.2
          </p>
          <p className="mt-1">
            These are constraints to design around, not reasons to avoid building agent systems.
          </p>
        </div>
      </div>
    </div>
  );
}
