// src/components/modules/mla-rope/utils/workflowData.ts
import { Node, Edge } from '@xyflow/react';
import {
  INPUT_H_T, W_DQ, W_UQ, W_DKV, W_UK, W_UV, W_QR, W_KR,
  calculateExpected
} from './ropeCalculations';

// Define layout constants
const col1 = 0, col2 = 600, col3 = 1200, col4 = 1800, col5 = 2400, col6 = 3000, col7 = 3600, col8 = 4300, col9 = 4900;
const row_mid = 1000;
const row_offset_top = 600;
const row_offset_bottom_start = 600;
const vertical_spacing_kv = 350;

export const initialNodes: Node[] = [
  // Input
  { id: 'input_h_t', type: 'matrix', position: { x: col1, y: row_mid }, data: { label: 'Input Hidden State (hₜ)', matrix: INPUT_H_T, description: '1x8 Vector' } },

  // --- TOP: Content Query Path ---
  { id: 'w_dq', type: 'matrix', position: { x: col2, y: row_mid - row_offset_top }, data: { label: 'Query Down-Projection (W_DQ)', matrix: W_DQ, description: '8x3 Matrix' } },
  { id: 'calc_c_q', type: 'calculation', position: { x: col3, y: row_mid - row_offset_top }, data: { label: 'Compress Query (c_Q)', formula: "c_q = hₜ · W_DQ", expectedMatrix: calculateExpected('c_q'), hint: "Compress input for the query path." } },
  { id: 'w_uq', type: 'matrix', position: { x: col4, y: row_mid - row_offset_top }, data: { label: 'Query Up-Projection (W_UQ)', matrix: W_UQ, description: '3x4 Matrix' } },
  { id: 'calc_q_content', type: 'calculation', position: { x: col5, y: row_mid - row_offset_top }, data: { label: 'Content Query (q_C)', formula: "q_C = c_Q · W_UQ", expectedMatrix: calculateExpected('q_content'), hint: "Reconstruct the content part of the query." } },

  // --- MIDDLE: RoPE Path ---
  { id: 'w_qr', type: 'matrix', position: { x: col5, y: row_mid - 200 }, data: { label: 'RoPE Query Weights (W_QR)', matrix: W_QR, description: '3x2 Matrix' } },
  { id: 'calc_q_rope_pre', type: 'calculation', position: { x: col6, y: row_mid - 200 }, data: { label: 'Pre-RoPE Query (q_R)', formula: "q_R_pre = c_Q · W_QR", expectedMatrix: calculateExpected('q_rope_pre'), hint: "Project latent query to RoPE dimension." } },
  {
    id: 'apply_rope_q', type: 'calculation', position: { x: col7, y: row_mid - 200 },
    data: { label: 'Apply RoPE to Query', formula: "q_R_pos = [-y, x]", expectedMatrix: calculateExpected('q_rope_post'), hint: 'For each pair of values [x, y], transform them to [-y, x] to simulate rotation.', description: "Inject positional data" }
  },
  
  { id: 'w_kr', type: 'matrix', position: { x: col5, y: row_mid + 200 }, data: { label: 'RoPE Key Weights (W_KR)', matrix: W_KR, description: '8x2 Matrix' } },
  { id: 'calc_k_rope_pre', type: 'calculation', position: { x: col6, y: row_mid + 200 }, data: { label: 'Pre-RoPE Key (k_R)', formula: "k_R_pre = h_t · W_KR", expectedMatrix: calculateExpected('k_rope_pre'), hint: "Project input to RoPE dimension." } },
  {
    id: 'apply_rope_k', type: 'calculation', position: { x: col7, y: row_mid + 200 },
    data: { label: 'Apply RoPE to Key', formula: "k_R_pos = [-y, x]", expectedMatrix: calculateExpected('k_rope_post'), hint: 'For each pair of values [x, y], transform them to [-y, x] to simulate rotation.', description: "Inject positional data" }
  },

  // --- BOTTOM: KV Path ---
  { id: 'w_dkv', type: 'matrix', position: { x: col2, y: row_mid + row_offset_bottom_start }, data: { label: 'KV Down-Projection (W_DKV)', matrix: W_DKV, description: '8x2 Matrix' } },
  { id: 'calc_c_kv', type: 'calculation', position: { x: col3, y: row_mid + row_offset_bottom_start + 132 }, data: { label: 'Compress K & V (c_KV)', formula: "c_KV = hₜ · W_DKV", expectedMatrix: calculateExpected('c_kv'), hint: "Compress input for the K and V paths." } },
  
  { id: 'w_uk', type: 'matrix', position: { x: col4, y: (row_mid + row_offset_bottom_start - vertical_spacing_kv / 2) + 80 }, data: { label: 'Key Up-Projection (W_UK)', matrix: W_UK, description: '2x4 Matrix' } },
  { id: 'calc_k_content', type: 'calculation', position: { x: col5, y: (row_mid + row_offset_bottom_start - vertical_spacing_kv / 2) + 330 }, data: { label: 'Content Key (k_C)', formula: "k_C = c_KV · W_UK", expectedMatrix: calculateExpected('k_content'), hint: "Reconstruct the content part of the key." } },
  
  { id: 'w_uv', type: 'matrix', position: { x: col4, y: (row_mid + row_offset_bottom_start + vertical_spacing_kv / 2) + 300 }, data: { label: 'Value Up-Projection (W_UV)', matrix: W_UV, description: '2x4 Matrix' } },
  { id: 'calc_v_final', type: 'calculation', position: { x: col5, y: (row_mid + row_offset_bottom_start + vertical_spacing_kv / 2) + 280 }, data: { label: 'Final Value (V)', formula: "V = c_KV · W_UV", expectedMatrix: calculateExpected('v_final'), hint: "Reconstruct the final value vector." } },

  // --- Concatenation (Now as Calculation Nodes) ---
  {
    id: 'concat_q', type: 'calculation', position: { x: col8, y: row_mid - 400 },
    data: { label: 'Final Query (Q)', formula: "Q = [q_C ; q_R]", expectedMatrix: calculateExpected('q_final'), description: "Concatenate Content and RoPE queries", hint: "Take the 4 values from the Content Query and the 2 values from the RoPE Query and place them side-by-side to form a new 1x6 vector." }
  },
  {
    id: 'concat_k', type: 'calculation', position: { x: col8, y: row_mid + 400 },
    data: { label: 'Final Key (K)', formula: "K = [k_C ; k_R]", expectedMatrix: calculateExpected('k_final'), description: "Concatenate Content and RoPE keys", hint: "Take the 4 values from the Content Key and the 2 values from the RoPE Key and place them side-by-side to form a new 1x6 vector." }
  },

  // --- Final Attention ---
  {
    id: 'attention-calc', type: 'calculation', position: { x: col9, y: row_mid },
    data: { label: 'Final Attention', formula: "Output = Softmax((Q·Kᵀ)/√d)·V", expectedMatrix: calculateExpected('attention_calc'), hint: 'Calculate final attention using concatenated Q/K and reconstructed V.', description: "The final output vector" }
  },
];

