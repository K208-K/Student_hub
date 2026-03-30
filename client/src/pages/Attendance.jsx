import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";
import { HiOutlineTrash, HiOutlinePlus, HiOutlineChartPie, HiOutlineBadgeCheck } from "react-icons/hi";
import { useTheme } from "../context/ThemeContext";

const COLORS = ["#06b6d4", "#ec4899", "#8b5cf6", "#f59e0b", "#10b981"];

export default function Attendance() {
  const { dark } = useTheme();
  const [subjects, setSubjects] = useState([]);
  const [newSubj, setNewSubj] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/attendance", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubjects(res.data.subjects || []);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, [token]);

  const updateDB = async (updated) => {
    try {
      const res = await axios.put(
        "http://localhost:5000/api/attendance",
        { subjects: updated },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubjects(res.data.subjects);
    } catch (error) {
      toast.error("Failed to update database");
    }
  };

  const addSubject = () => {
    if (!newSubj.trim()) return;
    updateDB([...subjects, { subject: newSubj, totalClasses: 0, attendedClasses: 0 }]);
    setNewSubj("");
    toast.success("Subject added!");
  };

  const removeSubject = (i) => updateDB(subjects.filter((_, idx) => idx !== i));

  const updateSubject = (i, field, val) => {
    updateDB(subjects.map((s, idx) => idx === i ? { ...s, [field]: Number(val) } : s));
  };

  const markAttendance = (i, present) => {
    updateDB(subjects.map((s, idx) => {
      if (idx === i) {
        return {
          ...s,
          totalClasses: s.totalClasses + 1,
          attendedClasses: present ? s.attendedClasses + 1 : s.attendedClasses
        };
      }
      return s;
    }));
  };

  const getInfo = (t, a) => {
    if (t === 0) return { pct: 0, needed: 0, bunk: 0 };
    const pct = (a / t) * 100;
    const needed = Math.max(0, Math.ceil((0.75 * t - a) / 0.25));
    const bunk = Math.max(0, Math.floor((a - 0.75 * t) / 0.75));
    return { pct: Number(pct.toFixed(1)), needed, bunk };
  };

  const totalClassesSum = subjects.reduce((acc, s) => acc + s.totalClasses, 0);
  const attendedClassesSum = subjects.reduce((acc, s) => acc + s.attendedClasses, 0);
  const overallPct = totalClassesSum > 0 ? ((attendedClassesSum / totalClassesSum) * 100).toFixed(1) : 0;

  const pieData = subjects.map(s => ({ 
    name: s.subject, 
    value: s.attendedClasses,
    percentage: s.totalClasses > 0 ? ((s.attendedClasses / s.totalClasses) * 100).toFixed(1) : 0 
  }));

  const barData = subjects.map(s => ({
    name: s.subject,
    attendance: s.totalClasses > 0 ? Number(((s.attendedClasses / s.totalClasses) * 100).toFixed(1)) : 0
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`glass p-3 shadow-xl border border-white/20 ${dark ? 'text-white' : 'text-slate-900'}`}>
          <p className="font-bold text-sm uppercase tracking-wider">{payload[0].name}</p>
          <p className="text-primary-500 font-black">
            {payload[0].value} Classes
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`relative min-h-screen p-6 md:p-12 overflow-hidden font-sans transition-colors duration-500 ${dark ? 'bg-[#0a0f1d] text-white' : 'bg-surface-50 text-slate-900'}`}>
      
      {/* Background Ambient Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}/>

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* HEADER & OVERALL CARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-2 flex flex-col justify-center">
            <h1 className={`text-4xl font-black uppercase italic tracking-tighter mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>Attendance Hub</h1>
            <p className="text-xs font-bold uppercase tracking-[0.4em] opacity-40">Academic Performance Tracker</p>
          </div>
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className={`glass-vibrant p-6 rounded-[35px] border border-white/30 flex items-center gap-6 shadow-2xl relative overflow-hidden ${dark ? 'text-white' : 'text-slate-900'}`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${dark ? 'bg-white/20' : 'bg-slate-900/10'}`}>
               <HiOutlineBadgeCheck className="text-4xl" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Overall Status</p>
              <h2 className="text-4xl font-black">{overallPct}%</h2>
              <div className="w-24 h-1 bg-current opacity-20 rounded-full mt-2 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${overallPct}%` }} className="h-full bg-current" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ADD SUBJECT */}
        <motion.div className="glass p-4 mb-10 flex flex-col sm:flex-row gap-4 border border-white/10 shadow-xl">
          <input
            value={newSubj} onChange={(e) => setNewSubj(e.target.value)}
            placeholder="Add a new subject..."
            className={`input-glass flex-1 outline-none font-bold ${dark ? 'text-white' : 'text-slate-900'}`}
          />
          <button onClick={addSubject} className="btn-primary px-8 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
            <HiOutlinePlus className="text-xl" /> Add Subject
          </button>
        </motion.div>

        {/* SUBJECTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <AnimatePresence>
            {subjects.map((s, i) => {
              const info = getInfo(s.totalClasses, s.attendedClasses);
              return (
                <motion.div key={s.subject + i} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <div className="glass p-6 h-full relative border border-white/10 group shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-black uppercase tracking-tight">{s.subject}</h2>
                      <button onClick={() => removeSubject(i)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                        <HiOutlineTrash className="text-xl" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 block ml-1">Total</label>
                        <input type="number" value={s.totalClasses} onChange={(e) => updateSubject(i, "totalClasses", e.target.value)} className={`input-glass w-full text-center font-black ${dark ? 'text-white' : 'text-slate-900'}`} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 block ml-1">Attended</label>
                        <input type="number" value={s.attendedClasses} onChange={(e) => updateSubject(i, "attendedClasses", e.target.value)} className={`input-glass w-full text-center font-black ${dark ? 'text-white' : 'text-slate-900'}`} />
                      </div>
                    </div>

                    <div className="flex gap-2 mb-6">
                      <button onClick={() => markAttendance(i, true)} className="flex-1 py-3 rounded-2xl bg-green-500/20 text-green-500 border border-green-500/30 font-black text-[10px] uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all">Present</button>
                      <button onClick={() => markAttendance(i, false)} className="flex-1 py-3 rounded-2xl bg-red-500/20 text-red-500 border border-red-500/30 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Absent</button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                        <span>Progress</span>
                        <span className={info.pct >= 75 ? "text-green-500" : "text-red-500"}>{info.pct}%</span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden border border-white/5 shadow-inner ${dark ? 'bg-white/5' : 'bg-slate-900/5'}`}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(info.pct, 100)}%` }} className={`h-full ${info.pct >= 75 ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                    </div>

                    <div className="flex justify-between mt-6 pt-4 border-t border-white/5 text-[9px] font-black uppercase tracking-widest opacity-50">
                      <span>Needed: {info.needed}</span>
                      <span>Bunk: {info.bunk}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ANALYTICS SECTION */}
        {subjects.length > 0 && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* PIE CHART WITH SUBJECT LEGEND */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass p-8 border border-white/10 flex flex-col items-center">
              <div className="flex items-center gap-3 self-start mb-8">
                <HiOutlineChartPie className="text-2xl text-cyan-500" />
                <h3 className="text-lg font-black uppercase tracking-tighter italic">Attendance Mix</h3>
              </div>
              <div className="w-full flex flex-col lg:flex-row items-center gap-8">
                <div className="w-full h-[250px] relative">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie 
                        data={pieData} dataKey="value" cx="50%" cy="50%" 
                        innerRadius={70} outerRadius={100} paddingAngle={5}
                        stroke="none"
                      >
                        {pieData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black leading-none">{overallPct}%</span>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Total</span>
                  </div>
                </div>
                <div className="w-full lg:w-48 space-y-3">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-[10px] font-black uppercase tracking-tight opacity-70 truncate w-24">{item.name}</span>
                      </div>
                      <span className="text-[10px] font-black opacity-40">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* BAR CHART */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass p-8 border border-white/10 flex flex-col items-center">
              <h3 className="text-sm font-black uppercase tracking-widest self-start mb-8 opacity-40">Comparative Analysis</h3>
              <div className="w-full h-62.5">
                <ResponsiveContainer>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#ffffff" : "#000000"} opacity={0.05} vertical={false} />
                    <XAxis dataKey="name" stroke={dark ? "#ffffff" : "#000000"} fontSize={8} tickLine={false} axisLine={false} tick={{ opacity: 0.4, fontWeight: '900' }} />
                    <YAxis stroke={dark ? "#ffffff" : "#000000"} fontSize={8} tickLine={false} axisLine={false} domain={[0, 100]} tick={{ opacity: 0.4 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
                    <Bar dataKey="attendance" radius={[6, 6, 0, 0]}>
                      {barData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}