// src/components/modules/word2vec/components/workflow/ContextNode.tsx
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { Pin } from 'lucide-react';

interface ContextNodeProps {
  data: {
    label: string;
    sentence: string;
    targetWord: string;
    contextWords: string[];
    description: string;
  };
}

export function ContextNode({ data }: ContextNodeProps) {
  const { isDark } = useTheme();

  return (
    <Card 
      className={`w-[400px] shadow-2xl rounded-lg relative transition-all duration-300 ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
      } transform -rotate-1`}
    >
      <div className="absolute -top-3 -left-3">
          <Pin className={`w-8 h-8 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} style={{ transform: 'rotate(-45deg)' }} />
      </div>
      <CardHeader>
        <CardTitle className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
          {data.label}
        </CardTitle>
        <CardDescription className="text-sm">
          {data.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-left">
        <div className="p-3 rounded-md bg-background/50">
            <p className="text-xs font-semibold text-muted-foreground mb-1">CORPUS SENTENCE</p>
            <p className="font-mono text-lg tracking-wider">
                ...the <span className="bg-orange-500/20 text-orange-400 px-1 rounded">cat</span> <span className="bg-green-500/30 text-green-300 px-2 py-1 rounded-md font-bold">sat</span> <span className="bg-orange-500/20 text-orange-400 px-1 rounded">on</span> the...
            </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-md bg-background/50">
                <p className="text-xs font-semibold text-muted-foreground mb-1">CONTEXT (INPUT)</p>
                <p className="text-lg font-bold text-orange-400">{data.contextWords.join(', ')}</p>
            </div>
            <div className="p-3 rounded-md bg-background/50">
                <p className="text-xs font-semibold text-muted-foreground mb-1">TARGET (GOAL)</p>
                <p className="text-lg font-bold text-green-300">{data.targetWord}</p>
            </div>
        </div>
      </CardContent>
      <Handle type="source" position={Position.Right} className="!bg-gray-500" />
    </Card>
  );
}
