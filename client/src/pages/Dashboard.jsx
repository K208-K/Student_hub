import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  HiOutlineAcademicCap,
  HiOutlineFire,
  HiOutlineTrendingUp,
  HiOutlineOfficeBuilding,
  HiOutlineClipboardList,
  HiOutlineCalculator,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineLightBulb,
  HiOutlineChevronRight,
  HiOutlineShieldCheck
} from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";

const menuCards = [
  { path: "/attendance", label: "Attendance", icon: HiOutlineClipboardList, color: "from-blue-500 to-cyan-500", desc: "Track presence" },
  { path: "/gpa", label: "GPA Calc", icon: HiOutlineCalculator, color: "from-violet-500 to-purple-500", desc: "Grade analytics" },
  { path: "/planner", label: "Planner", icon: HiOutlineCalendar, color: "from-emerald-500 to-teal-500", desc: "Study schedule" },
  { path: "/exams", label: "Exams", icon: HiOutlineClock, color: "from-orange-500 to-red-500", desc: "Countdown" },
  { path: "/ai", label: "AI Solver", icon: HiOutlineLightBulb, color: "from-pink-500 to-rose-500", desc: "Instant help" },
  { path: "/bunk", label: "Bunk Plan", icon: HiOutlineFire, color: "from-amber-500 to-yellow-500", desc: "Risk analysis" },
];

const gradeMap = { O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, D: 4, F: 0 };

