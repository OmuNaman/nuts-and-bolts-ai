// src/components/modules/multi-head-attention/components/workflow/CalculationNode.tsx
import { useState, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MatrixInput } from "@/components/MatrixInput";
import { useTheme } from "@/contexts/ThemeContext";
import {
  CheckCircle,
  Calculator,
  Lightbulb,
  Lock,
  Unlock,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import type { HeadColor, HeadNumber } from "../../utils/types";

interface CalculationNodeProps {
  data: {
    label: string;
    formula: string;
    description?: string;
    expectedMatrix: number[][];
    hint: string;
    onComplete?: (nodeId: string) => void;
    disabled?: boolean;
    headNumber?: HeadNumber;
    headColor?: HeadColor;
  };
  id: string;
}

export function CalculationNode({ data, id }: CalculationNodeProps) {
  const { isDark } = useTheme();
  const initialMatrix = () =>
    Array(data.expectedMatrix.length)
      .fill(null)
      .map(() => Array(data.expectedMatrix[0].length).fill(0));

  const [userMatrix, setUserMatrix] = useState<number[][]>(initialMatrix());
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [errors, setErrors] = useState<boolean[][]>([]);

  useEffect(() => {
    if (!data.disabled) {
      setUserMatrix(initialMatrix());
      setIsCompleted(false);
      setShowHint(false);
      setErrors([]);
    }
  }, [data.disabled, data.expectedMatrix, id]);

  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const wrongAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    correctAudioRef.current = new Audio("/correct.mp3");
    wrongAudioRef.current = new Audio("/wrong.mp3");
    
    if (correctAudioRef.current) {
      correctAudioRef.current.load();
    }
    if (wrongAudioRef.current) {
      wrongAudioRef.current.load();
    }

    return () => {
      if (correctAudioRef.current) {
        correctAudioRef.current.pause();
        correctAudioRef.current.src = "";
      }
      if (wrongAudioRef.current) {
        wrongAudioRef.current.pause();
        wrongAudioRef.current.src = "";
      }
    };
  }, []);

  const playSound = (isCorrect: boolean) => {
    const audioElement = isCorrect ? correctAudioRef.current : wrongAudioRef.current;
    if (audioElement) {
      audioElement.currentTime = 0;
      const playPromise = audioElement.play();
      if (playPromise) {
        playPromise.catch((error) => {
          console.error("Error playing sound:", error);
        });
      }
    }
  };

  const validateMatrix = (matrixToValidate: number[][]) => {
    if (data.disabled || isCompleted) return true;

    const newErrors = Array(matrixToValidate.length)
      .fill(null)
      .map((_, rIdx) => 
        Array(matrixToValidate[0]?.length || 0)
          .fill(false)
          .map((__, cIdx) => {
             const userValue = matrixToValidate[rIdx]?.[cIdx] ?? 0;
             const expectedValue = data.expectedMatrix[rIdx]?.[cIdx] ?? NaN;
             const tolerance = 0.0001;
             return Math.abs(userValue - expectedValue) > tolerance;
          })
      );
    
    const allValid = newErrors.every(row => row.every(cellError => !cellError));
    setErrors(newErrors);
    
    if (allValid) {
      setIsCompleted(true);
      data.onComplete?.(id);
    }
    
    return allValid;
  };

  const handleMatrixChange = (newMatrix: number[][]) => {
    if (data.disabled || isCompleted) return;
    setUserMatrix(newMatrix);
  };

  const resetMatrix = () => {
    if (data.disabled || isCompleted) return;
    setUserMatrix(initialMatrix());
    setErrors([]);
  };

  const nodeIsEffectivelyReadonly = data.disabled && !isCompleted;
  const hasHeadColor = data.headNumber && data.headColor;

  return (
    <Card
      className={`min-w-[320px] max-w-[400px] transition-all duration-300 relative ${
        isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300"
      } shadow-xl rounded-lg ${
        isCompleted
          ? isDark
            ? "ring-2 ring-green-500/70"
            : "ring-2 ring-green-500/80"
          : data.disabled
          ? isDark
            ? "border-slate-600"
            : "border-slate-200"
          : ""
      } ${data.disabled && !isCompleted ? "opacity-70" : ""}`}
      style={{
        borderColor: hasHeadColor ? data.headColor?.border : undefined,
        borderWidth: hasHeadColor ? '2px' : undefined
      }}
    >
      <div className={`p-4 ${data.disabled && !isCompleted ? "pointer-events-none" : ""}`}>
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">            {isCompleted ? (
              <Unlock
                className={`w-5 h-5 ${
                  isDark ? "text-green-400" : "text-green-500"
                }`}
              />
            ) : (
              <Calculator
                className={`w-5 h-5 ${
                  isDark ? "text-purple-400" : "text-purple-600"
                }`}
                style={hasHeadColor ? { color: data.headColor?.primary } : {}}
              />
            )}
            <h3
              className={`font-semibold text-lg ${
                isDark ? "text-slate-100" : "text-slate-800"
              }`}
            >
              {data.label}
            </h3>
            {data.headNumber && (
              <Badge 
                style={{
                  backgroundColor: data.headColor?.primary,
                  color: 'white'
                }}
              >
                Head {data.headNumber}
              </Badge>
            )}
            {isCompleted && !data.disabled && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <CheckCircle
                  className={`w-5 h-5 ${
                    isDark ? "text-green-400" : "text-green-500"
                  }`}
                />
              </motion.div>
            )}
          </div>
          <p
            className={`text-sm ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {data.description}
          </p>
        </div>
        <div
          className={`mb-4 p-3 border rounded-md text-center transition-colors duration-300 ${
            isDark
              ? "bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-slate-700"
              : "bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-slate-200"
          }`}
          style={hasHeadColor ? {
            background: isDark ? `rgba(${parseInt(data.headColor?.primary.slice(1, 3), 16)}, ${parseInt(data.headColor?.primary.slice(3, 5), 16)}, ${parseInt(data.headColor?.primary.slice(5, 7), 16)}, 0.1)` : data.headColor?.secondary,
            borderColor: `${data.headColor?.border}50`
          } : {}}
        >
          <div
            className={`text-lg font-mono ${
              isDark ? "text-blue-300" : "text-indigo-600"
            }`}
            style={hasHeadColor ? { color: data.headColor?.primary } : {}}
          >
            {data.formula}
          </div>
        </div>
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowHint(!showHint)}
              variant="outline"
              size="sm"
              disabled={nodeIsEffectivelyReadonly}
              className={`flex items-center gap-1 transition-colors duration-150 ${
                isDark
                  ? "text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-slate-100 focus-visible:ring-slate-500 disabled:opacity-50"
                  : "text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-slate-400 disabled:opacity-50"
              }`}
            >
              <Lightbulb className="w-3 h-3" />
              Hint
            </Button>
            <Button
              onClick={resetMatrix}
              variant="outline"
              size="sm"
              disabled={nodeIsEffectivelyReadonly}
              className={`flex items-center gap-1 transition-colors duration-150 ${
                isDark
                  ? "text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-slate-100 focus-visible:ring-slate-500 disabled:opacity-50"
                  : "text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-slate-400 disabled:opacity-50"
              }`}
            >
              Reset
            </Button>
          </div>

          <Button
            onClick={() => {
              const validationResult = validateMatrix(userMatrix);
              playSound(validationResult);
            }}
            variant="outline"
            size="sm"
            disabled={data.disabled && !isCompleted || isCompleted}
            className={`flex items-center gap-1 transition-colors duration-150 ${
              isDark
                ? "text-emerald-300 border-emerald-600 hover:bg-emerald-700 hover:text-emerald-100 focus-visible:ring-emerald-500 disabled:opacity-50"
                : "text-emerald-600 border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800 focus-visible:ring-emerald-400 disabled:opacity-50"
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Verify
          </Button>
        </div>

        {showHint && (data.disabled ? isCompleted : true) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className={`mb-4 p-3 border rounded-md transition-colors duration-300 ${
              isDark
                ? "bg-yellow-900/20 border-yellow-600/30"
                : "bg-yellow-50 border-yellow-300"
            }`}
          >
            <p
              className={`text-sm ${
                isDark ? "text-yellow-300" : "text-yellow-700"
              }`}
            >
              {data.hint}
            </p>
          </motion.div>
        )}

        <div className="flex justify-center">          <MatrixInput
            matrix={userMatrix}
            onChange={handleMatrixChange}
            errors={errors}
            readonly={data.disabled && !isCompleted}
            isCompleted={isCompleted}
          />
        </div>        {errors.some((row) => row.some((cell) => cell)) &&
          !isCompleted &&
          (data.disabled ? isCompleted : true) && (
            <div
              className={`mt-3 p-2 border rounded-md text-center transition-colors duration-300 ${
                isDark
                  ? "bg-red-900/20 border-red-600/30"
                  : "bg-red-50 border-red-300"
              }`}
            >
              <p
                className={`text-sm ${
                  isDark ? "text-red-300" : "text-red-600"
                }`}
              >
                Some values are incorrect.
              </p>
            </div>
          )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 !border-2 rounded-full transition-colors duration-300 ${
          isDark
            ? "!bg-blue-500 !border-slate-800"
            : "!bg-blue-500 !border-white"
        }`}
        style={{
          backgroundColor: hasHeadColor ? data.headColor?.primary : undefined,
          borderColor: isDark ? '#1e293b' : 'white'
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 !border-2 rounded-full transition-colors duration-300 ${
          isDark
            ? "!bg-purple-500 !border-slate-800"
            : "!bg-purple-500 !border-white"
        }`}
        style={{
          backgroundColor: hasHeadColor ? data.headColor?.primary : undefined,
          borderColor: isDark ? '#1e293b' : 'white'
        }}
      />
    </Card>
  );
}
