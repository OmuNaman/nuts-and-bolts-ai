// src/components/modules/multi-head-attention/utils/workflowData.ts
import type { Node, Edge } from '@xyflow/react';

// Head color themes for visual differentiation
const HEAD_COLORS = {
  1: {
    primary: '#ef4444',    // Red
    secondary: '#fef2f2',  // Light red
    border: '#dc2626'      // Dark red
  },
  2: {
    primary: '#14b8a6',    // Teal
    secondary: '#f0fdfa',  // Light teal
    border: '#0d9488'      // Dark teal
  },
  3: {
    primary: '#3b82f6',    // Blue
    secondary: '#eff6ff',  // Light blue
    border: '#2563eb'      // Dark blue
  }
};

// Define column X positions
const col0_X = 150;   // Input (Note: 'Input Matrix' node uses col0_X - 1000)
const col1_X = 700;   // W matrices
const col2_X = 1250;  // Q, K, V calculations
const col2_5_X = 1550; // K_Transpose CALCULATION nodes
const col3_X = 1900;  // Scores calculations
const col4_X = 2550;  // Softmax calculations (Output_hX is calculated here)
const col5_X = 3200;  // Concatenation
const col6_X = 3850;  // Wo matrix
const col7_X = 4400;  // Final Output

// Define head Y base positions and intra-head row spacing
const head1_Y_base = 150;
const head2_Y_base = 1500;
const head3_Y_base = 2850;

const row_spacing_within_head = 350; // Vertical distance between Wq/Wk/Wv or Q/K/V

// Y positions for rows within a head block
const head_row0_offset = 0;
const head_row1_offset = row_spacing_within_head;
const head_row2_offset = 2 * row_spacing_within_head;


