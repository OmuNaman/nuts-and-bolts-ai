import type { SelfAttentionStep as Step } from '@/types/moduleTypes';

// New Matrix data
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
  const innerDim = b.length; // or a[0].length

  if (a[0].length !== b.length) {
    console.error("Matrix dimensions incompatible for multiplication:", a[0].length, "vs", b.length);
    // Return an empty matrix or throw an error, depending on desired error handling
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

// Softmax function with numerical stability
function softmax(matrix: number[][]): number[][] {
  return matrix.map(row => {
    // Find the maximum value in the row for numerical stability
    const maxVal = Math.max(...row);
    const expRow = row.map(x => Math.exp(x - maxVal)); // Subtract max for stability
    const sum = expRow.reduce((acc, val) => acc + val, 0);

    // Handle sum being zero to prevent NaN, e.g., if all inputs are -Infinity after maxVal subtraction
    if (sum === 0) {
        return row.map(() => 0); // Or handle as an error condition
    }

    return expRow.map(x => x / sum);
  });
}

// Calculate expected results for each step
export function calculateExpected(step: Step): number[][] {
  switch (step) {
    case 'input':
      return INPUT_MATRIX;
    case 'q':
      return matrixMultiply(INPUT_MATRIX, WQ_MATRIX);
    case 'k':
      return matrixMultiply(INPUT_MATRIX, WK_MATRIX);
    case 'v':
      return matrixMultiply(INPUT_MATRIX, WV_MATRIX);
    case 'scores': {
      const Q = matrixMultiply(INPUT_MATRIX, WQ_MATRIX);
      const K = matrixMultiply(INPUT_MATRIX, WK_MATRIX);
      const KT = K[0].map((_, i) => K.map(row => row[i])); // Transpose K
      const rawScores = matrixMultiply(Q, KT);
      // Apply scaling factor here
      return rawScores.map(row => row.map(val => val / SCALING_FACTOR));
    }
    case 'softmax': {
      const Q = matrixMultiply(INPUT_MATRIX, WQ_MATRIX);
      const K = matrixMultiply(INPUT_MATRIX, WK_MATRIX);
      const KT = K[0].map((_, i) => K.map(row => row[i])); // Transpose K
      const rawScores = matrixMultiply(Q, KT);
      const scaledScores = rawScores.map(row => row.map(val => val / SCALING_FACTOR));
      return softmax(scaledScores);
    }
    case 'output': {
      const Q = matrixMultiply(INPUT_MATRIX, WQ_MATRIX);
      const K = matrixMultiply(INPUT_MATRIX, WK_MATRIX);
      const KT = K[0].map((_, i) => K.map(row => row[i])); // Transpose K
      const rawScores = matrixMultiply(Q, KT);
      const scaledScores = rawScores.map(row => row.map(val => val / SCALING_FACTOR));
      const attention = softmax(scaledScores);
      const V = matrixMultiply(INPUT_MATRIX, WV_MATRIX);
      return matrixMultiply(attention, V);
    }
    default:
      return [];
  }
}

// Validate user input against expected result
export function validateMatrix(step: Step, userMatrix: number[][]): { isValid: boolean; errors: boolean[][] } {
  const expected = calculateExpected(step);
  // Ensure user matrix has same dimensions as expected, otherwise it's invalid
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
      const tolerance = 0.0001; // Increased precision for floating point comparison
      
      if (Math.abs(userValue - expectedValue) > tolerance) {
        errors[i][j] = true;
        isValid = false;
      }
    }
  }
  
  return { isValid, errors };
}

// Get step-specific data
export function getStepData(step: Step) {
  const stepConfig = {
    // ... (input, q, k, v, scores steps remain the same as your last provided version)
    input: {
      title: "Input Matrix",
      description: "This is our starting input embeddings matrix (5×8)",
      formula: "Input = X",
      resultName: "Input Matrix",
      inputMatrices: [],
      hint: "This matrix is already given. Just observe the values from the original diagram."
    },
    q: {
      title: "Query Matrix (Q)",
      description: "Calculate the Query matrix by multiplying Input with Weight Query",
      formula: "Q = Input × Wq",
      resultName: "Q Matrix (5×4)",
      inputMatrices: [
        { name: "Input (5×8)", data: INPUT_MATRIX },
        { name: "Wq (8×4)", data: WQ_MATRIX }
      ],
      hint: "Multiply each row of Input (5×8) with each column of Wq (8×4). For Q₁₁ (first cell): (1×10) + (0×10) + (0×10) + (0×0) + (0×0) + (0×0) + (0×0) + (0×0) = 10"
    },
    k: {
      title: "Key Matrix (K)",
      description: "Calculate the Key matrix by multiplying Input with Weight Key",
      formula: "K = Input × Wk",
      resultName: "K Matrix (5×4)",
      inputMatrices: [
        { name: "Input (5×8)", data: INPUT_MATRIX },
        { name: "Wk (8×4)", data: WK_MATRIX }
      ],
      hint: "Similar to Q calculation, but using Wk weights. For K₁₁ (first cell): (1×2) + (0×2) + (0×2) + (0×0) + (0×0) + (0×0) + (0×0) + (0×0) = 2"
    },
    v: {
      title: "Value Matrix (V)",
      description: "Calculate the Value matrix by multiplying Input with Weight Value",
      formula: "V = Input × Wv",
      resultName: "V Matrix (5×4)",
      inputMatrices: [
        { name: "Input (5×8)", data: INPUT_MATRIX },
        { name: "Wv (8×4)", data: WV_MATRIX }
      ],
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
      hint: `First transpose K (K^T will be 4×5), then multiply Q (5×4) with K^T (4×5) to get raw scores (5×5). Finally, divide each value in the raw scores matrix by 2.0. Example: A raw score of 20 becomes 20 / 2.0 = 10.`
    },
    softmax: {
      title: "Softmax Attention",
      description: "Apply the softmax function to convert the scaled attention scores into probabilities. This normalizes each row to sum to 1.",
      formula: "Attention = softmax(Scaled Scores)",
      resultName: "Attention Matrix (5×5)",
      inputMatrices: [
        { name: `Scaled Scores (5×5)`, data: calculateExpected('scores') }
      ],
      // Updated Hint for softmax
      hint: "For each row in Scaled Scores, apply softmax: exp(value) / sum(exp(all values in row)). Enter decimal values. For 1/3, enter approx. 0.3333. For 1/2, enter 0.5000. For very small numbers resulting from exp(0) when others are exp(10), an entry like 0.0000 is appropriate. The system will validate with a small tolerance."
    },
    output: {
      title: "Final Output",
      description: "Calculate the final output by multiplying the Attention weights with the Value matrix. This creates a weighted sum of Value vectors.",
      formula: "Output = Attention × V",
      resultName: "Output Matrix (5×4)",
      inputMatrices: [
        { name: "Attention (5×5)", data: calculateExpected('softmax') },
        { name: "V (5×4)", data: calculateExpected('v') }
      ],
      hint: "Multiply the Attention matrix (5×5) with the Value matrix (5×4). Each row in the Output matrix is a weighted sum of the rows in the Value matrix, where the weights come from the corresponding row in the Attention matrix. Example Output₁₁: (0.3333 × V₁₁) + (0.3333 × V₂₁) + ... + (0.0000 × V₅₁)."
    }
  };
  
  return stepConfig[step];
}