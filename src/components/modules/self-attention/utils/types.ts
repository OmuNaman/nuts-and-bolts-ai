// src/components/modules/self-attention/utils/types.ts

// Define module-specific types
export type Step = "input" | "q" | "k" | "v" | "scores" | "softmax" | "output";

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
