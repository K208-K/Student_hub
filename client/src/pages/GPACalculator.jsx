import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import api from "../utils/api"; 
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  HiOutlineCalculator,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineTrendingUp,
  HiOutlineAcademicCap,
  HiOutlineChartPie,
  HiOutlineSparkles,
  HiOutlineChartBar
} from "react-icons/hi";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

// 🎯 Synchronized 10-Point Grade Mapping
const gradeMap = { 
  O: 10, "A+": 9, A: 8, "B+": 7, B: 6, "C+": 5, C: 4, F: 0 
};

export default function GPACalculator() {
  const { dark } = useTheme();
  const [semesters, setSemesters] = useState([]);
  const saveTimerRef = useRef(null);

  // 🔥 INITIAL DATA LOAD
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/gpa");
        setSemesters(res.data.semesters || []);
      } catch (err) { 
        console.error("Fetch error:", err); 
      }
    };
    fetchData();
  }, []);

  // ☁️ DEBOUNCED CLOUD SYNC
  const saveToDB = useCallback((updated) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await api.put("/gpa", { semesters: updated });
      } catch (err) { 
        console.error("Cloud sync failed"); 
      }
    }, 1500);
  }, []);

  // 📊 ANALYTICS ENGINE
  const stats = useMemo(() => {
    if (!semesters.length) return { cgpa: "0.00", credits: 0, status: "N/A", percentage: "0.0" };
    let totalPts = 0, totalCrd = 0, sgpas = [];

    semesters.forEach(sem => {
      let semPts = 0, semCrd = 0;
      sem.subjects.forEach(s => {
        const credit = Number(s.credits) || 0;
        const point = gradeMap[s.grade] || 0;
        semPts += credit * point;
        semCrd += credit;
      });
      const sgpa = semCrd ? semPts / semCrd : 0;
      sgpas.push(sgpa);
      totalPts += semPts; totalCrd += semCrd;
    });

    const cgpaVal = totalCrd ? (totalPts / totalCrd) : 0;
    return {
      cgpa: cgpaVal.toFixed(2),
      credits: totalCrd,
      highest: Math.max(...sgpas).toFixed(2),
      status: cgpaVal >= 9 ? "Outstanding" : cgpaVal >= 8 ? "Excellent" : cgpaVal >= 7 ? "Very Good" : "Good",
      percentage: (cgpaVal * 9.5).toFixed(1)
    };
  }, [semesters]);

  const chartData = semesters.map(sem => {
    let pts = 0, crd = 0;
    sem.subjects.forEach(s => { 
      pts += (Number(s.credits) || 0) * (gradeMap[s.grade] || 0); 
      crd += (Number(s.credits) || 0); 
    });
    return { name: `Sem ${sem.semesterNo}`, sgpa: crd ? Number((pts / crd).toFixed(2)) : 0 };
  });

  const addSemester = () => {
    const updated = [...semesters, { semesterNo: semesters.length + 1, subjects: [{ name: "", credits: 4, grade: "A" }] }];
    setSemesters(updated); saveToDB(updated);
  };

  const updateSubject = (semIdx, subIdx, field, val) => {
    const updated = [...semesters];
    updated[semIdx].subjects[subIdx][field] = field === 'credits' ? Number(val) : val;
    setSemesters(updated); saveToDB(updated);
  };

  return (
    <div className={`min-h-screen p-4 md:p-10 transition-colors duration-500 ${dark ? 'text-white' : 'text-slate-900'}`}>
      
      {/* 🔮 BACKGROUND FX */}
      <div className="fixed top-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-primary-500/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-5%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        
        {/* CLEAN MINIMALIST HEADER */}
        <header className="glass p-8 rounded-[40px] border border-white/10 shadow-2xl flex items-center gap-6 justify-center md:justify-start">
          <div className="p-4 bg-primary-500/20 rounded-[25px] text-primary-500 border border-primary-500/20 backdrop-blur-xl">
            <HiOutlineCalculator className="text-4xl" />
          </div>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">Academic <span className="text-primary-500 text-shadow-glow">Dashboard</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.6em] opacity-30 mt-1">Gpa Command Interface</p>
          </div>
        </header>

        {/* ANALYTICS METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Current CGPA" value={stats.cgpa} icon={<HiOutlineAcademicCap />} color="text-primary-500" />
          <StatCard label="Total Credits" value={stats.credits} icon={<HiOutlineTrendingUp />} color="text-emerald-500" />
          <StatCard label="Highest SGPA" value={stats.highest} icon={<HiOutlineSparkles />} color="text-amber-500" />
          <StatCard label="Performance" value={stats.status} icon={<HiOutlineChartPie />} color="text-violet-500" />
          
          <div className="col-span-2 glass p-6 rounded-[30px] flex items-center justify-between bg-primary-500/5 border-primary-500/20">
             <div>
                <p className="text-[9px] font-black uppercase opacity-40 tracking-widest">Percentage Conv.</p>
                <p className="text-3xl font-black text-primary-400">{stats.percentage}%</p>
             </div>
             <div className="h-12 w-12 rounded-2xl bg-primary-500/20 flex items-center justify-center">
                <HiOutlineChartBar className="text-primary-500 text-xl" />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* SEMESTER DATA ENTRY */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex justify-between items-center px-2">
               <h2 className="text-xl font-black uppercase tracking-tighter italic">Semester Records</h2>
               <button onClick={addSemester} className="btn-glass px-6 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                  <HiOutlinePlus /> Add Semester
               </button>
            </div>

            <AnimatePresence>
              {semesters.map((sem, semIdx) => (
                <motion.div key={semIdx} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-8 rounded-[40px] border border-white/5 shadow-xl">
                  <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                    <h3 className="text-xl font-black italic text-primary-400">SEMESTER {sem.semesterNo}</h3>
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-black bg-white/5 px-4 py-2 rounded-full opacity-60">SGPA: {chartData[semIdx]?.sgpa}</span>
                       <button onClick={() => {
                         const updated = semesters.filter((_, i) => i !== semIdx).map((s, i) => ({...s, semesterNo: i + 1}));
                         setSemesters(updated); saveToDB(updated);
                       }} className="text-red-500/30 hover:text-red-500 transition-colors"><HiOutlineTrash /></button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {sem.subjects.map((sub, subIdx) => (
                      <div key={subIdx} className="grid grid-cols-12 gap-3 items-center">
                        <input value={sub.name} onChange={(e) => updateSubject(semIdx, subIdx, 'name', e.target.value)} placeholder="Subject Name" className="col-span-6 input-glass p-3 font-bold text-sm" />
                        <input type="number" value={sub.credits} onChange={(e) => updateSubject(semIdx, subIdx, 'credits', e.target.value)} className="col-span-2 input-glass p-3 text-center font-mono" />
                        <select value={sub.grade} onChange={(e) => updateSubject(semIdx, subIdx, 'grade', e.target.value)} className="col-span-3 input-glass p-3 text-xs font-black uppercase appearance-none text-center">
                          {Object.keys(gradeMap).map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <button onClick={() => {
                          const updated = [...semesters];
                          updated[semIdx].subjects = updated[semIdx].subjects.filter((_, i) => i !== subIdx);
                          setSemesters(updated); saveToDB(updated);
                        }} className="col-span-1 text-red-500/20 hover:text-red-500 flex justify-center"><HiOutlineTrash /></button>
                      </div>
                    ))}
                    <button onClick={() => {
                      const updated = [...semesters];
                      updated[semIdx].subjects.push({ name: "", credits: 4, grade: "A" });
                      setSemesters(updated); saveToDB(updated);
                    }} className="w-full py-3 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] opacity-20 hover:opacity-100 transition-all">+ Add Course</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ANALYTICS SIDEBAR */}
          <div className="lg:col-span-4">
            <div className="glass p-8 rounded-[50px] border border-white/10 shadow-2xl sticky top-10 space-y-10">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-6 text-center">Semester-wise Trend</p>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorSgpa" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#06b6d4', strokeWidth: 2 }} />
                        <Area type="monotone" dataKey="sgpa" stroke="#06b6d4" strokeWidth={4} fillOpacity={1} fill="url(#colorSgpa)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               <div className="pt-8 border-t border-white/5">
                  <div className="p-6 rounded-[30px] bg-gradient-to-br from-primary-500 to-accent-600 text-white shadow-xl flex justify-between items-end">
                    <div>
                       <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-60">Standing</p>
                       <h4 className="text-3xl font-black italic tracking-tighter uppercase">{stats.status}</h4>
                    </div>
                    <HiOutlineAcademicCap className="text-4xl opacity-30" />
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="glass p-5 rounded-[30px] border border-white/5 hover:border-primary-500/30 transition-all group flex flex-col justify-between min-h-[140px]">
      <div className={`mb-3 text-2xl ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
      <div>
        <p className="text-[9px] font-black uppercase opacity-40 tracking-widest">{label}</p>
        <p className="text-xl font-black tracking-tighter mt-1">{value}</p>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-4 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-3xl">
        <p className="text-[10px] font-black uppercase opacity-50 mb-1">{payload[0].payload.name}</p>
        <p className="text-xl font-black text-primary-400">SGPA: {payload[0].value}</p>
      </div>
    );
  }
  return null;
}