// src/components/modules/neural-network/components/workflow/ActivationNode.tsx
import { useState, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { Card } from "@/components/ui/card"; // Shared UI
import { Button } from "@/components/ui/button"; // Shared UI
import { MatrixInput } from "@/components/MatrixInput"; // Shared component from main app
import { useTheme } from "@/contexts/ThemeContext"; // Global ThemeContext
import {
  CheckCircle,
  Zap,
  Lightbulb,
  Lock,
  Unlock,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";

interface ActivationNodeProps {  data: {
    label: string;
    formula: string;
    description?: string;
    expectedMatrix: number[][];
    onComplete?: (nodeId: string) => void;
    disabled?: boolean;
  };
  id: string;
}

export function ActivationNode({ data, id }: ActivationNodeProps) {
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
      setErrors([]);
      setShowHint(false);
    }
  }, [data.disabled, data.expectedMatrix, id]);

  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const wrongAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    correctAudioRef.current = new Audio("/correct.mp3");
    wrongAudioRef.current = new Audio("/wrong.mp3");

    if (correctAudioRef.current) correctAudioRef.current.load();
    if (wrongAudioRef.current) wrongAudioRef.current.load();

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
    const audioElement = isCorrect
      ? correctAudioRef.current
      : wrongAudioRef.current;
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

    const allValid = newErrors.every((row) =>
      row.every((cellError) => !cellError)
    );
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
  
  const nodeIsEffectivelyReadonly = data.disabled;

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
      } ${data.disabled ? "opacity-70" : ""}`}
    >
      <div className={`p-4 ${data.disabled ? "pointer-events-none" : ""}`}>
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            {isCompleted ? (
              <Unlock
                className={`w-5 h-5 ${
                  isDark ? "text-green-400" : "text-green-500"
                }`}
              />
            ) : (
              <Zap
                className={`w-5 h-5 ${
                  isDark ? "text-amber-400" : "text-amber-600"
                }`}
              />
            )}
            <h3
              className={`font-semibold text-lg ${
                isDark ? "text-slate-100" : "text-slate-800"
              }`}
            >
              {data.label}
            </h3>
            {isCompleted && !data.disabled && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <CheckCircle
                  className={`w-5 h-5 ${
                    isDark ? "text-green-400" : "text-green-500"
                  }`}
                />
              </motion.div>            )}
          </div>
          {data.description && (
            <p
              className={`text-sm ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {data.description}
            </p>
          )}
        </div>
        <div
          className={`mb-4 p-3 border rounded-md text-center transition-colors duration-300 ${
            isDark
              ? "bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-slate-700"
              : "bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-slate-200"
          }`}
        >
          <div
            className={`text-lg font-mono ${
              isDark ? "text-amber-300" : "text-amber-600"
            }`}
          >
            {data.formula}
          </div>
        </div>
        <div className="flex items-center justify-between mb-4 gap-2">
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
          <Button
            onClick={() => {
              const validationResult = validateMatrix(userMatrix);
              playSound(validationResult);
            }}
            variant="outline"
            size="sm"
            disabled={nodeIsEffectivelyReadonly || isCompleted}
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
        <div className="flex justify-center">
          <MatrixInput
            matrix={userMatrix}
            onChange={handleMatrixChange}
            errors={errors}
            readonly={data.disabled}
            isCompleted={isCompleted}
          />
        </div>
        {errors.some((row) => row.some((cell) => cell)) &&
          !isCompleted &&
          !data.disabled && (
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
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 !border-2 rounded-full transition-colors duration-300 ${
          isDark
            ? "!bg-amber-500 !border-slate-800"
            : "!bg-amber-500 !border-white"
        }`}
      />
    </Card>
  );
}
