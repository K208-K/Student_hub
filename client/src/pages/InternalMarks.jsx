import { useState, useEffect, useCallback, useRef } from 'react';
import api from "../utils/api"; 
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  HiOutlineAcademicCap, 
  HiOutlinePlus, 
  HiOutlineTrash, 
  HiOutlineChevronDown, 
  HiOutlineChevronUp,
  HiOutlineCloudUpload
} from 'react-icons/hi';

const COMPONENT_PRESETS = [
  "Mid Sem Exam", "Assignment-01", "Assignment-02", "Attendance",
  "Lab Quiz-1", "Lab Quiz-2", "Lab Record", "Internship Project Viva",
  "Presentation", "Certificate", "Quiz I", "Quiz II", "Assessment I", "Assessment II"
];

export default function InternalMarks() {
  const { dark } = useTheme();
  const [semesters, setSemesters] = useState([]);
  const [expandedSubjects, setExpandedSubjects] = useState([]); 
  const [isSaving, setIsSaving] = useState(false);
  const saveTimerRef = useRef(null);

  // 🔥 LOAD DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/internal");
        setSemesters(res.data.semesters || []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, []);

  // ☁️ MANUAL & AUTO SAVE LOGIC
  const saveToDB = useCallback(async (updated, isManual = false) => {
    if (isManual) setIsSaving(true);
    
    // Clear existing debounce timer
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    const performSave = async () => {
      try {
        await api.put("/internal", { semesters: updated });
        if (isManual) {
          setTimeout(() => setIsSaving(false), 1000); // Visual feedback
        }
      } catch (err) {
        console.error("Save error:", err);
        setIsSaving(false);
      }
    };

    if (isManual) {
      await performSave();
    } else {
      // Auto-debounce for typing
      saveTimerRef.current = setTimeout(performSave, 2000);
    }
  }, []);

  // --- ACTIONS ---
  const addSemester = () => {
    const updated = [...semesters, { semesterNo: semesters.length + 1, subjects: [] }];
    setSemesters(updated);
    saveToDB(updated);
  };

  const removeSemester = (semIdx) => {
    const updated = semesters.filter((_, i) => i !== semIdx).map((sem, idx) => ({ ...sem, semesterNo: idx + 1 }));
    setSemesters(updated);
    saveToDB(updated);
  };

  const addSubject = (semIdx) => {
    const updated = semesters.map((sem, i) => i === semIdx ? {
      ...sem, subjects: [...sem.subjects, { 
        code: '', name: '', scaledTarget: 40,
        components: [{ name: 'Mid Sem Exam', max: 60, obtained: 0 }] 
      }]
    } : sem);
    setSemesters(updated);
    saveToDB(updated);
  };

  const updateSubject = (semIdx, subIdx, field, val) => {
    const updated = semesters.map((sem, i) => i === semIdx ? {
      ...sem, subjects: sem.subjects.map((sub, j) => j === subIdx ? { ...sub, [field]: val } : sub)
    } : sem);
    setSemesters(updated);
    saveToDB(updated);
  };

  const updateComponent = (semIdx, subIdx, compIdx, field, val) => {
    const updated = semesters.map((sem, i) => i === semIdx ? {
      ...sem, subjects: sem.subjects.map((sub, j) => j === subIdx ? { 
        ...sub, components: sub.components.map((comp, k) => k === compIdx ? { 
          ...comp, [field]: field === 'name' ? val : Number(val) 
        } : comp)
      } : sub)
    } : sem);
    setSemesters(updated);
    saveToDB(updated);
  };

  const calcSubjectTotals = (components) => {
    let max = 0, obtained = 0;
    components.forEach(c => {
      max += Number(c.max || 0);
      obtained += Number(c.obtained || 0);
    });
    return { max, obtained };
  };

  return (
    <div className={`min-h-screen p-4 md:p-12 font-sans transition-colors duration-500 ${dark ? 'text-white' : 'text-slate-900'}`}>
      
      {/* HEADER WITH MANUAL SAVE */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary-500/20 rounded-3xl text-primary-500 border border-primary-500/30">
            <HiOutlineAcademicCap className="text-3xl" />
          </div>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">Internal Records</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Live Database Sync active</p>
          </div>
        </div>

        <button 
          onClick={() => saveToDB(semesters, true)}
          disabled={isSaving}
          className={`btn-glass px-8 py-3 flex items-center gap-3 font-black uppercase tracking-widest text-xs transition-all ${isSaving ? 'opacity-50' : 'hover:scale-105'}`}
        >
          <HiOutlineCloudUpload className={isSaving ? "animate-bounce" : "text-xl"} />
          {isSaving ? "Saving..." : "Manual Save"}
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-10">
        <AnimatePresence>
          {semesters.map((sem, semIdx) => (
            <motion.div key={semIdx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 md:p-8 border border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                <h2 className="text-xl font-black uppercase tracking-widest text-primary-400">Semester {sem.semesterNo}</h2>
                <button onClick={() => removeSemester(semIdx)} className="text-danger-500 hover:bg-danger-500/10 p-2 rounded-full"><HiOutlineTrash /></button>
              </div>

              {/* SUBJECTS LIST */}
              <div className="space-y-4">
                {sem.subjects.map((sub, subIdx) => {
                  const { max, obtained } = calcSubjectTotals(sub.components);
                  const isExpanded = expandedSubjects.includes(`${semIdx}-${subIdx}`);
                  
                  return (
                    <div key={subIdx} className="rounded-[30px] overflow-hidden bg-black/20 border border-white/5">
                      {/* Subject Header */}
                      <div className="flex flex-col lg:flex-row items-center gap-4 p-4 lg:p-6 bg-white/5">
                        <button 
                          onClick={() => {
                            const id = `${semIdx}-${subIdx}`;
                            setExpandedSubjects(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
                          }}
                          className="p-3 bg-white/5 rounded-2xl text-primary-400 hover:bg-primary-500/20 transition-colors"
                        >
                          {isExpanded ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
                        </button>
                        
                        <div className="flex flex-1 gap-3 w-full">
                          <input 
                            value={sub.code} 
                            onChange={(e) => updateSubject(semIdx, subIdx, 'code', e.target.value)}
                            placeholder="CODE" 
                            className="input-glass w-24 text-center font-mono text-xs uppercase"
                          />
                          <input 
                            value={sub.name} 
                            onChange={(e) => updateSubject(semIdx, subIdx, 'name', e.target.value)}
                            placeholder="Subject Name" 
                            className="input-glass flex-1 font-bold"
                          />
                        </div>

                        {/* 🔥 SHOW TOTALS HERE FOR EVERY SUBJECT */}
                        <div className="flex items-center gap-6 px-4">
                          <div className="text-center">
                            <p className="text-[9px] font-black opacity-30 uppercase">Max</p>
                            <p className="font-bold text-sm">{max}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[9px] font-black opacity-30 uppercase">Obtained</p>
                            <p className={`font-bold text-lg ${obtained > 0 ? 'text-success-400' : 'opacity-40'}`}>{obtained}</p>
                          </div>
                        </div>

                        <button onClick={() => {
                          const updated = semesters.map((s, i) => i === semIdx ? { ...s, subjects: s.subjects.filter((_, j) => j !== subIdx) } : s);
                          setSemesters(updated); saveToDB(updated);
                        }} className="text-danger-500 p-2"><HiOutlineTrash /></button>
                      </div>

                      {/* Components Detail */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="p-4 lg:p-8 bg-white/5 space-y-4">
                            {sub.components.map((comp, compIdx) => (
                              <div key={compIdx} className="flex flex-col md:flex-row gap-4 items-center">
                                <input 
                                  value={comp.name} 
                                  onChange={(e) => updateComponent(semIdx, subIdx, compIdx, 'name', e.target.value)}
                                  className="input-glass flex-1" 
                                  placeholder="Component (e.g. Mid Sem)" 
                                />
                                <div className="flex gap-4">
                                  <input type="number" value={comp.max} onChange={(e) => updateComponent(semIdx, subIdx, compIdx, 'max', e.target.value)} className="input-glass w-20 text-center" />
                                  <input type="number" value={comp.obtained} onChange={(e) => updateComponent(semIdx, subIdx, compIdx, 'obtained', e.target.value)} className="input-glass w-20 text-center font-bold text-primary-400" />
                                  <button onClick={() => {
                                    const updated = semesters.map((s, i) => i === semIdx ? { ...s, subjects: s.subjects.map((subj, j) => j === subIdx ? { ...subj, components: subj.components.filter((_, k) => k !== compIdx) } : subj) } : s);
                                    setSemesters(updated); saveToDB(updated);
                                  }} className="text-danger-500"><HiOutlineTrash /></button>
                                </div>
                              </div>
                            ))}
                            <button 
                              onClick={() => {
                                const updated = semesters.map((s, i) => i === semIdx ? { ...s, subjects: s.subjects.map((subj, j) => j === subIdx ? { ...subj, components: [...subj.components, { name: '', max: 30, obtained: 0 }] } : subj) } : s);
                                setSemesters(updated); saveToDB(updated);
                              }}
                              className="text-xs font-bold text-primary-400 flex items-center gap-2 hover:bg-primary-500/10 p-2 rounded-xl transition-all"
                            >
                              <HiOutlinePlus /> ADD COMPONENT
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              <button onClick={() => addSubject(semIdx)} className="w-full mt-6 py-4 border border-dashed border-white/20 rounded-[30px] hover:bg-white/5 transition-all font-bold uppercase text-xs tracking-widest text-primary-400">
                + Add Subject to Semester {sem.semesterNo}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="flex justify-center pb-20">
           <button onClick={addSemester} className="btn-glass px-12 py-5 text-lg font-black uppercase tracking-[0.3em] hover:scale-105 transition-all">
             Add Semester
           </button>
        </div>
      </div>
    </div>
  );
}