// src/components/modules/logistic-regression/utils/workflowData.ts
import { Node, Edge } from '@xyflow/react';
import { Matrix } from '@/types/moduleTypes';
import { 
  forwardPass, 
  backwardPass, 
  FEATURES_MATRIX, 
  TARGET_MATRIX, 
  WEIGHTS_MATRIX, 
  BIAS_MATRIX, 
  LEARNING_RATE,
  calculateExpected 
} from './matrixCalculations';

// Node and edge layout configuration
const NODE_WIDTH = 300;
const NODE_HEIGHT = 200;
const NODE_VERTICAL_GAP = 120;
const NODE_HORIZONTAL_GAP = 450;

// Column positions
const col1_X = 200;   // Input/Data 
const col2_X = col1_X + NODE_HORIZONTAL_GAP;   // Weights/Parameters
const col3_X = col2_X + NODE_HORIZONTAL_GAP;   // Linear
const col4_X = col3_X + NODE_HORIZONTAL_GAP;   // Sigmoid
const col5_X = col4_X + NODE_HORIZONTAL_GAP;   // Loss
const col6_X = col5_X + NODE_HORIZONTAL_GAP;   // Gradients
const col7_X = col6_X + NODE_HORIZONTAL_GAP;   // Updates

// Row positions
let row1_Y = 100;   // Feature data
let row2_Y = row1_Y + NODE_HEIGHT + NODE_VERTICAL_GAP;  // Target data
let row3_Y = row2_Y + NODE_HEIGHT + NODE_VERTICAL_GAP;  // Forward pass
let row4_Y = row3_Y + NODE_HEIGHT + NODE_VERTICAL_GAP;  // Loss
let row5_Y = row4_Y + NODE_HEIGHT + NODE_VERTICAL_GAP;  // Backward pass
let row6_Y = row5_Y + NODE_HEIGHT + NODE_VERTICAL_GAP;  // Parameter updates

// Node definitions
export const initialNodes: Node[] = [
  // Introduction node
  {
    id: 'intro-logistic-regression',
    type: 'introNode',
    position: { x: -400, y: 60 },
    data: { 
      title: 'Logistic Regression',
      description: 'Explore a student admission prediction model using logistic regression',
    }
  },
  
  // DATA NODES
  // Features (X)
  {
    id: 'features',
    type: 'matrix',
    position: { x: col1_X, y: row1_Y },
    data: {
      label: 'Features Matrix (X)',
      description: 'Student exam scores (Exam1, Exam2)',
      matrix: FEATURES_MATRIX
    }
  },
  // Target (y)
  {
    id: 'target',
    type: 'matrix',
    position: { x: col1_X + 2500, y: row2_Y - 700},
    data: {
      label: 'Target Matrix (y)',
      description: 'Admission results (0=No, 1=Yes)',
      matrix: TARGET_MATRIX
    }
  },
  
  // MODEL PARAMETERS
  // Weights (w)
  {
    id: 'weights',
    type: 'matrix',
    position: { x: col2_X, y: row1_Y - 120},
    data: {
      label: 'Weights (w)',
      description: 'Model parameters',
      matrix: WEIGHTS_MATRIX
    }
  },
  // Bias (b)
  {
    id: 'bias',
    type: 'matrix',
    position: { x: col2_X, y: row2_Y },
    data: {
      label: 'Bias (b)',
      description: 'Bias term',
      matrix: BIAS_MATRIX
    }
  },
  
  // FORWARD PASS NODES
  // Linear calculation
  {
    id: 'linear-calc',
    type: 'calculation',
    position: { x: col3_X +
        300, y: row3_Y - 710},
    data: {
      label: 'Calculate Linear Combination',
      formula: 'z = X × w + b',
      description: 'Linear part of logistic regression',
      expectedMatrix: calculateExpected('linear'),
      step: 'linear',
      hint: 'Multiply features by weights and add bias'
    }
  },
  
  // Sigmoid activation
  {
    id: 'sigmoid-calc',
    type: 'calculation',
    position: { x: col4_X + 700, y: row3_Y - 710},
    data: {
      label: 'Apply Sigmoid Function',
      formula: 'ŷ = σ(z) = 1/(1+e^(-z))',
      description: 'Converts linear values to probabilities (0-1)',
      expectedMatrix: calculateExpected('sigmoid'),
      step: 'sigmoid',
      hint: 'Apply sigmoid function to each element: 1/(1+e^(-z))'
    }
  },
  
  // Loss calculation
  {
    id: 'loss-calc',
    type: 'calculation',
    position: { x: col5_X + 1300, y: row3_Y - 600},
    data: {
      label: 'Calculate Loss',
      formula: 'Loss = -(1/m)∑[y·log(ŷ) + (1-y)·log(1-ŷ)]',
      description: 'Binary cross-entropy loss function',
      expectedMatrix: calculateExpected('loss'),
      step: 'loss',
      hint: 'Apply binary cross-entropy formula'
    }
  },
  
  // BACKWARD PASS NODES
  // Gradient calculation for weights
  {
    id: 'grad-weights-calc',
    type: 'calculation',
    position: { x: col6_X + 1700, y: row3_Y - 900},
    data: {
      label: 'Calculate Weight Gradients',
      formula: '∇w = (1/m) X^T × (ŷ - y)',
      description: 'Gradient of loss with respect to weights',
      expectedMatrix: calculateExpected('gradient-weights'),
      step: 'gradient-weights',
      hint: 'Transpose X, multiply by prediction error, divide by m'
    }
  },
  
  // Gradient calculation for bias
  {
    id: 'grad-bias-calc',
    type: 'calculation',
    position: { x: col6_X + 1700, y: row3_Y - 400},
    data: {
      label: 'Calculate Bias Gradient',
      formula: '∇b = (1/m) ∑(ŷ - y)',
      description: 'Gradient of loss with respect to bias',
      expectedMatrix: calculateExpected('gradient-bias'),
      step: 'gradient-bias',
      hint: 'Sum all prediction errors, divide by m'
    }
  },
  
  // Update weights
  {
    id: 'update-weights',
    type: 'calculation',
    position: { x: col7_X + 2000, y: row3_Y - 900},
    data: {
      label: 'Update Weights',
      formula: 'w = w - α × ∇w',
      description: `Learning rate α = ${LEARNING_RATE}`,
      expectedMatrix: calculateExpected('update-weights'),
      step: 'update-weights',
      hint: 'Subtract scaled gradient from current weights'
    }
  },
  
  // Update bias
  {
    id: 'update-bias',
    type: 'calculation',
    position: { x: col7_X + 2000, y: row3_Y - 400},
    data: {
      label: 'Update Bias',
      formula: 'b = b - α × ∇b',
      description: `Learning rate α = ${LEARNING_RATE}`,
      expectedMatrix: calculateExpected('update-bias'),
      step: 'update-bias',
      hint: 'Subtract scaled gradient from current bias'
    }
  }
];

