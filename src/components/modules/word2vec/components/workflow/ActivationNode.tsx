// src/components/modules/word2vec/components/workflow/ActivationNode.tsx
import { useState, useEffect } from "react";
import { Handle, Position } from "@xyflow/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MatrixDisplay } from "@/components/MatrixDisplay";
import { useTheme } from "@/contexts/ThemeContext";
import { Lightbulb, CheckCircle, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface ActivationNodeProps {
  data: {
    label: string;
    formula: string;
    description: string;
    expectedMatrix: number[][];
    hint?: string;
    vocabulary?: string[];
    highlightMax?: boolean;
    onComplete?: (nodeId: string) => void;
    disabled?: boolean;
  };
  id: string;
}

export function ActivationNode({ data, id }: ActivationNodeProps) {
  const { isDark } = useTheme();
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Effect to mark this node as automatically completed when shown
  // (since it's not a calculation the user needs to do)
  useEffect(() => {
    if (!data.disabled && !isCompleted && data.onComplete) {
      // Small delay for visual effect
      const timer = setTimeout(() => {
        setIsCompleted(true);
        data.onComplete?.(id);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [data.disabled, data.onComplete, id, isCompleted]);

  // Create highlights for the maximum value if requested
  const getHighlights = () => {
    if (!data.highlightMax || !data.expectedMatrix || data.expectedMatrix.length === 0) return undefined;
    
    const highlights = data.expectedMatrix.map(row => Array(row.length).fill(false));
    
    for (let i = 0; i < data.expectedMatrix.length; i++) {
      const row = data.expectedMatrix[i];
      if (row.length === 0) continue;
      
      // Find max value in row
      let maxVal = -Infinity;
      let maxIdx = -1;
      
      for (let j = 0; j < row.length; j++) {
        if (row[j] > maxVal) {
          maxVal = row[j];
          maxIdx = j;
        }
      }
      
      if (maxIdx >= 0) highlights[i][maxIdx] = true;
    }
    
    return highlights;
  };

  return (
    <Card
      className={`min-w-[320px] max-w-[400px] transition-all duration-300 ${
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
            <Zap
              className={`w-5 h-5 ${
                isDark ? "text-yellow-400" : "text-yellow-600"
              }`}
            />
            <h3
              className={`font-semibold text-lg ${
                isDark ? "text-slate-100" : "text-slate-800"
              }`}
            >
              {data.label}
            </h3>
            {isCompleted && (
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
              ? "bg-yellow-900/20 border-yellow-600/30"
              : "bg-yellow-50 border-yellow-300"
          }`}
        >
          <div
            className={`text-lg font-mono ${
              isDark ? "text-yellow-300" : "text-yellow-600"
            }`}
          >
            {data.formula}
          </div>
        </div>

        {data.hint && (
          <div className="flex items-center justify-between mb-4 gap-2">
            <Button
              onClick={() => setShowHint(!showHint)}
              variant="outline"
              size="sm"
              disabled={data.disabled}
              className={`flex items-center gap-1 transition-colors duration-150 ${
                isDark
                  ? "text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-slate-100 focus-visible:ring-slate-500 disabled:opacity-50"
                  : "text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-slate-400 disabled:opacity-50"
              }`}
            >
              <Lightbulb className="w-3 h-3" />
              {showHint ? "Hide Explanation" : "Show Explanation"}
            </Button>
          </div>
        )}
        
        {showHint && data.hint && !data.disabled && (
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

        <div className="flex justify-center mb-4">
          <MatrixDisplay 
            matrix={data.expectedMatrix} 
            highlight={getHighlights()} 
          />
        </div>

        {data.vocabulary && data.highlightMax && (
          <div className="mt-3 text-center">
            <p className={`text-sm font-medium ${isDark ? "text-green-400" : "text-green-600"}`}>
              Highest probability: {data.vocabulary[data.expectedMatrix[0].indexOf(Math.max(...data.expectedMatrix[0]))]}
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
            ? "!bg-yellow-500 !border-slate-800"
            : "!bg-yellow-500 !border-white"
        }`}
      />
    </Card>
  );
}
