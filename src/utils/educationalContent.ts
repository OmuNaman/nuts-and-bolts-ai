import type { SelfAttentionStep as Step } from '@/types/moduleTypes';

interface EducationalContent {
  stepNumber: string;
  title: string;
  explanation: string;
  importance: string;
  example?: string;
  tips: string[];
}

export function getEducationalContent(step: Step): EducationalContent {
  const content: Record<Step, EducationalContent> = {
    input: {
      stepNumber: "Step 1",
      title: "Input Embeddings (X)",
      explanation: "We begin with input embeddings, which are numerical representations of our input tokens (e.g., words in a sentence). Each row represents a single token, and each column corresponds to a dimension in the embedding space.",
      importance: "Input embeddings are the foundational data for all subsequent transformer computations. They convert abstract concepts like words into dense numerical vectors that the model can process and learn from.",
      example: "Shape: 5 tokens × 8 dimensions\nExample of first token 'The': [1, 0, 0, 0, 0, 0, 0, 0]",
      tips: [
        "Each row corresponds to an input token's embedding.",
        "The number of columns is the embedding dimension.",
        "These initial values are typically learned during training."
      ]
    },
    q: {
      stepNumber: "Step 2", 
      title: "Query Matrix (Q)",
      explanation: "The Query (Q) matrix is derived by multiplying the Input embeddings (X) with a learned weight matrix Wq. Queries represent 'what information is this token looking for?' when attending to other tokens.",
      importance: "Queries are crucial as they define the 'question' that each position asks. The similarity between a query and other keys determines the attention strength.",
      example: "Q = X × Wq\nTo calculate Q₁₁ (first cell of Q):\n(1×10) + (0×10) + (0×10) + (0×0) + (0×0) + (0×0) + (0×0) + (0×0) = 10\nResulting shape: (5, 4)",
      tips: [
        "Each row in Q is a query vector for an input token.",
        "Queries help determine the focus of attention.",
        "Dimensions must align for matrix multiplication (Input.cols == Wq.rows)."
      ]
    },
    k: {
      stepNumber: "Step 3",
      title: "Key Matrix (K)", 
      explanation: "The Key (K) matrix is created by multiplying the Input embeddings (X) with a learned weight matrix Wk. Keys represent 'what information does this token contain?' for other tokens to find and attend to.",
      importance: "Keys are like labels or summaries of information available at each position. They are compared against queries to compute raw attention scores.",
      example: "K = X × Wk\nTo calculate K₁₁ (first cell of K):\n(1×2) + (0×2) + (0×2) + (0×0) + (0×0) + (0×0) + (0×0) + (0×0) = 2\nResulting shape: (5, 4)",
      tips: [
        "Keys describe the content available at each token position.",
        "Used to calculate compatibility with Query vectors.",
        "Same matrix multiplication process as Q, but with different weights."
      ]
    },
    v: {
      stepNumber: "Step 4", 
      title: "Value Matrix (V)",
      explanation: "The Value (V) matrix is produced by multiplying the Input embeddings (X) with a learned weight matrix Wv. Values contain the actual content or information that will be combined and passed forward based on the attention weights.",
      importance: "Values are the actual 'payload' of information that gets aggregated. The attention mechanism determines how much of each value vector contributes to the final output for every token.",
      example: "V = X × Wv\nTo calculate V₁₁ (first cell of V):\n(1×1) + (0×0) + (0×0) + (0×0) + (0×0) + (0×0) + (0×0) + (0×0) = 1\nResulting shape: (5, 4)",
      tips: [
        "Values hold the rich information content.",
        "They are weighted by the attention scores.", 
        "The final output is a weighted sum of these value vectors."
      ]
    },
    scores: {
      stepNumber: "Step 5",
      title: "Attention Scores (Scaled)",
      explanation: "Attention scores are calculated by multiplying the Query (Q) matrix with the transpose of the Key (K^T) matrix. These raw scores are then divided by the square root of the key dimension (√d_k), which is 2.0, for numerical stability.",
      importance: "Raw scores quantify the compatibility between each query and every key. Scaling by √d_k is a critical technique that helps prevent the dot products from becoming too large, which can lead to vanishing gradients during training and make softmax highly sensitive.",
      example: "Scores = (Q × K^T) / 2.0\nGiven: Q₁ (first row of Q) = [10, 0, 0, 0], K₁ (first row of K) = [2, 0, 0, 0]\nRaw Score₁₁ (Q₁ dot K₁): (10×2) + (0×0) + (0×0) + (0×0) = 20\nScaled Score₁₁: 20 / 2.0 = 10\nResulting shape: (5, 5)",
      tips: [
        "Higher scores indicate stronger potential attention links.",
        "K is transposed (K^T shape: 4×5) to enable matrix multiplication with Q.",
        "Scaling stabilizes training by normalizing the variance of scores.",
        "Each cell represents one token's query interacting with another token's key."
      ]
    },
    softmax: {
      stepNumber: "Step 6",
      title: "Softmax Attention Weights",
      explanation: "The softmax function is applied row-wise to the Scaled Attention Scores. This transforms the scores into a probability distribution, ensuring that the attention weights for each query sum to 1.",
      importance: "Softmax normalizes the scores, making them interpretable as true probabilities. It highlights the most relevant connections (assigning higher probabilities) while effectively reducing the impact of less relevant ones (assigning probabilities close to zero). This process is essential for creating a meaningful weighted average of the value vectors.",
      example: "For a row of Scaled Scores: [10, 10, 10, 0, 0]\nApplying softmax:\nexp(10) / (exp(10) + exp(10) + exp(10) + exp(0) + exp(0)) ≈ 0.3333\nexp(0) / (exp(10) + exp(10) + exp(10) + exp(0) + exp(0)) ≈ 0.0000\nResulting row: [0.3333, 0.3333, 0.3333, 0.0000, 0.0000]\nEach row of the Attention matrix sums to 1.0.\nResulting shape: (5, 5)",
      tips: [
        "The exponential function amplifies differences between scores.",
        "Numerical stability (subtracting max value) is used for accurate calculation with large numbers.",
        "This step determines how much each value vector contributes to the final output."
      ]
    },
    output: {
      stepNumber: "Step 7",
      title: "Final Output", 
      explanation: "The final Output matrix is computed by multiplying the Attention (softmax probabilities) matrix with the Value (V) matrix. This operation combines the value vectors based on the attention weights, resulting in a new representation for each token that incorporates information from other relevant tokens.",
      importance: "This is the culmination of the self-attention mechanism! The Output matrix represents a contextually enriched version of the input. Each token's new representation is a weighted blend of all original value vectors, allowing the model to focus on important parts of the input sequence for each token.",
      example: "Output = Attention × V\nFor Output row 1, column 1 (Output₁₁):\n(0.3333 × V₁₁) + (0.3333 × V₂₁) + (0.3333 × V₃₁) + (0.0000 × V₄₁) + (0.0000 × V₅₁)\nResulting shape: (5, 4)",
      tips: [
        "Each row in the Output matrix is a weighted sum of the Value vectors.",
        "The Attention weights act as coefficients for this weighted sum.",
        "This output is then typically passed to subsequent layers in a transformer model."
      ]
    }
  };

  return content[step];
}