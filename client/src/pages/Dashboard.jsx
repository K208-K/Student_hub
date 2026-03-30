import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  HiOutlineAcademicCap, HiOutlineFire, HiOutlineTrendingUp, 
  HiOutlineOfficeBuilding, HiOutlineClipboardList, HiOutlineCalculator, 
  HiOutlineCalendar, HiOutlineClock, HiOutlineLightBulb 
} from 'react-icons/hi';
import { Link } from 'react-router-dom';

const menuCards = [
  { path: '/attendance', label: 'Attendance', icon: HiOutlineClipboardList, color: 'from-blue-500 to-cyan-500' },
  { path: '/gpa', label: 'GPA Calc', icon: HiOutlineCalculator, color: 'from-violet-500 to-purple-500' },
  { path: '/planner', label: 'Planner', icon: HiOutlineCalendar, color: 'from-emerald-500 to-teal-500' },
  { path: '/exams', label: 'Exams', icon: HiOutlineClock, color: 'from-orange-500 to-red-500' },
  { path: '/ai', label: 'AI Solver', icon: HiOutlineLightBulb, color: 'from-pink-500 to-rose-500' },
  { path: '/bunk', label: 'Bunk Plan', icon: HiOutlineFire, color: 'from-amber-500 to-yellow-500' },
];

const gradeMap = { O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, D: 4, F: 0 };

