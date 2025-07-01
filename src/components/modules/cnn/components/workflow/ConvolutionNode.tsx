// src/components/modules/cnn/components/workflow/ConvolutionNode.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { MatrixDisplay } from '@/components/MatrixDisplay';
import { CheckCircle, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type ValidationStatus = 'unvalidated' | 'correct' | 'incorrect';

interface ConvolutionNodeProps {
  data: {
    label: string;
    inputMatrix: number[][];
    kernelMatrix: number[][];
    expectedMatrix: number[][];
    onComplete?: (nodeId: string) => void;
    disabled?: boolean;
    hint: string; 
  };
  id: string;
}

export function ConvolutionNode({ data, id }: ConvolutionNodeProps) {
  const { isDark } = useTheme();
  const outputSize = data.expectedMatrix.length;
  
  const initialValidationStatus = () => Array(outputSize).fill(null).map(() => Array(outputSize).fill('unvalidated' as ValidationStatus));
  
  const [userOutput, setUserOutput] = useState(() => Array(outputSize).fill(null).map(() => Array(outputSize).fill('')));
  const [validationStatus, setValidationStatus] = useState<ValidationStatus[][]>(initialValidationStatus);
  const [currentPatch, setCurrentPatch] = useState({ row: 0, col: 0 });
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const wrongAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    correctAudioRef.current = new Audio("/correct.mp3");
    wrongAudioRef.current = new Audio("/wrong.mp3");
    return () => {
      correctAudioRef.current?.pause();
      wrongAudioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (!data.disabled) {
      setUserOutput(Array(outputSize).fill(null).map(() => Array(outputSize).fill('')));
      setValidationStatus(initialValidationStatus());
      setCurrentPatch({ row: 0, col: 0 });
      setIsCompleted(false);
    }
  }, [data.disabled, outputSize]);

  const playSound = (isCorrect: boolean) => {
    const audio = isCorrect ? correctAudioRef.current : wrongAudioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.error("Error playing sound:", e));
    }
  };

  const currentExpectedValue = data.expectedMatrix[currentPatch.row][currentPatch.col];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.disabled) return;
    const value = e.target.value;
    const newOutput = userOutput.map(r => [...r]);
    newOutput[currentPatch.row][currentPatch.col] = value;
    setUserOutput(newOutput);

    const newStatus = validationStatus.map(r => [...r]);
    newStatus[currentPatch.row][currentPatch.col] = 'unvalidated';
    setValidationStatus(newStatus);
  };

  const handleVerify = () => {
    if (data.disabled) return;
    const userValue = parseFloat(userOutput[currentPatch.row][currentPatch.col]);
    const isCorrect = Math.abs(userValue - currentExpectedValue) < 0.01;
    
    playSound(isCorrect);
    
    const newStatus = validationStatus.map(r => [...r]);
    newStatus[currentPatch.row][currentPatch.col] = isCorrect ? 'correct' : 'incorrect';
    setValidationStatus(newStatus);

    if (isCorrect) {
      if (currentPatch.col + 1 < outputSize) {
        setCurrentPatch({ ...currentPatch, col: currentPatch.col + 1 });
      } else if (currentPatch.row + 1 < outputSize) {
        setCurrentPatch({ row: currentPatch.row + 1, col: 0 });
      } else {
        setIsCompleted(true);
        data.onComplete?.(id);
      }
    }
  };

  const inputHighlights = useMemo(() => {
    const highlights = Array(data.inputMatrix.length).fill(false).map(() => Array(data.inputMatrix[0].length).fill(false));
    if (isCompleted || data.disabled) return highlights;
    for (let i = 0; i < data.kernelMatrix.length; i++) {
      for (let j = 0; j < data.kernelMatrix[0].length; j++) {
        highlights[currentPatch.row + i][currentPatch.col + j] = true;
      }
    }
    return highlights;
  }, [currentPatch, data.inputMatrix, data.kernelMatrix, isCompleted, data.disabled]);

  return (
    <Card className={`p-4 min-w-[450px] transition-all duration-300 ${isDark ? 'bg-slate-800' : 'bg-white'} ${isCompleted ? 'ring-2 ring-green-500' : ''} ${data.disabled && !isCompleted ? 'opacity-60' : ''}`}>
      <h3 className="text-center font-semibold mb-2">{data.label}</h3>
      <div className="flex justify-around items-center gap-4">
        <div>
          <p className="text-xs text-center mb-1 text-muted-foreground">Input</p>
          <MatrixDisplay matrix={data.inputMatrix} highlight={inputHighlights} />
        </div>
        <p className="text-2xl font-bold">Ä</p>
        <div>
          <p className="text-xs text-center mb-1 text-muted-foreground">Kernel</p>
          <MatrixDisplay matrix={data.kernelMatrix} />
        </div>
        <p className="text-2xl font-bold">=</p>
        <div>
          <p className="text-xs text-center mb-1 text-muted-foreground">Output</p>
          <div className="grid gap-1" style={{gridTemplateColumns: `repeat(${outputSize}, minmax(0, 1fr))`}}>
            {data.expectedMatrix.map((row, i) =>
              row.map((_, j) => {
                const status = validationStatus[i][j];
                const value = userOutput[i][j];
                return (
                  <div
                    key={`${i}-${j}`}
                    className={cn(
                      'w-12 h-12 flex items-center justify-center text-sm font-mono rounded-md border transition-colors duration-150',
                      status === 'correct' && 'bg-green-700/30 border-green-500/70 text-green-300',
                      status === 'incorrect' && 'bg-red-700/30 border-red-500/70 text-red-300',
                      status === 'unvalidated' && (isDark ? 'bg-slate-700/50 border-slate-600 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800')
                    )}
                  >
                    {status === 'correct' ? parseFloat(value).toFixed(2) : value}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      
      {!isCompleted && (
        <div className="mt-4 border-t pt-4">
          <div className="flex justify-center items-center gap-2 mb-2">
            <p className="text-center text-sm">Calculate the value for cell <span className="font-bold">[{currentPatch.row}, {currentPatch.col}]</span>:</p>
            <Button variant="ghost" size="icon" onClick={() => setShowHint(!showHint)} className="w-6 h-6" disabled={data.disabled}>
              <Lightbulb className="w-4 h-4 text-yellow-400"/>
            </Button>
          </div>
          <div className="flex justify-center items-center gap-2">
            <Input
              type="number"
              value={userOutput[currentPatch.row][currentPatch.col]}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              className={cn('w-24 text-center', validationStatus[currentPatch.row][currentPatch.col] === 'incorrect' && 'border-red-500')}
              disabled={data.disabled}
              autoFocus
            />
            <Button onClick={handleVerify} size="sm" disabled={data.disabled}>Verify</Button>
          </div>
          {/* --- THIS IS THE CORRECTED HINT LOGIC --- */}
          {showHint && (
            <motion.div 
              initial={{opacity: 0, y: -10}} 
              animate={{opacity: 1, y: 0}} 
              className="text-xs text-muted-foreground text-center mt-2 font-mono bg-slate-700/50 p-2 rounded-md"
            >
              For each cell in the highlighted input patch, multiply it by the corresponding cell in the kernel. Then, sum up all 9 of those products to get the final value.
            </motion.div>
          )}
        </div>
      )}

      {isCompleted && (
        <div className="mt-4 text-center text-green-500 font-semibold flex items-center justify-center gap-2">
          <CheckCircle /> Convolution Complete!
        </div>
      )}
      
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </Card>
  );
}