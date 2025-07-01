// src/components/modules/word2vec/components/workflow/ResultsNode.tsx
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { PartyPopper, CheckCircle, Rocket, Sparkles } from 'lucide-react';

interface ResultsNodeProps {
  data: {
    onExplore: () => void;
    disabled?: boolean;
  };
}

export function ResultsNode({ data }: ResultsNodeProps) {
  const { isDark } = useTheme();

  return (
    <Card 
      className={`w-[450px] shadow-2xl rounded-lg relative transition-all duration-300 ${
        isDark ? 'bg-slate-800 border-green-500/50' : 'bg-white border-green-400'
      } border-2`}
      style={{ opacity: data.disabled ? 0.5 : 1 }}
    >
      <div className="absolute -top-3 right-4 transform rotate-12">
          <PartyPopper className={`w-10 h-10 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
      </div>
      <CardHeader>
        <CardTitle className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <CheckCircle className="text-green-500" />
            Epoch Complete!
        </CardTitle>
        <CardDescription className="pt-2 text-base">
            You've successfully performed one full training step. Here's what that means:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-left text-sm">
        <div className="p-3 rounded-md bg-background/50 flex items-start gap-3">
            <span className="text-green-500 font-bold mt-1">•</span>
            <p>You calculated the gradients (the "direction of improvement") for all weights.</p>
        </div>
        <div className="p-3 rounded-md bg-background/50 flex items-start gap-3">
            <span className="text-green-500 font-bold mt-1">•</span>
            <p>You used these gradients to update the <strong>Embedding Matrix (W¹)</strong> and <strong>Output Matrix (W²)</strong>.</p>
        </div>
        <div className="p-3 rounded-md bg-background/50 flex items-start gap-3">
            <span className="text-green-500 font-bold mt-1">•</span>
            <p>In a real model, this process repeats millions of times, and the <span className="font-bold text-green-400">Embedding Matrix</span> starts to capture the semantic relationships between words.</p>
        </div>
        <div className="pt-4 text-center">
            <Button onClick={data.onExplore} disabled={data.disabled} size="lg" className="bg-green-600 hover:bg-green-700 text-white font-bold text-base shadow-lg hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105">
                <Sparkles className="w-5 h-5 mr-2" />
                See What We've Learned
            </Button>
        </div>
      </CardContent>
      <Handle type="target" position={Position.Left} className="!bg-green-500" />
    </Card>
  );
}
