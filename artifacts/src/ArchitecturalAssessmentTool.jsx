import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, AlertTriangle, Info, Layers, Shield, Scale, FileCheck, ArrowRight } from 'lucide-react';

const ArchitecturalAssessmentTool = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [assessments, setAssessments] = useState({
    autonomy: null,
    irreversibility: null,
    regulatory: null
  });
  const [showConstraints, setShowConstraints] = useState(false);
  const [expandedConstraint, setExpandedConstraint] = useState(null);

  const steps = [
    { id: 'intro', title: 'Introduction' },
    { id: 'autonomy', title: 'Autonomy Level' },
    { id: 'irreversibility', title: 'Irreversibility' },
    { id: 'regulatory', title: 'Regulatory Surface' },
    { id: 'results', title: 'Your Profile' }
  ];

  const dimensions = {
    autonomy: {
      title: 'Autonomy Level',
      question: 'Who decides whether actions are taken?',
      icon: Scale,
      options: [
        {
          value: 'advisory',
          level: 1,
          title: 'Advisory',
          description: 'Agent provides information; human decides and acts elsewhere',
          example: 'Financial planning app recommending insurance coverage',
          indicators: [
            'Agent outputs are recommendations or analysis',
            'Users take action through separate channels',
            'No system integration with execution'
          ]
        },
        {
          value: 'supervised',
          level: 2,
          title: 'Supervised Execution',
          description: 'Agent proposes actions; human approves; system executes',
          example: 'Limits allocation reviewed by risk managers',
          indicators: [
            'Agent generates actionable proposals',
            'Human review gate before execution',
            'System executes approved actions'
          ]
        },
        {
          value: 'autonomous',
          level: 3,
          title: 'Autonomous Execution',
          description: 'Agent decides and executes without per-action human approval',
          example: 'Algorithmic portfolio rebalancing agent',
          indicators: [
            'Pre-set boundaries, not per-action approval',
            'Agent triggers execution directly',
            'Human intervention is after-the-fact'
          ]
        }
      ]
    },
    irreversibility: {
      title: 'Action Irreversibility',
      question: 'What happens when something goes wrong?',
      icon: AlertTriangle,
      options: [
        {
          value: 'reversible',
          level: 1,
          title: 'Reversible',
          description: 'Actions can be undone trivially with no lasting impact',
          example: 'Generating analysis; drafting reports',
          indicators: [
            'Output can be discarded',
            'No external system state changes',
            'Mistakes cost time, not money'
          ]
        },
        {
          value: 'costly',
          level: 2,
          title: 'Costly to Reverse',
          description: 'Actions can be undone but with friction, cost, or consequences',
          example: 'Executed trade (can offset but not cancel)',
          indicators: [
            'Offsetting action required to reverse',
            'Transaction costs, market impact',
            'Audit trail shows both actions'
          ]
        },
        {
          value: 'irreversible',
          level: 3,
          title: 'Irreversible',
          description: 'Actions cannot be undone once taken',
          example: 'Settlement finality; regulatory filing deadlines',
          indicators: [
            'No correction mechanism exists',
            'Legal or operational finality',
            'Consequences are permanent'
          ]
        }
      ]
    },
    regulatory: {
      title: 'Regulatory Surface Area',
      question: 'What must you prove, and to whom?',
      icon: FileCheck,
      options: [
        {
          value: 'light',
          level: 1,
          title: 'Light',
          description: 'General consumer protection; no finance-specific AI regulation',
          example: 'Internal analytics tool; general assistant',
          indicators: [
            'No industry-specific oversight',
            'Standard software practices sufficient',
            'No examination or audit requirements'
          ]
        },
        {
          value: 'medium',
          level: 2,
          title: 'Medium',
          description: 'Industry-specific requirements: suitability, disclosure, record-keeping',
          example: 'Robo-advisor; customer-facing financial planning',
          indicators: [
            'Suitability documentation required',
            'Specific retention periods',
            'Disclosure obligations'
          ]
        },
        {
          value: 'heavy',
          level: 3,
          title: 'Heavy',
          description: 'Full regulatory stack: MiFID II, Dodd-Frank, SOX, prudential supervision',
          example: 'Institutional trading system; bank capital allocation',
          indicators: [
            'Multiple regulatory examinations',
            'Demonstrable controls required',
            'Best execution / surveillance obligations'
          ]
        }
      ]
    }
  };

  const constraintAreas = [
    {
      id: 'numerical',
      title: 'Numerical Precision',
      question: 'How sensitive is your domain to calculation errors?',
      low: 'Approximate values acceptable (portfolio percentages)',
      high: 'Basis point precision required (spread calculations, Greeks)',
      implication: 'High sensitivity → calculations in deterministic code, not LLM'
    },
    {
      id: 'adversarial',
      title: 'Adversarial Environment',
      question: 'Who might attack your system, and what would they gain?',
      low: 'Casual manipulation attempts, low-value targets',
      high: 'Sophisticated attackers, significant capital at stake',
      implication: 'High exposure → defense in depth, assume hostile inputs'
    },
    {
      id: 'systemic',
      title: 'Systemic Coupling',
      question: "Do your agent's actions affect other systems or counterparties?",
      low: 'Self-contained effects, isolated portfolio',
      high: 'Triggers margin calls, affects counterparty limits, moves markets',
      implication: 'High coupling → architectural awareness of downstream effects'
    },
    {
      id: 'time',
      title: 'Time Constraints',
      question: 'Are there hard deadlines with real consequences?',
      low: 'Flexible timing, can pause for review',
      high: 'Settlement cutoffs, expiry deadlines, margin windows',
      implication: 'Hard deadlines → heavier automation requires heavier controls'
    },
    {
      id: 'authorization',
      title: 'Authorization Stakes',
      question: "Who bears liability for the agent's actions?",
      low: 'User who received advice bears decision responsibility',
      high: 'Institution deploying agent bears liability',
      implication: 'Higher stakes → clearer audit trails, explanation capabilities'
    }
  ];

  const layers = [
    { name: 'Intent', question: 'What is the agent trying to accomplish?', description: 'Captures and preserves the goal driving agent behavior' },
    { name: 'Identity', question: 'Who is this agent and who authorized it?', description: 'Establishes credentials, authorization chains, accountability' },
    { name: 'Policy', question: 'What is this agent permitted to do?', description: 'Defines boundaries and constraints independent of the agent' },
    { name: 'Validation', question: 'Is this specific action valid given current state?', description: 'Real-time verification against live constraints before execution' },
    { name: 'Execution', question: 'How does the action get performed?', description: 'Interfaces with external systems to take action' },
    { name: 'Observation', question: 'What actually happened?', description: 'Independent recording of events, not relying on agent self-report' },
    { name: 'Explanation', question: 'Why did it happen?', description: 'Reconstructable reasoning chains for audit and investigation' },
    { name: 'Control', question: 'How do we intervene?', description: 'Kill switches, circuit breakers, human override capabilities' }
  ];

  const getLayerApplicability = (layer, profile) => {
    const matrix = {
      'Intent': { advisory: 'required', supervised: 'required', autonomous: 'required' },
      'Identity': { advisory: 'light', supervised: 'required', autonomous: 'required' },
      'Policy': { advisory: 'light', supervised: 'required', autonomous: 'required' },
      'Validation': { advisory: 'light', supervised: 'required', autonomous: 'critical' },
      'Execution': { advisory: 'na', supervised: 'required', autonomous: 'critical' },
      'Observation': { advisory: 'light', supervised: 'required', autonomous: 'critical' },
      'Explanation': { advisory: 'optional', supervised: 'required', autonomous: 'critical' },
      'Control': { advisory: 'light', supervised: 'required', autonomous: 'critical' }
    };
    return matrix[layer][profile] || 'light';
  };

  const getApplicabilityStyle = (applicability) => {
    switch (applicability) {
      case 'critical': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', label: 'Critical' };
      case 'required': return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', label: 'Required' };
      case 'light': return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', label: 'Light' };
      case 'optional': return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300', label: 'Optional' };
      case 'na': return { bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-200', label: 'N/A' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300', label: '-' };
    }
  };

  const calculateProfile = () => {
    if (!assessments.autonomy || !assessments.irreversibility || !assessments.regulatory) {
      return null;
    }

    const levels = {
      autonomy: dimensions.autonomy.options.find(o => o.value === assessments.autonomy)?.level || 1,
      irreversibility: dimensions.irreversibility.options.find(o => o.value === assessments.irreversibility)?.level || 1,
      regulatory: dimensions.regulatory.options.find(o => o.value === assessments.regulatory)?.level || 1
    };

    const maxLevel = Math.max(levels.autonomy, levels.irreversibility, levels.regulatory);

    // The highest dimension sets the floor
    if (maxLevel === 3) return 'heavy';
    if (maxLevel === 2) return 'medium';
    return 'light';
  };

  const getProfileDetails = (profile) => {
    const profiles = {
      light: {
        title: 'Light Architecture',
        color: 'emerald',
        description: 'Basic tool-calling patterns with sensible error handling and logging. You can iterate quickly and add structure as you scale.',
        recommendations: [
          'Standard agent loop implementation',
          'Basic logging and error handling',
          'User-facing explanations for transparency',
          'Plan for scaling up as usage grows'
        ]
      },
      medium: {
        title: 'Medium Architecture',
        color: 'amber',
        description: 'Key layers required with standard implementations. The human approval gate provides a checkpoint, but you cannot skip architectural layers.',
        recommendations: [
          'Explicit approval workflows',
          'Validation before action',
          'Audit trails for all decisions',
          'Explanation layer for human reviewers'
        ]
      },
      heavy: {
        title: 'Heavy Architecture',
        color: 'red',
        description: 'Full eight-layer framework with robust implementations. Every layer is critical because there is no human in the loop to catch what the architecture misses.',
        recommendations: [
          'Robust implementation of all eight layers',
          'Defense in depth for security',
          'Complete audit and explanation capabilities',
          'Kill switches and circuit breakers',
          'Regular testing and validation'
        ]
      }
    };
    return profiles[profile];
  };

  const handleSelect = (dimension, value) => {
    setAssessments(prev => ({ ...prev, [dimension]: value }));
  };

  const canProceed = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) return assessments.autonomy !== null;
    if (currentStep === 2) return assessments.irreversibility !== null;
    if (currentStep === 3) return assessments.regulatory !== null;
    return true;
  };

  const renderIntro = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Architectural Profile Assessment</h3>
        <p className="text-slate-600 mb-4">
          This tool helps you determine the right architectural profile for your AI agent system
          in financial contexts. You'll assess three dimensions that determine how much
          infrastructure you need.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {Object.entries(dimensions).map(([key, dim]) => {
            const Icon = dim.icon;
            return (
              <div key={key} className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-5 h-5 text-slate-600" />
                  <span className="font-medium text-slate-700">{dim.title}</span>
                </div>
                <p className="text-sm text-slate-500">{dim.question}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              <strong>Key insight:</strong> The highest-scoring dimension sets your architectural floor.
              A single high-tier dimension can mandate the full framework, regardless of where other
              dimensions fall.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDimensionStep = (dimensionKey) => {
    const dim = dimensions[dimensionKey];
    const Icon = dim.icon;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Icon className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{dim.title}</h3>
            <p className="text-slate-600">{dim.question}</p>
          </div>
        </div>

        <div className="space-y-3">
          {dim.options.map((option) => {
            const isSelected = assessments[dimensionKey] === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleSelect(dimensionKey, option.value)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                        {option.title}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        option.level === 1 ? 'bg-emerald-100 text-emerald-700' :
                        option.level === 2 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        Level {option.level}
                      </span>
                    </div>
                    <p className={`text-sm mb-2 ${isSelected ? 'text-blue-600' : 'text-slate-600'}`}>
                      {option.description}
                    </p>
                    <p className={`text-xs italic ${isSelected ? 'text-blue-500' : 'text-slate-400'}`}>
                      Example: {option.example}
                    </p>
                    <div className="mt-3 space-y-1">
                      {option.indicators.map((indicator, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-500">
                          <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-blue-400' : 'bg-slate-300'}`} />
                          {indicator}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 ${
                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderResults = () => {
    const profile = calculateProfile();
    const profileDetails = getProfileDetails(profile);
    const autonomyValue = assessments.autonomy;

    const colorClasses = {
      emerald: { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-800', accent: 'bg-emerald-500' },
      amber: { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-800', accent: 'bg-amber-500' },
      red: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800', accent: 'bg-red-500' }
    };
    const colors = colorClasses[profileDetails.color];

    return (
      <div className="space-y-6">
        {/* Profile Result */}
        <div className={`${colors.bg} ${colors.border} border-2 rounded-xl p-6`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`${colors.accent} p-2 rounded-lg`}>
              <Layers className="w-6 h-6 text-white" />
            </div>
            <h3 className={`text-xl font-bold ${colors.text}`}>{profileDetails.title}</h3>
          </div>
          <p className={`${colors.text} opacity-90 mb-4`}>{profileDetails.description}</p>

          <div className="bg-white bg-opacity-60 rounded-lg p-4">
            <h4 className={`font-medium ${colors.text} mb-2`}>Key Recommendations:</h4>
            <ul className="space-y-1">
              {profileDetails.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className={`w-4 h-4 ${colors.text}`} />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Assessment Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="font-medium text-slate-700 mb-3">Your Assessment</h4>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(dimensions).map(([key, dim]) => {
              const selected = dim.options.find(o => o.value === assessments[key]);
              const Icon = dim.icon;
              return (
                <div key={key} className="text-center p-3 bg-slate-50 rounded-lg">
                  <Icon className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                  <div className="text-xs text-slate-500 mb-1">{dim.title}</div>
                  <div className={`text-sm font-medium px-2 py-1 rounded ${
                    selected?.level === 1 ? 'bg-emerald-100 text-emerald-700' :
                    selected?.level === 2 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selected?.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Layer Applicability Matrix */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="font-medium text-slate-700 mb-3">Layer Applicability for Your Profile</h4>
          <div className="space-y-2">
            {layers.map((layer) => {
              const applicability = getLayerApplicability(layer.name, autonomyValue);
              const style = getApplicabilityStyle(applicability);
              return (
                <div key={layer.name} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${style.bg} ${style.text} ${style.border} border w-20 text-center`}>
                    {style.label}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-700 text-sm">{layer.name}</div>
                    <div className="text-xs text-slate-500">{layer.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Constraint Areas */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
          <button
            onClick={() => setShowConstraints(!showConstraints)}
            className="flex items-center justify-between w-full"
          >
            <h4 className="font-medium text-slate-700">Refine with Constraint Areas</h4>
            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${showConstraints ? 'rotate-90' : ''}`} />
          </button>

          {showConstraints && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-slate-600 mb-3">
                These additional factors help identify where you might need extra attention within your profile.
              </p>
              {constraintAreas.map((area) => (
                <div key={area.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedConstraint(expandedConstraint === area.id ? null : area.id)}
                    className="w-full p-3 flex items-center justify-between hover:bg-slate-50"
                  >
                    <span className="font-medium text-slate-700 text-sm">{area.title}</span>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${expandedConstraint === area.id ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedConstraint === area.id && (
                    <div className="px-3 pb-3 border-t border-slate-100">
                      <p className="text-sm text-slate-600 mt-2 mb-2">{area.question}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-emerald-50 rounded border border-emerald-200">
                          <div className="font-medium text-emerald-700 mb-1">Lower concern:</div>
                          <div className="text-emerald-600">{area.low}</div>
                        </div>
                        <div className="p-2 bg-red-50 rounded border border-red-200">
                          <div className="font-medium text-red-700 mb-1">Higher concern:</div>
                          <div className="text-red-600">{area.high}</div>
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                        <strong>Implication:</strong> {area.implication}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            setAssessments({ autonomy: null, irreversibility: null, regulatory: null });
            setCurrentStep(0);
            setShowConstraints(false);
          }}
          className="w-full py-2 text-slate-600 hover:text-slate-800 text-sm"
        >
          ← Start Over
        </button>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderIntro();
      case 1: return renderDimensionStep('autonomy');
      case 2: return renderDimensionStep('irreversibility');
      case 3: return renderDimensionStep('regulatory');
      case 4: return renderResults();
      default: return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Architectural Profile Assessment</h2>
        <p className="text-slate-600 text-sm">Part 2: Dimensions That Scale Architectural Requirements</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                idx < currentStep
                  ? 'bg-emerald-500 text-white'
                  : idx === currentStep
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-200 text-slate-500'
              }`}>
                {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`text-xs mt-1 ${idx === currentStep ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
                {step.title}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${idx < currentStep ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Content */}
      <div className="mb-8">
        {renderCurrentStep()}
      </div>

      {/* Navigation */}
      {currentStep < 4 && (
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
            disabled={!canProceed()}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
              canProceed()
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {currentStep === 3 ? 'See Results' : 'Continue'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ArchitecturalAssessmentTool;
