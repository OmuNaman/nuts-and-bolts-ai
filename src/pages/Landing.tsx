import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card } from "@/components/ui/card";
import {
  Brain,
  Cpu,
  Network,
  Sparkles,
  ArrowRight,
  GitBranch,
  Code,
  Lightbulb,
  Zap,
  Layers,
  Share2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Module {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  status: "available" | "coming-soon";
  gradient: string;
  features: string[];
}

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface SocialLink {
  icon: LucideIcon;
  label: string;
  href: string;
}

function FeatureCard({
  feature,
}: {
  feature: { icon: LucideIcon; title: string; description: string };
}) {
  const { isDark } = useTheme();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`p-6 rounded-xl transition-all duration-300 ${
        isDark
          ? "bg-slate-800/50 border-slate-700 hover:bg-slate-800/70"
          : "bg-white border-slate-200 hover:bg-slate-50"
      } border shadow-lg hover:shadow-xl`}
    >
      <div
        className={`mb-4 inline-flex p-3 rounded-lg ${
          isDark ? "bg-slate-700/50" : "bg-slate-100"
        }`}
      >
        <feature.icon className="w-6 h-6 text-blue-500" />
      </div>
      <h3
        className={`text-lg font-semibold mb-2 ${
          isDark ? "text-white" : "text-slate-900"
        }`}
      >
        {feature.title}
      </h3>
      <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
        {feature.description}
      </p>
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
            {nodes.map(
              (_, j) =>
                j !== i && (
                  <motion.line
                    key={`${i}-${j}`}
                    x1={node.x}
                    y1={node.y}
                    x2={nodes[j].x}
                    y2={nodes[j].y}
                    stroke={
                      isDark
                        ? "rgba(59, 130, 246, 0.2)"
                        : "rgba(37, 99, 235, 0.1)"
                    }
                    strokeWidth="1"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 2,
                      delay: (i + j) * 0.2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                )
            )}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="4"
              fill={isDark ? "#3b82f6" : "#2563eb"}
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function Landing() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 15,
        y: (e.clientY - window.innerHeight / 2) / 15,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const modules: Module[] = [
    {
      id: "self-attention",
      title: "Self Attention Mechanism",
      description:
        "Put your knowledge to the test with interactive practice modules. Learn by doing — not just reading.",
      icon: Brain,
      status: "available",
      gradient: "from-blue-500 to-purple-500",
      features: [
        "Interactive Matrix Operations",
        "Real-time Visualization",
        "Step-by-step Understanding",
      ],
    },
    {
      id: "transformer",
      title: "Transformer Architecture",
      description:
        "Coming soon - Deep dive into the complete transformer architecture with animated data flow",
      icon: Cpu,
      status: "coming-soon",
      gradient: "from-emerald-500 to-teal-500",
      features: [
        "Multi-head Attention",
        "Position Embeddings",
        "Feed-forward Networks",
      ],
    },
    {
      id: "llm",
      title: "Large Language Models",
      description:
        "Coming soon - Explore the architecture and principles behind modern LLMs",
      icon: Network,
      status: "coming-soon",
      gradient: "from-orange-500 to-red-500",
      features: ["Scaling Laws", "Architecture Choices", "Training Dynamics"],
    },
  ];

  const handleStartLearning = () => {
    if (user) {
      navigate("/learning");
    } else {
      navigate("/auth");
    }
  };

  const features: Feature[] = [
    {
      icon: Zap,
      title: "Real-time Processing",
      description:
        "Watch as matrices transform and interact in real-time, making complex operations intuitive.",
    },
    {
      icon: Layers,
      title: "Layer by Layer",
      description:
        "Break down complex neural architectures into understandable, interactive components.",
    },
    {
      icon: Share2,
      title: "Interactive Learning",
      description:
        "Engage with each concept through hands-on manipulation and visualization.",
    },
  ];

  const socialLinks: SocialLink[] = [
    { icon: GitBranch, label: "GitHub", href: "#" },
    { icon: Code, label: "Documentation", href: "#" },
    { icon: Lightbulb, label: "Blog", href: "#" },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 relative overflow-hidden ${
        isDark ? "bg-slate-900" : "bg-gray-50"
      }`}
    >
      {/* Animated Background Grid */}
      <div
        className="fixed inset-0 pointer-events-none transition-transform duration-200"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          backgroundImage: `radial-gradient(${
            isDark ? "rgb(255 255 255 / 0.15)" : "rgb(0 0 0 / 0.15)"
          } 1.5px, transparent 1.5px)`,
          backgroundSize: "40px 40px",
          backgroundPosition: "-20px -20px",
        }}
      />

      {/* Header */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-opacity-20 backdrop-blur-xl bg-opacity-80"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <img src="/Vizlogo.png" alt="Logo" className="h-8" />
            <h1
              className={`text-xl font-semibold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Vizuara AI Labs
            </h1>
          </motion.div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className={`transition-colors duration-300 ${
                    isDark
                      ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Dashboard
                </Button>
                <Button
                  onClick={() => navigate("/learning")}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  Continue Learning
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                  className={`transition-colors duration-300 ${
                    isDark
                      ? "text-slate-300 hover:bg-slate-700"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/auth")}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  Sign Up
                </Button>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </motion.nav>

      {/* Mouse Guide */}
      <motion.div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 text-sm text-slate-500"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      ></motion.div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-12 px-6">
        <motion.div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              className="flex justify-center mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="relative">
                <Sparkles
                  className={`w-12 h-12 ${
                    isDark ? "text-blue-400" : "text-blue-500"
                  }`}
                />
                <motion.div
                  className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>

            <motion.h1
              className={`text-5xl md:text-6xl lg:text-7xl font-bold mb-4 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Nuts &{" "}
              <motion.span
                className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent relative inline-block"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Bolts AI
              </motion.span>
            </motion.h1>

            <motion.p
              className={`text-lg md:text-xl mb-3 ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Powered by Vizuara AI
            </motion.p>

            <motion.p
              className={`text-xl md:text-2xl mb-6 ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Put your knowledge to the test with interactive practice modules!
            </motion.p>
          </motion.div>
        </motion.div>
      </section>

      {/* Learning Modules Cards */}
      <section className="py-12 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  className={`relative overflow-hidden p-6 cursor-pointer group transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    isDark
                      ? "bg-slate-800/50 hover:bg-slate-800/70 border-slate-700"
                      : "bg-white hover:bg-slate-50 border-slate-200"
                  } border`}
                  onClick={() =>
                    module.status === "available" && handleStartLearning()
                  }
                >
                  <div className="relative z-10">
                    <module.icon
                      className={`w-8 h-8 mb-4 bg-gradient-to-r ${module.gradient} text-transparent bg-clip-text`}
                    />
                    <h3
                      className={`text-xl font-semibold mb-3 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {module.title}
                    </h3>

                    <p
                      className={`text-sm mb-4 ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {module.description}
                    </p>

                    <div className="mb-6">
                      <ul
                        className={`text-sm space-y-1 ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        {module.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div
                              className={`w-1 h-1 rounded-full bg-gradient-to-r ${module.gradient}`}
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {module.status === "available" ? (
                      <Button
                        className={`w-full bg-gradient-to-r ${module.gradient} text-white hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl`}
                      >
                        <span>Start Learning</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    ) : (
                      <div
                        className={`flex items-center gap-2 text-sm font-medium ${
                          isDark ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
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

      {/* AI Concept Visualization Section */}
      <section className="py-16 px-6 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div
            className={`absolute top-20 left-10 text-xs font-mono ${
              isDark ? "text-blue-400" : "text-blue-600"
            }`}
          >
            matrix
          </div>
          <div
            className={`absolute bottom-32 right-16 text-xs font-mono ${
              isDark ? "text-purple-400" : "text-purple-600"
            }`}
          >
            attention
          </div>
          <div
            className={`absolute top-1/2 left-1/4 text-xs font-mono ${
              isDark ? "text-green-400" : "text-green-600"
            }`}
          >
            neural
          </div>
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <h2
                className={`text-3xl md:text-4xl font-bold mb-6 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Experience AI Like Never Before
              </h2>
              <p
                className={`text-lg mb-8 ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Our interactive visualizations transform complex mathematical
                concepts into intuitive, visual experiences. See how data flows
                through neural networks and understand the mathematics behind
                modern AI.
              </p>
              <div className="flex flex-col gap-4">
                {[
                  "Interactive matrix operations",
                  "Real-time attention visualization",
                  "Step-by-step concept breakdown",
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`flex items-center gap-3 ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    <div className="h-1 w-1 rounded-full bg-blue-500" />
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <AIConceptVisual />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
              Powerful Learning Features
            </h2>
            <p
              className={`text-lg max-w-2xl mx-auto ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Advanced tools designed to make learning AI concepts intuitive and
              engaging
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <FeatureCard feature={feature} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Call to Action */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          onClick={handleStartLearning}
          size="lg"
          className="px-6 py-6 text-lg rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold transition-all duration-300 ease-out hover:scale-110 hover:shadow-2xl shadow-blue-500/20 group"
        >
          <span>Start Learning</span>
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </div>
  );
}
