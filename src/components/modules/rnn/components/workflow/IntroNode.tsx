// src/components/modules/rnn/components/workflow/IntroNode.tsx
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { Cpu, List } from 'lucide-react';

interface IntroNodeProps {
  data: {
    label: string;
    description: string;
    task?: string;
    exampleSequence?: string;
    focusAreas?: string[];
    onComplete?: (nodeId: string) => void;
    disabled?: boolean;
  };
  id: string;
}

export function IntroNode({ data, id }: IntroNodeProps) {
  const { isDark } = useTheme();

  return (
    <Card
      className={`max-w-[400px] min-w-[350px] transition-colors duration-300 ${
        isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-slate-300'
      } shadow-xl rounded-lg`}
    >
      <div className="p-5">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Cpu
              className={`w-6 h-6 ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`}
            />
            <h3
              className={`font-bold text-xl ${
                isDark ? 'text-slate-100' : 'text-slate-800'
              }`}
            >
              {data.label}
            </h3>
          </div>
          <p
            className={`text-sm ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {data.description}
          </p>
        </div>

        {data.task && (
          <div className={`mb-4 p-3 border rounded-md transition-colors duration-300 ${
            isDark ? 'bg-purple-900/20 border-purple-600/30' : 'bg-purple-50 border-purple-200'
          }`}>
            <h4 className={`font-semibold mb-1 ${
              isDark ? 'text-purple-300' : 'text-purple-700'
            }`}>
              Your Task
            </h4>
            <p className={`text-sm ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              {data.task}
            </p>
            {data.exampleSequence && (
              <div className="mt-2 font-mono text-center p-2 bg-opacity-20 rounded">
                <span className={`text-lg font-bold ${
                  isDark ? 'text-amber-400' : 'text-amber-600'
                }`}>
                  {data.exampleSequence}
                </span>
              </div>
            )}
          </div>
        )}

        {data.focusAreas && data.focusAreas.length > 0 && (
          <div>
            <h4 className={`font-semibold mb-2 flex items-center gap-2 ${
              isDark ? 'text-slate-200' : 'text-slate-700'
            }`}>
              <List className="w-4 h-4" /> Key Concepts
            </h4>
            <ul className="space-y-2">
              {data.focusAreas.map((area, index) => (
                <li 
                  key={index}
                  className={`text-sm flex items-start gap-2 ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  <span className={`inline-block mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    isDark ? 'bg-blue-400' : 'bg-blue-500'
                  }`}></span>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 !border-2 rounded-full transition-colors duration-300 ${
          isDark
            ? '!bg-purple-500 !border-slate-800'
            : '!bg-purple-500 !border-white'
        }`}
      />
    </Card>
  );
}
