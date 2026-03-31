import { useState, useEffect, useCallback, useRef } from 'react';
import api from "../utils/api"; // Centralized API utility
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  HiOutlineAcademicCap, 
  HiOutlinePlus, 
  HiOutlineTrash, 
  HiOutlineChevronDown, 
  HiOutlineChevronUp 
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
  const saveTimerRef = useRef(null);

  // 🔥 LOAD DATA (Production API)
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

  // ☁️ DEBOUNCED SAVE TO DB
  const saveToDB = useCallback((updated) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      try {
        await api.put("/internal", { semesters: updated });
        console.log("Internal marks synced to cloud");
      } catch (err) {
        console.error("Save error:", err);
      }
    }, 1000); // 1 second delay
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, []);

  // --- SEMESTER ACTIONS ---
  const addSemester = () => {
    const updated = [...semesters, { semesterNo: semesters.length + 1, subjects: [] }];
    setSemesters(updated);
    saveToDB(updated);
  };

  const removeSemester = (semIdx) => {
    const updated = semesters.filter((_, i) => i !== semIdx)
      .map((sem, idx) => ({ ...sem, semesterNo: idx + 1 }));
    setSemesters(updated);
    saveToDB(updated);
  };

  // --- SUBJECT ACTIONS ---
  const addSubject = (semIdx) => {
    const updated = semesters.map((sem, i) => {
      if (i === semIdx) {
        return {
          ...sem,
          subjects: [...sem.subjects, { 
            code: '', name: '', scaledTarget: 40,
            components: [
              { name: 'Mid Sem Exam', max: 60, obtained: 0 },
              { name: 'Attendance', max: 30, obtained: 0 }
            ] 
          }]
        };
      }
      return sem;
    });
    setSemesters(updated);
    const newSubjId = `${semIdx}-${updated[semIdx].subjects.length - 1}`;
    setExpandedSubjects(prev => [...prev, newSubjId]);
    saveToDB(updated);
  };

  const removeSubject = (semIdx, subIdx) => {
    const updated = semesters.map((sem, i) => 
      i === semIdx ? { ...sem, subjects: sem.subjects.filter((_, j) => j !== subIdx) } : sem
    );
    setSemesters(updated);
    saveToDB(updated);
  };

  const updateSubject = (semIdx, subIdx, field, val) => {
    const updated = semesters.map((sem, i) => 
      i === semIdx ? {
        ...sem,
        subjects: sem.subjects.map((sub, j) => j === subIdx ? { ...sub, [field]: val } : sub)
      } : sem
    );
    setSemesters(updated);
    saveToDB(updated);
  };

  // --- COMPONENT ACTIONS ---
  const addComponent = (semIdx, subIdx) => {
    const updated = semesters.map((sem, i) => 
      i === semIdx ? {
        ...sem,
        subjects: sem.subjects.map((sub, j) => 
          j === subIdx ? { ...sub, components: [...sub.components, { name: '', max: 30, obtained: 0 }] } : sub
        )
      } : sem
    );
    setSemesters(updated);
    saveToDB(updated);
  };

  const updateComponent = (semIdx, subIdx, compIdx, field, val) => {
    const updated = semesters.map((sem, i) => 
      i === semIdx ? {
        ...sem,
        subjects: sem.subjects.map((sub, j) => 
          j === subIdx ? { 
            ...sub, 
            components: sub.components.map((comp, k) => 
              k === compIdx ? { 
                ...comp, 
                [field]: field === 'name' ? val : Math.max(0, Number(val)) 
              } : comp
            ) 
          } : sub
        )
      } : sem
    );
    setSemesters(updated);
    saveToDB(updated);
  };

  const removeComponent = (semIdx, subIdx, compIdx) => {
    const updated = semesters.map((sem, i) => 
      i === semIdx ? {
        ...sem,
        subjects: sem.subjects.map((sub, j) => 
          j === subIdx ? { ...sub, components: sub.components.filter((_, k) => k !== compIdx) } : sub
        )
      } : sem
    );
    setSemesters(updated);
    saveToDB(updated);
  };

  const toggleSubject = (semIdx, subIdx) => {
    const id = `${semIdx}-${subIdx}`;
    setExpandedSubjects(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const calcSubjectTotals = (components) => {
    let max = 0, obtained = 0;
    components.forEach(c => {
      max += Number(c.max || 0);
      obtained += Number(c.obtained || 0);
    });
    return { max, obtained };
  };

  const calcScaled = (obtained, max, targetTarget) => {
    if (max === 0) return 0;
    return Math.round((obtained / max) * targetTarget);
  };

  return (
    <div className={`relative min-h-screen p-6 md:p-12 overflow-hidden font-sans transition-colors duration-500 ${dark ? 'text-white' : 'text-slate-900'}`}>
      
      {/* Ambience */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-400/10 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent-500/10 blur-[100px] pointer-events-none" />

      <datalist id="component-presets">
        {COMPONENT_PRESETS.map(preset => <option key={preset} value={preset} />)}
      </datalist>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-primary-500/20 rounded-2xl text-primary-500 backdrop-blur-md border border-primary-500/30 shadow-lg">
            <HiOutlineAcademicCap className="text-3xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Internal Marks</h1>
            <p className="opacity-60 text-sm">Dynamic tracking synced with Cloud</p>
          </div>
        </div>

        {/* SEMESTERS */}
        <AnimatePresence>
          {semesters.map((sem, semIdx) => (
            <motion.div key={semIdx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 md:p-8 mb-8 relative border border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                <h2 className="text-2xl font-black italic tracking-tighter uppercase">Semester {sem.semesterNo}</h2>
                <button onClick={() => removeSemester(semIdx)} className="text-danger-500 hover:bg-danger-500/10 p-2 rounded-full"><HiOutlineTrash className="text-xl" /></button>
              </div>

              <div className="bg-black/20 rounded-3xl overflow-hidden border border-white/5">
                {/* Global Header */}
                {sem.subjects.length > 0 && (
                  <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-white/5 font-black text-[10px] tracking-widest uppercase opacity-40">
                    <div className="col-span-2 text-center">Code</div>
                    <div className="col-span-6">Subject / Component</div>
                    <div className="col-span-2 text-center">Max</div>
                    <div className="col-span-2 text-center">Obtained</div>
                  </div>
                )}

                <div className="divide-y divide-white/5">
                  {sem.subjects.map((sub, subIdx) => {
                    const { max, obtained } = calcSubjectTotals(sub.components);
                    const scaled = calcScaled(obtained, max, sub.scaledTarget);
                    const isExpanded = expandedSubjects.includes(`${semIdx}-${subIdx}`);

                    return (
                      <div key={subIdx} className="flex flex-col">
                        {/* Subject Row */}
                        <div className="flex flex-col md:flex-row justify-between items-center p-4 hover:bg-white/5 transition-all">
                          <div className="flex items-center gap-3 w-full md:w-auto">
                            <button onClick={() => toggleSubject(semIdx, subIdx)} className="p-2 rounded-xl bg-primary-500/10 text-primary-400">
                              {isExpanded ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
                            </button>
                            <input
                              value={sub.code}
                              onChange={e => updateSubject(semIdx, subIdx, 'code', e.target.value)}
                              placeholder="CODE"
                              className="input-glass w-24 text-center font-mono text-xs uppercase"
                            />
                            <input
                              value={sub.name}
                              onChange={e => updateSubject(semIdx, subIdx, 'name', e.target.value)}
                              placeholder="Subject Name"
                              className="input-glass flex-1 font-bold"
                            />
                          </div>
                          <button onClick={() => removeSubject(semIdx, subIdx)} className="p-2 text-danger-500"><HiOutlineTrash /></button>
                        </div>

                        {/* Components (Expanded) */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden bg-white/5">
                              {sub.components.map((comp, compIdx) => (
                                <div key={compIdx} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b border-white/5 items-center">
                                  <div className="col-span-2 hidden md:block text-center opacity-30 text-xs">{sub.code || '-'}</div>
                                  <div className="col-span-6 flex items-center gap-2">
                                    <button onClick={() => removeComponent(semIdx, subIdx, compIdx)} className="text-danger-500"><HiOutlineTrash /></button>
                                    <input
                                      list="component-presets"
                                      value={comp.name}
                                      onChange={e => updateComponent(semIdx, subIdx, compIdx, 'name', e.target.value)}
                                      className="input-glass w-full text-sm"
                                      placeholder="Component Name"
                                    />
                                  </div>
                                  <div className="col-span-2 flex justify-center">
                                    <input type="number" value={comp.max} onChange={e => updateComponent(semIdx, subIdx, compIdx, 'max', e.target.value)} className="input-glass w-20 text-center" />
                                  </div>
                                  <div className="col-span-2 flex justify-center">
                                    <input type="number" value={comp.obtained} onChange={e => updateComponent(semIdx, subIdx, compIdx, 'obtained', e.target.value)} className="input-glass w-20 text-center font-bold" />
                                  </div>
                                </div>
                              ))}
                              <div className="p-4 flex flex-col gap-4">
                                <button onClick={() => addComponent(semIdx, subIdx)} className="text-xs font-bold text-primary-400 flex items-center gap-2 uppercase tracking-widest"><HiOutlinePlus /> Add Component</button>
                                <div className="p-4 rounded-2xl bg-primary-500/10 flex justify-between items-center font-black uppercase text-xs tracking-[0.2em]">
                                  <span>Total Internal:</span>
                                  <span>{obtained} / {max}</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-accent-500/10 flex justify-between items-center">
                                   <div className="flex items-center gap-2 font-black uppercase text-xs tracking-widest">
                                     Scaled to: <input type="number" value={sub.scaledTarget} onChange={e => updateSubject(semIdx, subIdx, 'scaledTarget', e.target.value)} className="input-glass w-16 text-center" />
                                   </div>
                                   <div className="text-xl font-black text-accent-400">{scaled}</div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => addSubject(semIdx)} className="w-full py-4 bg-white/5 hover:bg-white/10 text-primary-400 font-bold uppercase tracking-widest text-xs transition-all"><HiOutlinePlus className="inline mr-2" /> Add Subject</button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="flex justify-center pb-12">
          <button onClick={addSemester} className="btn-glass px-10 py-4 text-lg font-black uppercase tracking-widest hover:scale-105 transition-transform"><HiOutlinePlus className="inline mr-2" /> Add Semester</button>
        </div>
      </div>
    </div>
  );
}