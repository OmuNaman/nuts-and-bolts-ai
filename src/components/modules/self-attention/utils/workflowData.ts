// FILE: src/components/modules/self-attention/utils/workflowData.ts
import { Node, Edge } from '@xyflow/react';
import { 
  INPUT_MATRIX, 
  WQ_MATRIX, 
  WK_MATRIX, 
  WV_MATRIX, 
  calculateExpected 
} from './matrixCalculations';

// Approximate heights based on new matrix sizes and content
// These are for planning, the actual render will determine exact size.
// We'll use these to guide the y-coordinate settings.
const NODE_VERTICAL_GAP = 150; // Increased gap

// Estimated heights for planning node positions
// MatrixNode with 5 rows (like Input): ~280-320px
// MatrixNode with 8 rows (like Wq, Wk, Wv): ~400-450px
// CalculationNode with 5-row output (like Q, K, V, Scores, Softmax, Output): ~450-500px
// CalculationNode with 4-row output (like K^T): ~420-470px

let currentY_col1 = 50;
const inputMatrixHeight = 300; // Estimate for Input Matrix (5 rows)
const weightMatrixHeight = 420; // Estimate for Wq, Wk, Wv (8 rows)

const calcNode5RowHeight = 480; // Estimate for Q, K, V, Scores, Softmax, Output
const calcNode4RowHeight = 450; // Estimate for K^T

export const initialNodes: Node[] = [
  // --- Column 1: Inputs ---
  {
    id: 'input-matrix',
    type: 'matrix',
    position: { x: 100, y: currentY_col1 },
    data: {
      label: 'Input Matrix',
      matrix: INPUT_MATRIX,
      description: 'Token embeddings (5×8)',
      isInput: true,
    },
  },
  {
    id: 'wq-matrix',
    type: 'matrix',
    position: { x: 100, y: (currentY_col1 += inputMatrixHeight + NODE_VERTICAL_GAP) }, // 50 + 300 + 150 = 500
    data: {
      label: 'Weight Query (Wq)',
      matrix: WQ_MATRIX,
      description: 'Query weight matrix (8×4)',
      isInput: true,
    },
  },
  {
    id: 'wk-matrix',
    type: 'matrix',
    position: { x: 100, y: (currentY_col1 += weightMatrixHeight + NODE_VERTICAL_GAP) }, // 500 + 420 + 150 = 1070
    data: {
      label: 'Weight Key (Wk)',
      matrix: WK_MATRIX,
      description: 'Key weight matrix (8×4)',
      isInput: true,
    },
  },
  {
    id: 'wv-matrix',
    type: 'matrix',
    position: { x: 100, y: (currentY_col1 += weightMatrixHeight + NODE_VERTICAL_GAP) }, // 1070 + 420 + 150 = 1640
    data: {
      label: 'Weight Value (Wv)',
      matrix: WV_MATRIX,
      description: 'Value weight matrix (8×4)',
      isInput: true,
    },
  },

  // --- Column 2: Q, K, V Calculations ---
  // Position Q relative to its inputs (Input & Wq)
  {
    id: 'calc-q',
    type: 'calculation',
    position: { x: 1050, y: 250 }, // Adjusted to vertically center somewhat with Input and Wq
    data: {
      label: 'Calculate Q',
      formula: 'Q = Input × Wq',
      description: 'Query matrix calculation (5×4)',
      expectedMatrix: calculateExpected('q'),
      hint: 'Multiply each row of Input (5×8) with each column of Wq (8×4). For Q₁₁ (first cell): (1×10) + (0×10) + (0×10) + (0×0) + (0×0) + (0×0) + (0×0) + (0×0) = 10',
    },
  },
  // Position K relative to its inputs (Input & Wk)
  {
    id: 'calc-k',
    type: 'calculation',
    position: { x: 650, y: 250 + calcNode5RowHeight + NODE_VERTICAL_GAP + 50 }, // 250 + 480 + 150 + 50 = 930
    data: {
      label: 'Calculate K',
      formula: 'K = Input × Wk',
      description: 'Key matrix calculation (5×4)',
      expectedMatrix: calculateExpected('k'),
      hint: 'Similar to Q calculation, but using Wk weights. For K₁₁ (first cell): (1×2) + (0×2) + (0×2) + (0×0) + (0×0) + (0×0) + (0×0) + (0×0) = 2',
    },
  },
  // Position V relative to its inputs (Input & Wv)
  {
    id: 'calc-v',
    type: 'calculation',
    position: { x: 1550, y: 930 + calcNode5RowHeight + NODE_VERTICAL_GAP + 50 }, // 930 + 480 + 150 + 50 = 1610
    data: {
      label: 'Calculate V',
      formula: 'V = Input × Wv',
      description: 'Value matrix calculation (5×4)',
      expectedMatrix: calculateExpected('v'),
      hint: 'Use Wv weights for this calculation. For V₁₁ (first cell): (1×1) + (0×0) + (0×0) + (0×0) + (0×0) + (0×0) + (0×0) + (0×0) = 1',
    },
  },

  // --- Column 3: K Transpose ---
  {
    id: 'calc-kt',
    type: 'calculation',
    position: { x: 1200, y: 930 }, // Align with calc-k
    data: {
      label: 'Transpose K',
      formula: 'K^T = transpose(K)',
      description: 'Transpose the Key matrix (4×5)',
      expectedMatrix: calculateExpected('k')[0].map((_, i) => calculateExpected('k').map(row => row[i])),
      hint: 'Flip rows and columns: K[i][j] becomes K^T[j][i]',
    },
  },

  // --- Column 4: Attention Scores ---
  // Position Scores relative to its inputs (Q & K^T)
  {
    id: 'calc-scores',
    type: 'calculation',
    position: { x: 1750, y: 590 }, // Vertically between Q (center ~490) and K^T (center ~1145)
    data: {
      label: 'Attention Scores (Scaled)',
      formula: `Scores = (Q × K^T) / 2.0`,
      description: 'Attention scores calculation (5×5)',
      expectedMatrix: calculateExpected('scores'),
      hint: 'Multiply Q matrix (5×4) with transposed K matrix (4×5) to get raw scores (5×5). Then, divide each value in the raw scores matrix by the scaling factor of 2.0 (√d_k).',
    },
  },

  // --- Column 5: Softmax ---
  {
    id: 'calc-softmax',
    type: 'calculation',
    position: { x: 2300, y: 590 }, // Align with calc-scores
    data: {
      label: 'Apply Softmax',
      formula: "Attention = softmax(Scaled Scores)",
      description: 'Convert scaled scores to probabilities (5×5)',
      expectedMatrix: calculateExpected('softmax'),
      hint: 'For each row in the Scaled Scores matrix, apply the softmax formula: exp(value) / sum(exp(all values in row)). This normalizes each row to sum to 1. Due to the high scaled scores (10), values like exp(10) will dominate the sum, making other terms (exp(0)) effectively zero.',
    },
  },

  // --- Column 6: Final Output ---
  // Position Output relative to its inputs (Softmax & V)
  {
    id: 'calc-output',
    type: 'calculation',
    position: { x: 2850, y: 1100 }, // Vertically between Softmax (center ~830) and V (center ~1850)
    data: {
      label: 'Final Output',
      formula: 'Output = Attention × V',
      description: 'Weighted combination of values (5×4)',
      expectedMatrix: calculateExpected('output'),
      hint: 'Multiply the Attention matrix (5×5) with the Value matrix (5×4). Each row in the Output matrix is a weighted sum of the rows in the Value matrix, where the weights come from the corresponding row in the Attention matrix.',
    },
  },
];

