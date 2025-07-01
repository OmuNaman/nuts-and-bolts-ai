// src/components/modules/neural-network/components/workflow/LayerBackgroundNode.tsx
import { useTheme } from "@/contexts/ThemeContext";

interface LayerBackgroundNodeProps {
  data: {
    label: string;
    width: number;
    height: number;
  };
}

export function LayerBackgroundNode({ data }: LayerBackgroundNodeProps) {
  const { isDark } = useTheme();
  
  return (
    <div 
      style={{ 
        width: data.width, 
        height: data.height,
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        zIndex: -1,
        borderRadius: '12px',
        border: `1px dashed ${isDark ? 'rgba(100, 116, 139, 0.3)' : 'rgba(148, 163, 184, 0.4)'}`,
        background: isDark 
          ? 'linear-gradient(to right, rgba(30, 41, 59, 0.4), rgba(51, 65, 85, 0.1))' 
          : 'linear-gradient(to right, rgba(241, 245, 249, 0.6), rgba(226, 232, 240, 0.2))',
        boxShadow: isDark 
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div 
        className={`
          absolute -top-3 left-4 px-2 py-0.5 text-xs font-medium rounded 
          ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600'}
        `}
      >
        {data.label}
      </div>
    </div>
  );
}
