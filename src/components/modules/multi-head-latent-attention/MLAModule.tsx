// src/components/modules/multi-head-latent-attention/MLAModule.tsx
import React, { useState, lazy } from 'react'; // <--- ADD THIS LINE
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { GitCommit, MessageSquare, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChatBot } from '@/components/ChatBot';

const MLAWorkflow = lazy(() => import('./components/MLAWorkflow').then(module => ({ default: module.MLAWorkflow })));

function MLAModule() {
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isWorkflowActive, setIsWorkflowActive] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const startWorkflow = () => {
    setShowIntroModal(false);
    setIsWorkflowActive(true);
  };

  return (
    <div className={`h-screen w-full flex flex-col transition-colors duration-300 relative overflow-hidden ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>
      <Dialog open={showIntroModal} onOpenChange={setShowIntroModal}>
        <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <GitCommit className="text-teal-500" />
              Welcome to Latent Attention!
            </DialogTitle>
            <DialogDescription className="pt-2 text-base">
              Discover how modern transformers like DeepSeek-V2 handle long sequences efficiently through a simplified demonstration.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Standard attention is slow because it creates a large Key-Value (KV) cache. Multi-Head Latent Attention (MHLA) solves this by first compressing K and V into a tiny **latent vector**, then performing attention.
            </p>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-2">
              <p className="text-amber-500 font-medium">Note:</p>
              <p className="text-sm text-muted-foreground">
                This is a simplified version of MHLA. The actual implementation in DeepSeek V2 is more complex. You can explore the complete modules on our website.
              </p>
            </div>
            <div className="mt-2 p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg">
              <p className="text-teal-400 font-medium">Your Mission:</p>
              <p className="text-sm mt-1 text-muted-foreground">
                Follow the data flow. You'll calculate the Query, then the compressed `c_KV` vector, and see how the final Keys and Values are reconstructed from it.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={startWorkflow} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
              Start Compression
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className={`shrink-0 sticky top-4 mx-4 z-50 flex items-center justify-between backdrop-blur-md shadow-lg rounded-lg p-4 transition-colors duration-300 ${isDark ? 'bg-slate-800/70 border-slate-700/50' : 'bg-white/80 border-slate-300/60'}`}>
        <div className="flex items-center gap-4">
          <img src="/Vizlogo.png" alt="Vizuara AI Labs" className="h-8 cursor-pointer" onClick={() => navigate("/")} />
          <h1 className="text-xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate("/")}>
            Multi-Head Latent Attention (Simplified)
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setIsChatOpen(!isChatOpen)} variant="outline" size="sm" className={`flex items-center gap-2 ${isDark ? "text-slate-300 border-slate-600 hover:bg-slate-700" : "text-slate-700 border-slate-300 hover:bg-slate-200"}`}>
            <MessageSquare className="w-4 h-4" /> {isChatOpen ? "Close" : "Chat"}
          </Button>
          {user && <Button onClick={() => navigate("/dashboard")} variant="outline" size="sm"><User className="w-4 h-4" /></Button>}
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-grow">
        <React.Suspense fallback={<div className="flex h-full w-full items-center justify-center">Loading Workflow...</div>}>
          <MLAWorkflow key={isWorkflowActive ? 'active' : 'inactive'} isActive={isWorkflowActive} />
        </React.Suspense>
      </div>

      <ChatBot isOpen={isChatOpen} />
    </div>
  );
}

export default MLAModule;