// Edge definitions
export const initialEdges: Edge[] = [
  // Features to linear calculation
  {
    id: 'features-to-linear',
    source: 'features',
    target: 'linear-calc',
    animated: true
  },
  // Weights to linear calculation
  {
    id: 'weights-to-linear',
    source: 'weights',
    target: 'linear-calc',
    animated: true
  },
  // Bias to linear calculation
  {
    id: 'bias-to-linear',
    source: 'bias',
    target: 'linear-calc',
    animated: true
  },
  // Linear to sigmoid
  {
    id: 'linear-to-sigmoid',
    source: 'linear-calc',
    target: 'sigmoid-calc',
    animated: true
  },
  // Sigmoid to loss calculation
  {
    id: 'sigmoid-to-loss',
    source: 'sigmoid-calc',
    target: 'loss-calc',
    animated: true
  },
  // Target to loss calculation
  {
    id: 'target-to-loss',
    source: 'target',
    target: 'loss-calc',
    animated: true,
    style: { stroke: '#9333ea' }
  },
  // Loss to gradient calculations
  {
    id: 'loss-to-grad-weights',
    source: 'loss-calc',
    target: 'grad-weights-calc',
    animated: true,
    style: { stroke: '#9333ea' }
  },
  {
    id: 'loss-to-grad-bias',
    source: 'loss-calc',
    target: 'grad-bias-calc',
    animated: true,
    style: { stroke: '#9333ea' }
  },
  // Features to weight gradients
//   {
//     id: 'features-to-grad-weights',
//     source: 'features',
//     target: 'grad-weights-calc',
//     animated: true
//   },
  // Sigmoid to weight gradients
//   {
//     id: 'sigmoid-to-grad-weights',
//     source: 'sigmoid-calc',
//     target: 'grad-weights-calc',
//     animated: true
//   },
//   // Sigmoid to bias gradients
//   {
//     id: 'sigmoid-to-grad-bias',
//     source: 'sigmoid-calc',
//     target: 'grad-bias-calc',
//     animated: true
//   },
//   // Weights to update weights
//   {
//     id: 'weights-to-update',
//     source: 'weights',
//     target: 'update-weights',
//     animated: true
//   },
//  // Bias to update bias
//   {
//     id: 'bias-to-update',
//     source: 'bias',
//     target: 'update-bias',
//     animated: true
//   },
  // Gradients to updates
  {
    id: 'grad-weights-to-update',
    source: 'grad-weights-calc',
    target: 'update-weights',
    animated: true,
    style: { stroke: '#9333ea' }
  },
  {
    id: 'grad-bias-to-update',
    source: 'grad-bias-calc',
    target: 'update-bias',
    animated: true,
    style: { stroke: '#9333ea' }
  }
];
