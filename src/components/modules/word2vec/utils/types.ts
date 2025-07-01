// src/components/modules/word2vec/utils/types.ts

export type NodeType = 
  | 'matrix' 
  | 'calculation' 
  | 'activation' 
  | 'wordVector' 
  | 'context' 
  | 'results';

export interface NodeData {
  label: string;
  description?: string;
  disabled?: boolean;
  onComplete?: (nodeId: string) => void;
}

export interface MatrixNodeData extends NodeData {
  matrix: number[][];
}

export interface CalculationNodeData extends NodeData {
  formula: string;
  expectedMatrix: number[][];
  hint: string;
}

export interface ActivationNodeData extends CalculationNodeData {
  vocabulary?: string[];
  highlightMax?: boolean;
}

export interface WordVectorNodeData extends NodeData {
  matrix: number[][];
  vocabulary?: string[];
}

export interface ContextNodeData extends NodeData {
  sentence: string;
  targetWord: string;
  contextWords: string[];
}

export interface ResultsNodeData extends NodeData {
  onExplore?: () => void;
}