export default function Dashboard() {
  const { user } = useAuth();
  const { dark } = useTheme();
  const location = useLocation();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [realAttendance, setRealAttendance] = useState("0.0");
  const [overallCGPA, setOverallCGPA] = useState("0.00");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const attRes = await api.get("/attendance");
        const subjects = attRes.data.subjects || [];
        const total = subjects.reduce((sum, sub) => sum + (sub.totalClasses || 0), 0);
        const attended = subjects.reduce((sum, sub) => sum + (sub.attendedClasses || 0), 0);
        setRealAttendance(total > 0 ? ((attended / total) * 100).toFixed(1) : "0.0");

        const gpaRes = await api.get("/gpa");
        const semesters = gpaRes.data.semesters || [];
        let totalCredits = 0, totalWeighted = 0;
        semesters.forEach((sem) => {
          sem.subjects?.forEach((sub) => {
            totalCredits += sub.credits || 0;
            totalWeighted += (sub.credits || 0) * (gradeMap[sub.grade] || 0);
          });
        });
        setOverallCGPA(totalCredits > 0 ? (totalWeighted / totalCredits).toFixed(2) : "0.00");
      } catch (error) {
        console.error("Dashboard Sync Error:", error);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  return (
    <div className={`min-h-screen p-4 md:p-10 relative overflow-hidden transition-colors duration-500 ${dark ? "bg-[#0a0f1d] text-white" : "bg-[#f8fafc] text-slate-900"}`}>
      
      {/* 🔮 FUTURISTIC BACKGROUND ELEMENTS */}
      <div className="fixed top-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse pointer-events-none" />
      <div className="fixed bottom-[-5%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-purple-600/10 blur-[120px] animate-pulse pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
              Control <span className="text-cyan-400 text-shadow-glow">Center</span>
            </h1>
            <p className="text-[10px] font-black tracking-[0.4em] opacity-40 uppercase mt-2">
              System Active • {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="glass px-6 py-3 rounded-2xl flex items-center gap-4 border-white/10 shadow-2xl backdrop-blur-xl">
               <div className="text-right">
                  <p className="text-xl font-black tracking-tighter">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-[9px] font-black opacity-40 uppercase tracking-widest">Local Intel</p>
               </div>
               <div className="w-[1px] h-8 bg-white/10" />
               <HiOutlineClock className="text-2xl text-cyan-400 animate-spin-slow" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT CONTENT: BENTO METRICS --- */}
          <div className="lg:col-span-8 space-y-8">
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard label="Attendance" value={`${realAttendance}%`} color="bg-blue-500" icon={<HiOutlineFire />} />
              <MetricCard label="Global GPA" value={overallCGPA} color="bg-indigo-500" icon={<HiOutlineTrendingUp />} />
              <MetricCard label="Current Sem" value={`${user?.semester || "6"}th`} color="bg-pink-500" icon={<HiOutlineAcademicCap />} />
              <MetricCard label="Campus" value={user?.college?.split(" ")[0] || "Quantum"} color="bg-amber-500" icon={<HiOutlineOfficeBuilding />} />
            </div>

            {/* QUICK NAV DECK */}
            <div className="glass p-8 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <HiOutlineShieldCheck className="text-9xl" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-8">Navigation Deck</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {menuCards.map((card, i) => (
                  <Link key={i} to={card.path}>
                    <motion.div 
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="glass p-6 rounded-[32px] border border-white/5 flex flex-col items-center justify-center text-center group cursor-pointer transition-all hover:border-cyan-500/30 shadow-xl"
                    >
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg mb-4 group-hover:shadow-cyan-500/40 transition-all`}>
                        <card.icon className="text-3xl" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-widest">{card.label}</p>
                      <p className="text-[9px] font-medium opacity-40 mt-1 uppercase">{card.desc}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* --- RIGHT CONTENT: USER DOSSIER --- */}
          <div className="lg:col-span-4">
            <motion.div 
              initial={{ x: 30, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }}
              className="glass p-10 rounded-[50px] border border-white/20 shadow-2xl relative overflow-hidden h-full flex flex-col items-center"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-cyan-500/20 to-purple-600/20" />
              
              <div className="relative z-10 w-full flex flex-col items-center">
                <div className="w-32 h-32 rounded-[40px] border-4 border-cyan-500/50 p-1 mb-6 shadow-2xl group transition-all">
                  <img 
                    src={user?.avatar || "https://i.ibb.co/51m8xG7/avatar.png"} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-[34px] grayscale group-hover:grayscale-0 transition-all"
                  />
                </div>
                
                <h3 className="text-3xl font-black tracking-tighter uppercase italic text-center leading-none">
                  {user?.name || "Scholar"}
                </h3>
                <div className="flex items-center gap-2 mt-2 bg-cyan-500/10 px-4 py-1 rounded-full border border-cyan-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <p className="text-[9px] font-black text-cyan-400 tracking-widest uppercase">{user?.rollNo || "ID-40292"}</p>
                </div>

                <div className="w-full space-y-4 mt-12">
                  <DataRow label="University" value={user?.university || "Quantum University"} />
                  <DataRow label="Department" value={user?.department || "CSE AI & ML"} />
                  <DataRow label="Clearance" value="Level 6 Academic" />
                  <DataRow label="Status" value="Verified Member" />
                </div>

                <div className="mt-auto pt-10 w-full opacity-20">
                   <div className="h-[1px] w-full bg-white/20 mb-4" />
                   <p className="text-[8px] font-black uppercase tracking-[1em] text-center">StudentHub OS V2.0</p>
                </div>
              </div>
            </motion.div>
          </div>

        </div>

        <footer className="mt-12 text-center pb-10 opacity-20 text-[10px] font-black uppercase tracking-[1em]">
          Designed by <span className="text-cyan-500">Karrim</span>
        </footer>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color, icon }) {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.05 }} 
      className="glass p-6 rounded-[35px] border border-white/10 flex flex-col justify-between shadow-xl min-h-[160px] relative overflow-hidden group"
    >
      <div className={`absolute -right-2 -top-2 w-20 h-20 ${color} opacity-10 blur-2xl rounded-full group-hover:opacity-30 transition-all`} />
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg mb-4`}>
        {icon}
      </div>
      <div>
        <h4 className="text-[9px] font-black uppercase opacity-40 tracking-[0.2em]">{label}</h4>
        <p className="text-2xl font-black tracking-tighter truncate">{value}</p>
      </div>
    </motion.div>
  );
}

function DataRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/5 group transition-all">
      <span className="text-[9px] font-black uppercase opacity-30 tracking-widest group-hover:opacity-60">{label}</span>
      <span className="text-[10px] font-bold uppercase tracking-tight text-right">{value}</span>
    </div>
  );
}