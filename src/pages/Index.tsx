// vizuara-ai-learning-lab-main/src/pages/Index.tsx
import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card } from '@/components/ui/card';
import { Brain, Cpu, Network, Sparkles, ArrowRight, GitBranch, Code, Lightbulb, Zap, Layers, Share2, BookOpenCheck, LineChart, Activity, GitCommit, GitPullRequestArrow} from 'lucide-react'; // Added Activity
import type { LucideIcon } from 'lucide-react';

interface ModuleInfo { // Renamed from Module to ModuleInfo to avoid conflict
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  status: 'available' | 'coming-soon';
  gradient: string;
  features: string[];
}

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

function FeatureCard({ feature }: { feature: Feature }) { // isDark removed, will useTheme inside
  const { isDark } = useTheme();
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`p-6 rounded-xl transition-all duration-300 ${
        isDark ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/70' : 'bg-white border-slate-200 hover:bg-slate-50'
      } border shadow-lg hover:shadow-xl`}
    >
      <div className={`mb-4 inline-flex p-3 rounded-lg ${
        isDark ? 'bg-slate-700/50' : 'bg-slate-100'
      }`}>
        <feature.icon className="w-6 h-6 text-blue-500" />
      </div>
      <h3 className={`text-lg font-semibold mb-2 ${
        isDark ? 'text-white' : 'text-slate-900'
      }`}>{feature.title}</h3>
      <p className={`text-sm ${
        isDark ? 'text-slate-400' : 'text-slate-600'
      }`}>{feature.description}</p>
    </motion.div>
  );
}

