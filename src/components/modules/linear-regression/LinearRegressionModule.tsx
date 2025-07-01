// src/components/modules/linear-regression/LinearRegressionModule.tsx
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { RotateCcw, LineChart, MessageSquare, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChatBot } from '@/components/ChatBot';
import { LinearRegressionWorkflow } from './components/LinearRegressionWorkflow';

function LinearRegressionModule() {
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  
  const handleProfileClick = () => {
    navigate("/dashboard");
  };

  return (
    <div className={`h-screen w-full flex flex-col transition-colors duration-300 relative overflow-hidden ${
       isDark ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* --- INTRO MODAL ---
      <Dialog open={showIntroModal} onOpenChange={setShowIntroModal}>
        <DialogContent className="sm:max-w-[550px] bg-background/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <LineChart className="text-orange-500" />
              Welcome to Linear Regression Lab!
            </DialogTitle>
            <DialogDescription className="pt-2 text-base">
              Explore a complete linear regression training cycle using house price prediction.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Linear Regression is one of the simplest yet most powerful algorithms in machine learning. In this lab, you'll see how it predicts house prices based on features like size and number of bedrooms.
            </p>
            <div className="mt-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <p className="text-orange-400 font-medium">Key Concepts:</p>
              <ul className="text-sm mt-2 space-y-1 text-muted-foreground">
                <li>• Linear hypothesis function: y = Xw + b</li>
                <li>• Mean squared error (MSE) loss function</li>
                <li>• Gradient descent optimization</li>
                <li>• Parameter update rules</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowIntroModal(false)} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              Let's Begin!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
      
      {/* Header */}
      <div className={`shrink-0 sticky top-4 mx-4 z-50 flex items-center justify-between backdrop-blur-md shadow-lg rounded-lg p-4 transition-colors duration-300 ${
        isDark ? 'bg-slate-800/70 border-slate-700/50' : 'bg-white/80 border-slate-300/60'
      }`}>
        <div className="flex items-center gap-4">
           <img 
            src="/Vizlogo.png" 
            alt="Vizuara AI Labs" 
            className="h-8 cursor-pointer" 
            onClick={() => navigate("/")}
          />
          <h1 
            className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          >
            Linear Regression
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setIsChatOpen(!isChatOpen)}
            variant="outline"
            size="sm"
            className={`flex items-center gap-2 transition-colors duration-150 ${
              isDark
                ? "text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-slate-100"
                : "text-slate-700 border-slate-300 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            {isChatOpen ? "Close Chat" : "Open Chat"}
          </Button>
          {user && (
            <Button
              onClick={handleProfileClick}
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 transition-colors duration-150 ${
                isDark
                  ? "text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-slate-100"
                  : "text-slate-700 border-slate-300 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-grow">
        <LinearRegressionWorkflow />
      </div>

      <ChatBot isOpen={isChatOpen} />
    </div>
  );
}

// Default export for lazy loading
export default LinearRegressionModule;
