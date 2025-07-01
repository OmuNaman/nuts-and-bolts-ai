// src/components/modules/logistic-regression/utils/matrixCalculations.ts

/**
 * Matrix operations for the Logistic Regression module
 * A logistic regression model: y = sigmoid(X * w + b)
 */

import { Matrix } from "@/types/moduleTypes";

// Sample data for logistic regression
// X (features): student exam scores in two subjects
// y (target): admission result (0 = not admitted, 1 = admitted)
export const FEATURES_MATRIX: Matrix = [
  [78.0, 85.0],  // student 1: exam1 = 78, exam2 = 85
  [82.0, 76.0],  // student 2: exam1 = 82, exam2 = 76
  [90.0, 92.0],  // student 3: exam1 = 90, exam2 = 92
  [65.0, 70.0],  // student 4: exam1 = 65, exam2 = 70
  [88.0, 95.0],  // student 5: exam1 = 88, exam2 = 95
  [72.0, 68.0]   // student 6: exam1 = 72, exam2 = 68
];

export const TARGET_MATRIX: Matrix = [
  [0],  // not admitted
  [0],  // not admitted
  [1],  // admitted
  [0],  // not admitted
  [1],  // admitted
  [0]   // not admitted
];

export const WEIGHTS_MATRIX: Matrix = [
  [0.01],  // weight for exam1
  [0.02]   // weight for exam2
];

export const BIAS_MATRIX: Matrix = [
  [-1.5]   // bias (initial value)
];

// Learning rate for updating weights
export const LEARNING_RATE = 0.001;

// Helper utility for matrix operations
export const matrixUtils = {
  // Matrix multiplication (dot product)
  multiply: (a: Matrix, b: Matrix): Matrix => {
    const result: Matrix = [];
    
    if (a[0].length !== b.length) {
      throw new Error(`Matrix dimensions don't match for multiplication: ${a[0].length} !== ${b.length}`);
    }

    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < b[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < a[0].length; k++) {
          sum += a[i][k] * b[k][j];
        }
        result[i][j] = parseFloat(sum.toFixed(4));
      }
    }
    
    return result;
  },

  // Element-wise subtraction
  subtract: (a: Matrix, b: Matrix): Matrix => {
    const result: Matrix = [];
    
    if (a.length !== b.length || a[0].length !== b[0].length) {
      throw new Error(`Matrix dimensions don't match for subtraction`);
    }

    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < a[0].length; j++) {
        result[i][j] = parseFloat((a[i][j] - b[i][j]).toFixed(4));
      }
    }
    
    return result;
  },

  // Element-wise addition
  add: (a: Matrix, b: Matrix): Matrix => {
    const result: Matrix = [];
    
    if (a.length !== b.length || a[0].length !== b[0].length) {
      throw new Error(`Matrix dimensions don't match for addition`);
    }

    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < a[0].length; j++) {
        result[i][j] = parseFloat((a[i][j] + b[i][j]).toFixed(4));
      }
    }
    
    return result;
  },

  // Transpose a matrix
  transpose: (m: Matrix): Matrix => {
    const result: Matrix = [];
    
    for (let j = 0; j < m[0].length; j++) {
      result[j] = [];
      for (let i = 0; i < m.length; i++) {
        result[j][i] = m[i][j];
      }
    }
    
    return result;
  },
  
  // Scale a matrix by a constant
  scale: (m: Matrix, scalar: number): Matrix => {
    const result: Matrix = [];
    
    for (let i = 0; i < m.length; i++) {
      result[i] = [];
      for (let j = 0; j < m[0].length; j++) {
        result[i][j] = parseFloat((m[i][j] * scalar).toFixed(4));
      }
    }
    
    return result;
  },

  // Sigmoid function applied to each element
  sigmoid: (m: Matrix): Matrix => {
    const result: Matrix = [];
    
    for (let i = 0; i < m.length; i++) {
      result[i] = [];
      for (let j = 0; j < m[0].length; j++) {
        const sigValue = 1 / (1 + Math.exp(-m[i][j]));
        result[i][j] = parseFloat(sigValue.toFixed(4));
      }
    }
    
    return result;
  },

  // Binary cross-entropy loss
  binaryCrossEntropy: (predictions: Matrix, targets: Matrix): number => {
    let sum = 0;
    const m = predictions.length;
    
    for (let i = 0; i < m; i++) {
      const y = targets[i][0];
      const p = predictions[i][0];
      // Avoid log(0) by adding a small epsilon
      const epsilon = 1e-15;
      sum += -(y * Math.log(p + epsilon) + (1 - y) * Math.log(1 - p + epsilon));
    }
    
    return parseFloat((sum / m).toFixed(4));
  },
  
  // Create a loss value matrix for display
  lossMatrix: (loss: number): Matrix => {
    return [[loss]];
  }
};

