// src/components/modules/self-attention/utils/matrixCalculations.ts
import type { Step } from './types';

// Matrix data
export const INPUT_MATRIX = [
  [1, 0, 0, 0, 0, 0, 0, 0], // x1: "The"
  [0, 1, 0, 0, 0, 0, 0, 0], // x2: "next"
  [0, 0, 1, 0, 0, 0, 0, 0], // x3: "day"
  [0, 0, 0, 1, 0, 0, 0, 0], // x4: "is"
  [0, 0, 0, 0, 1, 0, 0, 0]  // x5: "bright"
];

export const WQ_MATRIX = [
  [10, 0, 0, 0],
  [10, 0, 0, 0],
  [10, 0, 0, 0],
  [0, 10, 0, 0],
  [0, 10, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0]
];

export const WK_MATRIX = [
  [2, 0, 0, 0],
  [2, 0, 0, 0],
  [2, 0, 0, 0],
  [0, 2, 0, 0],
  [0, 2, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0]
];

export const WV_MATRIX = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
  [0, 0, 0, 1],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0]
];

// Scaling Factor (sqrt(d_k)) based on Key Matrix dimension 4
const SCALING_FACTOR = 2.0;

// Matrix multiplication helper
function matrixMultiply(a: number[][], b: number[][]): number[][] {
  const resultRows = a.length;
  const resultCols = b[0].length;
  const innerDim = b.length;

  // Initialize result matrix with zeros
  const result = Array(resultRows)
    .fill(null)
    .map(() => Array(resultCols).fill(0));

  // Perform multiplication
  for (let i = 0; i < resultRows; i++) {
    for (let j = 0; j < resultCols; j++) {
      for (let k = 0; k < innerDim; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }

  return result;
}

// Matrix scalar multiplication (each element multiplied by scalar)
function matrixScalarMultiply(matrix: number[][], scalar: number): number[][] {
  return matrix.map(row => row.map(value => value * scalar));
}

// Matrix scalar division (each element divided by scalar)
function matrixScalarDivide(matrix: number[][], scalar: number): number[][] {
  return matrix.map(row => row.map(value => value / scalar));
}

// Apply softmax function to each row of the matrix
function applySoftmaxByRow(matrix: number[][]): number[][] {
  return matrix.map(row => {
    const expValues = row.map(val => Math.exp(val));
    const sumExp = expValues.reduce((acc, val) => acc + val, 0);
    return expValues.map(val => val / sumExp);
  });
}

// Calculate each matrix based on the step name
export function calculateExpected(step: string): number[][] {
  switch(step) {
    case 'q':
      return matrixMultiply(INPUT_MATRIX, WQ_MATRIX);
    case 'k':
      return matrixMultiply(INPUT_MATRIX, WK_MATRIX);
    case 'v':
      return matrixMultiply(INPUT_MATRIX, WV_MATRIX);
    case 'scores': {
      const Q = calculateExpected('q');
      const K = calculateExpected('k');
      const KT = K[0].map((_, colIndex) => K.map(row => row[colIndex])); // Transpose K
      const rawScores = matrixMultiply(Q, KT);
      return matrixScalarDivide(rawScores, SCALING_FACTOR);
    }
    case 'softmax': {
      const scores = calculateExpected('scores');
      return applySoftmaxByRow(scores);
    }
    case 'output': {
      const attention = calculateExpected('softmax');
      const V = calculateExpected('v');
      return matrixMultiply(attention, V);
    }
    default:
      throw new Error(`Unknown step: ${step}`);
  }
}

// This would be expanded with more specific logic for the module
export function getStepData(step: string) {
  const stepConfig = {
    q: {
      title: "Query Matrix (Q)",
      description: `Calculate the Query matrix by multiplying Input embeddings with Wq.`,
      formula: `Q = Input × Wq`,
      resultName: "Query Matrix (5×4)",
      inputMatrices: [
        { name: "Input (5×8)", data: INPUT_MATRIX },
        { name: "Wq (8×4)", data: WQ_MATRIX }
      ],
      expectedMatrix: calculateExpected('q'),
      hint: "Multiply each row of Input (5×8) with each column of Wq (8×4). For Q₁₁ (first cell): (1×10) + (0×10) + (0×10) + (0×0) + (0×0) + (0×0) + (0×0) + (0×0) = 10"
    },
    k: {
      title: "Key Matrix (K)",
      description: `Calculate the Key matrix by multiplying Input embeddings with Wk.`,
      formula: `K = Input × Wk`,
      resultName: "Key Matrix (5×4)",
      inputMatrices: [
        { name: "Input (5×8)", data: INPUT_MATRIX },
        { name: "Wk (8×4)", data: WK_MATRIX }
      ],
      expectedMatrix: calculateExpected('k'),
      hint: "Similar to Q calculation, but using Wk weights. For K₁₁ (first cell): (1×2) + (0×2) + (0×2) + (0×0) + (0×0) + (0×0) + (0×0) + (0×0) = 2"
    },
    v: {
      title: "Value Matrix (V)",
      description: `Calculate the Value matrix by multiplying Input embeddings with Wv.`,
      formula: `V = Input × Wv`,
      resultName: "Value Matrix (5×4)",
      inputMatrices: [
        { name: "Input (5×8)", data: INPUT_MATRIX },
        { name: "Wv (8×4)", data: WV_MATRIX }
      ],
      expectedMatrix: calculateExpected('v'),
      hint: "Use Wv weights for this calculation. For V₁₁ (first cell): (1×1) + (0×0) + (0×0) + (0×0) + (0×0) + (0×0) + (0×0) + (0×0) = 1"
    },
    scores: {
      title: "Attention Scores (Scaled)",
      description: `Calculate raw attention scores (Q × K^T), then divide each value by the scaling factor (√d_k = 2.0).`,
      formula: `Scores = (Q × K^T) / 2.0`,
      resultName: "Scaled Scores Matrix (5×5)",
      inputMatrices: [
        { name: "Q (5×4)", data: calculateExpected('q') },
        { name: "K (5×4)", data: calculateExpected('k') }
      ],
      expectedMatrix: calculateExpected('scores'),
      hint: "Multiply Q matrix (5×4) with transposed K matrix (4×5) to get raw scores (5×5). Then, divide each value in the raw scores matrix by the scaling factor of 2.0 (√d_k)."
    },
    softmax: {
      title: "Softmax Attention Weights",
      description: `Apply softmax function to each row of the Scaled Scores matrix to get attention weights.`,
      formula: `Attention = softmax(Scaled Scores)`,
      resultName: "Attention Matrix (5×5)",
      inputMatrices: [
        { name: "Scaled Scores (5×5)", data: calculateExpected('scores') }
      ],
      expectedMatrix: calculateExpected('softmax'),
      hint: "For each row in the Scaled Scores matrix, apply the softmax formula: exp(value) / sum(exp(all values in row)). This normalizes each row to sum to 1. Due to the high scaled scores (10), values like exp(10) will dominate the sum, making other terms (exp(0)) effectively zero."
    },
    output: {
      title: "Final Output",
      description: `Calculate the final output by multiplying Attention matrix with Value matrix.`,
      formula: `Output = Attention × V`,
      resultName: "Output Matrix (5×4)",
      inputMatrices: [
        { name: "Attention (5×5)", data: calculateExpected('softmax') },
        { name: "V (5×4)", data: calculateExpected('v') }
      ],
      expectedMatrix: calculateExpected('output'),
      hint: "Multiply the Attention matrix (5×5) with the Value matrix (5×4). Each row in the Output matrix is a weighted sum of the rows in the Value matrix, where the weights come from the corresponding row in the Attention matrix. Example Output₁₁: (0.3333 × V₁₁) + (0.3333 × V₂₁) + ... + (0.0000 × V₅₁)."
    }
  };
  
  return stepConfig[step as keyof typeof stepConfig];
}
