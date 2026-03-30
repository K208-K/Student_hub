import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineHome, HiOutlineAcademicCap, HiOutlineCalculator,
  HiOutlineClipboardList, HiOutlineCalendar, HiOutlineDocumentText,
  HiOutlineBell, HiOutlineChatAlt2, HiOutlineClock, HiOutlineLightBulb,
  HiOutlineChartBar, HiOutlineLogout, HiOutlineSun, HiOutlineMoon,
  HiOutlineMenu, HiOutlineX, HiOutlineUser, HiOutlineBookOpen,
  HiOutlineFire
} from 'react-icons/hi';

const navItems = [
  { path: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
  { path: '/timetable', icon: HiOutlineCalendar, label: 'Time Table' },
  { path: '/attendance', icon: HiOutlineClipboardList, label: 'Attendance' },
  { path: '/gpa', icon: HiOutlineCalculator, label: 'GPA Calculator' },
  { path: '/internal', icon: HiOutlineAcademicCap, label: 'Internal Marks' },
  { path: '/planner', icon: HiOutlineCalendar, label: 'Study Planner' },
  { path: '/notes', icon: HiOutlineDocumentText, label: 'Notes' },
  { path: '/gpa-goal', icon: HiOutlineChartBar, label: 'GPA Goal' },
  { path: '/placement', icon: HiOutlineLightBulb, label: 'Placement Prep' },
  { path: '/bunk', icon: HiOutlineFire, label: 'Bunk Planner' },
  { path: '/exams', icon: HiOutlineClock, label: 'Exam Hub' },
  { path: '/notices', icon: HiOutlineBell, label: 'Notice Board' },
  { path: '/ai', icon: HiOutlineChatAlt2, label: 'AI Doubt Solver' },
  { path: '/profile', icon: HiOutlineUser, label: 'Profile' },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6">
      {/* 🚀 LOGO SECTION */}
      <div className={`px-6 mb-10 flex items-center gap-3 ${!expanded && 'justify-center'}`}>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
          <HiOutlineBookOpen className="text-white text-xl" />
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className={`font-black text-xl tracking-tighter uppercase italic ${dark ? 'text-white' : 'text-slate-900'}`}
            >
              Student<span className="text-cyan-500">Hub</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* 👤 USER MINI DOSSIER */}
      <AnimatePresence>
        {expanded && user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mx-4 mb-8 p-4 rounded-[24px] border border-white/10 glass-light shadow-xl`}
          >
            <div className="flex items-center gap-3">
               <img src={user.avatar || "https://i.ibb.co/51m8xG7/avatar.png"} className="w-10 h-10 rounded-xl object-cover border border-cyan-500/30" alt="Me" />
               <div className="overflow-hidden">
                  <p className={`text-sm font-black truncate uppercase tracking-tighter ${dark ? 'text-white' : 'text-slate-900'}`}>
                    {user.name?.split(' ')[0]}
                  </p>
                  <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest truncate">
                    Sem {user.semester || 6} • {user.department || 'CSE'}
                  </p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧭 NAVIGATION DECK */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `group relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300
              ${isActive
                ? `bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 font-bold`
                : `${dark ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-900/5'}`
              }`
            }
          >
            <item.icon className={`text-2xl shrink-0 transition-transform duration-300 group-hover:scale-110`} />
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            
            {/* Active Indicator Glow */}
            <NavLink to={item.path}>
              {({ isActive }) => isActive && (
                <motion.div layoutId="activeGlow" className="absolute inset-0 rounded-2xl bg-white/10 blur-sm pointer-events-none" />
              )}
            </NavLink>
          </NavLink>
        ))}
      </nav>

      {/* ⚙️ BOTTOM CONTROLS */}
      <div className="px-4 mt-6 space-y-2 pt-6 border-t border-white/5">
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300
            ${dark ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-900/5'}`}
        >
          {dark ? <HiOutlineSun className="text-2xl" /> : <HiOutlineMoon className="text-2xl" />}
          {expanded && <span className="text-[10px] font-black uppercase tracking-[0.2em]">{dark ? 'Light System' : 'Dark System'}</span>}
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 text-red-500/60 hover:text-red-500 hover:bg-red-500/10"
        >
          <HiOutlineLogout className="text-2xl" />
          {expanded && <span className="text-[10px] font-black uppercase tracking-[0.2em]">Terminate</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle HUD */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className={`lg:hidden fixed top-6 left-6 z-50 p-3 rounded-2xl glass border border-white/20 shadow-2xl ${dark ? 'text-white' : 'text-slate-900'}`}
        >
          <HiOutlineMenu className="text-2xl" />
        </button>
      )}

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`lg:hidden fixed top-0 left-0 z-[70] h-screen w-[280px] border-r border-white/10 ${dark ? 'bg-[#0a0f1d]/90' : 'bg-white/90'} backdrop-blur-2xl shadow-2xl`}
          >
            <button onClick={() => setMobileOpen(false)} className="absolute top-6 right-6 p-2 opacity-50 hover:opacity-100">
              <HiOutlineX className="text-2xl" />
            </button>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (Main Hub) */}
      <motion.aside
        animate={{ width: expanded ? 280 : 96 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`hidden lg:flex flex-col h-screen sticky top-0 z-[50] border-r border-white/10 transition-colors duration-500
          ${dark ? 'bg-[#0a0f1d]/80 text-white' : 'bg-white/80 text-slate-900'} backdrop-blur-2xl shadow-2xl`}
      >
        {/* Toggle Pull-Tab */}
        <button
          onClick={() => setExpanded(p => !p)}
          className={`absolute -right-3 top-10 z-20 w-6 h-10 rounded-xl flex items-center justify-center text-[10px] shadow-2xl border border-white/10
            ${dark ? 'bg-[#1e293b] text-cyan-400' : 'bg-white text-blue-600'}`}
        >
          {expanded ? '◀' : '▶'}
        </button>
        <SidebarContent />
      </motion.aside>
    </>
  );
}