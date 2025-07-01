// src/components/modules/cnn/CNNModule.tsx
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Layers, MessageSquare, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChatBot } from '@/components/ChatBot';
import { CNNWorkflow } from './components/CNNWorkflow';

function CNNModule() {
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isWorkflowActive, setIsWorkflowActive] = useState(false); // New state to control workflow
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const handleProfileClick = () => {
    navigate("/dashboard");
  };

  const startWorkflow = () => {
    setShowIntroModal(false);
    setIsWorkflowActive(true); // Activate the workflow
  };

  return (
    <div className={`h-screen w-full flex flex-col transition-colors duration-300 relative overflow-hidden ${
       isDark ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* --- INTRO MODAL --- */}
      <Dialog open={showIntroModal} onOpenChange={setShowIntroModal}>
        <DialogContent className="sm:max-w-[550px] bg-background/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Layers className="text-cyan-500" />
              Welcome to the CNN Lab!
            </DialogTitle>
            <DialogDescription className="pt-2 text-base">
              Visually trace a data sample through a simple Convolutional Neural Network.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              In this module, you'll perform the core operations of a CNN: convolution, activation, and pooling. See how a network learns to extract features from an "image".
            </p>
            <div className="mt-2 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
              <p className="text-cyan-400 font-medium">Key Concepts:</p>
              <ul className="text-sm mt-2 space-y-1 text-muted-foreground list-disc pl-5">
                <li>Apply a 3x3 convolution kernel to the input. The `Ä` symbol represents this special "convolve" operation.</li>
                <li>Activate the resulting feature map with ReLU.</li>
                <li>Down-sample the map with 2x2 Max Pooling.</li>
                <li>Flatten the result and pass it through a Dense layer for a final output.</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={startWorkflow} className="w-full bg-gradient-to-r from-cyan-500 to-sky-500 text-white">
              Let's Build!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className={`shrink-0 sticky top-4 mx-4 z-50 flex items-center justify-between backdrop-blur-md shadow-lg rounded-lg p-4 transition-colors duration-300 ${
        isDark ? 'bg-slate-800/70 border-slate-700/50' : 'bg-white/80 border-slate-300/60'
      }`}>
        <div className="flex items-center gap-4">
           <img src="/Vizlogo.png" alt="Vizuara AI Labs" className="h-8 cursor-pointer" onClick={() => navigate("/")} />
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-sky-500 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/")}>
            Convolutional Neural Network
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setIsChatOpen(!isChatOpen)} variant="outline" size="sm" className={`flex items-center gap-2 transition-colors duration-150 ${isDark ? "text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-slate-100" : "text-slate-700 border-slate-300 hover:bg-slate-200 hover:text-slate-900"}`}>
            <MessageSquare className="w-4 h-4" /> {isChatOpen ? "Close Chat" : "Open Chat"}
          </Button>
          {user && (
            <Button onClick={handleProfileClick} variant="outline" size="sm" className={`flex items-center gap-2 transition-colors duration-150 ${isDark ? "text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-slate-100" : "text-slate-700 border-slate-300 hover:bg-slate-200 hover:text-slate-900"}`}>
              <User className="w-4 h-4" /> Profile
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-grow">
        {/* Pass the active state to the workflow */}
        <CNNWorkflow key={isWorkflowActive ? 'active' : 'inactive'} isActive={isWorkflowActive} />
      </div>

      <ChatBot isOpen={isChatOpen} />
    </div>
  );
}

export default CNNModule;