// src/components/modules/word2vec/utils/workflowData.ts
import type { Node, Edge } from '@xyflow/react';
import { 
  VOCAB, ONE_HOT_CAT, ONE_HOT_ON, ONE_HOT_SAT, W1, W2,
  X_INPUT, H_LAYER, Z_LOGITS, Y_PRED, LOSS,
  dZ, dW2, dh, dW1, W1_NEW, W2_NEW
} from './matrixCalculations';

// --- Node Positions ---
const col_context = -650; // Intro node
const col0 = 0;        // One-hot vectors
const col1 = 600;      // Sum context
const col2 = 1200;     // W1
const col3 = 1800;     // h
const col4 = 2400;     // W2
const col5 = 3000;     // Z
const col6 = 3600;     // Y_pred, Y_true, Loss

// Backward pass columns (starting from Loss)
const col_backprop_z = col6 + 700; // dZ
const col_backprop_w = col_backprop_z + 650; // dW2, dh
const col_backprop_w1 = col_backprop_w + 650; // dW1
const col_update_w = col_backprop_w1 + 650; // W1_new, W2_new

const row_forward_mid = 400; // Main forward pass row
const row_loss_ytrue = row_forward_mid + 400; // Y_true below Y_pred
const row_backprop_dz = row_forward_mid; // dZ at same row as Loss (horizontally right)
const row_backprop_dw_dh = row_forward_mid - 200; // dW2, dh (slightly above dz)
const row_backprop_dw1 = row_forward_mid; // dW1

const row_update_w1 = row_forward_mid - 300; // W1_new (near original W1)
const row_update_w2 = row_forward_mid + 100; // W2_new (near original W2)


export const initialNodes: Node[] = [
  // --- NEW INTRODUCTION NODE ---
  { 
    id: 'intro-context', 
    type: 'context', 
    position: { x: col_context, y: row_forward_mid }, 
    data: { 
      label: "Our Training Goal",
      description: "We'll predict a target word using its surrounding context words. Then we'll see how the network learns!",
      sentence: "the cat sat on the mat",
      targetWord: "sat",
      contextWords: ["cat", "on"],
    } 
  },

  // --- Step 1: Context & One-Hot ---
  { id: 'context-cat', type: 'wordVector', position: { x: col0, y: row_forward_mid - 250 }, data: { label: "Context Word: 'cat'", matrix: ONE_HOT_CAT, description: "One-Hot Vector (1x5)", vocabulary: VOCAB } },
  { id: 'context-on', type: 'wordVector', position: { x: col0, y: row_forward_mid + 250 }, data: { label: "Context Word: 'on'", matrix: ONE_HOT_ON, description: "One-Hot Vector (1x5)", vocabulary: VOCAB } },

  // --- Step 2: Summing Context Vectors ---
  { id: 'calc-x', type: 'calculation', position: { x: col1, y: row_forward_mid }, data: { label: 'Sum Context Vectors (X)', formula: "X = Vcat + Von", expectedMatrix: X_INPUT, description: 'Combined Input Vector (1x5)', hint: 'Add the two one-hot vectors. This sums up where the context words are in the vocabulary.', vocabulary: VOCAB } },
  
  // --- Step 3: Hidden Layer (Embedding Lookup) ---
  { id: 'w1-matrix', type: 'matrix', position: { x: col2, y: row_forward_mid - 300 }, data: { label: "Embedding Matrix (W¹)", matrix: W1, description: "5x3 Matrix" } },
  { id: 'calc-h', type: 'calculation', position: { x: col3, y: row_forward_mid }, data: { label: 'Calculate Hidden Layer (h)', formula: "h = X ⋅ W¹", expectedMatrix: H_LAYER, description: "The 'Context Embedding' (1x3)", hint: "Multiply the 1x5 Input Vector (X) by the 5x3 Embedding Matrix (W¹)." } },

  // --- Step 4: Output Layer ---
  { id: 'w2-matrix', type: 'matrix', position: { x: col4, y: row_forward_mid - 300 }, data: { label: "Output Matrix (W²)", matrix: W2, description: "3x5 Matrix" } },
  { id: 'calc-z', type: 'calculation', position: { x: col5, y: row_forward_mid }, data: { label: 'Calculate Logits (Z)', formula: "Z = h ⋅ W²", expectedMatrix: Z_LOGITS, description: "Raw Vocabulary Scores (1x5)", hint: "Multiply the 1x3 Hidden Layer (h) by the 3x5 Output Matrix (W²).", vocabulary: VOCAB } },

  // --- Step 5: Prediction & Loss ---
  { id: 'activate-y-pred', type: 'activation', position: { x: col6, y: row_forward_mid }, data: { label: 'Get Prediction (ŷ)', formula: "ŷ = Softmax(Z)", expectedMatrix: Y_PRED, description: "Probability Distribution (1x5)", vocabulary: VOCAB, highlightMax: true } },
  { id: 'y-true', type: 'wordVector', position: { x: col6, y: row_loss_ytrue }, data: { label: "Correct Answer (Y)", matrix: ONE_HOT_SAT, description: "Target: 'sat' (1x5)", vocabulary: VOCAB } },
  { id: 'calc-loss', type: 'calculation', position: { x: col6 + 700, y: row_forward_mid }, data: { label: 'Calculate Loss (L)', formula: "L = -Σ(Y ⋅ log(ŷ))", expectedMatrix: LOSS, description: 'Cross-Entropy Loss (1x1)', hint: 'The formula measures how different the prediction is from the correct answer.' } },

  // --- Step 6: Backward Pass - Output Layer Gradients ---
  { id: 'calc-dz', type: 'calculation', position: { x: col_backprop_z + 700, y: row_backprop_dz }, data: { label: 'Gradient dZ', formula: "dZ = ŷ - Y", expectedMatrix: dZ, description: 'Error at Output Logits (1x5)', hint: 'Subtract the true one-hot vector from the predicted probabilities.', vocabulary: VOCAB } },
  { id: 'calc-dw2', type: 'calculation', position: { x: col_backprop_w + 650, y: row_backprop_dw_dh - 340 }, data: { label: 'Gradient dW²', formula: "dW² = hᵀ ⋅ dZ", expectedMatrix: dW2, description: 'Gradient for W² (3x5)', hint: 'Multiply the transpose of the hidden layer (h) by the error at Z (dZ).' } },
  { id: 'calc-dh', type: 'calculation', position: { x: col_backprop_w + 500 + 250, y: row_backprop_dw_dh + 250 - 10 - 10 - 10 }, data: { label: 'Gradient dh', formula: "dh = dZ ⋅ W²ᵀ", expectedMatrix: dh, description: 'Error at Hidden Layer (1x3)', hint: 'Multiply the error at Z (dZ) by the transpose of W².' } },

  // --- Step 7: Backward Pass - Embedding Layer Gradients ---
  { id: 'calc-dw1', type: 'calculation', position: { x: col_backprop_w1 + 500 + 200, y: row_backprop_dw1 - 20 - 20 -20 - 20}, data: { label: 'Gradient dW¹', formula: "dW¹ = Xᵀ ⋅ dh", expectedMatrix: dW1, description: 'Gradient for W¹ (5x3)', hint: 'Multiply the transpose of the input vector (X) by the error at h (dh).' } },

  // --- Step 8: Weight Updates ---
  { id: 'w1-new', type: 'calculation', position: { x: col_update_w + 500, y: row_update_w1 + 300}, data: { label: 'Updated W¹', formula: "W¹ = W¹ - (α ⋅ dW¹)", expectedMatrix: W1_NEW, description: 'Calculate New Embedding Matrix', hint: "Update the original W¹ weights by subtracting the gradient (dW¹) multiplied by a learning rate (α=0.05)." } },
  { id: 'w2-new', type: 'calculation', position: { x: col_update_w + 500, y: row_update_w2 - 560 }, data: { label: 'Update W²', formula: "W² = W² - (α ⋅ dW²)", expectedMatrix: W2_NEW, description: 'Calculate New Output Matrix', hint: "Update the original W² weights by subtracting the gradient (dW²) multiplied by a learning rate (α=0.05)." } },

  { id: 'results', type: 'results', position: { x: (col_backprop_w + 2000 + 300), y: row_forward_mid - 250}, data: {} }
];

