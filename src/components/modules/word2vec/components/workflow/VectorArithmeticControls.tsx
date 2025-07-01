// src/components/modules/word2vec/components/workflow/VectorArithmeticControls.tsx
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { semanticWords } from '../../utils/semanticData';

interface VectorArithmeticControlsProps {
  onCalculate: (wordA: string, op1: string, wordB: string, op2: string, wordC: string) => void;
  onSelectionChange: (words: string[]) => void;
  onReset: () => void;
}

const wordOptions = Object.keys(semanticWords);

export function VectorArithmeticControls({ onCalculate, onSelectionChange, onReset }: VectorArithmeticControlsProps) {
  const [wordA, setWordA] = useState('king');
  const [op1, setOp1] = useState('-');
  const [wordB, setWordB] = useState('man');
  const [op2, setOp2] = useState('+');
  const [wordC, setWordC] = useState('woman');

  // Group words by cluster for organized selection
  const wordsByCluster = useMemo(() => {
    const groups = new Map<string, string[]>();
    Object.entries(semanticWords).forEach(([word, data]) => {
      const cluster = data.cluster || 'Other';
      if (!groups.has(cluster)) {
        groups.set(cluster, []);
      }
      groups.get(cluster)!.push(word);
    });
    return groups;
  }, []);

  useEffect(() => {
    // Report selection changes to parent
    onSelectionChange([wordA, wordB, wordC]);
  }, [wordA, wordB, wordC, onSelectionChange]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Calculating:', { wordA, op1, wordB, op2, wordC }); // Debug log
    onCalculate(wordA, op1, wordB, op2, wordC);
  };
  
  const handleReset = () => {
    setWordA('king');
    setOp1('-');
    setWordB('man');
    setOp2('+');
    setWordC('woman');
    onReset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-200">Vector Arithmetic</h3>
        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
        >
          Reset
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs text-slate-400 mb-2 block">First Word</label>
          <Select value={wordA} onValueChange={setWordA}>
            <SelectTrigger className="w-full bg-slate-800/50 border-slate-700 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {Array.from(wordsByCluster.entries()).map(([cluster, words]) => (
                <SelectGroup key={cluster}>
                  <SelectLabel className="text-slate-400 capitalize">{cluster}</SelectLabel>
                  {words.map(word => (
                    <SelectItem key={word} value={word} className="text-slate-200">
                      {word}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Select value={op1} onValueChange={setOp1}>
            <SelectTrigger className="w-16 bg-slate-800/50 border-slate-700 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="+" className="text-slate-200">+</SelectItem>
              <SelectItem value="-" className="text-slate-200">-</SelectItem>
            </SelectContent>
          </Select>

          <Select value={wordB} onValueChange={setWordB}>
            <SelectTrigger className="flex-1 bg-slate-800/50 border-slate-700 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {Array.from(wordsByCluster.entries()).map(([cluster, words]) => (
                <SelectGroup key={cluster}>
                  <SelectLabel className="text-slate-400 capitalize">{cluster}</SelectLabel>
                  {words.map(word => (
                    <SelectItem key={word} value={word} className="text-slate-200">
                      {word}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Select value={op2} onValueChange={setOp2}>
            <SelectTrigger className="w-16 bg-slate-800/50 border-slate-700 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="+" className="text-slate-200">+</SelectItem>
              <SelectItem value="-" className="text-slate-200">-</SelectItem>
            </SelectContent>
          </Select>

          <Select value={wordC} onValueChange={setWordC}>
            <SelectTrigger className="flex-1 bg-slate-800/50 border-slate-700 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {Array.from(wordsByCluster.entries()).map(([cluster, words]) => (
                <SelectGroup key={cluster}>
                  <SelectLabel className="text-slate-400 capitalize">{cluster}</SelectLabel>
                  {words.map(word => (
                    <SelectItem key={word} value={word} className="text-slate-200">
                      {word}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          Calculate Vector Result
        </Button>
      </form>

      <div className="text-xs text-slate-500 border-t border-slate-800 pt-4 mt-4">
        <p>Try different combinations to explore word relationships!</p>
        <p className="mt-1 font-mono text-slate-400">Example: king - man + woman ≈ queen</p>
      </div>
    </div>
  );
}
