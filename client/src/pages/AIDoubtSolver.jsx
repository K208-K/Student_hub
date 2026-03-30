import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import {
  HiOutlinePaperAirplane,
  HiOutlineClipboardCopy,
  HiOutlineRefresh,
  HiOutlineSparkles,
  HiOutlineLightBulb
} from "react-icons/hi";
import axios from "axios";
import toast from "react-hot-toast";

export default function AIDoubtSolver() {
  const { dark } = useTheme();
  
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi 👋 I'm your Gemini AI tutor. Ask me anything about your courses, code, or math problems!"
    }
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  // Get token for backend auth if needed (though the AI route above doesn't strictly require it unless you added 'auth' middleware)
  const token = localStorage.getItem("token");

  // 🔥 AUTO SCROLL TO BOTTOM
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🚀 SEND MESSAGE TO BACKEND
  const send = async (customText) => {
    const q = typeof customText === 'string' ? customText.trim() : input.trim();
    if (!q || typing) return;

    // Add user message instantly
    setMessages(prev => [...prev, { role: "user", content: q }]);
    setInput("");
    setTyping(true);

    try {
      // Call our secure backend route
      const res = await axios.post(
        "http://localhost:5000/api/ai/ask", 
        { question: q },
        { headers: { Authorization: `Bearer ${token}` } } // Only needed if your route uses 'auth' middleware
      );

      // Clean up Gemini's bold markdown (**) just for cleaner UI without a markdown parser
      let fullText = res.data.answer.replace(/\*\*/g, ""); 
      let temp = "";

      // 🔥 TYPEWRITER EFFECT
      for (let i = 0; i < fullText.length; i++) {
        temp += fullText[i];
        
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last?.isStreaming) {
            return [...prev.slice(0, -1), { ...last, content: temp }];
          }
          // First character of AI response
          return [...prev, { role: "assistant", content: temp, isStreaming: true }];
        });

        // Speed up the typing effect (Gemini can output a lot of text!)
        await new Promise(r => setTimeout(r, 2)); 
      }

      // Mark streaming as finished
      setMessages(prev => {
        const last = prev[prev.length - 1];
        return [...prev.slice(0, -1), { ...last, isStreaming: false }];
      });

    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "⚠️ Sorry, I'm having trouble connecting to my brain. Check your server and API key." }
      ]);
    } finally {
      setTyping(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="relative h-screen p-4 md:p-8 flex flex-col overflow-hidden font-sans">
      
      {/* --- AMBIENT ORBS --- */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-400/20 blur-[100px] pointer-events-none" />
      <div className="fixed top-[40%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-accent-500/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-primary-600/15 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto w-full h-full flex flex-col">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6 shrink-0">
          <div className="p-3 bg-primary-500/20 rounded-2xl text-primary-500 backdrop-blur-md border border-primary-500/30 shadow-lg">
            <HiOutlineSparkles className="text-3xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text inline-block">AI Tutor</h1>
            <p className="opacity-70 text-sm mt-1">Powered by Google Gemini</p>
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="glass flex-1 overflow-y-auto p-4 md:p-6 space-y-6 rounded-4xl shadow-2xl border border-primary-500/20 flex flex-col scrollbar-hide">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                
                {/* AI Avatar Icon */}
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white shrink-0 mr-3 mt-1 shadow-lg shadow-primary-500/30">
                    <HiOutlineLightBulb />
                  </div>
                )}

                <div
                  className={`max-w-[85%] md:max-w-[75%] p-4 text-sm md:text-base shadow-lg ${
                    msg.role === "user"
                      ? "bg-linear-to-br from-primary-500 to-primary-600 text-white rounded-2xl rounded-tr-sm"
                      : "bg-white/60 dark:bg-black/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl rounded-tl-sm text-gray-800 dark:text-gray-100"
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                    {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-primary-500 animate-pulse" />}
                  </div>

                  {/* ACTION BUTTONS */}
                  {msg.role === "assistant" && !msg.isStreaming && (
                    <div className="flex gap-4 mt-3 pt-3 border-t border-black/10 dark:border-white/10 text-xs font-bold uppercase tracking-wider opacity-60">
                      <button
                        onClick={() => copyToClipboard(msg.content)}
                        className="flex items-center gap-1.5 hover:text-primary-500 transition-colors"
                      >
                        <HiOutlineClipboardCopy className="text-lg" /> Copy
                      </button>
                      
                      {/* Only show regenerate on the very last AI message */}
                      {i === messages.length - 1 && (
                        <button
                          onClick={() => {
                            // Find the last user message to ask again
                            const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                            if (lastUserMsg) send(lastUserMsg.content);
                          }}
                          className="flex items-center gap-1.5 hover:text-primary-500 transition-colors"
                        >
                          <HiOutlineRefresh className="text-lg" /> Retry
                        </button>
                      )}
                    </div>
                  )}

                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* TYPING INDICATOR */}
          {typing && !messages[messages.length - 1]?.isStreaming && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white shrink-0">
                <HiOutlineLightBulb />
              </div>
              <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md border border-white/50 dark:border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
          
          {/* Invisible div to scroll to */}
          <div ref={endRef} className="pb-2" />
        </div>

        {/* INPUT AREA */}
        <div className="mt-4 shrink-0 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask a question... (Shift+Enter for new line)"
            className="input-glass w-full resize-none py-4 pl-6 pr-16 rounded-3xl outline-none focus:ring-2 focus:ring-primary-500/50 shadow-xl overflow-hidden"
            rows="2"
          />

          <button
            onClick={() => send()}
            disabled={!input.trim() || typing}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl flex items-center justify-center transition-all ${
              input.trim() && !typing
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:scale-105 active:scale-95'
                : 'bg-black/5 dark:bg-white/5 text-gray-400 cursor-not-allowed'
            }`}
          >
            <HiOutlinePaperAirplane className="text-xl transform rotate-45 relative -left-0.5" />
          </button>
        </div>

      </div>
    </div>
  );
}