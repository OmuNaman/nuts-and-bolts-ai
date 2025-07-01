// src/components/modules/mla-rope/utils/ropeCalculations.ts
import { Matrix } from '@/types/moduleTypes';

// --- Math Helper Functions (re-used for consistency) ---
function matrixMultiply(a: Matrix, b: Matrix): Matrix {
  if (a.length === 0 || b.length === 0 || a[0].length !== b.length) throw new Error("Matrix dimensions incompatible.");
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

// --- Base Parameters & Inputs (from previous MLA module) ---
export const INPUT_H_T: Matrix = [[0.5, 0.8, -0.2, 0.1, 0.9, -0.5, 0.3, 0.4]]; // 1x8
export const W_UQ: Matrix = [[1, 0, 0, 1], [0, 1, 1, 0], [0, 0, 1, 1]]; // 3x4
export const W_UK: Matrix = [[1, 0, 1, 0], [0, 1, 0, 1]]; // 2x4
export const W_UV: Matrix = [[0, 2, 0, 1], [1, 0, 2, 0]]; // 2x4
export const W_DQ: Matrix = [ // 8x3
  [1, 0, 1], [0, 1, 0], [-1, 0, 0], [0, -1, 1],
  [1, 1, 0], [0, 0, 1], [0, 1, 0], [-1, 0, -1]
];
export const W_DKV: Matrix = [ // 8x2
  [1, 0], [0, 1], [1, 0], [0, 1],
  [0, 0], [0, 0], [1, 1], [-1, -1]
];

// --- NEW RoPE-specific Weight Matrices ---
export const W_QR: Matrix = [ // c_Q (1x3) -> q_R (1x2) => W_QR must be 3x2
  [0.8, -0.3],
  [0.2, 0.9],
  [-0.5, 0.1]
];
export const W_KR: Matrix = [ // h_t (1x8) -> k_R (1x2) => W_KR must be 8x2
  [0.6, -0.1], [0.1, 0.7], [0.4, -0.2], [-0.3, 0.8],
  [0.2, -0.5], [-0.6, 0.3], [0.9, 0.1], [-0.2, -0.7]
];

// --- Scaling Factor ---
// d_h (content) is 4, d_R_h (RoPE) is 2. Total dim = 6.
const SCALING_FACTOR = Math.sqrt(4 + 2);

// --- RoPE Simulation Function ---
// Simulates applying rotary embeddings by swapping and negating pairs.
function applyRoPE(matrix: Matrix): Matrix {
  return matrix.map(row => {
    const newRow = [...row];
    for (let i = 0; i < newRow.length; i += 2) {
      if (i + 1 < newRow.length) {
        const x = newRow[i];
        const y = newRow[i + 1];
        newRow[i] = -y; // Simplified rotation
        newRow[i+1] = x;
      }
    }
    return newRow;
  });
}

// --- Intermediate Calculation Results ---
const C_Q = matrixMultiply(INPUT_H_T, W_DQ);
const C_KV = matrixMultiply(INPUT_H_T, W_DKV);
const Q_CONTENT = matrixMultiply(C_Q, W_UQ);
const K_CONTENT = matrixMultiply(C_KV, W_UK);
export const V_FINAL = matrixMultiply(C_KV, W_UV); // Value vector is final
const Q_ROPE_PRE = matrixMultiply(C_Q, W_QR);
const K_ROPE_PRE = matrixMultiply(INPUT_H_T, W_KR);
const Q_ROPE_POST = applyRoPE(Q_ROPE_PRE);
const K_ROPE_POST = applyRoPE(K_ROPE_PRE);
const Q_FINAL = [Q_CONTENT[0].concat(Q_ROPE_POST[0])];
const K_FINAL = [K_CONTENT[0].concat(K_ROPE_POST[0])];

// We'll create a dummy sequence of 2 identical tokens for the final attention
const K_SEQ = [K_FINAL[0], K_FINAL[0]]; 
const V_SEQ = [V_FINAL[0], V_FINAL[0]];

const SCORES = matrixMultiply(Q_FINAL, transpose(K_SEQ)).map(r => r.map(v => v / SCALING_FACTOR));
const ATTENTION_WEIGHTS = softmax(SCORES);
const FINAL_OUTPUT = matrixMultiply(ATTENTION_WEIGHTS, V_SEQ);


// --- Main Export Function to get expected values for any step ---
export function calculateExpected(step: string): Matrix {
  switch (step) {
    case 'c_q': return C_Q;
    case 'c_kv': return C_KV;
    case 'q_content': return Q_CONTENT;
    case 'k_content': return K_CONTENT;
    case 'v_final': return V_FINAL;
    case 'q_rope_pre': return Q_ROPE_PRE;
    case 'k_rope_pre': return K_ROPE_PRE;
    case 'q_rope_post': return Q_ROPE_POST;
    case 'k_rope_post': return K_ROPE_POST;
    case 'q_final': return Q_FINAL;
    case 'k_final': return K_FINAL;
    case 'attention_calc': return FINAL_OUTPUT;
    default:
      throw new Error(`Unknown RoPE MLA step: ${step}`);
  }
}