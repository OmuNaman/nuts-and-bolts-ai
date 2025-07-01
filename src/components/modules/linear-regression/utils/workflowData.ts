// src/components/modules/linear-regression/utils/workflowData.ts
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
const col3_X = col2_X + NODE_HORIZONTAL_GAP;   // Predictions
const col4_X = col3_X + NODE_HORIZONTAL_GAP;   // Loss
const col5_X = col4_X + NODE_HORIZONTAL_GAP;   // Gradients
const col6_X = col5_X + NODE_HORIZONTAL_GAP;   // Updates

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
    id: 'intro-linear-regression',
    type: 'introNode',
    position: { x: -300, y: 60 },
    data: { 
      title: 'Linear Regression',
      description: 'Explore a simple house price prediction model using linear regression',
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
      description: 'House size (sqft in 1000s) and #bedrooms',
      matrix: FEATURES_MATRIX
    }
  },
  // Target (y)
  {
    id: 'target',
    type: 'matrix',
    position: { x: col1_X + 1450, y: row2_Y - 700},
    data: {
      label: 'Target Matrix (y)',
      description: 'House prices ($10,000s)',
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
  // Prediction calculation
  {
    id: 'prediction-calc',
    type: 'calculation',
    position: { x: col3_X, y: row3_Y - 710},
    data: {
      label: 'Calculate Predictions',
      formula: 'ŷ = X × w + b',
      description: 'Linear regression prediction formula',
      expectedMatrix: calculateExpected('prediction'),
      step: 'prediction'
    }
  },
  
  // Loss calculation
  {
    id: 'loss-calc',
    type: 'calculation',
    position: { x: col4_X + 500, y: row3_Y - 600},
    data: {
      label: 'Calculate Loss',
      formula: 'Loss = MSE = (1/m) Σ(ŷ - y)²',
      description: 'Mean Squared Error loss function',
      expectedMatrix: calculateExpected('loss'),
      step: 'loss'
    }
  },
  
  // BACKWARD PASS NODES
  // Gradient calculation for weights
  {
    id: 'grad-weights-calc',
    type: 'calculation',
    position: { x: col4_X + 1250, y: row3_Y - 900},
    data: {      label: 'Calculate Weight Gradients',
      formula: '∇w = (2/m) X^T × (ŷ - y)',
      description: 'Gradient of loss with respect to weights',
      expectedMatrix: calculateExpected('gradient-weights'),
      step: 'gradient-weights'
    }
  },
  
  // Gradient calculation for bias
  {
    id: 'grad-bias-calc',
    type: 'calculation',
    position: { x: col4_X + 1250, y: row3_Y - 400},
    data: {      label: 'Calculate Bias Gradient',
      formula: '∇b = (2/m) Σ(ŷ - y)',
      description: 'Gradient of loss with respect to bias',
      expectedMatrix: calculateExpected('gradient-bias'),
      step: 'gradient-bias'
    }
  },
  
  // Update weights
  {
    id: 'update-weights',
    type: 'calculation',
    position: { x: col4_X + 1750, y: row3_Y - 900},
    data: {      label: 'Update Weights',
      formula: 'w = w - α × ∇w',
      description: `Learning rate α = ${LEARNING_RATE}`,
      expectedMatrix: calculateExpected('update-weights'),
      step: 'update-weights'
    }
  },
  
  // Update bias
  {
    id: 'update-bias',
    type: 'calculation',
    position: { x: col4_X + 1750, y: row3_Y - 400},
    data: {      label: 'Update Bias',
      formula: 'b = b - α × ∇b',
      description: `Learning rate α = ${LEARNING_RATE}`,
      expectedMatrix: calculateExpected('update-bias'),
      step: 'update-bias'
    }
  }
];

// Edge definitions
export const initialEdges: Edge[] = [
  // Features to prediction calculation
  {
    id: 'features-to-prediction',
    source: 'features',
    target: 'prediction-calc',
    animated: true
  },
  // Weights to prediction calculation
  {
    id: 'weights-to-prediction',
    source: 'weights',
    target: 'prediction-calc',
    animated: true
  },
  // Bias to prediction calculation
  {
    id: 'bias-to-prediction',
    source: 'bias',
    target: 'prediction-calc',
    animated: true
  },
  // Prediction to loss calculation
  {
    id: 'prediction-to-loss',
    source: 'prediction-calc',
    target: 'loss-calc',
    animated: true
  },
  // Target to loss calculation
  {
    id: 'target-to-loss',
    source: 'target',
    target: 'loss-calc',
    animated: true,
    style: { stroke: '#ff0072' }
  },
  // Loss to gradient calculations
  {
    id: 'loss-to-grad-weights',
    source: 'loss-calc',
    target: 'grad-weights-calc',
    animated: true,
    style: { stroke: '#ff0072' }
  },
  {
    id: 'loss-to-grad-bias',
    source: 'loss-calc',
    target: 'grad-bias-calc',
    animated: true,
    style: { stroke: '#ff0072' }
  },
  // Gradients to updates
  {
    id: 'grad-weights-to-update',
    source: 'grad-weights-calc',
    target: 'update-weights',
    animated: true,
    style: { stroke: '#ff0072' }
  },
  {
    id: 'grad-bias-to-update',
    source: 'grad-bias-calc',
    target: 'update-bias',
    animated: true,
    style: { stroke: '#ff0072' }
  },
];
