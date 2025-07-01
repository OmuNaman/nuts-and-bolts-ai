// src/components/modules/word2vec/components/workflow/SemanticSpaceModal.tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { VectorArithmeticControls } from './VectorArithmeticControls';
import { SemanticSpacePlot } from './SemanticSpacePlot';
import { semanticWords } from '../../utils/semanticData';
import type { WordVector } from '../../utils/semanticData';
import { X } from 'lucide-react';

interface SemanticSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type Calculation = {
  wordA: string;
  op1: string;
  wordB: string;
  op2: string;
  wordC: string;
  result: { word: string; vector: WordVector };
}

export function SemanticSpaceModal({ isOpen, onClose }: SemanticSpaceModalProps) {
  const [calculation, setCalculation] = useState<Calculation | null>(null);
  const [selectedWords, setSelectedWords] = useState<string[]>(['king', 'man', 'woman']);

  const findClosestWord = (targetVector: WordVector, inputs: string[]): { word: string; vector: WordVector } => {
    let closestWord = '';
    let minDistance = Infinity;

    Object.entries(semanticWords).forEach(([word, vector]) => {
      if (inputs.includes(word)) return;
      
      const distance = Math.sqrt(
        Math.pow(targetVector.x - vector.x, 2) + 
        Math.pow(targetVector.y - vector.y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestWord = word;
      }
    });
    
    return { word: closestWord, vector: semanticWords[closestWord] };
  };

  const handleCalculate = (wordA: string, op1: string, wordB: string, op2: string, wordC: string) => {
    console.log('Calculating...', { wordA, op1, wordB, op2, wordC }); // Debug log
    
    const vecA = semanticWords[wordA];
    const vecB = semanticWords[wordB];
    const vecC = semanticWords[wordC];

    if (!vecA || !vecB || !vecC) {
      console.error('Missing vector data', { vecA, vecB, vecC });
      return;
    }

    let resultX = vecA.x;
    resultX += op1 === '+' ? vecB.x : -vecB.x;
    resultX += op2 === '+' ? vecC.x : -vecC.x;

    let resultY = vecA.y;
    resultY += op1 === '+' ? vecB.y : -vecB.y;
    resultY += op2 === '+' ? vecC.y : -vecC.y;
    
    const resultVector = { x: resultX, y: resultY, color: '#a78bfa' };
    const closest = findClosestWord(resultVector, [wordA, wordB, wordC]);
    
    console.log('Result:', { resultVector, closest }); // Debug log
    
    setCalculation({ wordA, op1, wordB, op2, wordC, result: closest });
    setSelectedWords([wordA, wordB, wordC, closest.word]);
  };

  const handleSelectionChange = (words: string[]) => {
    setSelectedWords(words);
  };

  const handleReset = () => {
    setCalculation(null);
    setSelectedWords(['king', 'man', 'woman']);
  };
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl h-[800px] bg-[#0a0c14] border-slate-800 p-0">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-semibold text-slate-100">Word Vector Space</h2>
            <p className="text-sm text-slate-400 mt-1">
              Explore relationships between word vectors through vector arithmetic
            </p>
          </div>

          <div className="flex-1 flex gap-0 overflow-hidden">
            {/* Left Panel - Controls */}
            <div className="w-[400px] border-r border-slate-800 bg-[#0d1117] p-6 flex flex-col gap-6">
              <VectorArithmeticControls 
                onCalculate={handleCalculate} 
                onSelectionChange={handleSelectionChange} 
                onReset={handleReset} 
              />

              {/* Result Box */}
              {calculation && (
                <div className="mt-auto">
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-purple-500/20">
                    <p className="text-sm text-slate-400 mb-2">
                      Result of{' '}
                      <span className="text-yellow-400 font-mono">{calculation.wordA}</span>
                      <span className="text-slate-400"> {calculation.op1} </span>
                      <span className="text-yellow-400 font-mono">{calculation.wordB}</span>
                      <span className="text-slate-400"> {calculation.op2} </span>
                      <span className="text-yellow-400 font-mono">{calculation.wordC}</span>
                      {' '}is closest to:
                    </p>
                    <div className="flex items-center justify-center">
                      <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                        {calculation.result.word}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Plot */}
            <div className="flex-1 relative">
              <div className="absolute inset-0">
                <SemanticSpacePlot 
                  calculation={calculation} 
                  selectedWords={selectedWords}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => onClose()}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
