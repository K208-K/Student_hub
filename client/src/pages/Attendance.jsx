import { useState, useEffect } from "react";
import api from "../utils/api"; // ✅ Using your clean API utility
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

  // ✅ Clean Fetching Logic
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/attendance");
      setSubjects(res.data.subjects || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data");
    }
  };

  // ✅ Clean DB Update Logic
  const updateDB = async (updatedSubjects) => {
    try {
      const res = await api.put("/attendance", { subjects: updatedSubjects });
      setSubjects(res.data.subjects || updatedSubjects);
      toast.success("Updated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const addSubject = () => {
    if (!newSubj.trim()) return toast.error("Enter subject name");
    const updated = [...subjects, { subject: newSubj, totalClasses: 0, attendedClasses: 0 }];
    updateDB(updated);
    setNewSubj("");
  };

  const removeSubject = (index) => {
    updateDB(subjects.filter((_, i) => i !== index));
  };

  const updateSubject = (index, field, value) => {
    const updated = subjects.map((s, i) => 
      i === index ? { ...s, [field]: Number(value) } : s
    );
    updateDB(updated);
  };

  const markAttendance = (index, present) => {
    const updated = subjects.map((s, i) => {
      if (i === index) {
        return {
          ...s,
          totalClasses: s.totalClasses + 1,
          attendedClasses: present ? s.attendedClasses + 1 : s.attendedClasses,
        };
      }
      return s;
    });
    updateDB(updated);
  };

  const getInfo = (t, a) => {
    if (t === 0) return { pct: 0, needed: 0, bunk: 0 };
    const pct = (a / t) * 100;
    const needed = Math.max(0, Math.ceil((0.75 * t - a) / 0.25));
    const bunk = Math.max(0, Math.floor((a - 0.75 * t) / 0.75));
    return { pct: Number(pct.toFixed(1)), needed, bunk };
  };

  // Calculations for UI
  const totalClassesSum = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
  const attendedClassesSum = subjects.reduce((sum, s) => sum + s.attendedClasses, 0);
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
          <p className="text-cyan-500 font-black">{payload[0].value} Classes</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`relative min-h-screen p-6 md:p-12 overflow-hidden transition-colors duration-500 ${dark ? 'bg-[#0a0f1d] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Background Ambient Orbs (From Old UI) */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* HEADER (From Old UI) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-2 flex flex-col justify-center">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">Attendance Hub</h1>
            <p className="text-xs font-bold uppercase tracking-[0.4em] opacity-40">Academic Performance Tracker</p>
          </div>
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="glass p-6 rounded-[35px] border border-white/30 flex items-center gap-6 shadow-2xl"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${dark ? 'bg-white/10' : 'bg-slate-900/10'}`}>
               <HiOutlineBadgeCheck className="text-3xl" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Overall</p>
              <h2 className="text-3xl font-black">{overallPct}%</h2>
            </div>
          </motion.div>
        </div>

        {/* ADD SUBJECT (From Old UI) */}
        <div className="glass p-4 mb-10 flex flex-col sm:flex-row gap-4 border border-white/10 shadow-xl">
          <input
            value={newSubj} onChange={(e) => setNewSubj(e.target.value)}
            placeholder="Add a new subject..."
            className={`bg-transparent flex-1 px-4 outline-none font-bold ${dark ? 'placeholder-white/20' : 'placeholder-black/20'}`}
          />
          <button onClick={addSubject} className="bg-cyan-500 text-white px-8 py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all">
            <HiOutlinePlus className="text-xl" /> Add Subject
          </button>
        </div>

        {/* SUBJECTS GRID (From Old UI) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <AnimatePresence>
            {subjects.map((s, i) => {
              const info = getInfo(s.totalClasses, s.attendedClasses);
              return (
                <motion.div key={i} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <div className="glass p-6 h-full relative border border-white/10 shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-black uppercase">{s.subject}</h2>
                      <button onClick={() => removeSubject(i)} className="text-red-500 hover:scale-110 transition-transform">
                        <HiOutlineTrash className="text-xl" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase opacity-40 block ml-1">Total</label>
                        <input type="number" value={s.totalClasses} onChange={(e) => updateSubject(i, "totalClasses", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-center font-bold outline-none focus:border-cyan-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase opacity-40 block ml-1">Attended</label>
                        <input type="number" value={s.attendedClasses} onChange={(e) => updateSubject(i, "attendedClasses", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-center font-bold outline-none focus:border-cyan-500" />
                      </div>
                    </div>

                    <div className="flex gap-2 mb-6">
                      <button onClick={() => markAttendance(i, true)} className="flex-1 py-3 rounded-2xl bg-green-500/20 text-green-500 border border-green-500/30 font-black text-[10px] uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all">Present</button>
                      <button onClick={() => markAttendance(i, false)} className="flex-1 py-3 rounded-2xl bg-red-500/20 text-red-500 border border-red-500/30 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Absent</button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase">
                        <span className="opacity-60">Status</span>
                        <span className={info.pct >= 75 ? "text-green-500" : "text-red-500"}>{info.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-black/10 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(info.pct, 100)}%` }} className={`h-full ${info.pct >= 75 ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                    </div>

                    <div className="flex justify-between mt-6 pt-4 border-t border-white/5 text-[9px] font-black uppercase opacity-50">
                      <span>Needed: {info.needed}</span>
                      <span>Bunk: {info.bunk}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ANALYTICS SECTION (From Old UI) */}
        {subjects.length > 0 && (
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-8 border border-white/10 flex flex-col items-center">
              <div className="flex items-center gap-3 self-start mb-8">
                <HiOutlineChartPie className="text-2xl text-cyan-500" />
                <h3 className="text-lg font-black uppercase italic">Attendance Mix</h3>
              </div>
              <div className="w-full h-[250px] relative">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie 
                      data={pieData} dataKey="value" cx="50%" cy="50%" 
                      innerRadius={60} outerRadius={90} paddingAngle={5} stroke="none"
                    >
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black">{overallPct}%</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-8 border border-white/10 flex flex-col items-center">
              <h3 className="text-sm font-black uppercase tracking-widest self-start mb-8 opacity-40">Analytics</h3>
              <div className="w-full h-[250px]">
                <ResponsiveContainer>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="name" fontSize={8} tick={{ opacity: 0.5, fontWeight: 900 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} fontSize={8} tick={{ opacity: 0.5 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="attendance" radius={[4, 4, 0, 0]}>
                      {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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