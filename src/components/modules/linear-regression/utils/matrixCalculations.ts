// src/components/modules/linear-regression/utils/matrixCalculations.ts

/**
 * Matrix operations for the Linear Regression module
 * A simple linear regression model: y = X * w + b
 */

import { Matrix } from "@/types/moduleTypes";

// Sample data for linear regression
// X (features): house size (sqft), number of bedrooms
// y (target): house price (in $10,000s)
export const FEATURES_MATRIX: Matrix = [
  [1.0, 1.0], // house 1: 1000 sqft, 1 bedroom
  [1.5, 2.0], // house 2: 1500 sqft, 2 bedrooms
  [2.0, 2.0], // house 3: 2000 sqft, 2 bedrooms
  [2.5, 3.0], // house 4: 2500 sqft, 3 bedrooms
  [3.0, 4.0]  // house 5: 3000 sqft, 4 bedrooms
];

export const TARGET_MATRIX: Matrix = [
  [15.0], // $150,000 
  [22.5], // $225,000
  [27.0], // $270,000
  [35.0], // $350,000
  [45.0]  // $450,000
];

export const WEIGHTS_MATRIX: Matrix = [
  [10.0], // weight for house size
  [2.0]   // weight for bedrooms
];

export const BIAS_MATRIX: Matrix = [
  [2.0]   // bias
];

// Learning rate for updating weights
export const LEARNING_RATE = 0.01;

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

  // Mean squared error loss
  mse: (predictions: Matrix, targets: Matrix): number => {
    let sum = 0;
    const m = predictions.length;
    
    for (let i = 0; i < m; i++) {
      const diff = predictions[i][0] - targets[i][0];
      sum += diff * diff;
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
  // Calculate predictions: X * w + b
  predict: (X: Matrix, w: Matrix, b: Matrix): Matrix => {
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
  
  // Calculate MSE loss
  loss: (predictions: Matrix, y: Matrix): number => {
    return matrixUtils.mse(predictions, y);
  }
};

// Backward pass calculations
export const backwardPass = {
  // Calculate gradients for weights: (2/m) * X^T * (predictions - y)
  gradientWeights: (X: Matrix, predictions: Matrix, y: Matrix): Matrix => {
    const m = X.length;
    const error = matrixUtils.subtract(predictions, y);
    const X_t = matrixUtils.transpose(X);
    const grad = matrixUtils.multiply(X_t, error);
    
    return matrixUtils.scale(grad, 2 / m);
  },
  
  // Calculate gradient for bias: (2/m) * sum(predictions - y)
  gradientBias: (predictions: Matrix, y: Matrix): Matrix => {
    const m = predictions.length;
    const error = matrixUtils.subtract(predictions, y);
    let sum = 0;
    
    for (let i = 0; i < m; i++) {
      sum += error[i][0];
    }
    
    return [[parseFloat((2 * sum / m).toFixed(4))]];
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
    case 'prediction':
      return forwardPass.predict(FEATURES_MATRIX, WEIGHTS_MATRIX, BIAS_MATRIX);
    case 'loss':
      const predictions = forwardPass.predict(FEATURES_MATRIX, WEIGHTS_MATRIX, BIAS_MATRIX);
      const loss = forwardPass.loss(predictions, TARGET_MATRIX);
      return matrixUtils.lossMatrix(loss);
    case 'gradient-weights':
      const pred1 = forwardPass.predict(FEATURES_MATRIX, WEIGHTS_MATRIX, BIAS_MATRIX);
      return backwardPass.gradientWeights(FEATURES_MATRIX, pred1, TARGET_MATRIX);
    case 'gradient-bias':
      const pred2 = forwardPass.predict(FEATURES_MATRIX, WEIGHTS_MATRIX, BIAS_MATRIX);
      return backwardPass.gradientBias(pred2, TARGET_MATRIX);
    case 'update-weights':
      const pred3 = forwardPass.predict(FEATURES_MATRIX, WEIGHTS_MATRIX, BIAS_MATRIX);
      const gradW = backwardPass.gradientWeights(FEATURES_MATRIX, pred3, TARGET_MATRIX);
      return backwardPass.updateWeights(WEIGHTS_MATRIX, gradW, LEARNING_RATE);
    case 'update-bias':
      const pred4 = forwardPass.predict(FEATURES_MATRIX, WEIGHTS_MATRIX, BIAS_MATRIX);
      const gradB = backwardPass.gradientBias(pred4, TARGET_MATRIX);
      return backwardPass.updateBias(BIAS_MATRIX, gradB, LEARNING_RATE);
    default:
      throw new Error(`Unknown step: ${step}`);
  }
}
