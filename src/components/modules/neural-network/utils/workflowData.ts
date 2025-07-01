// src/components/modules/neural-network/utils/workflowData.ts
import type { Node, Edge } from '@xyflow/react';
import { 
  NN_INPUT, NN_W1, NN_B1, NN_W2, NN_B2, NN_W3, NN_B3, Y_TRUE,
  Z1, A1, Z2, A2, Z3, A3, LOSS, 
  dZ3, dW3, db3, dZ2, dW2, db2, dZ1, dW1, db1,
  calculateExpected
} from './matrixCalculations';

// --- Node Positions ---
const col0 = 0, col1 = 600, col2 = 1200, col3 = 1800, col4 = 2400, col5 = 3000, col6 = 3600;
// Forward Pass Rows
const rowW = 0, rowZ = 400, rowB = 800;
// Backward Pass Rows
const rowdZ = 1200, rowdW = 1600;

export const initialNodes: Node[] = [
  // --- FORWARD PASS NODES ---
  { id: 'input', type: 'matrix', position: { x: col0, y: rowZ }, data: { label: 'Input (A⁰)', matrix: NN_INPUT, description: '1x2 Vector' } },
  { id: 'w1', type: 'matrix', position: { x: col1, y: rowW }, data: { label: 'Weights W¹', matrix: NN_W1, description: '2x4 Matrix' } },
  { id: 'b1', type: 'matrix', position: { x: col1, y: rowB }, data: { label: 'Biases b¹', matrix: NN_B1, description: '1x4 Vector' } },
  { id: 'calc-z1', type: 'calculation', position: { x: col2, y: rowZ }, data: { label: 'Calculate Z¹', formula: "Z¹=(A⁰⋅W¹)+b¹", expectedMatrix: Z1, hint: 'Input ⋅ W¹ + b¹' } },
  { id: 'activate-a1', type: 'activation', position: { x: col2 + 600, y: rowZ }, data: { label: 'Activate A¹', formula: "A¹=ReLU(Z¹)", expectedMatrix: A1 } },
  { id: 'w2', type: 'matrix', position: { x: col3, y: rowW }, data: { label: 'Weights W²', matrix: NN_W2, description: '4x4 Matrix' } },
  { id: 'b2', type: 'matrix', position: { x: col3, y: rowB }, data: { label: 'Biases b²', matrix: NN_B2, description: '1x4 Vector' } },
  { id: 'calc-z2', type: 'calculation', position: { x: col4, y: rowZ }, data: { label: 'Calculate Z²', formula: "Z²=(A¹⋅W²)+b²", expectedMatrix: Z2, hint: 'A¹ ⋅ W² + b²' } },
  { id: 'activate-a2', type: 'activation', position: { x: col4 + 600, y: rowZ }, data: { label: 'Activate A²', formula: "A²=ReLU(Z²)", expectedMatrix: A2 } },
  { id: 'w3', type: 'matrix', position: { x: col5, y: rowW }, data: { label: 'Weights W³', matrix: NN_W3, description: '4x2 Matrix' } },
  { id: 'b3', type: 'matrix', position: { x: col5, y: rowB }, data: { label: 'Biases b³', matrix: NN_B3, description: '1x2 Vector' } },
  { id: 'calc-z3', type: 'calculation', position: { x: col6, y: rowZ }, data: { label: 'Calculate Z³', formula: "Z³=(A²⋅W³)+b³", expectedMatrix: Z3, hint: 'A² ⋅ W³ + b³' } },
  { id: 'activate-a3', type: 'activation', position: { x: col6 + 600, y: rowZ }, data: { label: 'Activate A³', formula: "A³=Softmax(Z³)", expectedMatrix: A3 } },
  { id: 'y_true', type: 'matrix', position: { x: col6 + 1200 - 100 - 100 - 50 - 50 - 50 - 50, y: rowW + 500 + 200 + 100 - 50}, data: { label: 'Correct Answer (Y)', matrix: Y_TRUE, description: '1x2 Ground Truth' } },
  { id: 'calc-loss', type: 'calculation', position: { x: col6 + 1200, y: rowZ }, data: { label: 'Calculate Loss', formula: "L=-Σ(Y⋅log(A³))", expectedMatrix: LOSS, hint: 'Apply Cross-Entropy Loss' } },

  // --- BACKWARD PASS NODES ---
  { id: 'calc-dz3', type: 'calculation', position: { x: col6 + 500 + 500 + 600, y: rowdZ - 200-100 }, data: { label: 'Gradient dZ³', formula: "dZ³=A³-Y", expectedMatrix: dZ3, hint: 'Prediction - Correct Answer' } },
  { id: 'calc-dw3', type: 'calculation', position: { x: col5 + 1000 + 500 + 1000 + 200 + 100, y: rowdW - 1000 - 500 + 200 + 50}, data: { label: 'Gradient dW³', formula: "dW³=A²ᵀ⋅dZ³", expectedMatrix: dW3, hint: 'Transpose of A² ⋅ dZ³' } },
  { id: 'calc-db3', type: 'calculation', position: { x: col5 + 1000 + 500 + 1000 + 200 + 100, y: rowdW + 400 - 750}, data: { label: 'Gradient db³', formula: "db³=dZ³", expectedMatrix: db3, hint: 'The gradient of the bias is just dZ³' } },
  { id: 'calc-dz2', type: 'calculation', position: { x: col4 + 1000 + 500 + 1000 + 200 + 100 + 300 + 200 + 100, y: rowdZ - 100 - 100 - 50 - 50}, data: { label: 'Gradient dZ²', formula: "dZ²=(dZ³⋅W³ᵀ)*Relu'(Z²)", expectedMatrix: dZ2, hint: 'Propagate error back and apply derivative of activation' } },
  { id: 'calc-dw2', type: 'calculation', position: { x: col3 + 4000 + 500 + 200, y: rowdW - 500 - 500 - 300 + 50}, data: { label: 'Gradient dW²', formula: "dW²=A¹ᵀ⋅dZ²", expectedMatrix: dW2, hint: 'Transpose of A¹ ⋅ dZ²' } },
  { id: 'calc-db2', type: 'calculation', position: { x: col3 + 4000 + 500 + 200, y: rowdW + 400 - 750}, data: { label: 'Gradient db²', formula: "db²=dZ²", expectedMatrix: db2, hint: 'The gradient of the bias is just dZ²' } },
  { id: 'calc-dz1', type: 'calculation', position: { x: col2 + 4000 + 500 + 500 + 300, y: rowdZ - 200 - 100}, data: { label: 'Gradient dZ¹', formula: "dZ¹=(dZ²⋅W²ᵀ)*Relu'(Z¹)", expectedMatrix: dZ1, hint: 'Propagate error back and apply derivative of activation' } },
  { id: 'calc-dw1', type: 'calculation', position: { x: col1 + 4000 + 500 + 500 + 300 + 1000 + 200, y: rowdW - 1000 - 500 + 200 + 50 + 50 + 50}, data: { label: 'Gradient dW¹', formula: "dW¹=A⁰ᵀ⋅dZ¹", expectedMatrix: dW1, hint: 'Transpose of Input (A⁰) ⋅ dZ¹' } },
  { id: 'calc-db1', type: 'calculation', position: { x: col1 + 4000 + 500 + 500 + 300 + 1000 + 200, y: rowdW + 400 - 750}, data: { label: 'Gradient db¹', formula: "db¹=dZ¹", expectedMatrix: db1, hint: 'The gradient of the bias is just dZ¹' } },
];

