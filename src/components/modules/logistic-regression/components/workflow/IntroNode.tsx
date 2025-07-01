// src/components/modules/logistic-regression/components/workflow/IntroNode.tsx
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, ArrowRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

interface IntroNodeProps {
  data: {
    title: string;
    description: string;
    onComplete?: (nodeId: string) => void;
    disabled?: boolean;
  };
  id: string;
}

export function IntroNode({ data, id }: IntroNodeProps) {
  const { isDark } = useTheme();
  
  const handleClick = () => {
    if (!data.disabled && data.onComplete) {
      data.onComplete(id);
    }
  };

  return (
    <Card className={`min-w-[350px] max-w-md transition-all duration-300 relative ${
      isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
    } shadow-xl rounded-lg ${
      data.disabled ? 'opacity-70 pointer-events-none' : ''
    }`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`p-3 rounded-full ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}
          >
            <Activity className={`w-7 h-7 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          </motion.div>
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {data.title}
          </h3>
        </div>
        
        <p className={`mb-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {data.description}
        </p>
        
        <div className="space-y-3">
          <div className={`p-3 rounded-md ${isDark ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200'}`}>
            <p className={`text-sm font-medium ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>Key Concepts:</p>
            <ul className={`text-sm mt-2 space-y-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <li>• Linear combination of features (z = wx + b)</li>
              <li>• Sigmoid activation function: σ(z) = 1/(1+e^(-z))</li>
              <li>• Binary cross-entropy loss</li>
              <li>• Gradient descent optimization</li>
            </ul>
          </div>
          
          <Button 
            onClick={handleClick}
            disabled={data.disabled}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 transition-all group"
          >
            Start Learning 
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 !border-2 rounded-full transition-colors duration-300 ${
          isDark ? "!bg-purple-500 !border-slate-800" : "!bg-purple-500 !border-white"
        }`}
      />
    </Card>
  );
}
