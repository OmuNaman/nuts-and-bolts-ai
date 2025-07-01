
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { SelfAttentionStep as Step } from '@/types/moduleTypes';

interface ProgressBarProps {
  steps: Step[];
  currentStep: Step;
  completedSteps: Set<Step>;
}

const stepLabels: Record<Step, string> = {
  input: 'Input',
  q: 'Query (Q)',
  k: 'Key (K)',
  v: 'Value (V)',
  scores: 'Scores',
  softmax: 'Softmax',
  output: 'Output'
};

export function ProgressBar({ steps, currentStep, completedSteps }: ProgressBarProps) {
  const currentIndex = steps.indexOf(currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="mt-6">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-700 rounded-full">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Step Circles */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(step);
            const isCurrent = step === currentStep;
            
            return (
              <motion.div
                key={step}
                className="flex flex-col items-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 text-white ring-4 ring-blue-500/20'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className={`mt-2 text-xs font-medium ${
                  isCurrent ? 'text-blue-400' : 'text-gray-500'
                }`}>
                  {stepLabels[step]}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
