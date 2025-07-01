// src/components/modules/mla-query-compression/utils/mlaQcCalculations.ts
import { Matrix } from '@/types/moduleTypes';

// --- Math Helper Functions (These are robust and reusable) ---
export function matrixMultiply(a: Matrix, b: Matrix): Matrix {
  const aRows = a.length;
  const aCols = a[0].length;
  const bRows = b.length;
  const bCols = b[0].length;

  if (aCols !== bRows) {
    throw new Error(`Matrix dimensions incompatible for multiplication: ${aCols} !== ${bRows}`);
  }

  const result = Array(aRows).fill(0).map(() => Array(bCols).fill(0));

  for (let i = 0; i < aRows; i++) {       // Iterate through rows of A
    for (let j = 0; j < bCols; j++) {     // Iterate through columns of B
      for (let k = 0; k < aCols; k++) {   // Iterate through inner dimension
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return result;
}
export function softmax(matrix: Matrix): Matrix {
  return matrix.map(row => {
    const maxVal = Math.max(...row);
    const expRow = row.map(x => Math.exp(x - maxVal));
    const sum = expRow.reduce((acc, val) => acc + val, 0);
    // Handle sum being zero to prevent NaN (e.g., if all inputs are -Infinity after maxVal subtraction)
    if (sum === 0) return row.map(() => 0); 
    return expRow.map(x => x / sum);
  });
}
export function transpose(matrix: Matrix): Matrix {
    if (!matrix || matrix.length === 0 || matrix[0].length === 0) return [[]];
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

// --- STATIC MLA-QC Parameters & Base Input (These remain constants) ---
export const INPUT_H_T: Matrix = [[0.5, 0.8, -0.2, 0.1, 0.9, -0.5, 0.3, 0.4]]; // 1x8

// --- Query Compression Matrices ---
export const W_DQ: Matrix = [ // 8x3 (Query Down-Projection)
  [1, 0, 1], [0, 1, 0], [-1, 0, 0], [0, -1, 1],
  [1, 1, 0], [0, 0, 1], [0, 1, 0], [-1, 0, -1]
];
export const W_UQ: Matrix = [ // 3x4 (Query Up-Projection)
  [1, 0, 0, 1],
  [0, 1, 1, 0],
  [0, 0, 1, 1]
];

// --- KV Compression Matrices ---
export const W_DKV: Matrix = [ // 8x2
  [1, 0], [0, 1], [1, 0], [0, 1],
  [0, 0], [0, 0], [1, 1], [-1, -1]
];
export const W_UK: Matrix = [ // 2x4
  [1, 0, 1, 0],
  [0, 1, 0, 1]
];
export const W_UV: Matrix = [ // 2x4
  [0, 2, 0, 1],
  [1, 0, 2, 0]
];

const SCALING_FACTOR = Math.sqrt(4); // sqrt(d_h=4) = 2

// --- Step-by-Step Calculation Functions (Now take explicit inputs) ---
// These are not exported directly, but used by calculateExpected
const calculateCQ = (h_t: Matrix) => matrixMultiply(h_t, W_DQ);
const calculateQRecon = (c_q: Matrix) => matrixMultiply(c_q, W_UQ);
const calculateCKV = (h_t: Matrix) => matrixMultiply(h_t, W_DKV);
const calculateKRecon = (c_kv: Matrix) => matrixMultiply(c_kv, W_UK);
const calculateVRecon = (c_kv: Matrix) => matrixMultiply(c_kv, W_UV);

// This function calculates the attention output given the Q, K, V matrices
export function calculateAttentionOutput(q: Matrix, k: Matrix, v: Matrix): Matrix {
    const scores = matrixMultiply(q, transpose(k)).map(r => r.map(val => val / SCALING_FACTOR));
    const attentionWeights = softmax(scores);
    return matrixMultiply(attentionWeights, v);
}


// --- Main Expected Value Getter (For initial values/testing) ---
// This function will now call the dynamic calculation functions
export function getInitialExpected(step: string): Matrix {
  switch (step) {
    case 'c_q': return [[0, 0, 0]]; // Placeholder - user needs to calculate
    case 'q_recon': return [[0, 0, 0, 0]]; // Placeholder - user needs to calculate  
    case 'c_kv': return [[0, 0]]; // Placeholder - user needs to calculate
    case 'k_recon': return [[0, 0, 0, 0]]; // Placeholder - user needs to calculate
    case 'v_recon': return [[0, 0, 0, 0]]; // Placeholder - user needs to calculate
    case 'attention_calc': return [[0, 0, 0, 0]]; // Placeholder - calculated when ready
    default:
      throw new Error(`Unknown MLA-QC step: ${step}`);
  }
}

// --- Actual Expected Value Getter (For validation) ---
// This function calculates the real expected values for validation
export function calculateExpected(step: string): Matrix {
  switch (step) {
    case 'c_q': return calculateCQ(INPUT_H_T);
    case 'q_recon': return calculateQRecon(calculateCQ(INPUT_H_T));
    case 'c_kv': return calculateCKV(INPUT_H_T);
    case 'k_recon': return calculateKRecon(calculateCKV(INPUT_H_T));
    case 'v_recon': return calculateVRecon(calculateCKV(INPUT_H_T));
    case 'attention_calc':
        const initialQ = calculateQRecon(calculateCQ(INPUT_H_T));
        const initialK = calculateKRecon(calculateCKV(INPUT_H_T));
        const initialV = calculateVRecon(calculateCKV(INPUT_H_T));
        // For final attention, we assume a simple sequence where Q, K, V are just their single-token values for clarity.
        // In a true multi-head attention, these would be the full sequence of Q, K, V.
        // Given the simplified nature of the module, we'll use the single calculated Q, K, V.
        // We'll create sequence-like matrices for the final attention calculation step.
        const Q_SEQ_FOR_ATTN = initialQ; // 1x4
        const K_SEQ_FOR_ATTN = [initialK[0], initialK[0]]; // 2 tokens for K (1x4, repeated)
        const V_SEQ_FOR_ATTN = [initialV[0], initialV[0]]; // 2 tokens for V (1x4, repeated)

        return calculateAttentionOutput(Q_SEQ_FOR_ATTN, K_SEQ_FOR_ATTN, V_SEQ_FOR_ATTN);
    default:
      throw new Error(`Unknown MLA-QC step: ${step}`);
  }
}