export const initialNodes: Node[] = [
  // Input Matrix (5×6)
  {
    id: 'input',
    type: 'matrix',
    position: { x: col0_X - 1000, y: head2_Y_base + head_row1_offset },
    data: {
      label: 'Input Matrix',
      matrix: [ // Updated from Solution Sheet: Input X
        [1.0, 1.0, 0.0, 0.0, 0.0, 0.0],
        [1.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 0.0, 0.0, 1.0, 1.0]
      ],
      description: 'Input embeddings (5×6)',
      isInput: true
    }
  },

  // ====================== HEAD 1 (RED) ======================
  {
    id: 'wq-head1', type: 'matrix', position: { x: col1_X, y: head1_Y_base + head_row0_offset - 500},
    data: { label: 'Wq Matrix', matrix: [[10,0],[0,10],[0,0],[0,0],[0,0],[0,0]], description: 'Query weights (6×2)', headNumber: 1, headColor: HEAD_COLORS[1]}
  },
  {
    id: 'wk-head1', type: 'matrix', position: { x: col1_X, y: head1_Y_base + head_row1_offset - 300},
    data: { label: 'Wk Matrix', matrix: [[2,0],[0,2],[0,0],[0,0],[0,0],[0,0]], description: 'Key weights (6×2)', headNumber: 1, headColor: HEAD_COLORS[1]}
  },
  {
    id: 'wv-head1', type: 'matrix', position: { x: col1_X, y: head1_Y_base + head_row2_offset },
    data: { label: 'Wv Matrix', matrix: [[1,0],[0,1],[0,0],[0,0],[0,0],[0,0]], description: 'Value weights (6×2)', headNumber: 1, headColor: HEAD_COLORS[1]}
  },
  {
    id: 'calc-q-head1', type: 'calculation', position: { x: col2_X, y: head1_Y_base + head_row0_offset - 548 },
    data: { label: 'Calculate Q₁', formula: 'Q₁ = Input × Wq₁', description: 'Query matrix for Head 1 (5x2)', 
            expectedMatrix: [[10.0, 10.0], [10.0, 0.0], [ 0.0, 0.0], [ 0.0, 0.0], [ 0.0, 0.0]], // Q1 from sheet
            hint: 'Multiply input (5×6) with Wq₁ (6×2)', headNumber: 1, headColor: HEAD_COLORS[1]}
  },
  {
    id: 'calc-k-head1', type: 'calculation', position: { x: col2_X, y: head1_Y_base + head_row1_offset - 300},
    data: { label: 'Calculate K₁', formula: 'K₁ = Input × Wk₁', description: 'Key matrix for Head 1 (5x2)', 
            expectedMatrix: [[ 2.0, 2.0], [ 2.0, 0.0], [ 0.0, 0.0], [ 0.0, 0.0], [ 0.0, 0.0]], // K1 from sheet
            hint: 'Multiply input (5×6) with Wk₁ (6×2)', headNumber: 1, headColor: HEAD_COLORS[1]}
  },
  {
    id: 'k-transpose-head1', type: 'calculation', position: { x: col2_5_X + 250, y: head1_Y_base + head_row1_offset - 300 },
    data: {
      label: 'Transpose K₁',
      formula: 'K₁ᵀ = transpose(K₁)',
      description: 'Transposed Key Matrix (2×5)',
      expectedMatrix: [[2.0, 2.0, 0.0, 0.0, 0.0], [2.0, 0.0, 0.0, 0.0, 0.0]], // K1_T from sheet
      hint: 'Rearrange rows of K₁ to columns (or vice-versa) to get K₁ᵀ.',
      headNumber: 1, headColor: HEAD_COLORS[1]
    }
  },
  {
    id: 'calc-v-head1', type: 'calculation', position: { x: col2_X + 450, y: head1_Y_base + head_row2_offset - 50}, 
    data: { label: 'Calculate V₁', formula: 'V₁ = Input × Wv₁', description: 'Value matrix for Head 1 (5x2)', 
            expectedMatrix: [[ 1.0, 1.0], [ 1.0, 0.0], [ 0.0, 0.0], [ 0.0, 0.0], [ 0.0, 0.0]], // V1 from sheet
            hint: 'Multiply input (5×6) with Wv₁ (6×2)', headNumber: 1, headColor: HEAD_COLORS[1]}
  },
  {
    id: 'calc-scores-head1', type: 'calculation', position: { x: col3_X + 500, y: (head1_Y_base + head_row0_offset + head1_Y_base + head_row1_offset - 1250) / 2 }, 
    data: { label: 'Attention Scores₁', formula: 'Scores₁ = (Q₁ × K₁ᵀ) / √2', description: 'Scaled scores Head 1 (5x5)', 
            expectedMatrix: [ // ScaledAttentionScores_h1 from sheet
              [28.2843, 14.1421,  0.0,  0.0,  0.0],
              [14.1421, 14.1421,  0.0,  0.0,  0.0],
              [ 0.0,  0.0,  0.0,  0.0,  0.0],
              [ 0.0,  0.0,  0.0,  0.0,  0.0],
              [ 0.0,  0.0,  0.0,  0.0,  0.0]
            ], 
            hint: 'Q₁ × K₁ᵀ then divide by √2 (≈1.4142)', headNumber: 1, headColor: HEAD_COLORS[1]}
  },
  {
    id: 'calc-softmax-head1', type: 'calculation', position: { x: col4_X + 600, y: (( (head1_Y_base + head_row0_offset + head1_Y_base + head_row1_offset) / 2 ) + (head1_Y_base + head_row2_offset)) / 2 }, 
    data: { label: 'Attention Output₁', formula: 'Output₁ = softmax(Scores₁) × V₁', description: 'Output Head 1 (5x2)', 
            expectedMatrix: [ // Output_h1 from sheet
              [1.0000, 1.0000],
              [1.0000, 0.5000],
              [0.4000, 0.2000],
              [0.4000, 0.2000],
              [0.4000, 0.2000]
            ], 
            hint: 'Softmax(Scores₁) × V₁', headNumber: 1, headColor: HEAD_COLORS[1]}
  },

  // ====================== HEAD 2 (TEAL) ======================
  {
    id: 'wq-head2', type: 'matrix', position: { x: col1_X, y: head2_Y_base + head_row0_offset  },
    data: { label: 'Wq Matrix', matrix: [[0,0],[0,0],[10,0],[0,10],[0,0],[0,0]], description: 'Query weights (6×2)', headNumber: 2, headColor: HEAD_COLORS[2]}
  },
  {
    id: 'wk-head2', type: 'matrix', position: { x: col1_X, y: head2_Y_base + head_row1_offset + 250},
    data: { label: 'Wk Matrix', matrix: [[0,0],[0,0],[2,0],[0,2],[0,0],[0,0]], description: 'Key weights (6×2)', headNumber: 2, headColor: HEAD_COLORS[2]}
  },
  {
    id: 'wv-head2', type: 'matrix', position: { x: col1_X, y: head2_Y_base + head_row2_offset + 250 + 250},
    data: { label: 'Wv Matrix', matrix: [[0,0],[0,0],[1,0],[0,1],[0,0],[0,0]], description: 'Value weights (6×2)', headNumber: 2, headColor: HEAD_COLORS[2]}
  },
  {
    id: 'calc-q-head2', type: 'calculation', position: { x: col2_X, y: head2_Y_base + head_row0_offset },
    data: { label: 'Calculate Q₂', formula: 'Q₂ = Input × Wq₂', description: 'Query matrix for Head 2 (5x2)', 
            expectedMatrix: [[ 0.0, 0.0], [ 0.0, 0.0], [10.0, 10.0], [ 0.0, 10.0], [ 0.0, 0.0]], // Q2 from sheet
            hint: 'Multiply input (5×6) with Wq₂ (6×2)', headNumber: 2, headColor: HEAD_COLORS[2]}
  },
  {
    id: 'calc-k-head2', type: 'calculation', position: { x: col2_X, y: head2_Y_base + head_row1_offset + 250},
    data: { label: 'Calculate K₂', formula: 'K₂ = Input × Wk₂', description: 'Key matrix for Head 2 (5x2)', 
            expectedMatrix: [[ 0.0, 0.0], [ 0.0, 0.0], [ 2.0, 2.0], [ 0.0, 2.0], [ 0.0, 0.0]], // K2 from sheet
            hint: 'Multiply input (5×6) with Wk₂ (6×2)', headNumber: 2, headColor: HEAD_COLORS[2]}
  },
  {
    id: 'k-transpose-head2', type: 'calculation', position: { x: col2_5_X + 250, y: head2_Y_base + head_row1_offset + 250 },
    data: {
      label: 'Transpose K₂',
      formula: 'K₂ᵀ = transpose(K₂)',
      description: 'Transposed Key Matrix (2×5)',
      expectedMatrix: [[0.0, 0.0, 2.0, 0.0, 0.0], [0.0, 0.0, 2.0, 2.0, 0.0]], // K2_T from sheet
      hint: 'Rearrange rows of K₂ to columns (or vice-versa) to get K₂ᵀ.',
      headNumber: 2, headColor: HEAD_COLORS[2]
    }
  },
  {
    id: 'calc-v-head2', type: 'calculation', position: { x: col2_X + 450, y: head2_Y_base + head_row2_offset + 250 + 250},
    data: { label: 'Calculate V₂', formula: 'V₂ = Input × Wv₂', description: 'Value matrix for Head 2 (5x2)', 
            expectedMatrix: [[ 0.0, 0.0], [ 0.0, 0.0], [ 1.0, 1.0], [ 0.0, 1.0], [ 0.0, 0.0]], // V2 from sheet
            hint: 'Multiply input (5×6) with Wv₂ (6×2)', headNumber: 2, headColor: HEAD_COLORS[2]}
  },
  {
    id: 'calc-scores-head2', type: 'calculation', position: { x: col3_X + 500, y: (head2_Y_base + head_row0_offset + head2_Y_base + head_row1_offset) / 2 },
    data: { label: 'Attention Scores₂', formula: 'Scores₂ = (Q₂ × K₂ᵀ) / √2', description: 'Scaled scores Head 2 (5x5)', 
            expectedMatrix: [ // ScaledAttentionScores_h2 from sheet
              [ 0.0,  0.0,  0.0,  0.0,  0.0],
              [ 0.0,  0.0,  0.0,  0.0,  0.0],
              [ 0.0,  0.0, 28.2843, 14.1421,  0.0],
              [ 0.0,  0.0, 14.1421, 14.1421,  0.0],
              [ 0.0,  0.0,  0.0,  0.0,  0.0]
            ], 
            hint: 'Q₂ × K₂ᵀ then divide by √2 (≈1.4142)', headNumber: 2, headColor: HEAD_COLORS[2]}
  },
  {
    id: 'calc-softmax-head2', type: 'calculation', position: { x: col4_X + 600, y: (( (head2_Y_base + head_row0_offset + head2_Y_base + head_row1_offset) / 2 ) + (head2_Y_base + head_row2_offset)) / 2 },
    data: { label: 'Attention Output₂', formula: 'Output₂ = softmax(Scores₂) × V₂', description: 'Output Head 2 (5x2)', 
            expectedMatrix: [ // Output_h2 from sheet
              [0.2000, 0.4000],
              [0.2000, 0.4000],
              [1.0000, 1.0000],
              [0.5000, 1.0000],
              [0.2000, 0.4000]
            ], 
            hint: 'Softmax(Scores₂) × V₂', headNumber: 2, headColor: HEAD_COLORS[2]}
  },

  // ====================== HEAD 3 (BLUE) ======================
  {
    id: 'wq-head3', type: 'matrix', position: { x: col1_X, y: head3_Y_base + head_row0_offset + 500 },
    data: { label: 'Wq Matrix', matrix: [[0,0],[0,0],[0,0],[0,0],[10,0],[0,10]], description: 'Query weights (6×2)', headNumber: 3, headColor: HEAD_COLORS[3]}
  },
  {
    id: 'wk-head3', type: 'matrix', position: { x: col1_X, y: head3_Y_base + head_row1_offset +500 + 200},
    data: { label: 'Wk Matrix', matrix: [[0,0],[0,0],[0,0],[0,0],[2,0],[0,2]], description: 'Key weights (6×2)', headNumber: 3, headColor: HEAD_COLORS[3]}
  },
  {
    id: 'wv-head3', type: 'matrix', position: { x: col1_X, y: head3_Y_base + head_row2_offset + 500+200+200},
    data: { label: 'Wv Matrix', matrix: [[0,0],[0,0],[0,0],[0,0],[1,0],[0,1]], description: 'Value weights (6×2)', headNumber: 3, headColor: HEAD_COLORS[3]}
  },
  {
    id: 'calc-q-head3', type: 'calculation', position: { x: col2_X, y: head3_Y_base + head_row0_offset + 500},
    data: { label: 'Calculate Q₃', formula: 'Q₃ = Input × Wq₃', description: 'Query matrix for Head 3 (5x2)', 
            expectedMatrix: [[ 0.0, 0.0], [ 0.0, 0.0], [ 0.0, 0.0], [ 0.0, 0.0], [10.0, 10.0]], // Q3 from sheet
            hint: 'Multiply input (5×6) with Wq₃ (6×2)', headNumber: 3, headColor: HEAD_COLORS[3]}
  },
  {
    id: 'calc-k-head3', type: 'calculation', position: { x: col2_X, y: head3_Y_base + head_row1_offset + 500 + 200},
    data: { label: 'Calculate K₃', formula: 'K₃ = Input × Wk₃', description: 'Key matrix for Head 3 (5x2)', 
            expectedMatrix: [[ 0.0, 0.0], [ 0.0, 0.0], [ 0.0, 0.0], [ 0.0, 0.0], [ 2.0, 2.0]], // K3 from sheet
            hint: 'Multiply input (5×6) with Wk₃ (6×2)', headNumber: 3, headColor: HEAD_COLORS[3]}
  },
  {
    id: 'k-transpose-head3', type: 'calculation', position: { x: col2_5_X + 250, y: head3_Y_base + head_row1_offset + 500 + 200 },
    data: {
      label: 'Transpose K₃',
      formula: 'K₃ᵀ = transpose(K₃)',
      description: 'Transposed Key Matrix (2×5)',
      expectedMatrix: [[0.0, 0.0, 0.0, 0.0, 2.0], [0.0, 0.0, 0.0, 0.0, 2.0]], // K3_T from sheet
      hint: 'Rearrange rows of K₃ to columns (or vice-versa) to get K₃ᵀ.',
      headNumber: 3, headColor: HEAD_COLORS[3]
    }
  },
  {
    id: 'calc-v-head3', type: 'calculation', position: { x: col2_X + 450, y: head3_Y_base + head_row2_offset + 500 + 200 +200},
    data: { label: 'Calculate V₃', formula: 'V₃ = Input × Wv₃', description: 'Value matrix for Head 3 (5x2)', 
            expectedMatrix: [[ 0.0, 0.0], [ 0.0, 0.0], [ 0.0, 0.0], [ 0.0, 0.0], [ 1.0, 1.0]], // V3 from sheet
            hint: 'Multiply input (5×6) with Wv₃ (6×2)', headNumber: 3, headColor: HEAD_COLORS[3]}
  },
  {
    id: 'calc-scores-head3', type: 'calculation', position: { x: col3_X + 500, y: (head3_Y_base + head_row0_offset + head3_Y_base + 500 + 500 + 200 + head_row1_offset) / 2  },
    data: { label: 'Attention Scores₃', formula: 'Scores₃ = (Q₃ × K₃ᵀ) / √2', description: 'Scaled scores Head 3 (5x5)', 
            expectedMatrix: [ // ScaledAttentionScores_h3 from sheet
              [ 0.0,  0.0,  0.0,  0.0,  0.0],
              [ 0.0,  0.0,  0.0,  0.0,  0.0],
              [ 0.0,  0.0,  0.0,  0.0,  0.0],
              [ 0.0,  0.0,  0.0,  0.0,  0.0],
              [ 0.0,  0.0,  0.0,  0.0, 28.2843]
            ], 
            hint: 'Q₃ × K₃ᵀ then divide by √2 (≈1.4142)', headNumber: 3, headColor: HEAD_COLORS[3]}
  },
  {
    id: 'calc-softmax-head3', type: 'calculation', position: { x: col4_X + 600, y: (( (head3_Y_base + head_row0_offset + head3_Y_base + head_row1_offset + 4000) / 2 ) + (head3_Y_base + head_row2_offset)) / 2 },
    data: { label: 'Attention Output₃', formula: 'Output₃ = softmax(Scores₃) × V₃', description: 'Output Head 3 (5x2)', 
            expectedMatrix: [ // Output_h3 from sheet
              [0.2000, 0.2000],
              [0.2000, 0.2000],
              [0.2000, 0.2000],
              [0.2000, 0.2000],
              [1.0000, 1.0000]
            ], 
            hint: 'Softmax(Scores₃) × V₃', headNumber: 3, headColor: HEAD_COLORS[3]}
  },

  // ====================== CONCATENATION & FINAL OUTPUT ======================
  {
    id: 'concat-matrix', type: 'calculation', position: { x: col5_X + 1000 + 50+50+50+50, y: head2_Y_base + head_row1_offset },
    data: { label: 'Concatenate Heads', formula: 'Concat = [O₁|O₂|O₃]', description: 'Concatenated outputs (5×6)', 
            expectedMatrix: [ // Output_concat from sheet
              [1.0000, 1.0000, 0.2000, 0.4000, 0.2000, 0.2000],
              [1.0000, 0.5000, 0.2000, 0.4000, 0.2000, 0.2000],
              [0.4000, 0.2000, 1.0000, 1.0000, 0.2000, 0.2000],
              [0.4000, 0.2000, 0.5000, 1.0000, 0.2000, 0.2000],
              [0.4000, 0.2000, 0.2000, 0.4000, 1.0000, 1.0000]
            ], 
            hint: 'Concatenate O₁, O₂, O₃ horizontally'}
  },
  {
    id: 'wo-matrix', type: 'matrix', position: { x: col6_X + 500 + 50 + 100 + 200 + 150, y: head2_Y_base + head_row1_offset - 500 },
    data: { label: 'Wo Matrix', 
            matrix: [ // Wo (Identity) from sheet
              [1.0, 0.0, 0.0, 0.0, 0.0, 0.0],
              [0.0, 1.0, 0.0, 0.0, 0.0, 0.0],
              [0.0, 0.0, 1.0, 0.0, 0.0, 0.0],
              [0.0, 0.0, 0.0, 1.0, 0.0, 0.0],
              [0.0, 0.0, 0.0, 0.0, 1.0, 0.0],
              [0.0, 0.0, 0.0, 0.0, 0.0, 1.0]
            ], 
            description: 'Output weights (6×6)'}
  },
  {
    id: 'calc-output', type: 'calculation', position: { x: col7_X + 500 + 500, y: head2_Y_base + head_row1_offset },
    data: { label: 'Final Output', formula: 'Output = Concat × Wo', description: 'Final MHA output (5×6)', 
            expectedMatrix: [ // MHA_Final_Output from sheet
              [1.0000, 1.0000, 0.2000, 0.4000, 0.2000, 0.2000],
              [1.0000, 0.5000, 0.2000, 0.4000, 0.2000, 0.2000],
              [0.4000, 0.2000, 1.0000, 1.0000, 0.2000, 0.2000],
              [0.4000, 0.2000, 0.5000, 1.0000, 0.2000, 0.2000],
              [0.4000, 0.2000, 0.2000, 0.4000, 1.0000, 1.0000]
            ], 
            hint: 'Multiply Concat (5×6) with Wo (6×6)'}
  }
];

