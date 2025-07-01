// src/components/modules/mla-query-compression/components/MlaQueryCompressionWorkflow.tsx
import { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, addEdge, Controls, Background, useNodesState, useEdgesState, Connection, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

import { MatrixNode } from '@/components/workflow/MatrixNode';
import { CalculationNode } from '@/components/workflow/CalculationNode';
// REMOVED: import { AttentionSummaryNode } from './workflow/AttentionSummaryNode'; // This is no longer needed

import { initialNodes as rawInitialNodes, initialEdges } from '../utils/workflowData';
import { calculateExpected } from '../utils/mlaQcCalculations';

// --- UPDATED: Define the nodeTypes object to remove AttentionSummaryNode ---
const nodeTypes = {
  matrix: MatrixNode,
  calculation: CalculationNode,
  // REMOVED: attentionSummary: AttentionSummaryNode, // This node type is removed
};

// Node sequence remains the same for disabling logic
const nodeSequence = ['calc_c_q', 'calc_c_kv', 'calc_q_recon', 'calc_k_recon', 'calc_v_recon', 'attention-summary'];

export function MlaQueryCompressionWorkflowContent({ isActive }: { isActive: boolean }) {
  const [completedNodeIds, setCompletedNodeIds] = useState<Set<string>>(new Set());
  const reactFlowInstance = useReactFlow();
  const { isDark } = useTheme();

  const handleNodeComplete = useCallback((nodeId: string) => {
    setCompletedNodeIds(prev => new Set(prev).add(nodeId));
  }, []);

  const processedNodes = useMemo(() => {
    return rawInitialNodes.map(node => {
      // The 'attentionSummary' type has been changed to 'calculation' in workflowData.ts,
      // so now we only check for 'calculation' type for interactive nodes.
      const isInteractive = node.type === 'calculation';
      if (!isInteractive) return node;
      
      // If the workflow is not active, all interactive nodes should be disabled.
      if (!isActive) {
        return { ...node, data: { ...node.data, onComplete: handleNodeComplete, disabled: true } };
      }
      
      let disabled = true;
      // Logic for enabling nodes based on completion of previous steps
      switch(node.id) {
        case 'calc_c_q':
        case 'calc_c_kv':
          disabled = false; // These are the starting interactive nodes
          break;
        case 'calc_q_recon':
          disabled = !completedNodeIds.has('calc_c_q');
          break;
        case 'calc_k_recon':
        case 'calc_v_recon':
          disabled = !completedNodeIds.has('calc_c_kv');
          break;
        case 'attention-summary': // This is now a 'calculation' type node
          disabled = !(completedNodeIds.has('calc_q_recon') && completedNodeIds.has('calc_k_recon') && completedNodeIds.has('calc_v_recon'));
          break;
        default:
          disabled = true; // Default for any other unexpected interactive node
      }
      
      // For calculation nodes, ensure 'expectedMatrix' is correctly passed
      // (The workflowData.ts already provides this for 'calculation' types)
      // and ensure 'onComplete' and 'disabled' props are set.
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
    // This effect ensures the nodes are updated when processedNodes changes
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

export function MlaQueryCompressionWorkflow({ isActive }: { isActive: boolean }) {
  return (
    <ReactFlowProvider>
      <MlaQueryCompressionWorkflowContent isActive={isActive} />
    </ReactFlowProvider>
  );
}