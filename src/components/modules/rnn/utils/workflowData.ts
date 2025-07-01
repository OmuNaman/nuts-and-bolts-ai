// src/components/modules/rnn/utils/workflowData.ts
import type { Node, Edge } from '@xyflow/react';
import {
  VOCAB, ONE_HOT_A, ONE_HOT_B,
  W_xh, W_hh, W_hy, b_h, b_y,
  H1, Y1, PRED1, H2, Y2, PRED2,
  // Backward propagation imports
  TARGET_T1, TARGET_T2, TOTAL_LOSS, LOSS_T1, LOSS_T2,
  dL_dPred1, dL_dPred2, dL_dY1, dL_dY2,
  dL_dH1, dL_dH2_final, dL_dWhy, dL_dby,
  dL_dWxh, dL_dWhh, dL_dbh
} from './matrixCalculations';

// Node Positions - Spacing for 2 timesteps
const col_timestep_1 = 0;
const col_timestep_2 = 3000; // Spacing for the second timestep

// Backward propagation starts after forward pass
const col_backward_start = 6000; // Start backward pass after T2
const col_backward_loss = col_backward_start;
const col_backward_grad_output = col_backward_start + 800; // x base for ∂L/∂ŷ and ∂L/∂y
const col_backward_grad_hidden = col_backward_start + 1600; // x base for ∂L/∂h
// const col_backward_grad_weights = col_backward_start + 2400; // Original, will be replaced by more specific calc

// New constant for the X position of the final column of gradient (weights/biases) nodes
const col_final_grads_x = col_backward_grad_hidden + 1600; // e.g., 7600 + 1600 = 9200

const row_input = 0;
const row_h_prev = 400;
const row_calc_h = 800;
const row_backward_main = 400; // Center row for backward pass

// Consistent weight matrix positions for all timesteps
const weight_offset_x = -800; // Distance from timestep center to weights
const output_weight_offset_x = 700; // Distance from timestep center to output weights

// Position for the Intro Node, significantly to the left
const col_intro = -1500;
const row_intro_mid = (row_input + row_calc_h) / 2; // Vertically centered

