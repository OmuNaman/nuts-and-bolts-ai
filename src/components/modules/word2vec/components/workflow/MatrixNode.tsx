// src/components/modules/word2vec/components/workflow/MatrixNode.tsx
import { Handle, Position } from "@xyflow/react";
import { Card } from "@/components/ui/card";
import { MatrixDisplay } from "@/components/MatrixDisplay";
import { useTheme } from "@/contexts/ThemeContext";

interface MatrixNodeProps {
  data: {
    label: string;
    matrix: number[][];
    description: string;
    isInput?: boolean;
  };
}

export function MatrixNode({ data }: MatrixNodeProps) {
  const { isDark } = useTheme();

  return (
    <Card
      className={`min-w-[280px] transition-colors duration-300 ${
        isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300"
      } shadow-xl rounded-lg`}
    >
      <div className="p-4">
        <div className="text-center mb-3">
          <h3
            className={`font-semibold text-lg mb-1 ${
              isDark ? "text-slate-100" : "text-slate-800"
            }`}
          >
            {data.label}
          </h3>
          <p
            className={`text-sm ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {data.description}
          </p>
        </div>

        <div className="flex justify-center">
          <MatrixDisplay matrix={data.matrix} />
        </div>
      </div>
      {!data.isInput && (
        <Handle
          type="target"
          position={Position.Left}
          className={`w-3 h-3 !border-2 rounded-full transition-colors duration-300 ${
            isDark
              ? "!bg-blue-500 !border-slate-800"
              : "!bg-blue-500 !border-white"
          }`}
        />
      )}
      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 !border-2 rounded-full transition-colors duration-300 ${
          isDark
            ? "!bg-purple-500 !border-slate-800"
            : "!bg-purple-500 !border-white"
        }`}
      />
    </Card>
  );
}
