import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, GripHorizontal } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence, useDragControls } from "framer-motion";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface ChatBotProps {
  isOpen: boolean;
}

export function ChatBot({ isOpen }: ChatBotProps) {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your self-attention learning assistant. Feel free to ask me questions about the matrix calculations or concepts you see in the workflow.",
      isUser: false,
    },
  ]);
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current && isOpen) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessageId = `user-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: userMessageId, text: input, isUser: true },
    ]);
    setInput("");

    setTimeout(() => {
      const assistantMessageId = `assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          text: "This is a placeholder response. In the future, I'll help you understand these matrix calculations better!",
          isUser: false,
        },
      ]);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          style={{
            position: "fixed",
            right: "20px",
            bottom: "20px",
            width: "400px",
            height: "600px",
            zIndex: 1000,
          }}
          drag
          dragListener={false}
          dragControls={dragControls}
          dragMomentum={false}
          dragTransition={{
            power: 0,
            timeConstant: 0,
            modifyTarget: (target) => target, // No bounce effect
          }}
        >
          <Card
            className={`h-full flex flex-col shadow-xl border backdrop-blur-md ${
              isDark
                ? "bg-slate-800/90 border-slate-700"
                : "bg-white/90 border-slate-200"
            }`}
          >
            {/* Header */}
            <div
              className={`p-4 border-b flex items-center justify-between cursor-move ${
                isDark ? "border-slate-700" : "border-slate-200"
              }`}
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div>
                <h2
                  className={`text-lg font-semibold ${
                    isDark ? "text-slate-100" : "text-slate-800"
                  }`}
                >
                  Learning Assistant
                </h2>
                <p
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Ask questions about self-attention
                </p>
              </div>
              <GripHorizontal
                className={`w-5 h-5 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              />
            </div>

            {/* Messages */}
            <ScrollArea
              ref={scrollAreaRef}
              className="flex-1 p-4 overflow-y-auto"
            >
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${
                      message.isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.isUser
                          ? isDark
                            ? "bg-blue-600/90 text-white backdrop-blur-sm"
                            : "bg-blue-500/90 text-white backdrop-blur-sm"
                          : isDark
                          ? "bg-slate-700/90 text-slate-100 backdrop-blur-sm"
                          : "bg-slate-100/90 text-slate-900 backdrop-blur-sm"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            {/* Input */}
            <div
              className={`p-4 border-t ${
                isDark ? "border-slate-700" : "border-slate-200"
              }`}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question..."
                  className={`
                    ${
                      isDark
                        ? "bg-slate-700/90 border-slate-600 text-slate-100 focus-visible:ring-slate-500"
                        : "bg-slate-50/90 border-slate-200 text-slate-900 focus-visible:ring-slate-400"
                    } backdrop-blur-sm
                  `}
                />
                <Button
                  type="submit"
                  className={`px-3 ${
                    isDark
                      ? "bg-blue-600/90 hover:bg-blue-700/90"
                      : "bg-blue-500/90 hover:bg-blue-600/90"
                  } backdrop-blur-sm`}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
