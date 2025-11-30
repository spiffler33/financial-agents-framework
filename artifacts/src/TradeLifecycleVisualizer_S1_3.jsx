import React, { useState } from 'react';
import { ArrowRight, Building2, TrendingUp, CheckCircle, Shield, Landmark, Clock, Bot, AlertTriangle, Lock, Unlock, Info, ToggleLeft, ToggleRight } from 'lucide-react';

const TradeLifecycleVisualizer = () => {
  const [selectedStage, setSelectedStage] = useState(null);
  const [showAgentOverlay, setShowAgentOverlay] = useState(false);

  const stages = [
    {
      id: 'creation',
      name: 'Order Creation',
      time: 'T+0: 09:31:00',
      icon: TrendingUp,
      institution: 'Hedge Fund OMS',
      color: 'bg-blue-500',
      borderColor: 'border-blue-500',
      description: 'Portfolio manager decides to buy 50,000 shares of NVIDIA at $142 limit. Order enters the Order Management System.',
      details: [
        'Intent becomes instruction: ticker, side, quantity, price, time-in-force',
        'Pre-trade checks run: position limits, restricted lists, buying power',
        'Order held until checks pass'
      ],
      whatCanGoWrong: 'Order blocked by limit breach, restricted list hit, or insufficient buying power',
      reversibility: 'full',
      reversibilityNote: 'Order can be cancelled instantly. No market impact yet.',
      agentRelevance: {
        title: 'Agent Entry Point',
        description: 'This is where an agent proposes trades. The agent generates the order instruction.',
        layers: ['Intent Layer', 'Policy Layer', 'Validation Layer'],
        insight: 'Existing OMS pre-trade checks provide first line of defense. Agent-specific controls layer on top.'
      }
    },
    {
      id: 'routing',
      name: 'Routing',
      time: 'T+0: 09:31:01',
      icon: ArrowRight,
      institution: 'Prime Broker / SOR',
      color: 'bg-indigo-500',
      borderColor: 'border-indigo-500',
      description: 'Smart Order Routing algorithms decide how to execute: which venues, what sizes, what pace.',
      details: [
        'SOR evaluates: NYSE, NASDAQ, dark pools, ECNs',
        'Splits 50,000 shares across venues to minimize market impact',
        'Prime broker relationship determines available venues and algos'
      ],
      whatCanGoWrong: 'Poor algo selection, information leakage, routing to low-quality venues',
      reversibility: 'high',
      reversibilityNote: 'Child orders can be cancelled. Parent order can be pulled. Minimal cost.',
      agentRelevance: {
        title: 'Execution Strategy',
        description: 'Agent could select execution algorithm (VWAP, TWAP, aggressive) based on market conditions.',
        layers: ['Execution Layer'],
        insight: 'This is already algorithmic. Agent adds judgment about which algo to use, not the algo itself.'
      }
    },
    {
      id: 'execution',
      name: 'Execution',
      time: 'T+0: 09:31:01 - 10:45:00',
      icon: CheckCircle,
      institution: 'Exchanges / Venues',
      color: 'bg-green-500',
      borderColor: 'border-green-500',
      description: 'Orders match against the order book. 50,000 shares fill in chunks across multiple venues over ~75 minutes.',
      details: [
        'Price-time priority matching at each venue',
        'Partial fills: 12,000 @ $141.98, 18,000 @ $142.00, 20,000 @ $142.02',
        'Execution reports flow back for each fill'
      ],
      whatCanGoWrong: 'Partial fills, adverse selection, price slippage, exchange outages',
      reversibility: 'medium',
      reversibilityNote: 'Executed shares are yours. Can sell immediately but at market price (potential loss).',
      agentRelevance: {
        title: 'Real-time Decisions',
        description: 'Agent could adjust strategy mid-execution: go passive if price rising, aggressive if opportunity.',
        layers: ['Execution Layer', 'Observation Layer'],
        insight: 'Requires real-time market data integration. Decisions in milliseconds, not seconds.'
      }
    },
    {
      id: 'confirmation',
      name: 'Confirmation',
      time: 'T+0: 11:00:00',
      icon: Shield,
      institution: 'Both Parties / Matching Utility',
      color: 'bg-yellow-500',
      borderColor: 'border-yellow-500',
      description: 'Trade details confirmed between fund and counterparties. Both sides agree on what happened.',
      details: [
        'Broker sends trade confirmations',
        'Fund systems match against order records',
        'Central matching utility confirms both sides agree'
      ],
      whatCanGoWrong: 'Unmatched trades, quantity discrepancies, price breaks, wrong account allocation',
      reversibility: 'medium',
      reversibilityNote: 'Errors caught here can be corrected. Unmatched trades don\'t proceed to clearing.',
      agentRelevance: {
        title: 'Observation Point',
        description: 'System records what actually executed vs. what was intended. Discrepancies flagged.',
        layers: ['Observation Layer'],
        insight: 'Agent\'s belief about what happened must match external confirmations. Key reconciliation point.'
      }
    },
    {
      id: 'clearing',
      name: 'Clearing',
      time: 'T+0: 18:00:00',
      icon: Building2,
      institution: 'CCP (e.g., NSCC)',
      color: 'bg-orange-500',
      borderColor: 'border-orange-500',
      description: 'Central Counterparty steps in via novation. CCP becomes buyer to every seller. Positions netted.',
      details: [
        'Novation: CCP assumes counterparty risk',
        'Netting: today\'s buys and sells consolidated',
        'Margin calculated: initial margin + variation margin'
      ],
      whatCanGoWrong: 'Margin call if insufficient collateral, position rejected if member in default',
      reversibility: 'low',
      reversibilityNote: 'Trade is locked in. Can only offset with new trade, not cancel original.',
      agentRelevance: {
        title: 'Constraint Checkpoint',
        description: 'Margin requirements enforced. Agent must understand capital/collateral implications.',
        layers: ['Validation Layer', 'Policy Layer'],
        insight: 'Agent operating across many trades must track aggregate margin impact, not just individual trades.'
      }
    },
    {
      id: 'settlement',
      name: 'Settlement',
      time: 'T+1: 10:00:00',
      icon: Landmark,
      institution: 'DTCC / Custodians',
      color: 'bg-red-500',
      borderColor: 'border-red-500',
      description: 'Ownership transfers. Securities move to fund\'s custodian account. Cash moves to seller. DVP ensures atomic swap.',
      details: [
        'Settlement instructions matched at depository',
        'Delivery vs. Payment: shares and cash move simultaneously',
        'Securities credited to fund\'s custodian account'
      ],
      whatCanGoWrong: 'Settlement failure: instructions don\'t match, party can\'t deliver, cascading fails',
      reversibility: 'none',
      reversibilityNote: 'Ownership transferred. Legally final. Cannot be reversed—only offset by new transaction.',
      agentRelevance: {
        title: 'Point of No Return',
        description: 'After settlement, the action is permanent. All agent controls must act BEFORE this point.',
        layers: ['Control Layer'],
        insight: 'This is why Control Layer (kill switches, circuit breakers) must be able to halt before settlement.'
      }
    }
  ];

  const getReversibilityColor = (level) => {
    switch(level) {
      case 'full': return 'text-green-600 bg-green-50';
      case 'high': return 'text-green-500 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-orange-600 bg-orange-50';
      case 'none': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getReversibilityIcon = (level) => {
    if (level === 'none') return Lock;
    return Unlock;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trade Lifecycle Visualizer</h1>
          <p className="text-gray-600">Trace 50,000 shares of NVIDIA from decision to ownership</p>

          {/* Agent Overlay Toggle */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => setShowAgentOverlay(!showAgentOverlay)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                showAgentOverlay
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Bot className="w-4 h-4" />
              {showAgentOverlay ? 'Agent Overlay: ON' : 'Agent Overlay: OFF'}
              {showAgentOverlay ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            </button>
            <span className="text-sm text-gray-500">
              {showAgentOverlay ? 'Showing where agents interface with each stage' : 'Toggle to see agent integration points'}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Trade Date (T+0)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Settlement (T+1)</span>
              <Lock className="w-4 h-4" />
            </div>
          </div>

          {/* Stage Cards */}
          <div className="flex gap-2 overflow-x-auto pb-4">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const isSelected = selectedStage?.id === stage.id;

              return (
                <React.Fragment key={stage.id}>
                  <button
                    onClick={() => setSelectedStage(isSelected ? null : stage)}
                    className={`flex-shrink-0 w-36 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected
                        ? `${stage.borderColor} bg-white shadow-md`
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full ${stage.color} flex items-center justify-center mb-3 mx-auto`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 text-center">{stage.name}</div>
                    <div className="text-xs text-gray-500 text-center mt-1">{stage.institution}</div>

                    {showAgentOverlay && (
                      <div className="mt-2 flex justify-center">
                        <div className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          <span>Agent</span>
                        </div>
                      </div>
                    )}
                  </button>

                  {index < stages.length - 1 && (
                    <div className="flex-shrink-0 flex items-center">
                      <ArrowRight className="w-5 h-5 text-gray-300" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Reversibility Gradient Bar */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-2">Reversibility Gradient</div>
            <div className="h-2 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500"></div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-green-600">Fully reversible</span>
              <span className="text-xs text-red-600">Irreversible</span>
            </div>
          </div>
        </div>

        {/* Selected Stage Detail */}
        {selectedStage && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Stage Header */}
            <div className={`${selectedStage.color} p-4`}>
              <div className="flex items-center gap-3">
                <selectedStage.icon className="w-6 h-6 text-white" />
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedStage.name}</h2>
                  <p className="text-white/80 text-sm">{selectedStage.time}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Main Description */}
              <p className="text-gray-700 mb-6">{selectedStage.description}</p>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* What Happens */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-500" />
                      What Happens
                    </h3>
                    <ul className="space-y-2">
                      {selectedStage.details.map((detail, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-gray-400 mt-1">•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* What Can Go Wrong */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      What Can Go Wrong
                    </h3>
                    <p className="text-sm text-gray-600">{selectedStage.whatCanGoWrong}</p>
                  </div>

                  {/* Reversibility */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      {React.createElement(getReversibilityIcon(selectedStage.reversibility), {
                        className: `w-4 h-4 ${selectedStage.reversibility === 'none' ? 'text-red-500' : 'text-green-500'}`
                      })}
                      Reversibility
                    </h3>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${getReversibilityColor(selectedStage.reversibility)}`}>
                      <span className="capitalize">{selectedStage.reversibility === 'none' ? 'Irreversible' : `${selectedStage.reversibility} reversibility`}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{selectedStage.reversibilityNote}</p>
                  </div>
                </div>

                {/* Right Column - Agent Relevance */}
                {showAgentOverlay && (
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-600" />
                      {selectedStage.agentRelevance.title}
                    </h3>

                    <p className="text-sm text-purple-800 mb-4">
                      {selectedStage.agentRelevance.description}
                    </p>

                    <div className="mb-4">
                      <div className="text-xs font-medium text-purple-700 mb-2">Architectural Layers</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedStage.agentRelevance.layers.map((layer, idx) => (
                          <span key={idx} className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded">
                            {layer}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-purple-100 rounded p-3">
                      <div className="text-xs font-medium text-purple-700 mb-1">Key Insight</div>
                      <p className="text-sm text-purple-900">{selectedStage.agentRelevance.insight}</p>
                    </div>
                  </div>
                )}

                {!showAgentOverlay && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <Bot className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Toggle "Agent Overlay" to see how agents interface with this stage</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No Selection State */}
        {!selectedStage && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-400 mb-2">
              <TrendingUp className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Stage</h3>
            <p className="text-gray-500">Click on any stage above to see details about what happens, what can go wrong, and how agents interface.</p>
          </div>
        )}

        {/* Summary Card */}
        <div className="mt-6 bg-gray-800 rounded-xl p-6 text-white">
          <h3 className="font-semibold mb-3">Key Takeaways for Agent Architecture</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="font-medium text-green-400 mb-1">Pre-Settlement</div>
              <p className="text-gray-300">Multiple intervention points. Existing checkpoints (OMS, pre-trade checks) can be leveraged.</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="font-medium text-yellow-400 mb-1">Clearing</div>
              <p className="text-gray-300">Trade locked in but not final. Margin and netting implications require aggregate awareness.</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="font-medium text-red-400 mb-1">Post-Settlement</div>
              <p className="text-gray-300">Irreversible. All control mechanisms must act before this point. No undo button.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeLifecycleVisualizer;
