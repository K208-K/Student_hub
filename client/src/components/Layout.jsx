import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
  const { dark } = useTheme();

  return (
    <div className={`flex min-h-screen relative overflow-hidden transition-colors duration-700 ${dark ? 'bg-[#0a0f1d] text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {/* 🔮 DYNAMIC BACKGROUND MESH (Visible through Glass) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Top Right Orb */}
        <div className={`absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] animate-pulse opacity-20 
          ${dark ? 'bg-cyan-500' : 'bg-cyan-400'}`} 
        />
        {/* Bottom Left Orb */}
        <div className={`absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full blur-[120px] animate-pulse opacity-20 
          ${dark ? 'bg-purple-600' : 'bg-purple-400'}`} 
          style={{ animationDelay: '2s' }}
        />
        {/* Center Accent */}
        <div className={`absolute top-[30%] left-[20%] w-[30vw] h-[30vw] rounded-full blur-[140px] opacity-10
          ${dark ? 'bg-blue-500' : 'bg-blue-300'}`} 
        />
      </div>

      {/* --- TOAST NOTIFICATIONS --- */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'glass border border-white/20 shadow-2xl',
          style: {
            background: dark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(12px)',
            color: dark ? '#fff' : '#0f172a',
            borderRadius: '20px',
            padding: '12px 24px',
            fontSize: '12px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          },
        }}
      />

      {/* --- SIDEBAR --- */}
      <Sidebar />

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 relative z-10 min-h-screen overflow-x-hidden overflow-y-auto h-screen">
        <motion.div
          key={window.location.pathname} // Triggers animation on every route change
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto"
        >
          <Outlet />
        </motion.div>
      </main>

    </div>
  );
}