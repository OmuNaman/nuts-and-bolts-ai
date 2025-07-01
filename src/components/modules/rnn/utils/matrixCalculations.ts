// src/components/modules/rnn/utils/matrixCalculations.ts

// --- RNN Parameters ---
// VocabSize = 2, HiddenSize = 4
export const VOCAB = ['A', 'B'];

// --- Input Data ---
export const ONE_HOT_A = [[1, 0]]; // Dimension: 1 x VocabSize (1x2)
export const ONE_HOT_B = [[0, 1]]; // Dimension: 1 x VocabSize (1x2)

// --- Weight Matrices & Biases (Shared Across Timesteps) ---
// W_xh (Input to Hidden)
export const W_xh = [ // Dimension: VocabSize x HiddenSize (2x4)
  [ 0.5, -0.2,  0.8,  0.1],
  [ 0.3,  0.6, -0.4,  0.9]
];
// W_hh (Hidden to Hidden)
export const W_hh = [ // Dimension: HiddenSize x HiddenSize (4x4)
  [ 0.2,  0.5, -0.3,  0.4],
  [-0.1,  0.7,  0.6, -0.2],
  [ 0.8, -0.4,  0.1,  0.9],
  [ 0.3, -0.1,  0.5,  0.7]
];
// W_hy (Hidden to Output)
export const W_hy = [ // Dimension: HiddenSize x VocabSize (4x2)
  [ 0.6, -0.3],
  [-0.2,  0.8],
  [ 0.9, -0.1],
  [ 0.3,  0.7]
];

// Biases
export const b_h = [[0.1, 0.1, 0.1, 0.1]]; // Dimension: 1 x HiddenSize (1x4)
export const b_y = [[0.1, 0.1]];          // Dimension: 1 x VocabSize (1x2)


// --- Math Helper Functions ---

export function matrixMultiply(a: number[][], b: number[][]): number[][] {
  if (a[0].length !== b.length) throw new Error("Matrix dimensions incompatible for multiplication.");
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

export function matrixAdd(...matrices: number[][][]): number[][] {
  const rows = matrices[0].length;
  const cols = matrices[0][0].length;
  const result = Array(rows).fill(0).map(() => Array(cols).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      for (const m of matrices) {
        if (m.length !== rows || m[i].length !== cols) throw new Error("Matrix dimensions incompatible for addition.");
        result[i][j] += m[i][j];
      }
    }
  }
  return result;
}

export function elementWiseMultiply(a: number[][], b: number[][]): number[][] {
  if (a.length !== b.length || a[0].length !== b[0].length) throw new Error("Dimension mismatch for element-wise multiplication.");
  return a.map((row, i) => row.map((val, j) => val * b[i][j]));
}

export function tanh(matrix: number[][]): number[][] {
  return matrix.map(row => row.map(val => Math.tanh(val)));
}

export function tanhDerivative(preActivationMatrix: number[][]): number[][] {
  return preActivationMatrix.map(row => row.map(val => 1 - Math.pow(Math.tanh(val), 2)));
}

export function softmax(matrix: number[][]): number[][] {
  return matrix.map(row => {
    const maxVal = Math.max(...row);
    const expRow = row.map(x => Math.exp(x - maxVal));
    const sum = expRow.reduce((acc, val) => acc + val, 0);
    return expRow.map(x => x / sum);
  });
}