export const initialEdges: Edge[] = [
  // Edges from the new context node
  { id: 'e-intro-cat', source: 'intro-context', target: 'context-cat', animated: true, style: { strokeWidth: 2, stroke: '#9ca3af' } },
  { id: 'e-intro-on', source: 'intro-context', target: 'context-on', animated: true, style: { strokeWidth: 2, stroke: '#9ca3af' } },

  // Forward Pass Edges
  { id: 'e-cat-x', source: 'context-cat', target: 'calc-x', animated: true },
  { id: 'e-on-x', source: 'context-on', target: 'calc-x', animated: true },
  
  { id: 'e-x-h', source: 'calc-x', target: 'calc-h', animated: true },
  { id: 'e-w1-h', source: 'w1-matrix', target: 'calc-h', animated: true },

  { id: 'e-h-z', source: 'calc-h', target: 'calc-z', animated: true },
  { id: 'e-w2-z', source: 'w2-matrix', target: 'calc-z', animated: true },

  { id: 'e-z-ypred', source: 'calc-z', target: 'activate-y-pred', animated: true },
  
  { id: 'e-ypred-loss', source: 'activate-y-pred', target: 'calc-loss', animated: true },
  { id: 'e-ytrue-loss', source: 'y-true', target: 'calc-loss', animated: true },

  // Backward Pass Edges
  // From Loss to dZ
  { id: 'e-loss-dz', source: 'calc-loss', target: 'calc-dz', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } }, // Red for backprop

  // From dZ to dW2 and dh
  { id: 'e-dz-dw2', source: 'calc-dz', target: 'calc-dw2', animated: true, style: { stroke: '#ef4444' } },
  { id: 'e-dz-dh', source: 'calc-dz', target: 'calc-dh', animated: true, style: { stroke: '#ef4444' } },

  // From dh to dW1
  { id: 'e-dh-dw1', source: 'calc-dh', target: 'calc-dw1', animated: true, style: { stroke: '#ef4444' } },

  // Updates to new weights
  { id: 'e-dw1-w1new', source: 'calc-dw1', target: 'w1-new', animated: true, style: { stroke: '#10b981' } },
  { id: 'e-dw2-w2new', source: 'calc-dw2', target: 'w2-new', animated: true, style: { stroke: '#10b981' } },
];
