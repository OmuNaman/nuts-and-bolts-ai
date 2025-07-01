// src/components/modules/cnn/components/CNNWorkflow.tsx
import { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, addEdge, Controls, Background, useNodesState, useEdgesState, Connection, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

import { MatrixNode } from '@/components/workflow/MatrixNode';
import { CalculationNode } from '@/components/workflow/CalculationNode';
import { ActivationNode } from '@/components/modules/neural-network/components/workflow/ActivationNode';
import { ConvolutionNode } from './workflow/ConvolutionNode';
import { MaxPoolingNode } from './workflow/MaxPoolingNode';

import { initialNodes as rawInitialNodes, initialEdges } from '../utils/workflowData';

const nodeTypes = {
  matrix: MatrixNode,
  calculation: CalculationNode,
  activation: ActivationNode,
  convolution: ConvolutionNode,
  maxPooling: MaxPoolingNode,
};

const nodeSequence = ['convolution', 'relu', 'pooling', 'flatten', 'dense'];

// --- UPDATE: Add isActive prop ---
function CNNWorkflowContent({ isActive }: { isActive: boolean }) {
  const [completedNodeIds, setCompletedNodeIds] = useState<Set<string>>(new Set());
  const reactFlowInstance = useReactFlow();
  const { isDark } = useTheme();

  const handleNodeComplete = useCallback((nodeId: string) => {
    setCompletedNodeIds(prev => new Set(prev).add(nodeId));
  }, []);

  const processedNodes = useMemo(() => {
    return rawInitialNodes.map(node => {
      if (!['convolution', 'activation', 'maxPooling', 'calculation'].includes(node.type as string)) {
        return node;
      }
      
      // --- UPDATE: Check isActive prop ---
      if (!isActive) {
        return { ...node, data: { ...node.data, onComplete: handleNodeComplete, disabled: true } };
      }

      let disabled = true;
      const nodeIndex = nodeSequence.indexOf(node.id);

      if (nodeIndex === 0) {
        disabled = false;
      } else if (nodeIndex > 0) {
        const prevNodeId = nodeSequence[nodeIndex - 1];
        disabled = !completedNodeIds.has(prevNodeId);
      }
      
      return { ...node, data: { ...node.data, onComplete: handleNodeComplete, disabled } };
    });
    // --- UPDATE: Add isActive to dependency array ---
  }, [completedNodeIds, handleNodeComplete, isActive]);

  const [nodes, setNodes, onNodesChange] = useNodesState(processedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: Connection) => setEdges(eds => addEdge(params, eds)), [setEdges]);

  const resetWorkflow = () => {
    setCompletedNodeIds(new Set());
  };
  
  useEffect(() => {
    setNodes(processedNodes);
  }, [processedNodes, setNodes]);

  useEffect(() => {
    if (!isActive) return;

    const lastCompleted = nodeSequence.slice().reverse().find(id => completedNodeIds.has(id));
    const nextNodeIndex = lastCompleted ? nodeSequence.indexOf(lastCompleted) + 1 : 0;
    
    if (nextNodeIndex < nodeSequence.length) {
      const nextNodeId = nodeSequence[nextNodeIndex];
      setTimeout(() => {
        reactFlowInstance.fitView({
          nodes: [{ id: nextNodeId }],
          duration: 800,
          padding: 0.2
        });
      }, 500);
    }
  }, [completedNodeIds, reactFlowInstance, isActive]);

  return (
    <div className="h-full w-full relative">
      <div className="absolute top-4 right-4 z-10">
        <Button onClick={resetWorkflow} variant="outline" size="sm" className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> Reset Workflow
        </Button>
      </div>
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
  );
}

// --- UPDATE: Pass isActive prop through here ---
export function CNNWorkflow({ isActive }: { isActive: boolean }) {
  return (
    <ReactFlowProvider>
      <CNNWorkflowContent isActive={isActive} />
    </ReactFlowProvider>
  );
}