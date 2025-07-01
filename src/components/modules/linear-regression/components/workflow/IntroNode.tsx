// src/components/modules/linear-regression/components/workflow/IntroNode.tsx
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useTheme } from '@/contexts/ThemeContext';

interface IntroNodeProps {
  data: {
    title: string;
    description: string;
    onComplete?: (id: string) => void;
    disabled?: boolean;
  };
  id: string;
}

export const IntroNode = memo(({ data, id }: IntroNodeProps) => {
  const { isDark } = useTheme();
  
  return (
    <div 
      className={`p-4 rounded-xl shadow-lg border transition-all duration-300 ${
        isDark 
          ? 'bg-slate-800/90 border-orange-500/40 text-white' 
          : 'bg-white border-orange-500/60 text-slate-800'
      } w-[400px]`}
    >
      <Handle type="source" position={Position.Bottom} />
      
      <div className="flex flex-col gap-3">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
          {data.title}
        </h3>
        
        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {data.description}
        </p>
        
        <div className={`mt-2 p-3 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
            How Linear Regression Works:
          </h4>
          <ul className={`text-xs space-y-1 ${isDark ? 'text-slate-300' : 'text-slate-600'} list-disc pl-4`}>
            <li>Uses the equation: <span className="font-mono">ŷ = Xw + b</span></li>
            <li>Minimizes Mean Squared Error (MSE) loss</li>
            <li>Updates parameters using gradient descent</li>
            <li>Predicts continuous values (like house prices)</li>
          </ul>
        </div>
        
        <button
          onClick={() => data.onComplete?.(id)}
          disabled={data.disabled}
          className={`mt-2 py-2 px-4 rounded-md transition-all duration-300 ${
            data.disabled
              ? 'cursor-not-allowed opacity-50'
              : isDark
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
          }`}
        >
          {data.disabled ? 'Completed' : 'Start the Linear Regression Flow'}
        </button>
      </div>
    </div>
  );
});

IntroNode.displayName = 'LinearRegressionIntroNode';