export const initialEdges: Edge[] = [
  // --- Query Content Path ---
  { id: 'e-h-wdq', source: 'input_h_t', target: 'w_dq' },
  { id: 'e-wdq-cq', source: 'w_dq', target: 'calc_c_q', animated: true },
  { id: 'e-cq-wuq', source: 'calc_c_q', target: 'w_uq' },
  { id: 'e-wuq-q_content', source: 'w_uq', target: 'calc_q_content', animated: true },

  // --- KV Content Path ---
  { id: 'e-h-wdkv', source: 'input_h_t', target: 'w_dkv' },
  { id: 'e-wdkv-ckv', source: 'w_dkv', target: 'calc_c_kv', animated: true },
  { id: 'e-ckv-wuk', source: 'calc_c_kv', target: 'w_uk' },
  { id: 'e-wuk-k_content', source: 'w_uk', target: 'calc_k_content', animated: true },
  { id: 'e-ckv-wuv', source: 'calc_c_kv', target: 'w_uv' },
  { id: 'e-wuv-v_final', source: 'w_uv', target: 'calc_v_final', animated: true },
  
  // --- RoPE Path ---
  { id: 'e-cq-wqr', source: 'calc_c_q', target: 'w_qr' },
  { id: 'e-wqr-q_rope_pre', source: 'w_qr', target: 'calc_q_rope_pre', animated: true },
  { id: 'e-q_rope_pre-apply_q', source: 'calc_q_rope_pre', target: 'apply_rope_q', animated: true, style: { stroke: '#818cf8', strokeWidth: 2 } },
  
  { id: 'e-h-wkr', source: 'input_h_t', target: 'w_kr' },
  { id: 'e-wkr-k_rope_pre', source: 'w_kr', target: 'calc_k_rope_pre', animated: true },
  { id: 'e-k_rope_pre-apply_k', source: 'calc_k_rope_pre', target: 'apply_rope_k', animated: true, style: { stroke: '#818cf8', strokeWidth: 2 } },

  // --- Concatenation ---
  { id: 'e-q_content-concat_q', source: 'calc_q_content', target: 'concat_q', animated: true },
  { id: 'e-apply_q-concat_q', source: 'apply_rope_q', target: 'concat_q', animated: true, style: { stroke: '#818cf8' } },
  
  { id: 'e-k_content-concat_k', source: 'calc_k_content', target: 'concat_k', animated: true },
  { id: 'e-apply_k-concat_k', source: 'apply_rope_k', target: 'concat_k', animated: true, style: { stroke: '#818cf8' } },
  
  // --- Final Attention ---
  { id: 'e-concat_q-attn', source: 'concat_q', target: 'attention-calc', animated: true },
  { id: 'e-concat_k-attn', source: 'concat_k', target: 'attention-calc', animated: true },
  { id: 'e-v_final-attn', source: 'calc_v_final', target: 'attention-calc', animated: true },
];