// src/components/modules/multi-head-latent-attention/utils/workflowData.ts
import { Node, Edge } from '@xyflow/react';
import {
  INPUT_H_T, W_Q, W_DKV, W_UK, W_UV,
  calculateExpected
} from './mlaCalculations';

const col1 = 0, col2 = 600, col3 = 1200, col4 = 1800, col5 = 2400, col6 = 3000;
const row_mid = 500;
const row_offset = 400;

export const initialNodes: Node[] = [
  // --- Column 1: Input ---
  { id: 'input', type: 'matrix', position: { x: col1, y: row_mid }, data: { label: 'Input Hidden State (hₜ)', matrix: INPUT_H_T, description: '1x8 Vector' } },

  // --- Column 2: Initial Projection Weights ---
  { id: 'w_q', type: 'matrix', position: { x: col2, y: row_mid - row_offset }, data: { label: 'Query Weights (Wq)', matrix: W_Q, description: '8x4 Matrix' } },
  { id: 'w_dkv', type: 'matrix', position: { x: col2, y: row_mid + row_offset }, data: { label: 'KV Down-Projection (W_DKV)', matrix: W_DKV, description: '8x2 Matrix (Bottleneck)' } },
  
  // --- Column 3: Q and Latent KV Calculation ---
  { id: 'calc_q', type: 'calculation', position: { x: col3, y: row_mid - row_offset }, data: { label: '1. Calculate Query (q)', formula: "q = hₜ · Wq", expectedMatrix: calculateExpected('q'), hint: "Multiply the 1x8 input by the 8x4 query weights." } },
  { id: 'calc_c_kv', type: 'calculation', position: { x: col3, y: row_mid + row_offset }, data: { label: '2. Compress to Latent (c_KV)', formula: "c_KV = hₜ · W_DKV", expectedMatrix: calculateExpected('c_kv'), hint: "Multiply the 1x8 input by the 8x2 down-projection weights. This is the compressed KV cache!" } },

  // --- Column 4: Up-Projection Weights ---
  { id: 'w_uk', type: 'matrix', position: { x: col4, y: row_mid }, data: { label: 'Key Up-Projection (W_UK)', matrix: W_UK, description: '2x4 Matrix' } },
  { id: 'w_uv', type: 'matrix', position: { x: col4, y: row_mid + row_offset * 1.5 }, data: { label: 'Value Up-Projection (W_UV)', matrix: W_UV, description: '2x4 Matrix' } },

  // --- Column 5: Reconstruct K and V ---
  { id: 'calc_k', type: 'calculation', position: { x: col5, y: row_mid }, data: { label: '3. Reconstruct Key (k)', formula: "k = c_KV · W_UK", expectedMatrix: calculateExpected('k_recon'), hint: "Multiply the 1x2 latent vector by the 2x4 key up-projection weights." } },
  { id: 'calc_v', type: 'calculation', position: { x: col5, y: row_mid + row_offset * 1.5 }, data: { label: '4. Reconstruct Value (v)', formula: "v = c_KV · W_UV", expectedMatrix: calculateExpected('v_recon'), hint: "Multiply the 1x2 latent vector by the 2x4 value up-projection weights." } },

  // --- Column 6: Final Attention ---
  {
    id: 'attention-summary',
    // CHANGED: Use the generic 'calculation' node type instead of 'attentionSummary'
    type: 'calculation', // Changed from 'attentionSummary' to 'calculation'
    position: { x: col6, y: row_mid },
    data: {
      label: '5. Attention Calculation', // Label updated to match sequence
      description: "The Query attends to the reconstructed Keys & Values.",
      formula: "Output = Softmax((Q · Kᵀ)/√d) · V",
      // CHANGED: Use 'expectedMatrix' instead of 'finalOutput'
      expectedMatrix: calculateExpected('attention_calc'),
      // ADDED: A hint for the calculation node
      hint: 'Multiply the Query (Q) by the transpose of the reconstructed Key (Kᵀ), divide by √d, then apply Softmax. Finally, multiply the result by the reconstructed Value (V).',
    },
  },
];

export const initialEdges: Edge[] = [
  { id: 'e-h-wq', source: 'input', target: 'w_q' },
  { id: 'e-h-wdkv', source: 'input', target: 'w_dkv' },
  { id: 'e-wq-q', source: 'w_q', target: 'calc_q', animated: true },
  { id: 'e-wdkv-ckv', source: 'w_dkv', target: 'calc_c_kv', animated: true },
  
  { id: 'e-ckv-wuk', source: 'calc_c_kv', target: 'w_uk' },
  { id: 'e-ckv-wuv', source: 'calc_c_kv', target: 'w_uv' },
  
  { id: 'e-wuk-k', source: 'w_uk', target: 'calc_k', animated: true },
  { id: 'e-wuv-v', source: 'w_uv', target: 'calc_v', animated: true },

  { id: 'e-q-attn', source: 'calc_q', target: 'attention-summary', animated: true },
  { id: 'e-k-attn', source: 'calc_k', target: 'attention-summary', animated: true },
  { id: 'e-v-attn', source: 'calc_v', target: 'attention-summary', animated: true },
];