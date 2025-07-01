// src/components/modules/mla-query-compression/MlaQueryCompressionModule.tsx
import React, { useState, lazy } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { GitPullRequestArrow, MessageSquare, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChatBot } from '@/components/ChatBot';

// --- CORRECTED THE IMPORT PATH ---
const MlaQueryCompressionWorkflow = lazy(() => import('./components/MlaQueryCompressionWorkflow').then(module => ({ default: module.MlaQueryCompressionWorkflow })));

function MlaQueryCompressionModule() {
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
              <GitPullRequestArrow className="text-pink-500" />
              MLA with Query Compression
            </DialogTitle>
            <DialogDescription className="pt-2 text-base">
              Explore how compressing the Query vector adds another layer of efficiency.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              This module builds on the previous Latent Attention concept. Here, not only are Key and Value compressed, but the Query is also passed through its own down-projection and up-projection bottleneck.
            </p>
            <div className="mt-2 p-3 bg-pink-500/10 border border-pink-500/20 rounded-lg">
              <p className="text-pink-400 font-medium">What's the Trade-off?</p>
              <p className="text-sm mt-1 text-muted-foreground">
                This further reduces memory during training but adds slight computational overhead. It forces the model to learn an even more compact representation for its queries.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={startWorkflow} className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white">
              Explore the Trade-offs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className={`shrink-0 sticky top-4 mx-4 z-50 flex items-center justify-between backdrop-blur-md shadow-lg rounded-lg p-4 transition-colors duration-300 ${isDark ? 'bg-slate-800/70 border-slate-700/50' : 'bg-white/80 border-slate-300/60'}`}>
        <div className="flex items-center gap-4">
          <img src="/Vizlogo.png" alt="Vizuara AI Labs" className="h-8 cursor-pointer" onClick={() => navigate("/")} />
          <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate("/")}>
            MLA + Query Compression
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
          <MlaQueryCompressionWorkflow key={isWorkflowActive ? 'active' : 'inactive'} isActive={isWorkflowActive} />
        </React.Suspense>
      </div>

      <ChatBot isOpen={isChatOpen} />
    </div>
  );
}

export default MlaQueryCompressionModule;