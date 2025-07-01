
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { SelfAttentionStep as Step } from '@/types/moduleTypes';

interface StepNavigationProps {
  steps: Step[];
  currentStep: Step;
  completedSteps: Set<Step>;
  onStepChange: (step: Step) => void;
}

export function StepNavigation({ steps, currentStep, completedSteps, onStepChange }: StepNavigationProps) {
  const currentIndex = steps.indexOf(currentStep);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < steps.length - 1 && completedSteps.has(currentStep);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700 p-4"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Button
          onClick={() => onStepChange(steps[currentIndex - 1])}
          disabled={!canGoBack}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="text-sm text-gray-400">
          Step {currentIndex + 1} of {steps.length}
        </div>

        <Button
          onClick={() => onStepChange(steps[currentIndex + 1])}
          disabled={!canGoForward}
          className="flex items-center gap-2"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
