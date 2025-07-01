// src/components/modules/cnn/components/workflow/MaxPoolingNode.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { MatrixDisplay } from '@/components/MatrixDisplay';
// --- CHANGE 1: Import ArrowRight and Lock icons ---
import { CheckCircle, Lightbulb, ArrowRight, Lock } from 'lucide-react'; 
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type ValidationStatus = 'unvalidated' | 'correct' | 'incorrect';

interface MaxPoolingNodeProps {
  data: {
    label: string;
    inputMatrix: number[][];
    expectedMatrix: number[][];
    poolSize: number;
    stride: number;
    onComplete?: (nodeId: string) => void;
    disabled?: boolean;
    hint: string;
  };
  id: string;
}

export function MaxPoolingNode({ data, id }: MaxPoolingNodeProps) {
  const { isDark } = useTheme();
  const outputSize = data.expectedMatrix.length;

  const initialValidationStatus = () => Array(outputSize).fill(null).map(() => Array(outputSize).fill('unvalidated' as ValidationStatus));

  const [userOutput, setUserOutput] = useState(() => Array(outputSize).fill(null).map(() => Array(outputSize).fill('')));
  const [validationStatus, setValidationStatus] = useState<ValidationStatus[][]>(initialValidationStatus);
  const [currentPool, setCurrentPool] = useState({ row: 0, col: 0 });
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
      setCurrentPool({ row: 0, col: 0 });
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

  const currentExpectedValue = data.expectedMatrix[currentPool.row][currentPool.col];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.disabled) return;
    const value = e.target.value;
    const newOutput = userOutput.map(r => [...r]);
    newOutput[currentPool.row][currentPool.col] = value;
    setUserOutput(newOutput);
    
    const newStatus = validationStatus.map(r => [...r]);
    newStatus[currentPool.row][currentPool.col] = 'unvalidated';
    setValidationStatus(newStatus);
  };

  const handleVerify = () => {
    if (data.disabled) return;
    const userValue = parseFloat(userOutput[currentPool.row][currentPool.col]);
    const isCorrect = Math.abs(userValue - currentExpectedValue) < 0.01;

    playSound(isCorrect);
    
    const newStatus = validationStatus.map(r => [...r]);
    newStatus[currentPool.row][currentPool.col] = isCorrect ? 'correct' : 'incorrect';
    setValidationStatus(newStatus);
    
    if (isCorrect) {
      if (currentPool.col + 1 < outputSize) {
        setCurrentPool({ ...currentPool, col: currentPool.col + 1 });
      } else if (currentPool.row + 1 < outputSize) {
        setCurrentPool({ row: currentPool.row + 1, col: 0 });
      } else {
        setIsCompleted(true);
        data.onComplete?.(id);
      }
    }
  };

  const inputHighlights = useMemo(() => {
    const highlights = Array(data.inputMatrix.length).fill(false).map(() => Array(data.inputMatrix[0].length).fill(false));
    if (isCompleted || data.disabled) return highlights;
    for (let i = 0; i < data.poolSize; i++) {
      for (let j = 0; j < data.poolSize; j++) {
        highlights[currentPool.row * data.stride + i][currentPool.col * data.stride + j] = true;
      }
    }
    return highlights;
  }, [currentPool, data.inputMatrix, data.poolSize, data.stride, isCompleted, data.disabled]);

  // --- CHANGE 2: Define a boolean for the locked state ---
  const isLocked = data.disabled && !isCompleted;

  return (
    <Card className={`p-4 min-w-[350px] transition-all duration-300 ${isDark ? 'bg-slate-800' : 'bg-white'} ${isCompleted ? 'ring-2 ring-green-500' : ''} ${isLocked ? 'opacity-60' : ''}`}>
      <h3 className="text-center font-semibold mb-2">{data.label}</h3>
      <div className="flex justify-around items-center gap-4">
        <div>
          <p className="text-xs text-center mb-1 text-muted-foreground">Input Feature Map</p>
          {/* --- CHANGE 3: Conditionally render the input matrix or a locked placeholder --- */}
          {isLocked ? (
            <div className={`w-36 h-36 flex items-center justify-center rounded-md ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
              <Lock className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
          ) : (
            <MatrixDisplay matrix={data.inputMatrix} highlight={inputHighlights} />
          )}
        </div>
        
        {/* --- CHANGE 4: Use the ArrowRight icon instead of the text symbol --- */}
        <ArrowRight className={`w-6 h-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />

        <div>
          <p className="text-xs text-center mb-1 text-muted-foreground">Pooled Output</p>
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
          <p className="text-center text-sm mb-2">Find max value for cell <span className="font-bold">[{currentPool.row}, {currentPool.col}]</span>:</p>
          <div className="flex justify-center items-center gap-2">
            <Input
              type="number"
              value={userOutput[currentPool.row][currentPool.col]}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              className={cn('w-24 text-center', validationStatus[currentPool.row][currentPool.col] === 'incorrect' && 'border-red-500')}
              disabled={data.disabled}
            />
            <Button onClick={handleVerify} size="sm" disabled={data.disabled}>Verify</Button>
          </div>
          <Button variant="link" size="sm" onClick={() => setShowHint(!showHint)} className="mx-auto block mt-2" disabled={data.disabled}>
            <Lightbulb className="w-4 h-4 mr-1"/>
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </Button>
          {showHint && <motion.p initial={{opacity: 0}} animate={{opacity: 1}} className="text-xs text-muted-foreground text-center mt-2">{data.hint}</motion.p>}
        </div>
      )}

      {isCompleted && (
        <div className="mt-4 text-center text-green-500 font-semibold flex items-center justify-center gap-2">
          <CheckCircle /> Pooling Complete!
        </div>
      )}

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </Card>
  );
}