// Forward pass calculations
export const forwardPass = {
  // Calculate linear combination: X * w + b
  linear: (X: Matrix, w: Matrix, b: Matrix): Matrix => {
    const Xw = matrixUtils.multiply(X, w);
    
    // Create a bias matrix with the same dimensions as Xw (copy the bias value to each row)
    const biasExpanded: Matrix = [];
    for (let i = 0; i < Xw.length; i++) {
      biasExpanded[i] = [];
      for (let j = 0; j < Xw[0].length; j++) {
        biasExpanded[i][j] = b[0][j];
      }
    }
    
    return matrixUtils.add(Xw, biasExpanded);
  },
  
  // Apply sigmoid activation function: 1 / (1 + exp(-z))
  sigmoid: (z: Matrix): Matrix => {
    return matrixUtils.sigmoid(z);
  },
  
  // Calculate binary cross-entropy loss
  loss: (predictions: Matrix, y: Matrix): number => {
    return matrixUtils.binaryCrossEntropy(predictions, y);
  }
};

// Backward pass calculations
export const backwardPass = {
  // Calculate gradients for weights: (1/m) * X^T * (predictions - y)
  gradientWeights: (X: Matrix, predictions: Matrix, y: Matrix): Matrix => {
    const m = X.length;
    const error = matrixUtils.subtract(predictions, y);
    const X_t = matrixUtils.transpose(X);
    const grad = matrixUtils.multiply(X_t, error);
    
    return matrixUtils.scale(grad, 1 / m);
  },
  
  // Calculate gradient for bias: (1/m) * sum(predictions - y)
  gradientBias: (predictions: Matrix, y: Matrix): Matrix => {
    const m = predictions.length;
    const error = matrixUtils.subtract(predictions, y);
    let sum = 0;
    
    for (let i = 0; i < m; i++) {
      sum += error[i][0];
    }
    
    return [[parseFloat((sum / m).toFixed(4))]];
  },
  
  // Update weights: w - learning_rate * gradient
  updateWeights: (w: Matrix, gradient: Matrix, learningRate: number): Matrix => {
    const scaled = matrixUtils.scale(gradient, learningRate);
    return matrixUtils.subtract(w, scaled);
  },
  
  // Update bias: b - learning_rate * gradient
  updateBias: (b: Matrix, gradient: Matrix, learningRate: number): Matrix => {
    const scaled = matrixUtils.scale(gradient, learningRate);
    return matrixUtils.subtract(b, scaled);
  }
};

// Calculate expected matrix for each step
export function calculateExpected(step: string): Matrix {
  switch(step) {
    case 'linear':
      return forwardPass.linear(FEATURES_MATRIX, WEIGHTS_MATRIX, BIAS_MATRIX);
    case 'sigmoid':
      const z = forwardPass.linear(FEATURES_MATRIX, WEIGHTS_MATRIX, BIAS_MATRIX);
      return forwardPass.sigmoid(z);
    case 'loss':
      const z2 = forwardPass.linear(FEATURES_MATRIX, WEIGHTS_MATRIX, BIAS_MATRIX);
      const a = forwardPass.sigmoid(z2);
      const loss = forwardPass.loss(a, TARGET_MATRIX);
      return matrixUtils.lossMatrix(loss);
    case 'gradient-weights':
      const z3 = forwardPass.linear(FEATURES_MATRIX, WEIGHTS_MATRIX, BIAS_MATRIX);
      const a3 = forwardPass.sigmoid(z3);
      return backwardPass.gradientWeights(FEATURES_MATRIX, a3, TARGET_MATRIX);
    case 'gradient-bias':
      const z4 = forwardPass.linear(FEATURES_MATRIX, WEIGHTS_MATRIX, BIAS_MATRIX);
      const a4 = forwardPass.sigmoid(z4);
      return backwardPass.gradientBias(a4, TARGET_MATRIX);
    case 'update-weights':
      const z5 = forwardPass.linear(FEATURES_MATRIX, WEIGHTS_MATRIX, BIAS_MATRIX);
      const a5 = forwardPass.sigmoid(z5);
      const gradW = backwardPass.gradientWeights(FEATURES_MATRIX, a5, TARGET_MATRIX);
      return backwardPass.updateWeights(WEIGHTS_MATRIX, gradW, LEARNING_RATE);
    case 'update-bias':
      const z6 = forwardPass.linear(FEATURES_MATRIX, WEIGHTS_MATRIX, BIAS_MATRIX);
      const a6 = forwardPass.sigmoid(z6);
      const gradB = backwardPass.gradientBias(a6, TARGET_MATRIX);
      return backwardPass.updateBias(BIAS_MATRIX, gradB, LEARNING_RATE);
    default:
      throw new Error(`Unknown step: ${step}`);
  }
}
