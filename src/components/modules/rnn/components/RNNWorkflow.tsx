// src/components/modules/rnn/components/RNNWorkflow.tsx
import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  ReactFlowProvider,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { RotateCcw, Cpu } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { WordVectorNode } from './workflow/WordVectorNode';
import { MatrixNode } from '@/components/workflow/MatrixNode';
import { CalculationNode } from '@/components/workflow/CalculationNode';
import { ActivationNode } from './workflow/ActivationNode';
import { IntroNode } from './workflow/IntroNode';

import { initialNodes as rawInitialNodes, initialEdges } from '../utils/workflowData';

const nodeTypes = {
  wordVector: WordVectorNode,
  matrix: MatrixNode,
  calculation: CalculationNode,
  activation: ActivationNode,
  introNode: IntroNode,
};

// Define the sequence of nodes for 2 timesteps + backward propagation
const ALL_TIMESTEP_NODES = [
  'intro-rnn',
  // Forward Pass - Timestep 1
  't1_calc_h', 't1_calc_y', 't1_pred',
  // Forward Pass - Timestep 2  
  't2_calc_h', 't2_calc_y', 't2_pred',
  // Backward Pass
  'loss_calculation', 'grad_pred1', 'grad_pred2', 'grad_y1', 'grad_y2', 
  'grad_h2', 'grad_h1', 'grad_why', 'grad_by', 'grad_wxh', 'grad_whh', 'grad_bh'
];

