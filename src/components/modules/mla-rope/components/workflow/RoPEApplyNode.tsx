// src/components/modules/mla-rope/components/workflow/RoPEApplyNode.tsx
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { RotateCw } from 'lucide-react';

interface RoPEApplyNodeProps {
  data: {
    label: string;
    description: string;
  };
}

export function RoPEApplyNode({ data }: RoPEApplyNodeProps) {
  const { isDark } = useTheme();

  return (
    <Card
      className={`p-3 w-48 transition-all duration-300 rounded-lg shadow-md ${
        isDark ? 'bg-indigo-900/40 border-indigo-700/50' : 'bg-indigo-50 border-indigo-200'
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <RotateCw className={`w-6 h-6 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
        <h3 className={`font-semibold text-center ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>{data.label}</h3>
        <p className={`text-xs text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{data.description}</p>
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </Card>
  );
}