export const initialNodes: Node[] = [
  // --- Intro Node ---
  {
    id: 'intro-rnn',
    type: 'introNode',
    position: { x: col_intro, y: row_intro_mid },
    data: {
      label: "Recurrent Neural Networks (RNN)",
      description: "Explore the core mechanism of RNNs by manually performing a forward pass, character by character.",
      task: "Predict the next character in a sequence given the current input and the network's 'memory' (hidden state).",
      exampleSequence: "'A' -> 'B'", // Updated sequence
      focusAreas: [
        "Hidden State: The RNN's 'memory' from previous steps.",
        "Weight Reuse: The same weights are applied at every timestep.",
        "Sequential Processing: Data flows one step at a time."
      ]
    },
    zIndex: 10
  },

  // --- Timestep 1: Input 'A' ---
  {
    id: 't1_input',
    type: 'wordVector',
    position: { x: col_timestep_1 - 300, y: row_input },
    data: {
      label: "Input: x₁ ('A')",
      matrix: ONE_HOT_A,
      description: "One-hot vector for 'A'",
      vocabulary: VOCAB
    },
    zIndex: 1
  },
  {
    id: 't1_h_prev',
    type: 'matrix',
    position: { x: col_timestep_1 - 500, y: row_h_prev + 800},
    data: {
      label: 'Prev. Hidden State: h₀',
      matrix: [[0, 0, 0, 0]],
      description: 'Starts as zeros (1x4)'
    },
    zIndex: 1
  },
  // Weight matrices for Timestep 1
  { id: 't1_w_xh', type: 'matrix', position: { x: col_timestep_1 + weight_offset_x, y: row_input }, data: { label: 'W_xh (T1)', matrix: W_xh, description: 'Input-to-Hidden (2x4)' }, zIndex: 1 },
  { id: 't1_w_hh', type: 'matrix', position: { x: col_timestep_1 + weight_offset_x, y: row_h_prev }, data: { label: 'W_hh (T1)', matrix: W_hh, description: 'Hidden-to-Hidden (4x4)' }, zIndex: 1 },
  { id: 't1_b_h', type: 'matrix', position: { x: col_timestep_1 + weight_offset_x, y: row_calc_h }, data: { label: 'b_h (T1)', matrix: b_h, description: 'Hidden Bias (1x4)' }, zIndex: 1 },
  { id: 't1_w_hy', type: 'matrix', position: { x: col_timestep_1 + output_weight_offset_x, y: row_input }, data: { label: 'W_hy (T1)', matrix: W_hy, description: 'Hidden-to-Output (4x2)' }, zIndex: 1 },
  { id: 't1_b_y', type: 'matrix', position: { x: col_timestep_1 + output_weight_offset_x, y: row_h_prev }, data: { label: 'b_y (T1)', matrix: b_y, description: 'Output Bias (1x2)' }, zIndex: 1 },

  {
    id: 't1_calc_h',
    type: 'calculation',
    position: { x: col_timestep_1 + 220, y: row_calc_h - 250},
    data: {
      label: 'Calculate Hidden State h₁',
      formula: "h₁=tanh(x₁⋅Wxh + h₀⋅Whh + bh)",
      expectedMatrix: H1,
      hint: 'Combine current input and previous memory, then apply tanh.'
    },
    zIndex: 1
  },
  {
    id: 't1_calc_y',
    type: 'calculation',
    position: { x: col_timestep_1 + 220 + 500 + 300, y: row_calc_h - 250 },
    data: {
      label: 'Calculate Output Logits y₁',
      formula: "y₁=h₁⋅Why + by",
      expectedMatrix: Y1,
      hint: 'Multiply hidden state h₁ by W_hy, then add bias b_y.',
      vocabulary: VOCAB
    },
    zIndex: 1
  },
  {
    id: 't1_pred',
    type: 'activation',
    position: { x: col_timestep_1 + 220 + 500 + 500 + 300, y: row_calc_h - 250 },
    data: {
      label: 'Predict Next Char (ŷ₁)',
      formula: "ŷ₁=Softmax(y₁)",
      expectedMatrix: PRED1,
      description: 'Probability distribution over vocabulary',
      vocabulary: VOCAB,
      highlightMax: true
    },
    zIndex: 1
  },

  // --- Timestep 2: Input 'B' ---
  {
    id: 't2_input',
    type: 'wordVector',
    position: { x: col_timestep_2 - 300, y: row_input },
    data: {
      label: "Input: x₂ ('B')",
      matrix: ONE_HOT_B,
      description: "One-hot vector for 'B'",
      vocabulary: VOCAB
    },
    zIndex: 1
  },
  {
    id: 't2_h_prev',
    type: 'matrix',
    position: { x: col_timestep_2 - 500, y: row_h_prev + 800},
    data: {
      label: 'Prev. Hidden State: h₁',
      matrix: H1,
      description: 'Hidden state from T1 (1x4)'
    },
    zIndex: 1
  },
  // Weight matrices for Timestep 2 (same as T1, demonstrating weight sharing)
  { id: 't2_w_xh', type: 'matrix', position: { x: col_timestep_2 + weight_offset_x, y: row_input }, data: { label: 'W_xh (T2)', matrix: W_xh, description: 'Input-to-Hidden (2x4)' }, zIndex: 1 },
  { id: 't2_w_hh', type: 'matrix', position: { x: col_timestep_2 + weight_offset_x, y: row_h_prev }, data: { label: 'W_hh (T2)', matrix: W_hh, description: 'Hidden-to-Hidden (4x4)' }, zIndex: 1 },
  { id: 't2_b_h', type: 'matrix', position: { x: col_timestep_2 + weight_offset_x, y: row_calc_h }, data: { label: 'b_h (T2)', matrix: b_h, description: 'Hidden Bias (1x4)' }, zIndex: 1 },
  { id: 't2_w_hy', type: 'matrix', position: { x: col_timestep_2 + output_weight_offset_x, y: row_input }, data: { label: 'W_hy (T2)', matrix: W_hy, description: 'Hidden-to-Output (4x2)' }, zIndex: 1 },
  { id: 't2_b_y', type: 'matrix', position: { x: col_timestep_2 + output_weight_offset_x, y: row_h_prev }, data: { label: 'b_y (T2)', matrix: b_y, description: 'Output Bias (1x2)' }, zIndex: 1 },

  {
    id: 't2_calc_h',
    type: 'calculation',
    position: { x: col_timestep_2 + 220, y: row_calc_h - 250},
    data: {
      label: 'Calculate Hidden State h₂',
      formula: "h₂=tanh(x₂⋅Wxh + h₁⋅Whh + bh)",
      expectedMatrix: H2,
      hint: 'Combine current input and previous memory, then apply tanh.'
    },
    zIndex: 1
  },
  {
    id: 't2_calc_y',
    type: 'calculation',
    position: { x: col_timestep_2 + 220 + 500 + 300, y: row_calc_h - 250 },
    data: {
      label: 'Calculate Output Logits y₂',
      formula: "y₂=h₂⋅Why + by",
      expectedMatrix: Y2,
      hint: 'Multiply hidden state h₂ by W_hy, then add bias b_y.',
      vocabulary: VOCAB
    },
    zIndex: 1
  },
  {
    id: 't2_pred',
    type: 'activation',
    position: { x: col_timestep_2 + 220 + 500 + 500 + 300, y: row_calc_h - 250 },
    data: {
      label: 'Predict Next Char (ŷ₂)',
      formula: "ŷ₂=Softmax(y₂)",
      expectedMatrix: PRED2,
      description: 'Probability distribution over vocabulary',
      vocabulary: VOCAB,
      highlightMax: true
    },
    zIndex: 1
  },

  // =================== BACKWARD PROPAGATION SECTION ===================

  // --- Target Labels --- (Positioned to the left of Loss Calculation)
  {
    id: 'target_t1',
    type: 'matrix',
    position: { x: col_backward_loss - 500, y: row_backward_main - 200 }, // User: col_backward_loss - 300 - 200
    data: {
      label: 'Target T1',
      matrix: TARGET_T1,
      description: 'Expected output after "A" → "B"',
      vocabulary: VOCAB
    },
    zIndex: 1
  },
  {
    id: 'target_t2',
    type: 'matrix',
    position: { x: col_backward_loss - 500, y: row_backward_main + 400 }, // User: col_backward_loss - 300 - 200, y: row_backward_main + 200 + 200
    data: {
      label: 'Target T2',
      matrix: TARGET_T2,
      description: 'Expected output after "B" → "A"',
      vocabulary: VOCAB
    },
    zIndex: 1
  },

  // --- Loss Calculation ---
  {
    id: 'loss_calculation',
    type: 'calculation',
    position: { x: col_backward_loss, y: row_backward_main },
    data: {
      label: 'Calculate Total Loss',
      formula: "L = L₁ + L₂ = -log(ŷ₁[target]) - log(ŷ₂[target])",
      expectedMatrix: [[TOTAL_LOSS]],
      hint: 'Cross-entropy loss for both timesteps combined.',
      description: `Loss T1: ${LOSS_T1.toFixed(4)}, Loss T2: ${LOSS_T2.toFixed(4)}`
    },
    zIndex: 1
  },


  // --- Gradients w.r.t. Outputs (∂L/∂ŷ) ---
  {
    id: 'grad_pred1',
    type: 'calculation',
    position: { x: col_backward_grad_output + 150, y: row_backward_main - 200 },
    data: {
      label: 'Gradient ∂L/∂ŷ₁',
      formula: "∂L/∂ŷ₁ = ŷ₁ - target₁",
      expectedMatrix: dL_dPred1,
      hint: 'Gradient of loss w.r.t. softmax output T1'
    },
    zIndex: 1
  },
  {
    id: 'grad_pred2',
    type: 'calculation',
    position: { x: col_backward_grad_output + 150, y: row_backward_main + 200 },
    data: {
      label: 'Gradient ∂L/∂ŷ₂',
      formula: "∂L/∂ŷ₂ = ŷ₂ - target₂",
      expectedMatrix: dL_dPred2,
      hint: 'Gradient of loss w.r.t. softmax output T2'
    },
    zIndex: 1
  },

  // --- Gradients w.r.t. Logits (∂L/∂y) ---
  {
    id: 'grad_y1',
    type: 'calculation',
    position: { x: col_backward_grad_output + 700, y: row_backward_main - 200 }, // User: col_backward_grad_output + 500 + 200
    data: {
      label: 'Gradient ∂L/∂y₁',
      formula: "∂L/∂y₁ = ∂L/∂ŷ₁",
      expectedMatrix: dL_dY1,
      hint: 'For cross-entropy + softmax: ∂L/∂y = ∂L/∂ŷ'
    },
    zIndex: 1
  },
  {
    id: 'grad_y2',
    type: 'calculation',
    position: { x: col_backward_grad_output + 700, y: row_backward_main + 200 }, // User: col_backward_grad_output + 500 + 200
    data: {
      label: 'Gradient ∂L/∂y₂',
      formula: "∂L/∂y₂ = ∂L/∂ŷ₂",
      expectedMatrix: dL_dY2,
      hint: 'For cross-entropy + softmax: ∂L/∂y = ∂L/∂ŷ'
    },
    zIndex: 1
  },

  // --- Gradients w.r.t. Hidden States (∂L/∂h) ---
  {
    id: 'grad_h1', // dL/dH1 depends on dL/dY1 and dL/dH2
    type: 'calculation',
    position: { x: col_backward_grad_hidden + 400, y: row_backward_main - 200},
    data: {
      label: 'Gradient ∂L/∂h₁',
      formula: "∂L/∂h₁ = (∂L/∂y₁ ⋅ W_hy^T) + (∂L/∂h₂ ⋅ ∂h₂/∂h₁)",
      expectedMatrix: dL_dH1,
      hint: 'Hidden state gradient includes contributions from current output and next hidden state'
    },
    zIndex: 1
  },
  {
    id: 'grad_h2', // dL/dH2 depends on dL/dY2
    type: 'calculation',
    position: { x: col_backward_grad_hidden + 400, y: row_backward_main + 200}, // User: col_backward_grad_hidden + 500 - 100, y: row_backward_main + 200 + 60
    data: {
      label: 'Gradient ∂L/∂h₂',
      formula: "∂L/∂h₂ = ∂L/∂y₂ ⋅ W_hy^T",
      expectedMatrix: dL_dH2_final,
      hint: 'Hidden state gradient from its output only (for this final h2)'
    },
    zIndex: 1
  },

  // --- Weight and Bias Gradients (Column: col_final_grads_x) ---
  {
    id: 'grad_why',
    type: 'calculation',
    position: { x: col_final_grads_x, y: row_backward_main - 400 - 200},
    data: {
      label: 'Gradient ∂L/∂W_hy',
      formula: "∂L/∂W_hy = h₁^T ⋅ (∂L/∂y₁) + h₂^T ⋅ (∂L/∂y₂)",
      expectedMatrix: dL_dWhy,
      hint: 'Accumulate gradients from both timesteps'
    },
    zIndex: 1
  },
  {
    id: 'grad_by',
    type: 'calculation',
    position: { x: col_final_grads_x - 500 - 200, y: row_backward_main - 200 - 500},
    data: {
      label: 'Gradient ∂L/∂b_y',
      formula: "∂L/∂b_y = (∂L/∂y₁) + (∂L/∂y₂)",
      expectedMatrix: dL_dby,
      hint: 'Sum gradients from both timesteps'
    },
    zIndex: 1
  },
  {
    id: 'grad_wxh',
    type: 'calculation',
    position: { x: col_final_grads_x, y: row_backward_main + 200 - 100 - 200 + 50}, // Centered
    data: {
      label: 'Gradient ∂L/∂W_xh',
      formula: "∂L/∂W_xh = x₁^T ⋅ δ₁ + x₂^T ⋅ δ₂ (where δ is (∂L/∂h) * tanh')",
      expectedMatrix: dL_dWxh,
      hint: 'Input-to-hidden weight gradients'
    },
    zIndex: 1
  },
  {
    id: 'grad_whh',
    type: 'calculation',
    position: { x: col_final_grads_x, y: row_backward_main + 400},
    data: {
      label: 'Gradient ∂L/∂W_hh',
      formula: "∂L/∂W_hh = h₀^T ⋅ δ₁ + h₁^T ⋅ δ₂ (where δ is (∂L/∂h) * tanh')",
      expectedMatrix: dL_dWhh,
      hint: 'Hidden-to-hidden weight gradients'
    },
    zIndex: 1
  },
  {
    id: 'grad_bh',
    type: 'calculation',
    position: { x: col_final_grads_x, y: row_backward_main + 700 + 300},
    data: {
      label: 'Gradient ∂L/∂b_h',
      formula: "∂L/∂b_h = δ₁ + δ₂ (where δ is (∂L/∂h) * tanh')",
      expectedMatrix: dL_dbh,
      hint: 'Hidden bias gradients from both timesteps'
    },
    zIndex: 1
  },
];

