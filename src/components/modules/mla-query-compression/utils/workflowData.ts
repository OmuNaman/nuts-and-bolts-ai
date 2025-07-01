// src/components/modules/mla-query-compression/utils/workflowData.ts
import { Node, Edge } from '@xyflow/react';
import {
  INPUT_H_T, W_DQ, W_UQ, W_DKV, W_UK, W_UV,
  calculateExpected // Keep only calculateExpected as getInitialExpected is not strictly needed for node data if calculateExpected provides initial.
} from './mlaQcCalculations';

const col1 = 0, col2 = 600, col3 = 1200, col4 = 1800, col5 = 2400, col6 = 3000;
const row_mid = 500;
const row_offset_large = 500;
const row_offset_small = 350;

export const initialNodes: Node[] = [
  // --- Column 1: Input ---
  { id: 'input', type: 'matrix', position: { x: col1, y: row_mid }, data: { label: 'Input Hidden State (hₜ)', matrix: INPUT_H_T, description: '1x8 Vector' } },

  // --- Column 2: Down-Projection Weights ---
  { id: 'w_dq', type: 'matrix', position: { x: col2, y: row_mid - row_offset_large }, data: { label: 'Query Down-Projection (W_DQ)', matrix: W_DQ, description: '8x3 Matrix' } },
  { id: 'w_dkv', type: 'matrix', position: { x: col2, y: row_mid + row_offset_large }, data: { label: 'KV Down-Projection (W_DKV)', matrix: W_DKV, description: '8x2 Matrix' } },

  // --- Column 3: Compressed Latent Vectors ---
  {
    id: 'calc_c_q',
    type: 'calculation',
    position: { x: col3, y: row_mid - row_offset_large },
    data: {
      label: '1. Compress Query (c_q)',
      formula: "c_q = hₜ · W_DQ",
      expectedMatrix: calculateExpected('c_q'),
      hint: "Compress the input into a smaller query representation."
    }
  },
  {
    id: 'calc_c_kv',
    type: 'calculation',
    position: { x: col3, y: row_mid + row_offset_large },
    data: {
      label: '2. Compress K & V (c_KV)',
      formula: "c_KV = hₜ · W_DKV",
      expectedMatrix: calculateExpected('c_kv'),
      hint: "Compress the input into a shared latent vector for Key and Value."
    }
  },

  // --- Column 4: Up-Projection Weights ---
  { id: 'w_uq', type: 'matrix', position: { x: col4, y: row_mid - row_offset_large }, data: { label: 'Query Up-Projection (W_UQ)', matrix: W_UQ, description: '3x4 Matrix' } },
  { id: 'w_uk', type: 'matrix', position: { x: col4, y: row_mid + row_offset_small - 150 }, data: { label: 'Key Up-Projection (W_UK)', matrix: W_UK, description: '2x4 Matrix' } },
  { id: 'w_uv', type: 'matrix', position: { x: col4, y: row_mid + row_offset_large + 150 }, data: { label: 'Value Up-Projection (W_UV)', matrix: W_UV, description: '2x4 Matrix' } },
  
  // --- Column 5: Reconstructed Q, K, V ---
  {
    id: 'calc_q_recon',
    type: 'calculation',
    position: { x: col5, y: row_mid - row_offset_large },
    data: {
      label: '3. Reconstruct Query (q)',
      formula: "q = c_q · W_UQ",
      expectedMatrix: calculateExpected('q_recon'),
      hint: "Project the compressed query back to its full dimension."
    }
  },
  {
    id: 'calc_k_recon',
    type: 'calculation',
    position: { x: col5, y: row_mid + row_offset_small - 150 },
    data: {
      label: '4. Reconstruct Key (k)',
      formula: "k = c_KV · W_UK",
      expectedMatrix: calculateExpected('k_recon'),
      hint: "Project the latent KV vector to the full key dimension."
    }
  },
  {
    id: 'calc_v_recon',
    type: 'calculation',
    position: { x: col5, y: row_mid + row_offset_large + 150 },
    data: {
      label: '5. Reconstruct Value (v)',
      formula: "v = c_KV · W_UV",
      expectedMatrix: calculateExpected('v_recon'),
      hint: "Multiply the 1x2 latent vector by the 2x4 value up-projection weights."
    }
  },

  // --- Column 6: Final Attention (Now a regular Calculation Node) ---
  {
    id: 'attention-summary',
    // --- CHANGED: Type to 'calculation' ---
    type: 'calculation',
    position: { x: col6, y: row_mid },
    data: {
      label: '6. Final Attention', // Updated label to match the sequence
      description: "The Query attends to the reconstructed Keys & Values.",
      formula: "Output = Softmax((Q · Kᵀ)/√d) · V",
      // --- CHANGED: Use expectedMatrix for validation ---
      expectedMatrix: calculateExpected('attention_calc'),
      // --- ADDED: Hint property for the calculation node ---
      hint: 'Multiply the Query (Q) by the transpose of the reconstructed Key (Kᵀ), divide by √d, then apply Softmax. Finally, multiply the result by the reconstructed Value (V).',
    },
  },
];

export const initialEdges: Edge[] = [
  { id: 'e-h-wdq', source: 'input', target: 'w_dq' },
  { id: 'e-h-wdkv', source: 'input', target: 'w_dkv' },
  { id: 'e-wdq-cq', source: 'w_dq', target: 'calc_c_q', animated: true },
  { id: 'e-wdkv-ckv', source: 'w_dkv', target: 'calc_c_kv', animated: true },
  
  { id: 'e-cq-wuq', source: 'calc_c_q', target: 'w_uq' },
  { id: 'e-ckv-wuk', source: 'calc_c_kv', target: 'w_uk' },
  { id: 'e-ckv-wuv', source: 'calc_c_kv', target: 'w_uv' },

  { id: 'e-wuq-q', source: 'w_uq', target: 'calc_q_recon', animated: true },
  { id: 'e-wuk-k', source: 'w_uk', target: 'calc_k_recon', animated: true },
  { id: 'e-wuv-v', source: 'w_uv', target: 'calc_v_recon', animated: true },

  // These edges now connect to the 'calculation' node for final attention
  { id: 'e-q-attn', source: 'calc_q_recon', target: 'attention-summary', animated: true },
  { id: 'e-k-attn', source: 'calc_k_recon', target: 'attention-summary', animated: true },
  { id: 'e-v-attn', source: 'calc_v_recon', target: 'attention-summary', animated: true },
];