export const initialEdges: Edge[] = [
  // Input to weight multiplications
  { id: 'input-to-q', source: 'input-matrix', target: 'calc-q', animated: true, style: { strokeWidth: 1.5 } },
  { id: 'wq-to-q', source: 'wq-matrix', target: 'calc-q', animated: true, style: { strokeWidth: 1.5 } },
  
  { id: 'input-to-k', source: 'input-matrix', target: 'calc-k', animated: true, style: { strokeWidth: 1.5 } },
  { id: 'wk-to-k', source: 'wk-matrix', target: 'calc-k', animated: true, style: { strokeWidth: 1.5 } },
  
  { id: 'input-to-v', source: 'input-matrix', target: 'calc-v', animated: true, style: { strokeWidth: 1.5 } },
  { id: 'wv-to-v', source: 'wv-matrix', target: 'calc-v', animated: true, style: { strokeWidth: 1.5 } },
  
  // K to K transpose
  { id: 'k-to-kt', source: 'calc-k', target: 'calc-kt', animated: true, style: { strokeWidth: 1.5 } },
  
  // Q and K^T to Scores
  { id: 'q-to-scores', source: 'calc-q', target: 'calc-scores', animated: true, style: { strokeWidth: 1.5 } },
  { id: 'kt-to-scores', source: 'calc-kt', target: 'calc-scores', animated: true, style: { strokeWidth: 1.5 } },
  
  // Scores to Softmax
  { id: 'scores-to-softmax', source: 'calc-scores', target: 'calc-softmax', animated: true, style: { strokeWidth: 1.5 } },
  
  // Softmax and V to Output
  { id: 'softmax-to-output', source: 'calc-softmax', target: 'calc-output', animated: true, style: { strokeWidth: 1.5 } },
  { id: 'v-to-output', source: 'calc-v', target: 'calc-output', animated: true, style: { strokeWidth: 1.5 } },
];