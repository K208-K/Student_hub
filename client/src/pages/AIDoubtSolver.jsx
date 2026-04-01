import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import {
  HiOutlinePaperAirplane,
  HiOutlineClipboardCopy,
  HiOutlineRefresh,
  HiOutlineSparkles,
  HiOutlineLightBulb,
  HiOutlineStop
} from "react-icons/hi";
import axios from "axios";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

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
  const stopTypingRef = useRef(false); // To stop typewriter effect
  const endRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (customText) => {
    const q = typeof customText === 'string' ? customText.trim() : input.trim();
    if (!q || typing) return;

    setMessages(prev => [...prev, { role: "user", content: q }]);
    setInput("");
    setTyping(true);
    stopTypingRef.current = false;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai/ask", 
        { question: q },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const fullText = res.data.answer;
      let temp = "";

      // 🔥 REFINED TYPEWRITER EFFECT
      for (let i = 0; i < fullText.length; i++) {
        if (stopTypingRef.current) break; // Allow user to stop
        temp += fullText[i];
        
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last?.isStreaming) {
            return [...prev.slice(0, -1), { ...last, content: temp }];
          }
          return [...prev, { role: "assistant", content: temp, isStreaming: true }];
        });

        // Dynamic speed: slower for shorter, faster for long text
        const speed = fullText.length > 500 ? 1 : 5;
        await new Promise(r => setTimeout(r, speed)); 
      }

      setMessages(prev => {
        const last = prev[prev.length - 1];
        return [...prev.slice(0, -1), { ...last, isStreaming: false }];
      });

    } catch (err) {
      toast.error("AI connection failed.");
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Connection error. Please check your API key." }]);
    } finally {
      setTyping(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  return (
    <div className={`relative h-screen p-4 md:p-8 flex flex-col overflow-hidden font-sans ${dark ? 'text-white' : 'text-slate-900'}`}>
      
      {/* BACKGROUND ORBS */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-400/10 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-accent-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto w-full h-full flex flex-col">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6 shrink-0">
          <div className="p-3 bg-primary-500/20 rounded-2xl text-primary-500 border border-primary-500/30 shadow-lg">
            <HiOutlineSparkles className="text-3xl" />
          </div>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">AI <span className="text-primary-500">Tutor</span></h1>
            <p className="opacity-40 text-[10px] font-black uppercase tracking-[0.4em]">Gemini Intelligence</p>
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="glass flex-1 overflow-y-auto p-4 md:p-6 space-y-6 rounded-[40px] border border-white/10 shadow-2xl custom-scrollbar">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white shrink-0 mr-3 mt-1 shadow-lg">
                    <HiOutlineLightBulb />
                  </div>
                )}

                <div className={`max-w-[85%] md:max-w-[75%] p-4 shadow-lg ${
                    msg.role === "user"
                      ? "bg-primary-600 text-white rounded-3xl rounded-tr-none"
                      : "bg-white/5 border border-white/10 rounded-3xl rounded-tl-none"
                  }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({node, inline, className, children, ...props}) {
                          const match = /language-(\w+)/.exec(className || '')
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={atomDark}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>{children}</code>
                          )
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                    {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-primary-500 animate-pulse" />}
                  </div>

                  {msg.role === "assistant" && !msg.isStreaming && (
                    <div className="flex gap-4 mt-3 pt-3 border-t border-white/5 text-[10px] font-black uppercase tracking-widest opacity-30">
                      <button onClick={() => copyToClipboard(msg.content)} className="flex items-center gap-1.5 hover:text-primary-500 transition-colors">
                        <HiOutlineClipboardCopy className="text-lg" /> Copy
                      </button>
                      {i === messages.length - 1 && (
                        <button onClick={() => {
                            const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                            if (lastUserMsg) send(lastUserMsg.content);
                          }} className="flex items-center gap-1.5 hover:text-primary-500 transition-colors">
                          <HiOutlineRefresh className="text-lg" /> Retry
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={endRef} />
        </div>

        {/* INPUT AREA */}
        <div className="mt-4 shrink-0 relative flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask a question..."
            className="input-glass w-full py-4 pl-6 pr-16 rounded-[25px] outline-none focus:ring-2 focus:ring-primary-500/50 shadow-xl"
            rows="2"
          />

          <button
            onClick={() => typing ? (stopTypingRef.current = true) : send()}
            className={`p-4 rounded-2xl flex items-center justify-center transition-all ${
              input.trim() || typing ? 'bg-primary-500 text-white shadow-lg' : 'bg-white/5 text-gray-500'
            }`}
          >
            {typing ? <HiOutlineStop className="text-2xl" /> : <HiOutlinePaperAirplane className="text-2xl rotate-45" />}
          </button>
        </div>
      </div>
    </div>
  );
}