
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getEducationalContent } from '@/utils/educationalContent';
import type { SelfAttentionStep as Step } from '@/types/moduleTypes';

interface EducationalSidebarProps {
  currentStep: Step;
}

export function EducationalSidebar({ currentStep }: EducationalSidebarProps) {
  const content = getEducationalContent(currentStep);

  return (
    <motion.div
      key={currentStep}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <Card className="p-6 bg-slate-800/50 border-slate-700 sticky top-24">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
              {content.stepNumber}
            </Badge>
            <h3 className="font-semibold text-lg">{content.title}</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm text-gray-300 mb-2">What's happening?</h4>
              <p className="text-sm text-gray-400 leading-relaxed">{content.explanation}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-gray-300 mb-2">Why it matters</h4>
              <p className="text-sm text-gray-400 leading-relaxed">{content.importance}</p>
            </div>
            
            {content.example && (
              <div>
                <h4 className="font-medium text-sm text-gray-300 mb-2">Example calculation</h4>
                <div className="text-xs font-mono bg-slate-900/50 p-3 rounded border border-slate-600">
                  {content.example}
                </div>
              </div>
            )}
            
            {content.tips.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-300 mb-2">Tips</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  {content.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