export default function Dashboard() {
  const { user } = useAuth();
  const { dark } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [realAttendance, setRealAttendance] = useState(0);
  const [overallCGPA, setOverallCGPA] = useState("0.00");
  const token = localStorage.getItem("token");

  // 🕒 LIVE CLOCK
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 📊 SYNC REAL STATS (Attendance & CGPA)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. Fetch Attendance
        const attRes = await axios.get("http://localhost:5000/api/attendance", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const attSubjects = attRes.data.subjects || [];
        const totalAtt = attSubjects.reduce((acc, s) => acc + s.totalClasses, 0);
        const attendedAtt = attSubjects.reduce((acc, s) => acc + s.attendedClasses, 0);
        setRealAttendance(totalAtt > 0 ? ((attendedAtt / totalAtt) * 100).toFixed(1) : 0);

        // 2. Fetch GPA for Overall CGPA
        const gpaRes = await axios.get("http://localhost:5000/api/gpa", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const semesters = gpaRes.data.semesters || [];
        let totalCredits = 0, totalWeighted = 0;
        
        semesters.forEach((sem) => {
          sem.subjects.forEach((s) => {
            totalCredits += s.credits;
            totalWeighted += s.credits * (gradeMap[s.grade] || 0);
          });
        });
        setOverallCGPA(totalCredits ? (totalWeighted / totalCredits).toFixed(2) : "0.00");

      } catch (error) {
        console.error("Dashboard Sync Error:", error);
      }
    };
    if (token) fetchStats();
  }, [token]);

  const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date) => date.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
  const greeting = currentTime.getHours() < 12 ? 'Good Morning' : currentTime.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className={`min-h-screen p-4 md:p-8 relative overflow-hidden font-sans transition-colors duration-500 ${dark ? 'bg-[#0a0f1d] text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {/* 🔮 BACKGROUND GLOW */}
      <div className="fixed top-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/10 blur-[140px] animate-pulse pointer-events-none" />
      <div className="fixed bottom-[-5%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-purple-600/10 blur-[140px] animate-pulse pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
              {greeting}, <span className="text-cyan-400 text-shadow-glow">{user?.name?.split(' ')[0] || 'Scholar'}</span> 👋
            </h1>
            <p className="text-[10px] font-black tracking-[0.4em] opacity-60 uppercase mt-2">
              {formatDate(currentTime)} • <span className="text-cyan-400">{formatTime(currentTime)}</span>
            </p>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="glass px-6 py-2 rounded-full flex items-center gap-3 border-white/20 shadow-xl">
               <div className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
               <span className="text-[10px] font-black tracking-widest opacity-80 uppercase">Systems Active</span>
            </div>
            <img src={user?.avatar || "https://i.ibb.co/51m8xG7/avatar.png"} alt="Profile" className="w-12 h-12 rounded-2xl border-2 border-cyan-500 p-0.5 overflow-hidden object-cover" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT SECTION --- */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <MetricCard label="Attendance" value={`${realAttendance}%`} color="bg-blue-500" icon={<HiOutlineFire/>} />
               <MetricCard label="Overall CGPA" value={overallCGPA} color="bg-indigo-500" icon={<HiOutlineTrendingUp/>} />
               <MetricCard label="Current Sem" value={`${user?.semester || '6'}th`} color="bg-pink-500" icon={<HiOutlineAcademicCap/>} />
               <MetricCard label="Institution" value={user?.college?.split(' ')[0] || "Quantum"} color="bg-amber-500" icon={<HiOutlineOfficeBuilding/>} />
            </div>

            {/* NAVIGATION DECK */}
            <div className="glass p-8 rounded-[40px] border border-white/10 shadow-2xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-8 pl-2">Quick Navigation</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {menuCards.map((card, i) => (
                  <Link key={i} to={card.path}>
                    <motion.div whileHover={{ y: -5, scale: 1.05 }} className="glass p-6 rounded-[30px] border border-white/10 flex flex-col items-center justify-center text-center group cursor-pointer transition-all">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg mb-4 group-hover:shadow-cyan-500/40`}>
                        <card.icon className="text-2xl" />
                      </div>
                      <p className={`text-[10px] font-black uppercase tracking-widest opacity-70 group-hover:opacity-100 ${dark ? 'text-white' : 'text-slate-900'}`}>{card.label}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* --- RIGHT SECTION: DOSSIER --- */}
          <div className="lg:col-span-4">
            <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass p-10 rounded-[50px] border border-white/20 shadow-2xl relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-cyan-500 to-blue-600 opacity-20" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-28 h-28 mx-auto rounded-[35px] border-4 border-cyan-500 shadow-2xl overflow-hidden mb-6 p-1 bg-white/10">
                  <img src={user?.avatar || "https://i.ibb.co/51m8xG7/avatar.png"} alt="Student" className="w-full h-full object-cover rounded-[28px]" />
                </div>
                <h3 className={`text-3xl font-black tracking-tighter uppercase text-center mb-1 ${dark ? 'text-white' : 'text-slate-900'}`}>{user?.name || "Abdul Karim"}</h3>
                <p className="text-[10px] font-black text-cyan-400 tracking-[0.4em] uppercase text-center mb-10">{user?.rollNo || "N/A"}</p>
                <div className="space-y-4 flex-1">
                  <DataRow label="University" value={user?.university || "Quantum University"} />
                  <DataRow label="College" value={user?.college || "Quantum School of Tech"} />
                  <DataRow label="Department" value={user?.department || "CSE AI & ML"} />
                  <DataRow label="Course" value={user?.course || "B.Tech Engineering"} />
                  <DataRow label="Section" value={user?.section || "Section-1"} />
                </div>
                <div className="mt-12 pt-8 border-t border-white/5 text-center opacity-20"><p className="text-[10px] font-black uppercase tracking-[0.8em]">STUDENTHUB OS</p></div>
              </div>
            </motion.div>
          </div>
        </div>
        <footer className="mt-12 text-center pb-8 opacity-30 text-[10px] font-black uppercase tracking-[1em]">Designed by <span className="text-cyan-500">K208</span></footer>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color, icon }) {
  const { dark } = useTheme();
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="glass p-5 rounded-[30px] border border-white/10 flex flex-col justify-between shadow-xl">
      <div className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg mb-4`}>{icon}</div>
      <div>
        <h4 className={`text-[9px] font-black uppercase opacity-40 tracking-widest ${dark ? 'text-white' : 'text-slate-900'}`}>{label}</h4>
        <p className={`text-lg font-bold truncate ${dark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
      </div>
    </motion.div>
  );
}

function DataRow({ label, value }) {
  const { dark } = useTheme();
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-white/5">
      <span className={`text-[9px] font-black uppercase opacity-30 tracking-widest ${dark ? 'text-white' : 'text-slate-900'}`}>{label}</span>
      <span className={`text-[10px] font-bold uppercase tracking-tight text-right ${dark ? 'text-white' : 'text-slate-900'}`}>{value}</span>
    </div>
  );
}