// src/components/modules/neural-network/utils/matrixCalculations.ts
import type { NeuralNetworkStep as Step } from './types';

// --- Neural Network Parameters ---
// Architecture: 2 -> 4 -> 4 -> 2

// Sample Input (1x2 matrix)
export const NN_INPUT = [[0.5, -0.2]];

// The "Correct Answer" for this input
export const Y_TRUE = [[0, 1]]; // Class 2 is the correct one

// Layer 1: 2x4
export const NN_W1 = [
  [0.1, 0.4, -0.2, 0.7],
  [0.3, -0.5, 0.6, -0.1]
];
export const NN_B1 = [[0.1, 0.2, 0.1, -0.3]];

// Layer 2: 4x4
export const NN_W2 = [
  [0.4, -0.2, 0.1, 0.5],
  [-0.1, 0.3, -0.5, 0.2],
  [0.7, -0.3, 0.2, -0.1],
  [0.2, 0.6, -0.4, 0.3]
];
export const NN_B2 = [[-0.2, 0.1, 0.3, -0.1]];

// Layer 3 (Output): 4x2
export const NN_W3 = [
  [0.2, -0.1],
  [-0.3, 0.5],
  [0.6, -0.2],
  [-0.1, 0.4]
];
export const NN_B3 = [[0.1, -0.2]];


// --- Math Helpers ---

