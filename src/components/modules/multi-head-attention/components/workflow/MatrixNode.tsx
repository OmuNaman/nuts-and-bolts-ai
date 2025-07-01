// src/components/modules/multi-head-attention/components/workflow/MatrixNode.tsx
import { Handle, Position } from "@xyflow/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatrixDisplay } from "@/components/MatrixDisplay";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";
import type { HeadColor, HeadNumber } from "../../utils/types";

interface MatrixNodeProps {
  data: {
    label: string;
    matrix: number[][];
    description: string;
    isInput?: boolean;
    headNumber?: HeadNumber;
    headColor?: HeadColor;
  };
}

export function MatrixNode({ data }: MatrixNodeProps) {
  const { isDark } = useTheme();
  const hasHeadColor = data.headNumber && data.headColor;

  return (
    <Card
      className={`min-w-[280px] transition-colors duration-300 shadow-xl rounded-lg ${
        isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300"
      }`}
      style={{
        borderColor: hasHeadColor ? data.headColor?.border : undefined,
        borderWidth: hasHeadColor ? '2px' : undefined
      }}
    >
      <div className="p-4">
        <div className="text-center mb-3">
          <div className="flex items-center justify-center gap-2 mb-1">
            <h3
              className={`font-semibold text-lg ${
                isDark ? "text-slate-100" : "text-slate-800"
              }`}
            >
              {data.label}
            </h3>
            {data.headNumber && (
              <Badge 
                style={{
                  backgroundColor: data.headColor?.primary,
                  color: 'white'
                }}
              >
                Head {data.headNumber}
              </Badge>
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
          style={{
            backgroundColor: hasHeadColor ? data.headColor?.primary : undefined,
            borderColor: isDark ? '#1e293b' : 'white'
          }}
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
        style={{
          backgroundColor: hasHeadColor ? data.headColor?.primary : undefined,
          borderColor: isDark ? '#1e293b' : 'white'
        }}
      />
    </Card>
  );
}