export function matrixTranspose(matrix: number[][]): number[][] {
  if (!matrix || matrix.length === 0 || matrix[0].length === 0) return [[]];
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

export function matrixSubtract(a: number[][], b: number[][]): number[][] {
  if (a.length !== b.length || a[0].length !== b[0].length) throw new Error("Dimension mismatch for subtraction.");
  return a.map((row, i) => row.map((val, j) => val - b[i][j]));
}

// --- FORWARD PASS CALCULATIONS (STEP-BY-STEP) ---

// Initial hidden state h₀ (all zeros)
const h0 = [[0, 0, 0, 0]]; // Dimension: 1 x HiddenSize (1x4)

// Timestep 1: Input 'A' (x₁)
const x1 = ONE_HOT_A; // Dimension: 1x2
const h1_preactivation = matrixAdd(
  matrixMultiply(x1, W_xh), // (1x2) * (2x4) -> 1x4
  matrixMultiply(h0, W_hh), // (1x4) * (4x4) -> 1x4
  b_h                       // 1x4
); // Result Dimension: 1x4
export const H1 = tanh(h1_preactivation); // Dimension: 1x4
export const Y1 = matrixAdd(matrixMultiply(H1, W_hy), b_y); // ((1x4)*(4x2) -> 1x2) + (1x2) -> 1x2
export const PRED1 = softmax(Y1); // Dimension: 1x2

// Timestep 2: Input 'B' (x₂)
const x2 = ONE_HOT_B; // Dimension: 1x2
const h2_preactivation = matrixAdd(
  matrixMultiply(x2, W_xh), // (1x2) * (2x4) -> 1x4
  matrixMultiply(H1, W_hh), // (1x4) * (4x4) -> 1x4
  b_h                       // 1x4
); // Result Dimension: 1x4
export const H2 = tanh(h2_preactivation); // Dimension: 1x4
export const Y2 = matrixAdd(matrixMultiply(H2, W_hy), b_y); // ((1x4)*(4x2) -> 1x2) + (1x2) -> 1x2
export const PRED2 = softmax(Y2); // Dimension: 1x2


// --- BACKWARD PROPAGATION CALCULATIONS ---

// Target labels (one-hot encoded)
export const TARGET_T1 = [[0, 1]]; // Expected output after "A" is "B". Dimension: 1x2
export const TARGET_T2 = [[1, 0]]; // Expected output after "B" is "A". Dimension: 1x2

// Loss calculation
export function crossEntropyLoss(predictions: number[][], targets: number[][]): number {
  return -predictions[0].reduce((sum, pred, i) => sum + targets[0][i] * Math.log(Math.max(pred, 1e-15)), 0);
}
export const LOSS_T1 = crossEntropyLoss(PRED1, TARGET_T1);
export const LOSS_T2 = crossEntropyLoss(PRED2, TARGET_T2);
export const TOTAL_LOSS = LOSS_T1 + LOSS_T2; // Scalar

// Step 1: Gradients of loss w.r.t. predictions (dL/dŷ)
export const dL_dPred1 = matrixSubtract(PRED1, TARGET_T1); // (1x2) - (1x2) -> 1x2
export const dL_dPred2 = matrixSubtract(PRED2, TARGET_T2); // (1x2) - (1x2) -> 1x2

// Step 2: Gradients w.r.t. logits (dL/dy)
export const dL_dY1 = dL_dPred1; // Dimension: 1x2
export const dL_dY2 = dL_dPred2; // Dimension: 1x2

// Step 3: Gradients w.r.t. hidden states (dL/dh)
// This is the core of "Backpropagation Through Time" (BPTT)
export const dL_dH2_final = matrixMultiply(dL_dY2, matrixTranspose(W_hy)); // (1x2)*(2x4) -> 1x4

const dL_dH1_from_Y1 = matrixMultiply(dL_dY1, matrixTranspose(W_hy)); // (1x2)*(2x4) -> 1x4
const delta_h2_backpropagated = elementWiseMultiply(dL_dH2_final, tanhDerivative(h2_preactivation)); // (1x4) ⊙ (1x4) -> 1x4
const dL_dH1_from_H2_flow = matrixMultiply(delta_h2_backpropagated, matrixTranspose(W_hh)); // (1x4)*(4x4) -> 1x4
export const dL_dH1 = matrixAdd(dL_dH1_from_Y1, dL_dH1_from_H2_flow); // (1x4) + (1x4) -> 1x4

// Step 4: Gradients for Weights and Biases (accumulated over all timesteps)
const delta_h1 = elementWiseMultiply(dL_dH1, tanhDerivative(h1_preactivation)); // (1x4) ⊙ (1x4) -> 1x4
const delta_h2 = elementWiseMultiply(dL_dH2_final, tanhDerivative(h2_preactivation)); // (1x4) ⊙ (1x4) -> 1x4

// Gradients for W_hy and b_y
export const dL_dWhy_T1 = matrixMultiply(matrixTranspose(H1), dL_dY1); // (4x1)*(1x2) -> 4x2
export const dL_dWhy_T2 = matrixMultiply(matrixTranspose(H2), dL_dY2); // (4x1)*(1x2) -> 4x2
export const dL_dWhy = matrixAdd(dL_dWhy_T1, dL_dWhy_T2); // (4x2) + (4x2) -> 4x2

export const dL_dby = matrixAdd(dL_dY1, dL_dY2); // (1x2) + (1x2) -> 1x2

// Gradients for W_xh, W_hh, and b_h
export const dL_dWxh_T1 = matrixMultiply(matrixTranspose(x1), delta_h1); // (2x1)*(1x4) -> 2x4
export const dL_dWxh_T2 = matrixMultiply(matrixTranspose(x2), delta_h2); // (2x1)*(1x4) -> 2x4
export const dL_dWxh = matrixAdd(dL_dWxh_T1, dL_dWxh_T2); // (2x4) + (2x4) -> 2x4

export const dL_dWhh_T1 = matrixMultiply(matrixTranspose(h0), delta_h1); // (4x1)*(1x4) -> 4x4
export const dL_dWhh_T2 = matrixMultiply(matrixTranspose(H1), delta_h2); // (4x1)*(1x4) -> 4x4
export const dL_dWhh = matrixAdd(dL_dWhh_T1, dL_dWhh_T2); // (4x4) + (4x4) -> 4x4

export const dL_dbh = matrixAdd(delta_h1, delta_h2); // (1x4) + (1x4) -> 1x4
