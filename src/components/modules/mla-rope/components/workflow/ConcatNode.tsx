// src/components/modules/mla-rope/components/workflow/ConcatNode.tsx
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { Link2 } from 'lucide-react';
import { MatrixDisplay } from '@/components/MatrixDisplay';

interface ConcatNodeProps {
  data: {
    label: string;
    matrix: number[][];
    description: string;
  };
}

export function ConcatNode({ data }: ConcatNodeProps) {
  const { isDark } = useTheme();

  return (
    <Card
      className={`p-4 min-w-[320px] transition-all duration-300 rounded-lg shadow-lg ${
        isDark ? 'bg-emerald-950/60 border-emerald-700/50' : 'bg-emerald-50 border-emerald-200'
      }`}
    >
      <div className="text-center mb-3">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Link2 className={`w-5 h-5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
          <h3 className={`font-semibold text-lg ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{data.label}</h3>
        </div>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{data.description}</p>
      </div>
      <div className="flex justify-center">
        <MatrixDisplay matrix={data.matrix} />
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </Card>
  );
}