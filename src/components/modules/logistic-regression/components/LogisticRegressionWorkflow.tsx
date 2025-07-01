// src/components/modules/logistic-regression/components/LogisticRegressionWorkflow.tsx
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
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { MatrixNode } from '@/components/workflow/MatrixNode';
import { CalculationNode } from '@/components/workflow/CalculationNode';
import { IntroNode } from './workflow/IntroNode';

import { initialNodes as rawInitialNodes, initialEdges } from '../utils/workflowData';

const nodeTypes = {
  matrix: MatrixNode,
  calculation: CalculationNode,
  introNode: IntroNode,
};

// Define the sequence of nodes for the logistic regression workflow
const ALL_STEP_NODES = [
  'intro-logistic-regression',
  'linear-calc',
  'sigmoid-calc',
  'loss-calc',
  'grad-weights-calc',
  'grad-bias-calc',
  'update-weights',
  'update-bias'
];

function LogisticRegressionWorkflowContent() {
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
        case 'intro-logistic-regression':
          // This node is special; it's "completed" by clicking the modal button.
          // It should be disabled after it's been completed.
          disabled = completedNodeIds.has('intro-logistic-regression');
          break;
        case 'linear-calc':
          disabled = !completedNodeIds.has('intro-logistic-regression');
          break;
        case 'sigmoid-calc':
          disabled = !completedNodeIds.has('linear-calc');
          break;
        case 'loss-calc':
          disabled = !completedNodeIds.has('sigmoid-calc');
          break;
        case 'grad-weights-calc':
        case 'grad-bias-calc':
          disabled = !completedNodeIds.has('loss-calc');
          break;
        case 'update-weights':
          disabled = !completedNodeIds.has('grad-weights-calc');
          break;
        case 'update-bias':
          disabled = !completedNodeIds.has('grad-bias-calc');
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
    if (!completedNodeIds.has('intro-logistic-regression')) {
       handleNodeComplete('intro-logistic-regression');
    }
  };

  const resetWorkflow = () => {
    setCompletedNodeIds(new Set());
    setShowIntroModal(true);
    setTimeout(() => {
        reactFlowInstance.fitView({
            nodes: [{ id: 'intro-logistic-regression' }],
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
        nodes: [{ id: 'intro-logistic-regression' }],
        duration: 800,
        padding: 0.2
      });
    }
  }, [showIntroModal, reactFlowInstance]);

  useEffect(() => {
    const lastCompleted = Array.from(completedNodeIds).pop();

    const focusMap: { [key: string]: string[] } = {
      'intro-logistic-regression': ['linear-calc'],
      'linear-calc': ['sigmoid-calc'],
      'sigmoid-calc': ['loss-calc'],
      'loss-calc': ['grad-weights-calc', 'grad-bias-calc'],
      'grad-weights-calc': ['update-weights'],
      'grad-bias-calc': ['update-bias'],
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
              <span className="text-purple-500">📊</span>
              Welcome to Logistic Regression Lab!
            </DialogTitle>
            <DialogDescription className="pt-2 text-base">
              Explore a complete logistic regression training cycle: linear combination, sigmoid activation, loss, and parameter updates.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-sm text-muted-foreground">
            <p>In this lab, we'll use <strong>student features</strong> (exam scores) to predict <strong>admission probability</strong> (0 or 1).</p>
            <p>You'll see how a logistic model makes classifications and how gradient descent updates the model parameters to minimize loss.</p>
            <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-purple-400 font-medium">🎯 Your Mission:</p>
              <p className="text-sm">Work through the workflow to train a logistic regression model on student admission data!</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleIntroComplete} className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
              Let's Begin! 🚀
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="absolute top-4 right-4 z-50 flex items-center gap-4 p-2 px-4 backdrop-blur-md rounded-lg shadow-md bg-opacity-80 border border-opacity-20 transition-colors duration-300 ${isDark ? 'bg-slate-800/50 border-slate-700/30' : 'bg-white/70 border-slate-300/40'}">
        <div className="text-sm text-muted-foreground">
          Progress: {completedNodeIds.size > 0 ? completedNodeIds.size - 1 : 0}/{ALL_STEP_NODES.length - 1} steps
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

export function LogisticRegressionWorkflow() {
  return (
    <ReactFlowProvider>
      <LogisticRegressionWorkflowContent />
    </ReactFlowProvider>
  );
}