function RNNWorkflowContent() {
  const [completedNodeIds, setCompletedNodeIds] = useState<Set<string>>(new Set());
  const [showIntroModal, setShowIntroModal] = useState(true);
  const reactFlowInstance = useReactFlow();
  const { isDark } = useTheme();

  const handleNodeComplete = useCallback((nodeId: string) => {
    setCompletedNodeIds(prev => new Set(prev).add(nodeId));
  }, []);

  const processedNodes = useMemo(() => {
    return rawInitialNodes.map(node => {
      // Static nodes are never interactive from a workflow perspective.
      // The 'disabled' prop is only relevant for calculation, activation, and intro nodes.
      if (node.type !== 'calculation' && node.type !== 'activation' && node.type !== 'introNode') {
          return node;
      }
      
      let disabled = true;

      // A node is disabled if its predecessor is NOT complete.
      switch (node.id) {
        case 'intro-rnn':
          // This node is special; it's "completed" by clicking the modal button.
          // It should be disabled after it's been completed.
          disabled = completedNodeIds.has('intro-rnn');
          break;
        case 't1_calc_h':
          disabled = !completedNodeIds.has('intro-rnn');
          break;
        case 't1_calc_y':
          disabled = !completedNodeIds.has('t1_calc_h');
          break;
        case 't1_pred':
          disabled = !completedNodeIds.has('t1_calc_y');
          break;
        case 't2_calc_h':
          disabled = !completedNodeIds.has('t1_pred');
          break;
        case 't2_calc_y':
          disabled = !completedNodeIds.has('t2_calc_h');
          break;
        case 't2_pred':
          disabled = !completedNodeIds.has('t2_calc_y');
          break;
        case 'loss_calculation':
          disabled = !completedNodeIds.has('t2_pred');
          break;
        case 'grad_pred1':
        case 'grad_pred2':
          disabled = !completedNodeIds.has('loss_calculation');
          break;
        case 'grad_y1':
          disabled = !completedNodeIds.has('grad_pred1');
          break;
        case 'grad_y2':
          disabled = !completedNodeIds.has('grad_pred2');
          break;
        case 'grad_h2':
          disabled = !completedNodeIds.has('grad_y2');
          break;
        case 'grad_h1':
          disabled = !completedNodeIds.has('grad_y1') || !completedNodeIds.has('grad_h2');
          break;
        case 'grad_why':
        case 'grad_by':
        case 'grad_wxh':
        case 'grad_whh':
        case 'grad_bh':
          disabled = !completedNodeIds.has('grad_h1');
          break;
      }
      
      return { ...node, data: { ...node.data, onComplete: handleNodeComplete, disabled } };
    });
  }, [completedNodeIds, handleNodeComplete]);

  const [nodes, setNodes, onNodesChange] = useNodesState(processedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  
  const handleIntroComplete = () => {
    setShowIntroModal(false);
    if (!completedNodeIds.has('intro-rnn')) {
       handleNodeComplete('intro-rnn');
    }
  };

  const resetWorkflow = () => {
    setCompletedNodeIds(new Set());
    setShowIntroModal(true);
    setTimeout(() => {
        reactFlowInstance.fitView({
            nodes: [{ id: 'intro-rnn' }],
            duration: 800,
            padding: 0.2
        });
    }, 100);
  };

  useEffect(() => {
    setNodes(processedNodes);
  }, [processedNodes, setNodes]);

  useEffect(() => {
    if (showIntroModal) {
      reactFlowInstance.fitView({
        nodes: [{ id: 'intro-rnn' }],
        duration: 800,
        padding: 0.2
      });
    }
  }, [showIntroModal, reactFlowInstance]);

  useEffect(() => {
    const lastCompleted = Array.from(completedNodeIds).pop();

    const focusMap: { [key: string]: string[] } = {
      'intro-rnn': ['t1_calc_h'],
      't1_calc_h': ['t1_calc_y'],
      't1_calc_y': ['t1_pred'],
      't1_pred': ['t2_calc_h'],
      't2_calc_h': ['t2_calc_y'],
      't2_calc_y': ['t2_pred'],
      't2_pred': ['loss_calculation'],
      'loss_calculation': ['grad_pred1', 'grad_pred2'],
      'grad_pred2': ['grad_y2'],
      'grad_y1': ['grad_h1'],
      'grad_h2': ['grad_h1'],
      'grad_h1': ['grad_why', 'grad_wxh', 'grad_whh', 'grad_bh']
    };

    if (lastCompleted && focusMap[lastCompleted]) {
      setTimeout(() => {
        reactFlowInstance.fitView({
          nodes: focusMap[lastCompleted].map(id => ({ id })),
          duration: 1000,
          padding: 0.3
        });
      }, 500);
    }
  }, [completedNodeIds, reactFlowInstance]);

  return (
    <div className={`h-screen w-full flex flex-col transition-colors duration-300 relative overflow-hidden ${
       isDark ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
    }`}>
      <Dialog open={showIntroModal} onOpenChange={setShowIntroModal}>
        <DialogContent className="sm:max-w-[550px] bg-background/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Cpu className="text-purple-500" />
              Welcome to the Simplified RNN Lab!
            </DialogTitle>
            <DialogDescription className="pt-2 text-base">
              Explore a complete RNN training cycle: Forward + Backward Pass.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-sm text-muted-foreground">
            <p>We'll process the sequence <span className="font-bold text-lg text-orange-400 font-mono">"A" → "B"</span> character by character. Then calculate gradients through <strong>Backward Propagation</strong>.</p>
            <p>Notice the <strong>same weight matrices</strong> are used at each timestep, and how gradients flow backward through time.</p>
            <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-purple-400 font-medium">🎯 Your Mission:</p>
              <p className="text-sm">Complete the forward pass, then compute gradients through backpropagation to understand how RNNs learn!</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleIntroComplete} className="w-full">
              Let's Begin! 🚀
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>      <div className="absolute top-4 right-4 z-50 flex items-center gap-4 p-2 px-4 backdrop-blur-md rounded-lg shadow-md bg-opacity-80 border border-opacity-20 transition-colors duration-300 ${
        isDark ? 'bg-slate-800/50 border-slate-700/30' : 'bg-white/70 border-slate-300/40'
      }">
          <div className="text-sm text-muted-foreground">
            Progress: {completedNodeIds.size > 0 ? completedNodeIds.size - 1 : 0}/{ALL_TIMESTEP_NODES.length - 1} nodes
          </div>
          <Button onClick={resetWorkflow} variant="outline" size="sm" className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
        </div>

      <div className="flex-grow w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background gap={32} size={1.5} color={isDark ? '#334155' : '#cbd5e1'} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export function RNNWorkflow() {
  return (
    <ReactFlowProvider>
      <RNNWorkflowContent />
    </ReactFlowProvider>
  );
}
