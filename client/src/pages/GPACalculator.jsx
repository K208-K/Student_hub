import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import api from "../utils/api"; 
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import {
  HiOutlineCalculator, HiOutlinePlus, HiOutlineTrash, HiOutlineAcademicCap,
  HiOutlineTrendingUp, HiOutlineSparkles, HiOutlineChartPie, HiOutlineChartBar
} from "react-icons/hi";

// 🎯 OFFICIAL GRADE POINT MAPPING
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

  // ☁️ FIXED DATABASE SYNC (Debounced)
  const saveToDB = useCallback((updatedData) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    
    saveTimerRef.current = setTimeout(async () => {
      try {
        // We wrap the array in an object as most backends expect { semesters: [...] }
        await api.put("/gpa", { semesters: updatedData });
        console.log("Database synced successfully ✅");
      } catch (err) { 
        console.error("Cloud sync failed ❌", err.response?.data || err.message); 
      }
    }, 1000); 
  }, []);

  // 🧮 CALCULATION HELPERS
  const calculateSGPA = (subjects) => {
    const totalCredits = subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);
    if (totalCredits === 0) return "0.00";
    const weightedPoints = subjects.reduce((sum, s) => sum + (Number(s.credits) || 0) * (gradeMap[s.grade] || 0), 0);
    return (weightedPoints / totalCredits).toFixed(2);
  };

  // ➕ ACTIONS
  const addSemester = () => {
    const updated = [
      ...semesters, 
      { 
        semesterNo: semesters.length + 1, 
        subjects: [{ type: "Theory", code: "", name: "", credits: 3, grade: "A" }] 
      }
    ];
    setSemesters(updated);
    saveToDB(updated);
  };

  const updateSubject = (semIdx, subIdx, field, val) => {
    // 1. Immutable update for React state & DB sync
    const updatedSemesters = semesters.map((sem, sIdx) => {
      if (sIdx !== semIdx) return sem;
      
      const updatedSubjects = sem.subjects.map((sub, bIdx) => {
        if (bIdx !== subIdx) return sub;
        return { 
          ...sub, 
          [field]: field === 'credits' ? Number(val) : val 
        };
      });

      return { ...sem, subjects: updatedSubjects };
    });

    setSemesters(updatedSemesters);
    saveToDB(updatedSemesters); // Sends the fresh array to the DB
  };

  const removeSemester = (idx) => {
    const updated = semesters
      .filter((_, i) => i !== idx)
      .map((s, i) => ({ ...s, semesterNo: i + 1 }));
    setSemesters(updated);
    saveToDB(updated);
  };

  const removeSubject = (semIdx, subIdx) => {
    const updated = semesters.map((sem, sIdx) => {
      if (sIdx !== semIdx) return sem;
      return { ...sem, subjects: sem.subjects.filter((_, i) => i !== subIdx) };
    });
    setSemesters(updated);
    saveToDB(updated);
  };

  return (
    <div className={`min-h-screen p-4 md:p-10 transition-colors duration-500 ${dark ? 'bg-[#0b0f1a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* HEADER */}
        <header className="glass p-6 rounded-[30px] border border-white/10 flex justify-between items-center shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/20 rounded-2xl text-primary-500">
              <HiOutlineCalculator className="text-3xl" />
            </div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">Academic <span className="text-primary-500">Dashboard</span></h1>
          </div>
          <button onClick={addSemester} className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">
            + Add Semester
          </button>
        </header>

        <div className="space-y-8">
          <AnimatePresence>
            {semesters.map((sem, semIdx) => (
              <motion.div 
                key={semIdx} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`p-8 rounded-[40px] border ${dark ? 'bg-[#161b2a] border-white/5' : 'bg-white border-slate-200'} shadow-2xl`}
              >
                {/* SEMESTER HEADER */}
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                  <h3 className="text-xl font-black italic text-primary-400">SEMESTER {sem.semesterNo}</h3>
                  <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-primary-500/10 rounded-full text-[11px] font-black text-primary-500 border border-primary-500/20">
                      SGPA: {calculateSGPA(sem.subjects)}
                    </div>
                    <button onClick={() => removeSemester(semIdx)} className="text-red-500/30 hover:text-red-500 transition-colors">
                      <HiOutlineTrash className="text-xl" />
                    </button>
                  </div>
                </div>

                {/* TABLE HEADERS */}
                <div className="grid grid-cols-12 gap-3 mb-4 px-2 opacity-40 text-[9px] font-black uppercase tracking-[0.2em]">
                  <div className="col-span-1">Type</div>
                  <div className="col-span-2">Subject Code</div>
                  <div className="col-span-4">Subject Name</div>
                  <div className="col-span-1 text-center">Credits</div>
                  <div className="col-span-2 text-center">Grade</div>
                  <div className="col-span-1 text-center">Point</div>
                  <div className="col-span-1"></div>
                </div>

                {/* SUBJECT ROWS */}
                <div className="space-y-3">
                  {sem.subjects.map((sub, subIdx) => (
                    <div key={subIdx} className="grid grid-cols-12 gap-3 items-center group">
                      
                      <select 
                        value={sub.type} 
                        onChange={(e) => updateSubject(semIdx, subIdx, 'type', e.target.value)} 
                        className={`col-span-1 p-3 rounded-xl text-[10px] font-bold border-none outline-none ${dark ? 'bg-white/5 text-white' : 'bg-slate-100 text-black'}`}
                      >
                        <option value="Theory">Theory</option>
                        <option value="Practical">Practical</option>
                      </select>

                      <input 
                        value={sub.code} 
                        onChange={(e) => updateSubject(semIdx, subIdx, 'code', e.target.value)} 
                        placeholder="MT3015" 
                        className={`col-span-2 p-3 rounded-xl text-center font-mono text-xs uppercase outline-none ${dark ? 'bg-white/5 text-white' : 'bg-slate-100 text-black'}`}
                      />

                      <input 
                        value={sub.name} 
                        onChange={(e) => updateSubject(semIdx, subIdx, 'name', e.target.value)} 
                        placeholder="Subject Name" 
                        className={`col-span-4 p-3 rounded-xl font-bold text-xs outline-none ${dark ? 'bg-white/5 text-white' : 'bg-slate-100 text-black'}`}
                      />

                      <input 
                        type="number" 
                        value={sub.credits} 
                        onChange={(e) => updateSubject(semIdx, subIdx, 'credits', e.target.value)} 
                        className={`col-span-1 p-3 rounded-xl text-center font-bold text-xs outline-none ${dark ? 'bg-white/5 text-white' : 'bg-slate-100 text-black'}`}
                      />

                      <select 
                        value={sub.grade} 
                        onChange={(e) => updateSubject(semIdx, subIdx, 'grade', e.target.value)} 
                        className={`col-span-2 p-3 rounded-xl text-xs font-black text-center appearance-none outline-none ${dark ? 'bg-white/5 text-white' : 'bg-slate-100 text-black'}`}
                      >
                        {Object.keys(gradeMap).map(g => (
                          <option key={g} value={g} className="text-black">{g}</option>
                        ))}
                      </select>

                      <div className="col-span-1 text-center font-mono text-xs font-bold text-primary-400">
                        {(gradeMap[sub.grade] || 0).toFixed(2)}
                      </div>

                      <button onClick={() => removeSubject(semIdx, subIdx)} className="col-span-1 text-red-500/20 hover:text-red-500 transition-colors flex justify-center">
                        <HiOutlineTrash />
                      </button>
                    </div>
                  ))}

                  <button 
                    onClick={() => {
                      const updated = [...semesters];
                      updated[semIdx].subjects.push({ type: "Theory", code: "", name: "", credits: 3, grade: "A" });
                      setSemesters(updated);
                      saveToDB(updated);
                    }} 
                    className="w-full py-3 border border-dashed border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.4em] opacity-20 hover:opacity-100 transition-all"
                  >
                    + Add Course Row
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}