function AIConceptVisual() {
  const { isDark } = useTheme();
  const nodeCount = 6;
  const radius = 120;
  const center = { x: 150, y: 150 };
  
  const nodes = Array.from({ length: nodeCount }, (_, i) => {
    const angle = (i / nodeCount) * Math.PI * 2;
    return {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    };
  });

  return (
    <div className="relative w-[300px] h-[300px]">
      <svg width="300" height="300" className="absolute inset-0">
        {nodes.map((node, i) => (
          <g key={i}>
            {nodes.map((_, j) => (
              j !== i && (
                <motion.line
                  key={`${i}-${j}`}
                  x1={node.x} y1={node.y} x2={nodes[j].x} y2={nodes[j].y}
                  stroke={isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)'}
                  strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: (i + j) * 0.2, repeat: Infinity, repeatType: "reverse" }}
                />
              )
            ))}
            <motion.circle
              cx={node.x} cy={node.y} r="4" fill={isDark ? '#3b82f6' : '#2563eb'}
              initial={{ scale: 0 }} animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}


export default function Index() { // Renamed Landing to Index
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const navigate = useNavigate(); // Added
  const { user } = useAuth(); // Added
  const { isDark } = useTheme();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 15,
        y: (e.clientY - window.innerHeight / 2) / 15,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const learningModules: ModuleInfo[] = [ // Renamed modules to learningModules
    {
      id: 'self-attention',
      title: 'Self Attention Mechanism (Single-Head)',
      description: 'Understand the core of transformers: how a sequence processes itself to weigh the importance of different words.',
      icon: Brain,
      status: 'available',
      gradient: 'from-blue-500 to-purple-500',
      features: ['Interactive Matrix Operations', 'Step-by-step Calculations', 'Core Transformer Concept']
    },
    {
      id: 'multi-head-attention',
      title: 'Multi-Head Attention Mechanism (3 Heads)',
      description: 'Explore how multiple attention "heads" capture diverse relationships in parallel, enhancing model capacity.',
      icon: Cpu,
      status: 'available',
      gradient: 'from-emerald-500 to-teal-500',
      features: ['Parallel Processing', 'Diverse Representations', 'Enhanced Context Understanding']
    },
    {
      id: 'neural-network',
      title: 'Neural Network Epoch Training',
      description: 'Visualize and understand how neural networks learn through forward propagation and backpropagation in a single training epoch.',
      icon: Network,
      status: 'available',
      gradient: 'from-red-500 to-orange-500',
      features: ['Forward Pass Calculation', 'Gradient Computation', 'Backpropagation Visualization']
    },
    {
      id: 'word2vec', // Using the id that matches the moduleComponents registration
      title: 'Word2Vec (CBOW)',
      description: 'Explore how words are mapped to vector space and learn to visualize semantic relationships between words.',
      icon: BookOpenCheck, // Using book icon
      status: 'available',
      gradient: 'from-yellow-500 to-amber-500',
      features: ['Vector Embeddings', 'Semantic Arithmetic', 'Contextual Prediction']
    },
    {
      id: 'rnn',
      title: 'Recurrent Neural Network (RNN)',
      description: 'Explore how RNNs process sequential data by maintaining hidden states and learn about their forward and backward passes.',
      icon: Sparkles, // Using sparkles icon
      status: 'available',
      gradient: 'from-purple-500 to-pink-500',
      features: ['Sequential Data Processing', 'Hidden State Computation', 'Backpropagation Through Time']
    },
    {
      id: 'linear-regression',
      title: 'Linear Regression',
      description: 'Understand how linear regression predicts continuous values and trains using gradient descent optimization.',
      icon: LineChart, // Using LineChart icon for regression
      status: 'available',
      gradient: 'from-orange-500 to-amber-500',
      features: ['House Price Prediction', 'Mean Squared Error Loss', 'Gradient Descent Optimization']
    },
    {
      id: 'logistic-regression',
      title: 'Logistic Regression',
      description: 'Learn how logistic regression performs binary classification with the sigmoid function and cross-entropy loss.',
      icon: Activity, // Using Activity icon for classification
      status: 'available',
      gradient: 'from-purple-500 to-indigo-500',
      features: ['Binary Classification', 'Sigmoid Activation', 'Cross-Entropy Loss']
    },
    {
      id: 'cnn',
      title: 'Convolutional Neural Network (CNN)',
      description: 'Learn how CNNs extract features from images using convolution, activation, and pooling layers.',
      icon: Layers, // Using Layers icon for CNN
      status: 'available',
      gradient: 'from-cyan-500 to-sky-500',
      features: ['Interactive Convolution', 'Feature Map Visualization', 'Pooling and Flattening']
    },
    {
      id: 'multi-head-latent-attention',
      title: 'Multi-Head Latent Attention (MLA)',
      description: 'The key to efficient transformers! See how models like DeepSeek-V2 compress the KV cache into a latent space.',
      icon: GitCommit,
      status: 'available',
      gradient: 'from-teal-500 to-cyan-500',
      features: ['KV Cache Compression', 'Latent Space Bottleneck', 'Low-Rank Approximation']
    },
    {
      id: 'mla-query-compression',
      title: 'MLA with Query Compression',
      description: 'Go a step further by compressing the Query vector itself, a technique used to optimize training memory.',
      icon: GitPullRequestArrow,
      status: 'available',
      gradient: 'from-pink-500 to-rose-500',
      features: ['Full Latent Path', 'Deeper Compression', 'Training vs. Inference Trade-offs']
    },
    {
      id: 'mla-rope',
      title: 'MLA + RoPE (Positional Embedding)',
      description: 'See how Rotary Positional Embeddings are integrated into MLA to encode relative token positions.',
      icon: Lightbulb, // Using Sparkles again as a visual metaphor for transformation/embedding
      status: 'available',
      gradient: 'from-purple-500 to-indigo-500', // A new gradient
      features: ['Positional Encoding', 'Sequence Awareness', 'MLA Integration']
    }
  ];

  const handleModuleClick = (moduleId: string, moduleStatus: 'available' | 'coming-soon') => {
    if (moduleStatus === 'available') {
      if (user) {
        navigate(`/learning/${moduleId}`);
      } else {
        navigate("/auth", { state: { from: { pathname: `/learning/${moduleId}` } } });
      }
    }
    // Optionally, handle 'coming-soon' clicks, e.g., with a toast.
  };


  const features: Feature[] = [
    { icon: Zap, title: "Real-time Processing", description: "Watch as matrices transform and interact in real-time, making complex operations intuitive." },
    { icon: Layers, title: "Layer by Layer", description: "Break down complex neural architectures into understandable, interactive components." },
    { icon: Share2, title: "Interactive Learning", description: "Engage with each concept through hands-on manipulation and visualization." }
  ];

  return (
    // ThemeProvider is now global, removed from here
    <div className={`min-h-screen transition-colors duration-300 relative overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="fixed inset-0 pointer-events-none transition-transform duration-200" style={{
        transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
        backgroundImage: `radial-gradient(${isDark ? 'rgb(255 255 255 / 0.15)' : 'rgb(0 0 0 / 0.15)'} 1.5px, transparent 1.5px)`,
        backgroundSize: '40px 40px', backgroundPosition: '-20px -20px',
      }} />

      <motion.nav initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-opacity-20 backdrop-blur-xl bg-opacity-80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            <img src="/Vizlogo.png" alt="Vizuara AI Labs Logo" className="h-8" />
            <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Vizuara AI Labs</h1>
          </motion.div>
          <div className="flex items-center gap-4">
            {user ? (
              <Button variant="outline" onClick={() => navigate("/dashboard")} className={`transition-colors duration-300 ${ isDark ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}>Dashboard</Button>
            ) : (
              <Button onClick={() => navigate("/auth")} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">Sign In / Sign Up</Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </motion.nav>

      <section className="relative pt-32 pb-20 px-6">
        <motion.div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-3xl mx-auto">
            <motion.div className="flex justify-center mb-4" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
              <div className="relative">
                <Sparkles className={`w-12 h-12 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                <motion.div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5], }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
              </div>
            </motion.div>
            <motion.h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              Nuts & <motion.span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent relative inline-block" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>Bolts AI</motion.span>
            </motion.h1>
            <motion.p className={`text-lg md:text-xl mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Powered by Vizuara AI</motion.p>
            <motion.p className={`text-xl md:text-2xl mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
              Put your knowledge to the test with interactive practice modules!
            </motion.p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => handleModuleClick('self-attention', 'available')} size="lg" className="px-8 py-6 text-lg rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl shadow-blue-500/20 group mt-6">
                  Explore Self-Attention
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button onClick={() => handleModuleClick('linear-regression', 'available')} size="lg" className="px-8 py-6 text-lg rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl shadow-orange-500/20 group mt-6">
                  Try Linear Regression
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button onClick={() => handleModuleClick('logistic-regression', 'available')} size="lg" className="px-8 py-6 text-lg rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl shadow-purple-500/20 group mt-6">
                  Try Logistic Regression
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section id="modules" className="py-20 px-6 relative"> {/* Added id for potential deep linking */}
        <div className="max-w-7xl mx-auto">
           <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Learning Modules</h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Dive into specific AI concepts with our hands-on visualizers.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {learningModules.map((module, index) => (
              <motion.div key={module.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }}>
                <Card
                  className={`relative overflow-hidden p-6 group transition-all duration-300 hover:shadow-xl h-full flex flex-col ${
                    module.status === 'available' ? 'cursor-pointer hover:scale-105' : 'opacity-70 cursor-not-allowed'
                  } ${isDark ? 'bg-slate-800/50 hover:bg-slate-800/70 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200'} border`}
                  onClick={() => handleModuleClick(module.id, module.status)}
                >
                  <div className="relative z-10 flex flex-col flex-grow">
                    <module.icon className={`w-8 h-8 mb-4 bg-gradient-to-r ${module.gradient} text-transparent bg-clip-text`} />
                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{module.title}</h3>
                    <p className={`text-sm mb-4 flex-grow ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{module.description}</p>
                    <div className="mb-6 mt-auto"> {/* Ensure features and button are at bottom */}
                      <ul className={`text-xs space-y-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {module.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${module.gradient}`} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {module.status === 'available' ? (
                      <Button className={`w-full mt-auto bg-gradient-to-r ${module.gradient} text-white hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl`}>
                        <span>Start Learning</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    ) : (
                      <div className={`mt-auto flex items-center gap-2 text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        <GitBranch className="w-4 h-4" />
                        <span>Coming Soon</span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="relative">
              <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Experience AI Like Never Before</h2>
              <p className={`text-lg mb-8 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Our interactive visualizations transform complex mathematical concepts into intuitive, visual experiences. See how data flows through neural networks and understand the mathematics behind modern AI.
              </p>
              <div className="flex flex-col gap-4">
                {["Interactive matrix operations", "Real-time attention visualization", "Step-by-step concept breakdown"].map((item, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }}
                    className={`flex items-center gap-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <div className="h-1 w-1 rounded-full bg-blue-500" />
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="flex justify-center">
              <AIConceptVisual />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">Powerful Learning Features</h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Advanced tools designed to make learning AI concepts intuitive and engaging</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.2 }} viewport={{ once: true }}>
                <FeatureCard feature={feature} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}