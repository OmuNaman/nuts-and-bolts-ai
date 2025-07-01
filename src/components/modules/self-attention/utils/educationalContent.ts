// src/components/modules/self-attention/utils/educationalContent.ts
import { Step, EducationalContent } from './types';

export function getEducationalContent(step: Step): EducationalContent {
  const stepConfig: Record<Step, EducationalContent> = {
    input: {
      stepNumber: "Step 1",
      title: "Input Embeddings (X)",
      explanation: "The input matrix X represents token embeddings for a sequence of words. Each row is a one-hot encoded vector representing a word from the sequence: 'The next day is bright'.",
      importance: "Input embeddings are the foundation of the self-attention mechanism. They represent the initial state of each token before contextualization.",
      example: "X = [x₁, x₂, x₃, x₄, x₅]ᵀ where each x is a one-hot encoded vector\nFor example, x₁ = [1, 0, 0, 0, 0, 0, 0, 0] representing 'The'",
      tips: [
        "Each row represents a token (word) from the input sequence.",
        "In practice, these would be dense word embeddings, not one-hot vectors.",
        "We're using simplified embeddings for educational purposes."
      ]
    },
    q: {
      stepNumber: "Step 2",
      title: "Query Matrix (Q)",
      explanation: "The Query (Q) matrix is produced by multiplying the Input embeddings (X) with a learned weight matrix Wq. Queries represent 'what information is this token looking for?' from other tokens.",
      importance: "Queries determine what kind of information each token is searching for in other tokens. They are used to find relevant content in the sequence for each position.",
      example: "Q = X × Wq\nTo calculate Q₁₁ (first cell of Q):\n(1×10) + (0×10) + (0×10) + (0×0) + (0×0) + (0×0) + (0×0) + (0×0) = 10\nResulting shape: (5, 4)",
      tips: [
        "Queries search for relevant information in other tokens.",
        "Each token generates its own query vector.",
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
      importance: "Attention scores measure the compatibility between each Query and every Key. These scores determine how much attention each token pays to every other token in the sequence. Scaling prevents values from becoming too large during training, leading to more stable gradients.",
      example: "Scores = (Q × K^T) / √d_k\nQ × K^T gives us raw compatibility scores between tokens.\nDividing by √d_k (which is 2.0) scales the values appropriately.\nResulting shape: (5, 5), where each cell (i,j) represents how much token i attends to token j.",
      tips: [
        "Scores show how relevant each token is to every other token.",
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
      example: "Attention = softmax(Scaled Scores)\nFor a token with scores [5, 0, 0, 0, 0]:\nsoftmax converts to: [0.9933, 0.0017, 0.0017, 0.0017, 0.0017]\nThis means the token primarily attends to itself (99.33%), with minimal attention to other tokens.\nResulting shape: (5, 5)",
      tips: [
        "softmax(x) = exp(x) / Σexp(x) for each row",
        "Each row sums to 1.0, creating a proper probability distribution.",
        "Higher scores dominate the attention (winner-takes-most).",
        "This step determines how much each value vector contributes to the final output."
      ]
    },
    output: {
      stepNumber: "Step 7",
      title: "Final Output", 
      explanation: "The final Output matrix is computed by multiplying the Attention (softmax probabilities) matrix with the Value (V) matrix. This operation combines the value vectors based on the attention weights, resulting in a new representation for each token that incorporates information from other relevant tokens.",
      importance: "This is the culmination of the self-attention mechanism! The Output matrix represents a contextually enriched version of the input. Each token's new representation is a weighted blend of all original value vectors, allowing the model to focus on important parts of the input sequence for each token.",
      example: "Output = Attention × V\nFor the first token, if it primarily attends to itself and 'next':\nOutput₁ = (0.8 × V₁) + (0.2 × V₂) + (0 × V₃) + (0 × V₄) + (0 × V₅)\nResulting shape: (5, 4), where each row is a contextualized representation of the corresponding input token.",
      tips: [
        "Output captures contextualized representations of each token.",
        "Information flows between tokens based on attention weights.",
        "The network can learn specialized attention patterns through training.",
        "In practice, this is followed by a feed-forward network and layer normalization."
      ]
    }
  };
  
  return stepConfig[step];
}
