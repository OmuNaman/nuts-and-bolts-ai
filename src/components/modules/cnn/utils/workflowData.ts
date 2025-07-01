// src/components/modules/cnn/utils/workflowData.ts
import { Node, Edge } from '@xyflow/react';
import {
  INPUT_MATRIX,
  KERNEL_MATRIX,
  DENSE_WEIGHTS,
  DENSE_BIAS,
  calculateExpected
} from './cnnCalculations';

const col1 = 0, col2 = 600, col3 = 1440, col4 = 1850, col5 = 2400, col6 = 3000;
const row1 = 0, row2 = 500, row3 = 1000;

export const initialNodes: Node[] = [
  // --- Column 1: Inputs ---
  {
    id: 'input-image',
    type: 'matrix',
    position: { x: col1, y: row1 + 200 },
    data: { label: 'Input Image', matrix: INPUT_MATRIX, description: '5x5 Grayscale Matrix' }
  },
  {
    id: 'kernel',
    type: 'matrix',
    position: { x: col1, y: row2 + 200 },
    data: { label: 'Convolution Kernel', matrix: KERNEL_MATRIX, description: '3x3 Filter' }
  },

  // --- Column 2: Convolution Step ---
  {
    id: 'convolution',
    type: 'convolution', // Custom node type
    position: { x: col2, y: row1 + 250 },
    data: {
      label: '1. Convolution',
      inputMatrix: INPUT_MATRIX,
      kernelMatrix: KERNEL_MATRIX,
      expectedMatrix: calculateExpected('convolution'),
      hint: 'Slide the 3x3 kernel over the input. At each position, perform an element-wise multiplication and sum the results to get a single output pixel.'
    }
  },

  // --- Column 3: ReLU Activation ---
  {
    id: 'relu',
    type: 'activation', // Can reuse the generic activation node
    position: { x: col3, y: row1 + 300 },
    data: {
      label: '2. ReLU Activation',
      formula: 'output = max(0, input)',
      description: 'Remove negative values',
      expectedMatrix: calculateExpected('relu'),
      hint: 'For each cell in the matrix, if the value is negative, it becomes 0. Otherwise, it stays the same.'
    }
  },

  // --- Column 4: Max Pooling Step ---
  {
    id: 'pooling',
    type: 'maxPooling', // Custom node type
    position: { x: col4, y: row1 + 300 },
    data: {
      label: '3. Max Pooling',
      inputMatrix: calculateExpected('relu'),
      expectedMatrix: calculateExpected('pooling'),
      poolSize: 2,
      stride: 1,
      hint: 'Slide a 2x2 window over the input. At each position, find the maximum value within the window to create the output.'
    }
  },
  
  // --- Column 5: Flatten & Dense ---
  {
    id: 'flatten',
    type: 'calculation', // Reusing calculation node for this simple step
    position: { x: col5, y: row1 },
    data: {
      label: '4. Flatten',
      formula: 'Flatten(Matrix)',
      description: 'Convert 2D matrix to 1D vector',
      expectedMatrix: calculateExpected('flatten'),
      hint: 'Take all the numbers from the 2x2 matrix and arrange them into a single row (1x4 vector).'
    }
  },
  {
    id: 'dense-weights',
    type: 'matrix',
    position: { x: col5, y: row2 - 100 },
    data: { label: 'Dense Weights', matrix: DENSE_WEIGHTS, description: '4x1 Vector' }
  },
  
  // --- Column 6: Final Output ---
  {
    id: 'dense',
    type: 'calculation',
    position: { x: col6, y: row1 + 150 },
    data: {
      label: '5. Dense Layer',
      formula: 'Output = (Input · Weights) + Bias',
      description: 'Final classification score',
      expectedMatrix: calculateExpected('dense'),
      hint: `Multiply the flattened 1x4 vector by the 4x1 weight vector to get a single value, then add the bias (${DENSE_BIAS}).`
    }
  }
];

export const initialEdges: Edge[] = [
  { id: 'e-input-conv', source: 'input-image', target: 'convolution', animated: true },
  { id: 'e-kernel-conv', source: 'kernel', target: 'convolution', animated: true },
  { id: 'e-conv-relu', source: 'convolution', target: 'relu', animated: true },
  { id: 'e-relu-pool', source: 'relu', target: 'pooling', animated: true },
  { id: 'e-pool-flatten', source: 'pooling', target: 'flatten', animated: true },
  { id: 'e-flatten-dense', source: 'flatten', target: 'dense', animated: true },
  { id: 'e-weights-dense', source: 'dense-weights', target: 'dense', animated: true },
];