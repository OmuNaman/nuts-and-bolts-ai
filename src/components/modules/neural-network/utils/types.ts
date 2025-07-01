// src/components/modules/neural-network/utils/types.ts

export type NeuralNetworkStep = 
  // Forward pass steps
  | "input" 
  | "z1" | "a1" 
  | "z2" | "a2" 
  | "z3" | "a3" 
  | "loss" 
  // Backward pass steps
  | "dz3" | "dw3" | "db3" 
  | "dz2" | "dw2" | "db2" 
  | "dz1" | "dw1" | "db1";

export interface StepData {
  title: string;
  description: string;
  formula: string;
  resultName: string;
  inputMatrices: {
    name: string;
    data: number[][];
  }[];
  expectedMatrix: number[][];
  hint: string;
}

export interface EducationalContent {
  stepNumber: string;
  title: string;
  explanation: string;
  importance: string;
  example: string;
  tips: string[];
}
