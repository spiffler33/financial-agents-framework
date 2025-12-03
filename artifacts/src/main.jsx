import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import AgentLoopVisualizer from './AgentLoopVisuslier_S1_1.jsx'
import CharacteristicExplorer from './CharacteristicExplorer_S1_2.jsx'
import TradeLifecycleVisualizer from './TradeLifecycleVisualizer_S1_3.jsx'
import ArchitecturalAssessmentTool from './ArchitecturalAssessmentTool.jsx'

function App() {
  const [activeArtifact, setActiveArtifact] = useState('agent-loop')

  const artifacts = {
    'agent-loop': { name: '1.1 Agent Loop', component: AgentLoopVisualizer },
    'characteristics': { name: '1.2 Characteristics', component: CharacteristicExplorer },
    'trade-lifecycle': { name: '1.3 Trade Lifecycle', component: TradeLifecycleVisualizer },
    'assessment': { name: '2. Assessment Tool', component: ArchitecturalAssessmentTool },
  }

  const ActiveComponent = artifacts[activeArtifact].component

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Artifact Selector */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <span className="text-slate-400 text-sm">Select Artifact:</span>
          <div className="flex gap-2">
            {Object.entries(artifacts).map(([key, { name }]) => (
              <button
                key={key}
                onClick={() => setActiveArtifact(key)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  activeArtifact === key
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Artifact */}
      <ActiveComponent />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
