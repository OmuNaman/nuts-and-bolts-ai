// src/components/modules/multi-head-latent-attention/components/workflow/AttentionSummaryNode.tsx
import React, { useEffect } from 'react'; // <--- CORRECTED THIS LINE
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { MatrixDisplay } from '@/components/MatrixDisplay';
import { useTheme } from '@/contexts/ThemeContext';
import { CheckCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface AttentionSummaryNodeProps {
  data: {
    label: string;
    description: string;
    formula: string;
    finalOutput: number[][];
    disabled?: boolean;
    onComplete?: (nodeId: string) => void;
  };
  id: string;
}

export function AttentionSummaryNode({ data, id }: AttentionSummaryNodeProps) {
  const { isDark } = useTheme();

  // Auto-complete this node when enabled
  useEffect(() => {
    if (!data.disabled) {
      data.onComplete?.(id);
    }
  }, [data.disabled, data.onComplete, id]);

  const isCompleted = !data.disabled;

  return (
    <Card className={`p-4 min-w-[350px] transition-all duration-300 ${isDark ? 'bg-slate-800' : 'bg-white'} ${isCompleted ? 'ring-2 ring-green-500' : ''} ${data.disabled ? 'opacity-60' : ''}`}>
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className={`w-5 h-5 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
          <h3 className="font-semibold text-lg">{data.label}</h3>
          {isCompleted && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </motion.div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{data.description}</p>
      </div>
      <div className={`mb-4 p-3 border rounded-md text-center ${isDark ? "bg-amber-900/20 border-slate-700" : "bg-amber-50 border-slate-200"}`}>
        <div className={`text-lg font-mono ${isDark ? "text-amber-300" : "text-amber-600"}`}>{data.formula}</div>
      </div>
      
      {/* Only show the matrix result when the node is enabled (not disabled) */}
      {!data.disabled ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <MatrixDisplay matrix={data.finalOutput} />
        </motion.div>
      ) : (
        <div className={`flex justify-center items-center h-20 border-2 border-dashed rounded-md ${isDark ? 'border-slate-600 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
          <p className="text-sm">Complete all steps to see the result</p>
        </div>
      )}
      
      <Handle type="target" position={Position.Left} />
    </Card>
  );
}