// Edges remain the same as they correctly connect the logical flow
export const initialEdges: Edge[] = [
  // Input to all weight matrices across all heads
  { id: 'e-input-wq1', source: 'input', target: 'wq-head1', animated: true },
  { id: 'e-input-wk1', source: 'input', target: 'wk-head1', animated: true },
  { id: 'e-input-wv1', source: 'input', target: 'wv-head1', animated: true },
  { id: 'e-input-wq2', source: 'input', target: 'wq-head2', animated: true },
  { id: 'e-input-wk2', source: 'input', target: 'wk-head2', animated: true },
  { id: 'e-input-wv2', source: 'input', target: 'wv-head2', animated: true },
  { id: 'e-input-wq3', source: 'input', target: 'wq-head3', animated: true },
  { id: 'e-input-wk3', source: 'input', target: 'wk-head3', animated: true },
  { id: 'e-input-wv3', source: 'input', target: 'wv-head3', animated: true },

  // Weight matrices to Q, K, V calculations for each head
  { id: 'e-wq1-calcq1', source: 'wq-head1', target: 'calc-q-head1' },
  { id: 'e-wk1-calck1', source: 'wk-head1', target: 'calc-k-head1' }, 
  { id: 'e-wv1-calcv1', source: 'wv-head1', target: 'calc-v-head1' },
  { id: 'e-wq2-calcq2', source: 'wq-head2', target: 'calc-q-head2' },
  { id: 'e-wk2-calck2', source: 'wk-head2', target: 'calc-k-head2' }, 
  { id: 'e-wv2-calcv2', source: 'wv-head2', target: 'calc-v-head2' },
  { id: 'e-wq3-calcq3', source: 'wq-head3', target: 'calc-q-head3' },
  { id: 'e-wk3-calck3', source: 'wk-head3', target: 'calc-k-head3' }, 
  { id: 'e-wv3-calcv3', source: 'wv-head3', target: 'calc-v-head3' },

  // K calculations to K_Transpose nodes
  { id: 'e-calck1-kT1', source: 'calc-k-head1', target: 'k-transpose-head1' },
  { id: 'e-calck2-kT2', source: 'calc-k-head2', target: 'k-transpose-head2' },
  { id: 'e-calck3-kT3', source: 'calc-k-head3', target: 'k-transpose-head3' },

  // Q and K_Transpose to attention scores for each head
  { id: 'e-q1-scores1', source: 'calc-q-head1', target: 'calc-scores-head1' },
  { id: 'e-kT1-scores1', source: 'k-transpose-head1', target: 'calc-scores-head1' },
  { id: 'e-q2-scores2', source: 'calc-q-head2', target: 'calc-scores-head2' },
  { id: 'e-kT2-scores2', source: 'k-transpose-head2', target: 'calc-scores-head2' },
  { id: 'e-q3-scores3', source: 'calc-q-head3', target: 'calc-scores-head3' },
  { id: 'e-kT3-scores3', source: 'k-transpose-head3', target: 'calc-scores-head3' },

  // Scores and V to softmax/attention output for each head
  { id: 'e-scores1-softmax1', source: 'calc-scores-head1', target: 'calc-softmax-head1' },
  { id: 'e-v1-softmax1', source: 'calc-v-head1', target: 'calc-softmax-head1' },
  { id: 'e-scores2-softmax2', source: 'calc-scores-head2', target: 'calc-softmax-head2' },
  { id: 'e-v2-softmax2', source: 'calc-v-head2', target: 'calc-softmax-head2' },
  { id: 'e-scores3-softmax3', source: 'calc-scores-head3', target: 'calc-softmax-head3' },
  { id: 'e-v3-softmax3', source: 'calc-v-head3', target: 'calc-softmax-head3' },

  // Attention outputs to concatenation
  { id: 'e-softmax1-concat', source: 'calc-softmax-head1', target: 'concat-matrix' },
  { id: 'e-softmax2-concat', source: 'calc-softmax-head2', target: 'concat-matrix' },
  { id: 'e-softmax3-concat', source: 'calc-softmax-head3', target: 'concat-matrix' },

  // Concatenation and output weights to final output
  { id: 'e-concat-output', source: 'concat-matrix', target: 'calc-output' },
  { id: 'e-wo-output', source: 'wo-matrix', target: 'calc-output' }
];
