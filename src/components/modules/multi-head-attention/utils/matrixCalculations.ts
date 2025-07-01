// src/components/modules/multi-head-attention/utils/matrixCalculations.ts

import type { Step } from './types';
import type { HeadNumber } from './types';

// Matrix data
export const INPUT_MATRIX = [
  [1.0, 1.0, 0.0, 0.0, 0.0, 0.0],
  [1.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  [0.0, 0.0, 1.0, 1.0, 0.0, 0.0],
  [0.0, 0.0, 0.0, 1.0, 0.0, 0.0],
  [0.0, 0.0, 0.0, 0.0, 1.0, 1.0]
];

// Head 1 Matrices
export const WQ_MATRIX_HEAD1 = [
  [10, 0],
  [0, 10],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0]
];

export const WK_MATRIX_HEAD1 = [
  [2, 0],
  [0, 2],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0]
];

export const WV_MATRIX_HEAD1 = [
  [1, 0],
  [0, 1],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0]
];

// Head 2 Matrices
export const WQ_MATRIX_HEAD2 = [
  [0, 0],
  [0, 0],
  [10, 0],
  [0, 10],
  [0, 0],
  [0, 0]
];

export const WK_MATRIX_HEAD2 = [
  [0, 0],
  [0, 0],
  [2, 0],
  [0, 2],
  [0, 0],
  [0, 0]
];

export const WV_MATRIX_HEAD2 = [
  [0, 0],
  [0, 0],
  [1, 0],
  [0, 1],
  [0, 0],
  [0, 0]
];

// Head 3 Matrices
export const WQ_MATRIX_HEAD3 = [
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [10, 0],
  [0, 10]
];

export const WK_MATRIX_HEAD3 = [
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [2, 0],
  [0, 2]
];

export const WV_MATRIX_HEAD3 = [
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [1, 0],
  [0, 1]
];

// Output Weight Matrix (Identity matrix for this example)
export const WO_MATRIX = [
  [1, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 1]
];

// Scaling Factor (sqrt(d_k)) based on Key Matrix dimension 2
const SCALING_FACTOR = Math.sqrt(2);

