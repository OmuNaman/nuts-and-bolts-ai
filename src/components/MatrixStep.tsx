import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MatrixDisplay } from '@/components/MatrixDisplay';
import { MatrixInput } from '@/components/MatrixInput';
import { getStepData, calculateExpected, validateMatrix } from '@/utils/matrixCalculations';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, CheckCircle } from 'lucide-react';
import type { SelfAttentionStep as Step } from '@/types/moduleTypes';

interface MatrixStepProps {
  step: Step;
  onComplete: () => void;
  isCompleted: boolean;
}

export function MatrixStep({ step, onComplete, isCompleted }: MatrixStepProps) {
  const { toast } = useToast();
  const stepData = getStepData(step);
  const [userMatrix, setUserMatrix] = useState<number[][]>([]);
  const [showHint, setShowHint] = useState(false);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: boolean[][] } | null>(null);

  const playAudio = (isCorrect: boolean) => {
    console.log('Attempting to play sound:', isCorrect ? 'correct' : 'wrong');
    const audio = new Audio(isCorrect ? '/correct.mp3' : '/wrong.mp3');
    
    audio.addEventListener('canplaythrough', () => {
      console.log('Audio can play through');
      audio.play()
        .then(() => console.log('Audio started playing'))
        .catch(error => console.error('Audio play error:', error));
    });

    audio.addEventListener('error', (e) => {
      console.error('Audio loading error:', e);
    });

    audio.load();
  };

  useEffect(() => {
    // Initialize empty matrix based on expected dimensions
    const expected = calculateExpected(step);
    setUserMatrix(Array(expected.length).fill(null).map(() => Array(expected[0].length).fill(0)));
    setValidationResult(null);
    setShowHint(false);
  }, [step]);

  const handleMatrixChange = (matrix: number[][]) => {
    setUserMatrix(matrix);
    const result = validateMatrix(step, matrix);
    setValidationResult(result);

    if (result.isValid && !isCompleted) {
      playAudio(true);
      toast({
        title: "Correct! 🎉",
        description: "Great job! You've calculated the matrix correctly.",
        duration: 3000,
      });
      setTimeout(() => onComplete(), 1000);
    } else if (!result.isValid) {
      playAudio(false);
    }
  };

  const resetMatrix = () => {
    const expected = calculateExpected(step);
    setUserMatrix(Array(expected.length).fill(null).map(() => Array(expected[0].length).fill(0)));
    setValidationResult(null);
  };

  const expected = calculateExpected(step);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold mb-2">{stepData.title}</h2>
        <p className="text-gray-400 text-lg">{stepData.description}</p>
      </motion.div>

      {/* Input Matrices Display (for reference) */}
      {stepData.inputMatrices.length > 0 && (
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <h3 className="text-lg font-semibold mb-4">Input Matrices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stepData.inputMatrices.map((matrix, index) => (
              <div key={index} className="text-center">
                <h4 className="text-sm font-medium mb-2 text-gray-300">{matrix.name}</h4>
                <MatrixDisplay matrix={matrix.data} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Formula Display */}
      <Card className="p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/20">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Formula</h3>
          <div className="text-2xl font-mono text-blue-300">{stepData.formula}</div>
        </div>
      </Card>

      {/* Matrix Input */}
      <Card className="p-6 bg-slate-800/50 border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Calculate: {stepData.resultName}</h3>
          <div className="flex items-center gap-2">
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 text-green-400"
              >
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Completed!</span>
              </motion.div>
            )}
            <Button
              onClick={() => setShowHint(!showHint)}
              variant="outline"
              size="sm"
            >
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </Button>
            <Button
              onClick={resetMatrix}
              variant="outline"
              size="sm"
            >
              Reset
            </Button>
          </div>
        </div>

        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-4 bg-yellow-900/20 border border-yellow-500/20 rounded-lg"
          >
            <div className="text-sm text-yellow-300">
              <strong>Hint:</strong> {stepData.hint}
            </div>
          </motion.div>
        )}

        <div className="flex justify-center">
          <MatrixInput
            matrix={userMatrix}
            onChange={handleMatrixChange}
            errors={validationResult?.errors}
            readonly={isCompleted}
          />
        </div>

        {validationResult && !validationResult.isValid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-red-900/20 border border-red-500/20 rounded-lg text-center"
          >
            <p className="text-red-300">Oops! Some values are incorrect. Red cells need fixing.</p>
          </motion.div>
        )}
      </Card>

      {/* Expected Result (for debugging - remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-4 bg-gray-900/50 border-gray-700">
          <h4 className="text-sm font-medium mb-2">Expected Result (Dev Only)</h4>
          <MatrixDisplay matrix={expected} />
        </Card>
      )}
    </div>
  );
}
