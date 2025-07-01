// src/components/modules/multi-head-latent-attention/components/MLAWorkflow.tsx
import { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, addEdge, Controls, Background, useNodesState, useEdgesState, Connection, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

import { MatrixNode } from '@/components/workflow/MatrixNode';
import { CalculationNode } from '@/components/workflow/CalculationNode';
// REMOVED: import { AttentionSummaryNode } from './workflow/AttentionSummaryNode'; 

import { initialNodes as rawInitialNodes, initialEdges } from '../utils/workflowData';

const nodeTypes = {
  matrix: MatrixNode,
  calculation: CalculationNode,
  // REMOVED: attentionSummary: AttentionSummaryNode, // This node type is no longer needed
};

const nodeSequence = ['calc_q', 'calc_c_kv', 'calc_k', 'calc_v', 'attention-summary'];

export function MLAWorkflowContent({ isActive }: { isActive: boolean }) {
  const [completedNodeIds, setCompletedNodeIds] = useState<Set<string>>(new Set());
  const reactFlowInstance = useReactFlow();
  const { isDark } = useTheme();

  const handleNodeComplete = useCallback((nodeId: string) => {
    setCompletedNodeIds(prev => new Set(prev).add(nodeId));
  }, []);

  const processedNodes = useMemo(() => {
    return rawInitialNodes.map(node => {
      // The 'attentionSummary' type has been changed to 'calculation' in workflowData.ts
      // So now we just check for 'calculation' type here.
      const isInteractive = node.type === 'calculation'; 
      if (!isInteractive) return node;
      
      if (!isActive) {
        return { ...node, data: { ...node.data, onComplete: handleNodeComplete, disabled: true } };
      }
      
      let disabled = true;
      if (node.id === 'calc_q' || node.id === 'calc_c_kv') {
        disabled = false;
      } else if (node.id === 'calc_k' || node.id === 'calc_v') {
        disabled = !completedNodeIds.has('calc_c_kv');
      } else if (node.id === 'attention-summary') { // This logic correctly gates the 'attention-summary' node
        disabled = !(completedNodeIds.has('calc_q') && completedNodeIds.has('calc_k') && completedNodeIds.has('calc_v'));
      }
      
      return { ...node, data: { ...node.data, onComplete: handleNodeComplete, disabled } };
    });
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

  return (
    <div className="h-full w-full relative">
      <div className="absolute top-4 right-4 z-10">
        <Button onClick={resetWorkflow} variant="outline" size="sm" className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> Reset
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

export function MLAWorkflow({ isActive }: { isActive: boolean }) {
  return (
    <ReactFlowProvider>
      <MLAWorkflowContent isActive={isActive} />
    </ReactFlowProvider>
  );
}