export const initialEdges: Edge[] = [
  // --- Timestep 1 Connections ---
  { id: 'e-t1wxh-t1h', source: 't1_w_xh', target: 't1_calc_h', style: { strokeDasharray: '5 5' } },
  { id: 'e-t1whh-t1h', source: 't1_w_hh', target: 't1_calc_h', style: { strokeDasharray: '5 5' } },
  { id: 'e-t1bh-t1h', source: 't1_b_h', target: 't1_calc_h', style: { strokeDasharray: '5 5' } },
  { id: 'e-x1-t1h', source: 't1_input', target: 't1_calc_h', animated: true },
  { id: 'e-h0-t1h', source: 't1_h_prev', target: 't1_calc_h', animated: true },
  { id: 'e-h1-t1y', source: 't1_calc_h', target: 't1_calc_y', animated: true },
  { id: 'e-t1why-t1y', source: 't1_w_hy', target: 't1_calc_y', style: { strokeDasharray: '5 5' } },
  { id: 'e-t1by-t1y', source: 't1_b_y', target: 't1_calc_y', style: { strokeDasharray: '5 5' } },
  { id: 'e-y1-t1p', source: 't1_calc_y', target: 't1_pred', animated: true },

  // --- Timestep 2 Connections ---
  { id: 'e-t2wxh-t2h', source: 't2_w_xh', target: 't2_calc_h', style: { strokeDasharray: '5 5' } },
  { id: 'e-t2whh-t2h', source: 't2_w_hh', target: 't2_calc_h', style: { strokeDasharray: '5 5' } },
  { id: 'e-t2bh-t2h', source: 't2_b_h', target: 't2_calc_h', style: { strokeDasharray: '5 5' } },
  { id: 'e-x2-t2h', source: 't2_input', target: 't2_calc_h', animated: true },
  { id: 'e-h1-t2h', source: 't2_h_prev', target: 't2_calc_h', animated: true }, // Connects to t2_h_prev
  { id: 'e-t1h-t2prev', source: 't1_calc_h', target: 't2_h_prev', animated: true, style: { stroke: '#ff6b6b', strokeWidth: 3 } }, // Hidden state flow from t1_calc_h
  { id: 'e-h2-t2y', source: 't2_calc_h', target: 't2_calc_y', animated: true },
  { id: 'e-t2why-t2y', source: 't2_w_hy', target: 't2_calc_y', style: { strokeDasharray: '5 5' } },
  { id: 'e-t2by-t2y', source: 't2_b_y', target: 't2_calc_y', style: { strokeDasharray: '5 5' } },
  { id: 'e-y2-t2p', source: 't2_calc_y', target: 't2_pred', animated: true },

  // --- BACKWARD PROPAGATION CONNECTIONS ---

  // From forward pass predictions & targets to loss calculation
  // { id: 'e-t1pred-loss', source: 't1_pred', target: 'loss_calculation', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } }, // Uncommented
  { id: 'e-t2pred-loss', source: 't2_pred', target: 'loss_calculation', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
  { id: 'e-target1-loss', source: 'target_t1', target: 'loss_calculation', style: { strokeDasharray: '5 5', stroke: '#ef4444' } },
  { id: 'e-target2-loss', source: 'target_t2', target: 'loss_calculation', style: { strokeDasharray: '5 5', stroke: '#ef4444' } },

  // Loss to output gradients (∂L/∂ŷ)
  { id: 'e-loss-gradpred1', source: 'loss_calculation', target: 'grad_pred1', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
  { id: 'e-loss-gradpred2', source: 'loss_calculation', target: 'grad_pred2', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },

  // Output gradients (∂L/∂ŷ) to logit gradients (∂L/∂y)
  { id: 'e-gradpred1-grady1', source: 'grad_pred1', target: 'grad_y1', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
  { id: 'e-gradpred2-grady2', source: 'grad_pred2', target: 'grad_y2', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },

  // Logit gradients (∂L/∂y) to hidden gradients (∂L/∂h)
  { id: 'e-grady1-gradh1', source: 'grad_y1', target: 'grad_h1', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } }, // ∂L/∂y₁ contributes to ∂L/∂h₁
  { id: 'e-grady2-gradh2', source: 'grad_y2', target: 'grad_h2', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } }, // ∂L/∂y₂ contributes to ∂L/∂h₂

  // Gradients to Weight/Bias Gradients
  // ∂L/∂W_hy and ∂L/∂b_y
  { id: 'e-gradh1-gradwhy', source: 'grad_h1', target: 'grad_why', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } }, // h₁ contributes to ∂L/∂W_hy via y₁
  { id: 'e-gradh2-gradwhy', source: 'grad_h2', target: 'grad_why', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } }, // h₂ contributes to ∂L/∂W_hy via y₂

  // ∂L/∂W_xh, ∂L/∂W_hh, ∂L/∂b_h
  { id: 'e-gradh1-gradwxh', source: 'grad_h1', target: 'grad_wxh', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } }, // ∂L/∂h₁ contributes to ∂L/∂W_xh (via x₁)
  { id: 'e-gradh2-gradwxh', source: 'grad_h2', target: 'grad_wxh', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } }, // ∂L/∂h₂ contributes to ∂L/∂W_xh (via x₂)
  { id: 'e-gradh1-gradwhh', source: 'grad_h1', target: 'grad_whh', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } }, // ∂L/∂h₁ contributes to ∂L/∂W_hh (via h₀)
  { id: 'e-gradh2-gradwhh', source: 'grad_h2', target: 'grad_whh', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } }, // ∂L/∂h₂ contributes to ∂L/∂W_hh (via h₁)
  { id: 'e-gradh1-gradbh', source: 'grad_h1', target: 'grad_bh', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },   // ∂L/∂h₁ contributes to ∂L/∂b_h
  { id: 'e-gradh2-gradbh', source: 'grad_h2', target: 'grad_bh', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },   // ∂L/∂h₂ contributes to ∂L/∂b_h
];
