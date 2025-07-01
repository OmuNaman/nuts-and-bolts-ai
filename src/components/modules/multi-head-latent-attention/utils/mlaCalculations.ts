// src/components/modules/multi-head-latent-attention/utils/mlaCalculations.ts
import { Matrix } from '@/types/moduleTypes';

// --- Math Helper Functions (could be moved to a shared lib) ---
function matrixMultiply(a: Matrix, b: Matrix): Matrix {
  if (a[0].length !== b.length) throw new Error("Matrix dimensions incompatible.");
  const result = Array(a.length).fill(0).map(() => Array(b[0].length).fill(0));
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b[0].length; j++) {
      for (let k = 0; k < b.length; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return result;
}
function softmax(matrix: Matrix): Matrix {
  return matrix.map(row => {
    const maxVal = Math.max(...row);
    const expRow = row.map(x => Math.exp(x - maxVal));
    const sum = expRow.reduce((acc, val) => acc + val, 0);
    return expRow.map(x => x / sum);
  });
}
function transpose(matrix: Matrix): Matrix {
    if (!matrix || matrix.length === 0) return [[]];
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

// --- MLA Parameters & Input ---
// Input hidden state (e.g., from a token embedding)
export const INPUT_H_T: Matrix = [[0.5, 0.8, -0.2, 0.1, 0.9, -0.5, 0.3, 0.4]]; // 1x8

// Weight Matrices
export const W_Q: Matrix = [ // 8x4
  [1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1],
  [1, 0, 1, 0], [0, 1, 0, 1], [-1, 0, 1, 0], [0, -1, 0, 1]
];

// Down-projection for KV
export const W_DKV: Matrix = [ // 8x2 (The Bottleneck)
  [1, 0], [0, 1], [1, 0], [0, 1],
  [0, 0], [0, 0], [1, 1], [-1, -1]
];

// Up-projection for Key
export const W_UK: Matrix = [ // 2x4
  [1, 0, 1, 0],
  [0, 1, 0, 1]
];

// Up-projection for Value
export const W_UV: Matrix = [ // 2x4
  [0, 2, 0, 1],
  [1, 0, 2, 0]
];

// Scaling factor (sqrt of head dimension)
const SCALING_FACTOR = Math.sqrt(4); // sqrt(d_h=4) = 2

// --- Step-by-Step Calculation Results ---

const Q_VECTOR = matrixMultiply(INPUT_H_T, W_Q);
const C_KV_VECTOR = matrixMultiply(INPUT_H_T, W_DKV);
const K_RECONSTRUCTED = matrixMultiply(C_KV_VECTOR, W_UK);
const V_RECONSTRUCTED = matrixMultiply(C_KV_VECTOR, W_UV);

// For the final step, we assume a sequence of two identical inputs for demonstration
const Q_SEQ = Q_VECTOR; // Using single Q for all queries
const K_SEQ = [K_RECONSTRUCTED[0], K_RECONSTRUCTED[0]]; // Two identical keys
const V_SEQ = [V_RECONSTRUCTED[0], V_RECONSTRUCTED[0]]; // Two identical values

const SCORES = matrixMultiply(Q_SEQ, transpose(K_SEQ)).map(r => r.map(v => v / SCALING_FACTOR));
const ATTENTION_WEIGHTS = softmax(SCORES);
const FINAL_OUTPUT = matrixMultiply(ATTENTION_WEIGHTS, V_SEQ);


// --- Main Export Function ---
export function calculateExpected(step: string): Matrix {
  switch (step) {
    case 'q': return Q_VECTOR;
    case 'c_kv': return C_KV_VECTOR;
    case 'k_recon': return K_RECONSTRUCTED;
    case 'v_recon': return V_RECONSTRUCTED;
    case 'attention_calc': return FINAL_OUTPUT;
    default:
      throw new Error(`Unknown MLA step: ${step}`);
  }
}

// --- Initial Placeholder Function (for workflowData initial display) ---
export function getInitialExpected(step: string): Matrix {
  switch (step) {
    case 'q': return [[0, 0, 0, 0]]; // Placeholder - user needs to calculate
    case 'c_kv': return [[0, 0]]; // Placeholder - user needs to calculate
    case 'k_recon': return [[0, 0, 0, 0]]; // Placeholder - user needs to calculate
    case 'v_recon': return [[0, 0, 0, 0]]; // Placeholder - user needs to calculate
    case 'attention_calc': return [[0, 0, 0, 0]]; // Placeholder - calculated when ready
    default:
      throw new Error(`Unknown MLA step: ${step}`);
  }
}