// Matrix multiplication helper
function matrixMultiply(a: number[][], b: number[][]): number[][] {
  const resultRows = a.length;
  const resultCols = b[0].length;
  const innerDim = b.length;

  if (a[0].length !== b.length) {
    console.error("Matrix dimensions incompatible for multiplication:", a[0].length, "vs", b.length);
    return Array(resultRows).fill(null).map(() => Array(resultCols).fill(NaN));
  }

  const result = Array(resultRows).fill(null).map(() => Array(resultCols).fill(0));
  
  for (let i = 0; i < resultRows; i++) {
    for (let j = 0; j < resultCols; j++) {
      for (let k = 0; k < innerDim; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  
  return result;
}

// Matrix transpose function
function transpose(matrix: number[][]): number[][] {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

// Softmax function with numerical stability
function softmax(matrix: number[][]): number[][] {
  return matrix.map(row => {
    const maxVal = Math.max(...row);
    const expRow = row.map(x => Math.exp(x - maxVal));
    const sum = expRow.reduce((acc, val) => acc + val, 0);

    if (sum === 0) {
        return row.map(() => 0);
    }

    return expRow.map(x => x / sum);
  });
}

// Concatenate matrices horizontally
function concatenateHorizontally(matrices: number[][][]): number[][] {
  const rows = matrices[0].length;
  const result = Array(rows).fill(null).map(() => []);
  
  for (let i = 0; i < rows; i++) {
    for (const matrix of matrices) {
      result[i].push(...matrix[i]);
    }
  }
  
  return result;
}

// Helper function to get the weight matrix for a specific head
function getWeightMatrix(type: 'q' | 'k' | 'v', headNumber: HeadNumber): number[][] {
  switch (type) {
    case 'q':
      return headNumber === 1 ? WQ_MATRIX_HEAD1 : 
             headNumber === 2 ? WQ_MATRIX_HEAD2 : WQ_MATRIX_HEAD3;
    case 'k':
      return headNumber === 1 ? WK_MATRIX_HEAD1 : 
             headNumber === 2 ? WK_MATRIX_HEAD2 : WK_MATRIX_HEAD3;
    case 'v':
      return headNumber === 1 ? WV_MATRIX_HEAD1 : 
             headNumber === 2 ? WV_MATRIX_HEAD2 : WV_MATRIX_HEAD3;
  }
}

// Calculate Q, K, V for a specific head
function calculateQKV(type: 'q' | 'k' | 'v', headNumber: HeadNumber): number[][] {
  const weightMatrix = getWeightMatrix(type, headNumber);
  return matrixMultiply(INPUT_MATRIX, weightMatrix);
}

// Calculate attention scores for a specific head
function calculateScores(headNumber: HeadNumber): number[][] {
  const Q = calculateQKV('q', headNumber);
  const K = calculateQKV('k', headNumber);
  const KT = transpose(K);
  const rawScores = matrixMultiply(Q, KT);
  return rawScores.map(row => row.map(val => val / SCALING_FACTOR));
}

// Calculate softmax attention for a specific head
function calculateSoftmaxAttention(headNumber: HeadNumber): number[][] {
  const scores = calculateScores(headNumber);
  const attentionWeights = softmax(scores);
  const V = calculateQKV('v', headNumber);
  return matrixMultiply(attentionWeights, V);
}

// Calculate concatenated output and final MHA output
function calculateOutput(): number[][] {
  const head1Output = calculateSoftmaxAttention(1);
  const head2Output = calculateSoftmaxAttention(2);
  const head3Output = calculateSoftmaxAttention(3);
  
  const concatenated = concatenateHorizontally([head1Output, head2Output, head3Output]);
  return matrixMultiply(concatenated, WO_MATRIX);
}

// Validate user input against expected result
export function validateMatrix(step: Step, userMatrix: number[][], headNumber?: HeadNumber): { isValid: boolean; errors: boolean[][] } {
  const expected = calculateExpected(step, headNumber);
  
  if (!userMatrix || userMatrix.length === 0 || !userMatrix[0] || userMatrix[0].length === 0 ||
      userMatrix.length !== expected.length || userMatrix[0].length !== expected[0].length) {
    return { isValid: false, errors: Array(expected.length).fill(null).map(() => Array(expected[0].length).fill(true)) };
  }

  const errors = Array(userMatrix.length).fill(null).map(() => Array(userMatrix[0].length).fill(false));
  let isValid = true;
  
  for (let i = 0; i < expected.length; i++) {
    for (let j = 0; j < expected[i].length; j++) {
      const userValue = userMatrix[i]?.[j] || 0;
      const expectedValue = expected[i][j];
      const tolerance = 0.0001;
      
      if (Math.abs(userValue - expectedValue) > tolerance) {
        errors[i][j] = true;
        isValid = false;
      }
    }
  }
  
  return { isValid, errors };
}

// Calculate expected results for each step
export function calculateExpected(step: Step, headNumber?: HeadNumber): number[][] {
  switch (step) {
    case 'input':
      return INPUT_MATRIX;
    case 'q':
      if (!headNumber) return calculateQKV('q', 1); // Default to head 1
      return calculateQKV('q', headNumber);
    case 'k':
      if (!headNumber) return calculateQKV('k', 1); // Default to head 1
      return calculateQKV('k', headNumber);
    case 'v':
      if (!headNumber) return calculateQKV('v', 1); // Default to head 1
      return calculateQKV('v', headNumber);
    case 'scores':
      if (!headNumber) return calculateScores(1); // Default to head 1
      return calculateScores(headNumber);
    case 'softmax':
      if (!headNumber) return calculateSoftmaxAttention(1); // Default to head 1
      return calculateSoftmaxAttention(headNumber);
    case 'output':
      return calculateOutput();
    default:
      return [];
  }
}

// Get step-specific data
export function getStepData(step: Step, headNumber?: HeadNumber) {
  const headSuffix = headNumber ? ` (Head ${headNumber})` : '';
  
  const stepConfig = {
    input: {
      title: "Input Matrix",
      description: "Starting input embeddings matrix (5×6)",
      formula: "Input = X",
      resultName: "Input Matrix",
      inputMatrices: [],
      hint: "This matrix is already given. Just observe the values."
    },
    q: {
      title: `Query Matrix (Q)${headSuffix}`,
      description: `Calculate the Query matrix for head ${headNumber || 1}`,
      formula: `Q${headNumber || 1} = Input × Wq${headNumber || 1}`,
      resultName: `Q Matrix (5×2)`,
      inputMatrices: [
        { name: "Input (5×6)", data: INPUT_MATRIX },
        { name: `Wq${headNumber || 1} (6×2)`, data: headNumber === 1 ? WQ_MATRIX_HEAD1 :
                                                   headNumber === 2 ? WQ_MATRIX_HEAD2 :
                                                   WQ_MATRIX_HEAD3 }
      ],
      hint: `Multiply Input matrix with weight matrix Wq${headNumber || 1} to get Query matrix for head ${headNumber || 1}.`
    },
    k: {
      title: `Key Matrix (K)${headSuffix}`,
      description: `Calculate the Key matrix for head ${headNumber || 1}`,
      formula: `K${headNumber || 1} = Input × Wk${headNumber || 1}`,
      resultName: `K Matrix (5×2)`,
      inputMatrices: [
        { name: "Input (5×6)", data: INPUT_MATRIX },
        { name: `Wk${headNumber || 1} (6×2)`, data: headNumber === 1 ? WK_MATRIX_HEAD1 :
                                                   headNumber === 2 ? WK_MATRIX_HEAD2 :
                                                   WK_MATRIX_HEAD3 }
      ],
      hint: `Multiply Input matrix with weight matrix Wk${headNumber || 1} to get Key matrix for head ${headNumber || 1}.`
    },
    v: {
      title: `Value Matrix (V)${headSuffix}`,
      description: `Calculate the Value matrix for head ${headNumber || 1}`,
      formula: `V${headNumber || 1} = Input × Wv${headNumber || 1}`,
      resultName: `V Matrix (5×2)`,
      inputMatrices: [
        { name: "Input (5×6)", data: INPUT_MATRIX },
        { name: `Wv${headNumber || 1} (6×2)`, data: headNumber === 1 ? WV_MATRIX_HEAD1 :
                                                   headNumber === 2 ? WV_MATRIX_HEAD2 :
                                                   WV_MATRIX_HEAD3 }
      ],
      hint: `Multiply Input matrix with weight matrix Wv${headNumber || 1} to get Value matrix for head ${headNumber || 1}.`
    },
    scores: {
      title: `Attention Scores${headSuffix}`,
      description: `Calculate scaled attention scores for head ${headNumber || 1}`,
      formula: `Scores${headNumber || 1} = (Q${headNumber || 1} × K${headNumber || 1}^T) / √2`,
      resultName: `Scaled Scores Matrix (5×5)`,
      inputMatrices: [
        { name: `Q${headNumber || 1} (5×2)`, data: calculateQKV('q', headNumber || 1) },
        { name: `K${headNumber || 1}^T (2×5)`, data: transpose(calculateQKV('k', headNumber || 1)) }
      ],
      hint: `Calculate attention scores by multiplying Q${headNumber || 1} with transposed K${headNumber || 1}, then divide by √2.`
    },
    softmax: {
      title: `Softmax Attention${headSuffix}`,
      description: `Apply softmax to attention scores for head ${headNumber || 1}`,
      formula: `Attention${headNumber || 1} = softmax(Scores${headNumber || 1}) × V${headNumber || 1}`,
      resultName: `Attention Matrix (5×2)`,
      inputMatrices: [
        { name: `Scores${headNumber || 1} (5×5)`, data: calculateScores(headNumber || 1) },
        { name: `V${headNumber || 1} (5×2)`, data: calculateQKV('v', headNumber || 1) }
      ],
      hint: `Apply softmax function row-wise to the scaled scores matrix for head ${headNumber || 1}, then multiply by V${headNumber || 1}.`
    },
    output: {
      title: "Multi-Head Output",
      description: "Concatenate all head outputs and multiply by output weights",
      formula: "Output = Concat(Head₁, Head₂, Head₃) × Wo",
      resultName: "Final Output Matrix (5×6)",
      inputMatrices: [
        { name: "Head₁ Output (5×2)", data: calculateSoftmaxAttention(1) },
        { name: "Head₂ Output (5×2)", data: calculateSoftmaxAttention(2) },
        { name: "Head₃ Output (5×2)", data: calculateSoftmaxAttention(3) },
        { name: "Wo (6×6)", data: WO_MATRIX }
      ],
      hint: "Concatenate outputs from all 3 heads horizontally to get a 5×6 matrix, then multiply by Wo (6×6) to get final 5×6 output."
    }
  };
  
  return stepConfig[step];
}
