// vizuara-ai-learning-lab-main/src/pages/LearningModulePage.tsx
import React, { Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext'; 

// Define module components using React.lazy for code splitting
const SelfAttentionModule = lazy(() => import('@/components/modules/self-attention/SelfAttentionModule'));
const NeuralNetworkModule = lazy(() => import('@/components/modules/neural-network/NeuralNetworkModule'));
const MultiHeadAttentionModule = lazy(() => import('@/components/modules/multi-head-attention/MultiHeadAttentionModule'));
const Word2VecModule = lazy(() => import('@/components/modules/word2vec/components/Word2VecModule'));
const RNNModule = lazy(() => import('@/components/modules/rnn/RNNModule'));
const LinearRegressionModule = lazy(() => import('@/components/modules/linear-regression/LinearRegressionModule'));
const LogisticRegressionModule = lazy(() => import('@/components/modules/logistic-regression/LogisticRegressionModule'));
const CNNModule = lazy(() => import('@/components/modules/cnn/CNNModule')); 
const MLAModule = lazy(() => import('@/components/modules/multi-head-latent-attention/MLAModule'));
const MlaQueryCompressionModule = lazy(() => import('@/components/modules/mla-query-compression/MlaQueryCompressionModule'));
const MLARopeModule = lazy(() => import('@/components/modules/mla-rope/MLARopeModule'));

const moduleComponents: { [key: string]: React.LazyExoticComponent<React.ComponentType<any>> } = {
  'self-attention': SelfAttentionModule,
  'neural-network': NeuralNetworkModule,
  'multi-head-attention': MultiHeadAttentionModule,
  'word2vec': Word2VecModule,
  'rnn': RNNModule,
  'linear-regression': LinearRegressionModule,
  'logistic-regression': LogisticRegressionModule,
  'cnn': CNNModule, 
  'multi-head-latent-attention': MLAModule, // ADD THIS LINE
  'mla-query-compression': MlaQueryCompressionModule,
  'mla-rope': MLARopeModule,
};

const LearningModulePage = () => {
  const { moduleSlug } = useParams<{ moduleSlug: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme(); 

  if (!moduleSlug || !moduleComponents[moduleSlug]) {
    navigate('/not-found', { replace: true }); 
    return (
        <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-100 text-black'}`}>
            <p>Module not found. Redirecting...</p>
        </div>
    );
  }

  const ModuleComponent = moduleComponents[moduleSlug];

  return (
    <Suspense 
        fallback={
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-100 text-black'}`}>
                <p className="text-xl animate-pulse">Loading Awesome AI Module...</p>
            </div>
        }
    >
      <ModuleComponent />
    </Suspense>
  );
};

export default LearningModulePage;