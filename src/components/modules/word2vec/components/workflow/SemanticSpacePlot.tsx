// src/components/modules/word2vec/components/workflow/SemanticSpacePlot.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { semanticWords } from '../../utils/semanticData';
import type { Calculation } from './SemanticSpaceModal';
import { ArrowRight, Zap } from 'lucide-react';

interface SemanticSpacePlotProps {
    calculation: Calculation | null;
    selectedWords: string[];
}

export const SemanticSpacePlot = React.memo(function SemanticSpacePlot({ calculation, selectedWords }: SemanticSpacePlotProps) {
    const { isDark } = useTheme();
    const [showingPath, setShowingPath] = useState(false);

    // Data points
    const data = useMemo(() => 
        Object.entries(semanticWords).map(([name, { x, y, color }]) => ({
            name,
            x,
            y,
            fill: color,
            isSelected: selectedWords.includes(name)
        }))
    , [selectedWords]);

    // Custom dot component
    const CustomizedDot = ({ cx, cy, payload }: any) => {
        if (!payload) return null;
        const isSelected = payload.isSelected;
        const isResultPoint = calculation?.result.word === payload.name;
        
        return (
            <g transform={`translate(${cx},${cy})`}>
                {/* Glowing effect for result point */}
                {isResultPoint && (
                    <>
                        <circle
                            r="16"
                            fill="#a855f7"
                            opacity="0.2"
                            className="animate-pulse"
                        >
                            <animate
                                attributeName="opacity"
                                values="0.2;0.1;0.2"
                                dur="1.5s"
                                repeatCount="indefinite"
                            />
                        </circle>
                        <circle
                            r="12"
                            fill="#a855f7"
                            opacity="0.3"
                            className="animate-pulse"
                        >
                            <animate
                                attributeName="opacity"
                                values="0.3;0.15;0.3"
                                dur="1.5s"
                                repeatCount="indefinite"
                            />
                        </circle>
                    </>
                )}
                
                {/* Main dot */}
                <circle
                    r={isSelected || isResultPoint ? 6 : 4}
                    fill={isResultPoint ? '#a855f7' : payload.fill || '#666'}
                    opacity={isSelected || isResultPoint ? 1 : 0.6}
                />
                
                {/* Label */}
                <text
                    x="0"
                    y="-10"
                    textAnchor="middle"
                    fill={isResultPoint ? '#a855f7' : '#94a3b8'}
                    fontSize={isResultPoint ? "14px" : "12px"}
                    fontWeight={isResultPoint ? "bold" : "normal"}
                >
                    {payload.name}
                </text>
            </g>
        );
    };

    // Vector lines as a reference component
    const VectorLines = ({ calculation }: { calculation: Calculation | null }) => {
        if (!calculation || !showingPath) return null;
        
        const start = semanticWords[calculation.wordA];
        const mid = semanticWords[calculation.wordB];
        const end = semanticWords[calculation.wordC];
        
        if (!start || !mid || !end) return null;

        // Calculate vector points
        const midX = calculation.op1 === '-' ? start.x - mid.x : start.x + mid.x;
        const midY = calculation.op1 === '-' ? start.y - mid.y : start.y + mid.y;
        const endX = calculation.op2 === '-' ? midX - end.x : midX + end.x;
        const endY = calculation.op2 === '-' ? midY - end.y : midY + end.y;

        return (
            <g>
                {/* First vector */}
                <line
                    x1={start.x * 50 + 400}  // Scale and offset for chart coordinates
                    y1={-start.y * 50 + 400}  // Y is inverted in SVG
                    x2={midX * 50 + 400}
                    y2={-midY * 50 + 400}
                    stroke="#facc15"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                />
                {/* Second vector */}
                <line
                    x1={midX * 50 + 400}
                    y1={-midY * 50 + 400}
                    x2={endX * 50 + 400}
                    y2={-endY * 50 + 400}
                    stroke="#facc15"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                />
            </g>
        );
    };

    // Effect to show/hide path
    useEffect(() => {
        if (calculation) {
            setShowingPath(true);
        }
    }, [calculation]);

    return (
        <div className="w-full h-full relative bg-[#0a0c14]">
            {/* Title and description - positioned above the graph */}
            <div className="absolute left-0 right-0 top-0 p-4 z-10">
                <h2 className="text-xl font-semibold text-slate-200 mb-2">The Semantic Space</h2>
                <p className="text-sm text-slate-400 max-w-[600px]">
                    This is what a trained embedding space looks like. The positions of words are not random; 
                    they capture meaning. Use the controls below to perform vector arithmetic and see the 
                    relationships for yourself.
                </p>
            </div>
            
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 100, right: 30, bottom: 20, left: 30 }}>
                    {/* Arrow marker definition */}
                    <defs>
                        <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="9"
                            refY="3.5"
                            orient="auto"
                        >
                            <polygon points="0 0, 10 3.5, 0 7" fill="#facc15"/>
                        </marker>
                    </defs>
                    
                    <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="#1f2937" 
                        opacity={0.2} 
                    />
                    
                    <XAxis 
                        type="number" 
                        dataKey="x" 
                        domain={[-8, 8]} 
                        tick={{ fill: '#4b5563' }}
                        stroke="#374151"
                    />
                    <YAxis 
                        type="number" 
                        dataKey="y" 
                        domain={[-8, 8]} 
                        tick={{ fill: '#4b5563' }}
                        stroke="#374151"
                    />
                    
                    {/* Vector lines */}
                    <VectorLines calculation={calculation} />
                    
                    {/* Data points */}
                    <Scatter 
                        data={data} 
                        shape={<CustomizedDot />}
                    />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
});
