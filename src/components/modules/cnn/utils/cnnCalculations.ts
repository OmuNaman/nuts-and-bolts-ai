// src/components/modules/cnn/utils/cnnCalculations.ts
import { Matrix } from '@/types/moduleTypes';

// --- Static Data for the CNN Module ---

// A simple 5x5 input matrix representing a grayscale image with a "corner" pattern.
export const INPUT_MATRIX: Matrix = [
  [10, 10, 10, 0, 0],
  [10, 10, 10, 0, 0],
  [10, 10, 10, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
];

// A 3x3 kernel for vertical edge detection.
export const KERNEL_MATRIX: Matrix = [
  [1, 0, -1],
  [1, 0, -1],
  [1, 0, -1],
];

// Bias for the convolutional layer.
export const KERNEL_BIAS = 0;

// Weights for the dense layer (takes a 4-element flattened vector).
export const DENSE_WEIGHTS: Matrix = [[0.5], [-0.5], [0.2], [-0.2]];

// Bias for the dense layer.
export const DENSE_BIAS = 0.1;

// --- Helper Functions ---

function applyConvolution(input: Matrix, kernel: Matrix, bias: number): Matrix {
  const inputHeight = input.length;
  const inputWidth = input[0].length;
  const kernelHeight = kernel.length;
  const kernelWidth = kernel[0].length;
  const outputHeight = inputHeight - kernelHeight + 1;
  const outputWidth = inputWidth - kernelWidth + 1;

  const output: Matrix = Array(outputHeight).fill(0).map(() => Array(outputWidth).fill(0));

  for (let y = 0; y < outputHeight; y++) {
    for (let x = 0; x < outputWidth; x++) {
      let sum = 0;
      for (let ky = 0; ky < kernelHeight; ky++) {
        for (let kx = 0; kx < kernelWidth; kx++) {
          sum += input[y + ky][x + kx] * kernel[ky][kx];
        }
      }
      output[y][x] = sum + bias;
    }
  }
  return output;
}

function applyReLU(input: Matrix): Matrix {
  return input.map(row => row.map(val => Math.max(0, val)));
}

function applyMaxPooling(input: Matrix, poolSize: number, stride: number): Matrix {
  const outputHeight = Math.floor((input.length - poolSize) / stride) + 1;
  const outputWidth = Math.floor((input[0].length - poolSize) / stride) + 1;
  const output: Matrix = Array(outputHeight).fill(0).map(() => Array(outputWidth).fill(0));

  for (let y = 0; y < outputHeight; y++) {
    for (let x = 0; x < outputWidth; x++) {
      let maxVal = -Infinity;
      for (let py = 0; py < poolSize; py++) {
        for (let px = 0; px < poolSize; px++) {
          maxVal = Math.max(maxVal, input[y * stride + py][x * stride + px]);
        }
      }
      output[y][x] = maxVal;
    }
  }
  return output;
}

function flattenMatrix(input: Matrix): Matrix {
  return [input.flat()];
}

function applyDense(input: Matrix, weights: Matrix, bias: number): Matrix {
  const multiplied = input.map(row => 
    weights[0].map((_, j) => 
      row.reduce((sum, cell, i) => sum + cell * weights[i][j], 0)
    )
  );
  return multiplied.map(row => row.map(val => val + bias));
}


// --- Step-by-Step Calculation Results ---
const CONV_OUTPUT = applyConvolution(INPUT_MATRIX, KERNEL_MATRIX, KERNEL_BIAS);
const RELU_OUTPUT = applyReLU(CONV_OUTPUT);
const POOL_OUTPUT = applyMaxPooling(RELU_OUTPUT, 2, 1);
const FLATTEN_OUTPUT = flattenMatrix(POOL_OUTPUT);
const DENSE_OUTPUT = applyDense(FLATTEN_OUTPUT, DENSE_WEIGHTS, DENSE_BIAS);


// --- Main Export Function ---
export function calculateExpected(step: string): Matrix {
  switch (step) {
    case 'convolution':
      return CONV_OUTPUT;
    case 'relu':
      return RELU_OUTPUT;
    case 'pooling':
      return POOL_OUTPUT;
    case 'flatten':
      return FLATTEN_OUTPUT;
    case 'dense':
      return DENSE_OUTPUT;
    default:
      throw new Error(`Unknown CNN step: ${step}`);
  }
}