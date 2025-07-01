// src/components/modules/word2vec/components/Word2VecModule.tsx
import { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, addEdge, Controls, Background, useNodesState, useEdgesState, Connection, MiniMap } from '@xyflow/react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import '@xyflow/react/dist/style.css';
import '@/App.css';

// Import node components
import { MatrixNode } from './workflow/MatrixNode';
import { CalculationNode } from './workflow/CalculationNode';
import { ActivationNode } from './workflow/ActivationNode';
import { WordVectorNode } from './workflow/WordVectorNode';
import { ContextNode } from './workflow/ContextNode';
import { ResultsNode } from './workflow/ResultsNode';
import { SemanticSpaceModal } from './workflow/SemanticSpaceModal';

// Import data
import { initialNodes as rawInitialNodes, initialEdges } from '../utils/workflowData';

// Node type registry for ReactFlow
const nodeTypes = {
  matrix: MatrixNode,
  calculation: CalculationNode,
  activation: ActivationNode,
  wordVector: WordVectorNode,
  context: ContextNode,
  results: ResultsNode,
};

export default function Word2VecModule() {
  // Track completed nodes
  const [completedNodeIds, setCompletedNodeIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleNodeComplete = useCallback((nodeId: string) => {
    setCompletedNodeIds(prev => new Set(prev).add(nodeId));
  }, []);

  // Process nodes to manage node states
  const processedNodes = useMemo(() => {
    const initialCompleted = new Set(['intro-context', 'context-cat', 'context-on', 'w1-matrix', 'w2-matrix', 'y-true']);
    const allCompleted = new Set([...initialCompleted, ...completedNodeIds]);

    return rawInitialNodes.map(node => {
      if (node.type === 'results') {
        const isDisabled = !(allCompleted.has('w1-new'));
        return { ...node, data: { ...node.data, onExplore: () => setIsModalOpen(true), disabled: isDisabled }};
      }
      if (node.type !== 'calculation' && node.type !== 'activation') {
        return { ...node, data: { ...node.data, disabled: false } };
      }

      let disabled = true;
      switch(node.id) {
        case 'calc-x': disabled = !(allCompleted.has('context-cat') && allCompleted.has('context-on')); break;
        case 'calc-h': disabled = !allCompleted.has('calc-x'); break;
        case 'calc-z': disabled = !allCompleted.has('calc-h'); break;
        case 'activate-y-pred': disabled = !allCompleted.has('calc-z'); break;
        case 'calc-loss': disabled = !allCompleted.has('activate-y-pred'); break;
        case 'calc-dz': disabled = !allCompleted.has('calc-loss'); break;
        case 'calc-dw2': disabled = !allCompleted.has('calc-dz'); break;
        case 'calc-dh': disabled = !allCompleted.has('calc-dz'); break;
        case 'calc-dw1': disabled = !allCompleted.has('calc-dh'); break;
        case 'w1-new': disabled = !allCompleted.has('calc-dw1'); break;
        case 'w2-new': disabled = !allCompleted.has('calc-dw2'); break;
        default: disabled = true; break;
      }

      return { ...node, data: { ...node.data, onComplete: handleNodeComplete, disabled: disabled } };
    });
  }, [completedNodeIds, handleNodeComplete]);

  // Set up ReactFlow states
  const [nodes, setNodes, onNodesChange] = useNodesState(processedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const resetWorkflow = () => {
    setCompletedNodeIds(new Set());
    setIsModalOpen(false);
  };
  
  // Update nodes when dependencies change
  useEffect(() => { 
    setNodes(processedNodes); 
  }, [processedNodes, setNodes]);

  const onConnect = useCallback((params: Connection) => 
    setEdges((eds) => addEdge(params, eds)), [setEdges]);  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  return (
    <div className={`h-screen w-full flex flex-col transition-colors duration-300 relative overflow-hidden ${
      isDark ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Header */}
      <div className={`shrink-0 sticky top-4 mx-4 z-50 flex items-center justify-between backdrop-blur-md shadow-lg rounded-lg p-4 transition-colors duration-300 ${
        isDark ? 'bg-slate-800/70 border-slate-700/50' : 'bg-white/80 border-slate-300/60'
      }`}>
        <div className="flex items-center gap-4">
          <img 
            src="/Vizlogo.png" 
            alt="Vizuara AI Labs" 
            className="h-8 cursor-pointer" 
            onClick={() => navigate("/")}
          />
          <h1 
            className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          >
            Word2Vec (CBOW)
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={resetWorkflow} variant="outline" size="sm" className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
          <ThemeToggle />
        </div>
      </div>

      {/* Main content with ReactFlow */}
      <div className="flex-grow m-4 mt-2" style={{ height: 'calc(100vh - 6rem)' }}>
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange} 
          onEdgesChange={onEdgesChange} 
          onConnect={onConnect} 
          nodeTypes={nodeTypes} 
          fitView          className={`workflow-canvas rounded-lg border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
          style={{ width: '100%', height: '100%' }}
        >
          <Background gap={24} size={1.5} color={isDark ? '#334155' : '#cbd5e1'} />
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              if (node.type === 'matrix') return '#3b82f6';
              if (node.type === 'calculation') return '#8b5cf6';
              if (node.type === 'activation') return '#f59e0b';
              if (node.type === 'wordVector') return '#10b981';
              if (node.type === 'context') return '#ec4899';
              if (node.type === 'results') return '#06b6d4';
              return '#6b7280';
            }}            style={{
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(241, 245, 249, 0.8)',
              border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
              borderRadius: '0.375rem',
            }}
            maskColor={isDark ? "rgba(30, 41, 59, 0.7)" : "rgba(226, 232, 240, 0.7)"}
          />
        </ReactFlow>
      </div>
      <SemanticSpaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