export function matrixMultiply(a: number[][], b: number[][]): number[][] {
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

export function matrixAdd(a: number[][], b: number[][]): number[][] {
  if (a.length !== b.length || a[0].length !== b[0].length) { return a; }
  return a.map((row, i) => row.map((val, j) => val + b[i][j]));
}

export function matrixSubtract(a: number[][], b: number[][]): number[][] {
  if (a.length !== b.length || a[0].length !== b[0].length) { return a; }
  return a.map((row, i) => row.map((val, j) => val - b[i][j]));
}

export function transpose(matrix: number[][]): number[][] {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

export function elementWiseMultiply(a: number[][], b: number[][]): number[][] {
  if (a.length !== b.length || a[0].length !== b[0].length) { return a; }
  return a.map((row, i) => row.map((val, j) => val * b[i][j]));
}


// Activation Functions & Derivatives
export function relu(matrix: number[][]): number[][] {
  return matrix.map(row => row.map(val => Math.max(0, val)));
}

export function relu_derivative(matrix: number[][]): number[][] {
  return matrix.map(row => row.map(val => (val > 0 ? 1 : 0)));
}

export function softmax(matrix: number[][]): number[][] {
  return matrix.map(row => {
    const maxVal = Math.max(...row);
    const expRow = row.map(x => Math.exp(x - maxVal));
    const sum = expRow.reduce((acc, val) => acc + val, 0);
    if (sum === 0) return row.map(() => 1 / row.length);
    return expRow.map(x => x / sum);
  });
}

// Loss Function
export function crossEntropyLoss(y_pred: number[][], y_true: number[][]): number[][] {
  let loss = 0;
  for (let i = 0; i < y_pred[0].length; i++) {
    const epsilon = 1e-12;
    loss += y_true[0][i] * Math.log(y_pred[0][i] + epsilon);
  }
  return [[-loss]];
}

// --- FORWARD PASS CALCULATIONS ---
export const Z1 = matrixAdd(matrixMultiply(NN_INPUT, NN_W1), NN_B1);
export const A1 = relu(Z1);
export const Z2 = matrixAdd(matrixMultiply(A1, NN_W2), NN_B2);
export const A2 = relu(Z2);
export const Z3 = matrixAdd(matrixMultiply(A2, NN_W3), NN_B3);
export const A3 = softmax(Z3);
export const LOSS = crossEntropyLoss(A3, Y_TRUE);

// --- BACKPROPAGATION CALCULATIONS ---
export const dZ3 = matrixSubtract(A3, Y_TRUE);
export const dW3 = matrixMultiply(transpose(A2), dZ3);
export const db3 = dZ3;
export const dA2 = matrixMultiply(dZ3, transpose(NN_W3));
export const dZ2 = elementWiseMultiply(dA2, relu_derivative(Z2));
export const dW2 = matrixMultiply(transpose(A1), dZ2);
export const db2 = dZ2;
export const dA1 = matrixMultiply(dZ2, transpose(NN_W2));
export const dZ1 = elementWiseMultiply(dA1, relu_derivative(Z1));
export const dW1 = matrixMultiply(transpose(NN_INPUT), dZ1);
export const db1 = dZ1;

// Calculate each matrix based on the step name
export function calculateExpected(step: string): number[][] {
  switch(step) {
    case 'z1': return Z1;
    case 'a1': return A1;
    case 'z2': return Z2;
    case 'a2': return A2;
    case 'z3': return Z3;
    case 'a3': return A3;
    case 'loss': return LOSS;
    case 'dz3': return dZ3;
    case 'dw3': return dW3;
    case 'db3': return db3;
    case 'dz2': return dZ2;
    case 'dw2': return dW2;
    case 'db2': return db2;
    case 'dz1': return dZ1;
    case 'dw1': return dW1;
    case 'db1': return db1;
    default:
      throw new Error(`Unknown step: ${step}`);
  }
}

// This would be expanded with more specific logic for the module
export function getStepData(step: string) {
  const stepConfig: Record<string, any> = {
    z1: {
      title: "Calculate Z¹",
      description: "First layer pre-activation",
      formula: "Z¹ = A⁰·W¹ + b¹",
      resultName: "Z¹ Matrix (1×4)",
      inputMatrices: [
        { name: "Input A⁰ (1×2)", data: NN_INPUT },
        { name: "Weights W¹ (2×4)", data: NN_W1 },
        { name: "Biases b¹ (1×4)", data: NN_B1 }
      ],
      expectedMatrix: Z1,
      hint: "Multiply the input matrix (1×2) with weights W¹ (2×4) and add biases b¹ (1×4)"
    },
    a1: {
      title: "Activate A¹",
      description: "First layer activation",
      formula: "A¹ = ReLU(Z¹)",
      resultName: "A¹ Matrix (1×4)",
      inputMatrices: [
        { name: "Z¹ (1×4)", data: Z1 }
      ],
      expectedMatrix: A1,
      hint: "Apply ReLU function to Z¹: max(0, value) for each element"
    },
    z2: {
      title: "Calculate Z²",
      description: "Second layer pre-activation",
      formula: "Z² = A¹·W² + b²",
      resultName: "Z² Matrix (1×4)",
      inputMatrices: [
        { name: "A¹ (1×4)", data: A1 },
        { name: "Weights W² (4×4)", data: NN_W2 },
        { name: "Biases b² (1×4)", data: NN_B2 }
      ],
      expectedMatrix: Z2,
      hint: "Multiply A¹ (1×4) with weights W² (4×4) and add biases b² (1×4)"
    },
    a2: {
      title: "Activate A²",
      description: "Second layer activation",
      formula: "A² = ReLU(Z²)",
      resultName: "A² Matrix (1×4)",
      inputMatrices: [
        { name: "Z² (1×4)", data: Z2 }
      ],
      expectedMatrix: A2,
      hint: "Apply ReLU function to Z²: max(0, value) for each element"
    },
    z3: {
      title: "Calculate Z³",
      description: "Output layer pre-activation",
      formula: "Z³ = A²·W³ + b³",
      resultName: "Z³ Matrix (1×2)",
      inputMatrices: [
        { name: "A² (1×4)", data: A2 },
        { name: "Weights W³ (4×2)", data: NN_W3 },
        { name: "Biases b³ (1×2)", data: NN_B3 }
      ],
      expectedMatrix: Z3,
      hint: "Multiply A² (1×4) with weights W³ (4×2) and add biases b³ (1×2)"
    },
    a3: {
      title: "Activate A³ (Output)",
      description: "Output layer activation",
      formula: "A³ = Softmax(Z³)",
      resultName: "A³ Matrix (1×2)",
      inputMatrices: [
        { name: "Z³ (1×2)", data: Z3 }
      ],
      expectedMatrix: A3,
      hint: "Apply Softmax function to Z³: exp(value) / sum(exp(values)) for each element"
    },
    loss: {
      title: "Calculate Loss",
      description: "Cross-entropy loss",
      formula: "Loss = -Σ(Y·log(A³))",
      resultName: "Loss Value",
      inputMatrices: [
        { name: "Predictions A³ (1×2)", data: A3 },
        { name: "True Labels Y (1×2)", data: Y_TRUE }
      ],
      expectedMatrix: LOSS,
      hint: "Apply cross-entropy loss function: -sum(true_label * log(predicted))"
    },
    dz3: {
      title: "Gradient dZ³",
      description: "Output layer error",
      formula: "dZ³ = A³ - Y",
      resultName: "dZ³ Matrix (1×2)",
      inputMatrices: [
        { name: "Predictions A³ (1×2)", data: A3 },
        { name: "True Labels Y (1×2)", data: Y_TRUE }
      ],
      expectedMatrix: dZ3,
      hint: "Subtract true labels from predictions"
    },
    dw3: {
      title: "Gradient dW³",
      description: "Output layer weight gradients",
      formula: "dW³ = A²ᵀ·dZ³",
      resultName: "dW³ Matrix (4×2)",
      inputMatrices: [
        { name: "A² (1×4)", data: A2 },
        { name: "dZ³ (1×2)", data: dZ3 }
      ],
      expectedMatrix: dW3,
      hint: "Multiply transpose of A² (4×1) with dZ³ (1×2)"
    },
    db3: {
      title: "Gradient db³",
      description: "Output layer bias gradients",
      formula: "db³ = dZ³",
      resultName: "db³ Matrix (1×2)",
      inputMatrices: [
        { name: "dZ³ (1×2)", data: dZ3 }
      ],
      expectedMatrix: db3,
      hint: "The gradient of the bias is just dZ³"
    },
    dz2: {
      title: "Gradient dZ²",
      description: "Second layer error",
      formula: "dZ² = (dZ³·W³ᵀ) * Relu'(Z²)",
      resultName: "dZ² Matrix (1×4)",
      inputMatrices: [
        { name: "dZ³ (1×2)", data: dZ3 },
        { name: "W³ (4×2)", data: NN_W3 },
        { name: "Z² (1×4)", data: Z2 }
      ],
      expectedMatrix: dZ2,
      hint: "Multiply dZ³ (1×2) with transpose of W³ (2×4), then element-wise multiply with ReLU derivative of Z²"
    },
    dw2: {
      title: "Gradient dW²",
      description: "Second layer weight gradients",
      formula: "dW² = A¹ᵀ·dZ²",
      resultName: "dW² Matrix (4×4)",
      inputMatrices: [
        { name: "A¹ (1×4)", data: A1 },
        { name: "dZ² (1×4)", data: dZ2 }
      ],
      expectedMatrix: dW2,
      hint: "Multiply transpose of A¹ (4×1) with dZ² (1×4)"
    },
    db2: {
      title: "Gradient db²",
      description: "Second layer bias gradients",
      formula: "db² = dZ²",
      resultName: "db² Matrix (1×4)",
      inputMatrices: [
        { name: "dZ² (1×4)", data: dZ2 }
      ],
      expectedMatrix: db2,
      hint: "The gradient of the bias is just dZ²"
    },
    dz1: {
      title: "Gradient dZ¹",
      description: "First layer error",
      formula: "dZ¹ = (dZ²·W²ᵀ) * Relu'(Z¹)",
      resultName: "dZ¹ Matrix (1×4)",
      inputMatrices: [
        { name: "dZ² (1×4)", data: dZ2 },
        { name: "W² (4×4)", data: NN_W2 },
        { name: "Z¹ (1×4)", data: Z1 }
      ],
      expectedMatrix: dZ1,
      hint: "Multiply dZ² (1×4) with transpose of W² (4×4), then element-wise multiply with ReLU derivative of Z¹"
    },
    dw1: {
      title: "Gradient dW¹",
      description: "First layer weight gradients",
      formula: "dW¹ = A⁰ᵀ·dZ¹",
      resultName: "dW¹ Matrix (2×4)",
      inputMatrices: [
        { name: "A⁰ (1×2)", data: NN_INPUT },
        { name: "dZ¹ (1×4)", data: dZ1 }
      ],
      expectedMatrix: dW1,
      hint: "Multiply transpose of input (2×1) with dZ¹ (1×4)"
    },
    db1: {
      title: "Gradient db¹",
      description: "First layer bias gradients",
      formula: "db¹ = dZ¹",
      resultName: "db¹ Matrix (1×4)",
      inputMatrices: [
        { name: "dZ¹ (1×4)", data: dZ1 }
      ],
      expectedMatrix: db1,
      hint: "The gradient of the bias is just dZ¹"
    }
  };
  
  return stepConfig[step];
}