export const initialEdges: Edge[] = [
  // --- FORWARD PASS EDGES ---
  { id: 'e-input-z1', source: 'input', target: 'calc-z1' }, { id: 'e-w1-z1', source: 'w1', target: 'calc-z1' }, { id: 'e-b1-z1', source: 'b1', target: 'calc-z1' },
  { id: 'e-z1-a1', source: 'calc-z1', target: 'activate-a1' },
  { id: 'e-a1-z2', source: 'activate-a1', target: 'calc-z2' }, { id: 'e-w2-z2', source: 'w2', target: 'calc-z2' }, { id: 'e-b2-z2', source: 'b2', target: 'calc-z2' },
  { id: 'e-z2-a2', source: 'calc-z2', target: 'activate-a2' },
  { id: 'e-a2-z3', source: 'activate-a2', target: 'calc-z3' }, { id: 'e-w3-z3', source: 'w3', target: 'calc-z3' }, { id: 'e-b3-z3', source: 'b3', target: 'calc-z3' },
  { id: 'e-z3-a3', source: 'calc-z3', target: 'activate-a3' },
  { id: 'e-a3-loss', source: 'activate-a3', target: 'calc-loss' }, { id: 'e-y-loss', source: 'y_true', target: 'calc-loss' },

  // --- BACKWARD PASS EDGES ---
  // { id: 'e-loss-dz3', source: 'calc-loss', target: 'calc-dz3', animated: true, style: { stroke: '#ef4444' } },
  { id: 'e-a3-dz3', source: 'activate-a3', target: 'calc-dz3', animated: true, style: { stroke: '#ef4444' } },
  { id: 'e-y-dz3', source: 'y_true', target: 'calc-dz3', animated: true, style: { stroke: '#ef4444' } },

  { id: 'e-dz3-dw3', source: 'calc-dz3', target: 'calc-dw3', animated: true, style: { stroke: '#ef4444' } },
  { id: 'e-dz3-db3', source: 'calc-dz3', target: 'calc-db3', animated: true, style: { stroke: '#ef4444' } },

  { id: 'e-dz3-dz2', source: 'calc-dz3', target: 'calc-dz2', animated: true, style: { stroke: '#ef4444' } },
  
  { id: 'e-dz2-dw2', source: 'calc-dz2', target: 'calc-dw2', animated: true, style: { stroke: '#ef4444' } },
  { id: 'e-dz2-db2', source: 'calc-dz2', target: 'calc-db2', animated: true, style: { stroke: '#ef4444' } },

  { id: 'e-dz2-dz1', source: 'calc-dz2', target: 'calc-dz1', animated: true, style: { stroke: '#ef4444' } },

  { id: 'e-dz1-dw1', source: 'calc-dz1', target: 'calc-dw1', animated: true, style: { stroke: '#ef4444' } },
  { id: 'e-dz1-db1', source: 'calc-dz1', target: 'calc-db1', animated: true, style: { stroke: '#ef4444' } },
]