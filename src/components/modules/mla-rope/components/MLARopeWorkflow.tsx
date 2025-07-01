// src/components/modules/mla-rope/components/MLARopeWorkflow.tsx
import { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, addEdge, Controls, Background, useNodesState, useEdgesState, Connection, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

import { MatrixNode } from '@/components/workflow/MatrixNode';
import { CalculationNode } from '@/components/workflow/CalculationNode';
// import { ConcatNode } from './workflow/ConcatNode'; // REMOVED

import { initialNodes as rawInitialNodes, initialEdges } from '../utils/workflowData';

// --- UPDATED: ConcatNode is no longer a custom type ---
const nodeTypes = {
  matrix: MatrixNode,
  calculation: CalculationNode,
  // concat: ConcatNode, // REMOVED
};

export function MLARopeWorkflowContent({ isActive }: { isActive: boolean }) {
  const [completedNodeIds, setCompletedNodeIds] = useState<Set<string>>(new Set());
  const { isDark } = useTheme();

  const handleNodeComplete = useCallback((nodeId: string) => {
    setCompletedNodeIds(prev => new Set(prev).add(nodeId));
  }, []);

  const processedNodes = useMemo(() => {
    return rawInitialNodes.map(node => {
      // The logic now correctly handles 'concat_q' and 'concat_k' as calculation nodes.
      if (node.type !== 'calculation') {
        // For non-calculation nodes, just handle the global isActive flag
        return { ...node, data: { ...node.data, onComplete: handleNodeComplete, disabled: !isActive } };
      }

      if (!isActive) {
        return { ...node, data: { ...node.data, onComplete: handleNodeComplete, disabled: true } };
      }

      let disabled = true;
      switch (node.id) {
        case 'calc_c_q':
        case 'calc_c_kv':
          disabled = false;
          break;
        case 'calc_q_content':
        case 'calc_q_rope_pre':
          disabled = !completedNodeIds.has('calc_c_q');
          break;
        case 'calc_k_content':
        case 'calc_v_final':
          disabled = !completedNodeIds.has('calc_c_kv');
          break;
        case 'apply_rope_q':
          disabled = !completedNodeIds.has('calc_q_rope_pre');
          break;
        case 'apply_rope_k':
          disabled = !completedNodeIds.has('calc_k_rope_pre');
          break;
        // --- UPDATED: Logic for concat nodes ---
        case 'concat_q':
          disabled = !(completedNodeIds.has('calc_q_content') && completedNodeIds.has('apply_rope_q'));
          break;
        case 'concat_k':
          disabled = !(completedNodeIds.has('calc_k_content') && completedNodeIds.has('apply_rope_k'));
          break;
        // --- End of updated logic ---
        case 'attention-calc':
          disabled = !(completedNodeIds.has('concat_q') && completedNodeIds.has('concat_k') && completedNodeIds.has('calc_v_final'));
          break;
      }
      return { ...node, data: { ...node.data, onComplete: handleNodeComplete, disabled } };
    });
  }, [completedNodeIds, handleNodeComplete, isActive]);

  const [nodes, setNodes, onNodesChange] = useNodesState(processedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback((params: Connection) => setEdges(eds => addEdge(params, eds)), [setEdges]);

  const resetWorkflow = () => setCompletedNodeIds(new Set());

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

export function MLARopeWorkflow({ isActive }: { isActive: boolean }) {
  return (
    <ReactFlowProvider>
      <MLARopeWorkflowContent isActive={isActive} />
    </ReactFlowProvider>
  );
}