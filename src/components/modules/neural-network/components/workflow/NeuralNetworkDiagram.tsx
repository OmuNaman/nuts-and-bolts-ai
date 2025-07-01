// src/components/modules/neural-network/components/workflow/NeuralNetworkDiagram.tsx
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";

interface NeuralNetworkDiagramProps {
  architecture: number[];
  activeNodeId: string | null;
}

const nodeProgressMap: Record<string, number> = {
  'input': 0,
  'calc-z1': 1,
  'activate-a1': 2,
  'calc-z2': 3,
  'activate-a2': 4,
  'calc-z3': 5,
  'activate-a3': 6,
  'calc-loss': 7,
  'calc-dz3': 8,
  'calc-dw3': 9,
  'calc-db3': 9,
  'calc-dz2': 10,
  'calc-dw2': 11,
  'calc-db2': 11,
  'calc-dz1': 12,
  'calc-dw1': 13,
  'calc-db1': 13
};

export function NeuralNetworkDiagram({ architecture, activeNodeId }: NeuralNetworkDiagramProps) {
  const { isDark } = useTheme();
  const progress = activeNodeId ? nodeProgressMap[activeNodeId] ?? -1 : -1;

  const width = 800;
  const height = 400;
  const layerSpacing = width / (architecture.length + 1);

  const positions = architecture.map((numNeurons, i) => {
    const layerX = layerSpacing * (i + 1);
    const neuronYSpacing = height / (numNeurons + 1);
    return Array.from({ length: numNeurons }, (_, j) => ({
      x: layerX,
      y: neuronYSpacing * (j + 1),
    }));
  });

  const themeColors = {
    inactive: isDark ? 'rgba(100, 116, 139, 0.3)' : 'rgba(156, 163, 175, 0.4)',
    activeNeuron: isDark ? '#38bdf8' : '#0ea5e9',
    activeConnection: isDark ? '#a78bfa' : '#8b5cf6',
    pulse: isDark ? '#f0abfc' : '#e879f9',
    backprop: isDark ? '#ef4444' : '#dc2626'
  };

  const isBackpropActive = progress >= 8; // dz3 node and onwards

  return (
    <div className={`w-full h-full p-4 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-slate-900/50' : 'bg-slate-100'}`}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        {/* Connections */}
        {positions.slice(0, -1).map((layer, i) => {
          const isForwardConnectionsActive = (progress === (i * 2) + 1);
          const isBackwardConnectionsActive = isBackpropActive && (progress >= 10 - (i * 2));
          
          return layer.map((startNode, j) =>
            positions[i + 1].map((endNode, k) => (
              <g key={`group-${i}-${j}-${k}`}>
                <motion.line
                  x1={startNode.x} y1={startNode.y}
                  x2={endNode.x} y2={endNode.y}
                  stroke={
                    isBackwardConnectionsActive 
                      ? themeColors.backprop 
                      : isForwardConnectionsActive 
                        ? themeColors.activeConnection 
                        : themeColors.inactive
                  }
                  strokeWidth={isForwardConnectionsActive || isBackwardConnectionsActive ? 1.5 : 0.5}
                  transition={{ duration: 0.3 }}
                />
                {isForwardConnectionsActive && (
                  <motion.circle
                    r="3"
                    fill={themeColors.pulse}
                    initial={{ cx: startNode.x, cy: startNode.y, opacity: 0 }}
                    animate={{ cx: endNode.x, cy: endNode.y, opacity: [0, 1, 1, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 1,
                      ease: "linear",
                      delay: (j * 0.1) + (k * 0.05),
                    }}
                  />
                )}
                {isBackwardConnectionsActive && (
                  <motion.circle
                    r="3"
                    fill={themeColors.backprop}
                    initial={{ cx: endNode.x, cy: endNode.y, opacity: 0 }}
                    animate={{ cx: startNode.x, cy: startNode.y, opacity: [0, 1, 1, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 1,
                      ease: "linear",
                      delay: (j * 0.1) + (k * 0.05),
                    }}
                  />
                )}
              </g>
            ))
          );
        })}

        {/* Neurons */}
        {positions.map((layer, i) => {
          const isLayerActive = (progress === (i * 2));
          const isLayerActiveBackprop = isBackpropActive && (progress >= 10 - (i * 2));
          
          return layer.map((node, j) => (
            <motion.circle
              key={`node-${i}-${j}`}
              cx={node.x}
              cy={node.y}
              r={isLayerActive || isLayerActiveBackprop ? 8 : 6}
              fill={
                isLayerActiveBackprop 
                  ? themeColors.backprop 
                  : isLayerActive 
                    ? themeColors.activeNeuron 
                    : themeColors.inactive
              }
              stroke={
                isLayerActiveBackprop 
                  ? themeColors.backprop 
                  : isLayerActive 
                    ? themeColors.activeNeuron 
                    : 'none'
              }
              strokeWidth={2}
              style={{
                filter: (isLayerActive || isLayerActiveBackprop)
                  ? `drop-shadow(0 0 4px ${isLayerActiveBackprop ? themeColors.backprop : themeColors.activeNeuron})`
                  : 'none',
              }}
              animate={{ 
                scale: (isLayerActive || isLayerActiveBackprop) ? [1, 1.3, 1] : 1 
              }}
              transition={{
                duration: 1,
                repeat: (isLayerActive || isLayerActiveBackprop) ? Infinity : 0,
              }}
            />
          ));
        })}
        
        {/* Layer Labels */}
        {positions.map((layer, i) => (
          <text
            key={`label-${i}`}
            x={layer[0].x}
            y={height - 20}
            textAnchor="middle"
            className={`text-sm font-medium ${isDark ? 'fill-slate-300' : 'fill-slate-700'}`}
          >
            {i === 0 ? 'Input' : i === positions.length - 1 ? 'Output' : `Hidden ${i}`}
          </text>
        ))}
      </svg>
    </div>
  );
}
