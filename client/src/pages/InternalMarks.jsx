import { useState, useEffect } from 'react';
import axios from "axios";
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  HiOutlineAcademicCap, 
  HiOutlinePlus, 
  HiOutlineTrash, 
  HiOutlineChevronDown, 
  HiOutlineChevronUp 
} from 'react-icons/hi';

// Preset options based on your screenshots to make data entry fast!
const COMPONENT_PRESETS = [
  "Mid Sem Exam",
  "Assignment-01",
  "Assignment-02",
  "Attendance",
  "Lab Quiz-1",
  "Lab Quiz-2",
  "Lab Record",
  "Internship Project Viva",
  "Presentation",
  "Certificate",
  "Quiz I",
  "Quiz II",
  "Assessment I",
  "Assessment II"
];

export default function InternalMarks() {
  const { dark } = useTheme();

  // The state is now a list of semesters, each containing subjects, each containing components.
  const [semesters, setSemesters] = useState([]);
  const [expandedSubjects, setExpandedSubjects] = useState([]); 

  const token = localStorage.getItem("token");

  // 🔥 LOAD DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/internal", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSemesters(res.data.semesters || []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, [token]);

  // 🔥 SAVE TO DB
  const saveToDB = async (updated) => {
    try {
      await axios.put(
        "http://localhost:5000/api/internal",
        { semesters: updated },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // --- SEMESTER ACTIONS ---
  const addSemester = async () => {
    const updated = [
      ...semesters,
      {
        semesterNo: semesters.length + 1,
        subjects: []
      }
    ];
    setSemesters(updated);
    await saveToDB(updated);
  };

  const removeSemester = async (semIdx) => {
    const updated = semesters.filter((_, i) => i !== semIdx);
    const reIndexed = updated.map((sem, idx) => ({ ...sem, semesterNo: idx + 1 }));
    setSemesters(reIndexed);
    await saveToDB(reIndexed);
  };

  // --- SUBJECT ACTIONS ---
  const addSubject = async (semIdx) => {
    const updated = semesters.map((sem, i) => {
      if (i === semIdx) {
        return {
          ...sem,
          subjects: [
            ...sem.subjects,
            { 
              code: '', 
              name: '', 
              scaledTarget: 40, // Usually universities scale internal marks to 40 or 30
              components: [
                { name: 'Mid Sem Exam', max: 60, obtained: 0 },
                { name: 'Attendance', max: 30, obtained: 0 }
              ] 
            }
          ]
        };
      }
      return sem;
    });

    setSemesters(updated);
    
    // Auto expand the new subject
    const newSubjId = `${semIdx}-${updated[semIdx].subjects.length - 1}`;
    setExpandedSubjects(prev => [...prev, newSubjId]);
    
    await saveToDB(updated);
  };

  const removeSubject = async (semIdx, subIdx) => {
    const updated = semesters.map((sem, i) => 
      i === semIdx ? { ...sem, subjects: sem.subjects.filter((_, j) => j !== subIdx) } : sem
    );
    setSemesters(updated);
    await saveToDB(updated);
  };

  const updateSubject = async (semIdx, subIdx, field, val) => {
    const updated = semesters.map((sem, i) => 
      i === semIdx ? {
        ...sem,
        subjects: sem.subjects.map((sub, j) => 
          j === subIdx ? { ...sub, [field]: val } : sub
        )
      } : sem
    );
    setSemesters(updated);
    await saveToDB(updated);
  };

  // --- COMPONENT ACTIONS ---
  const addComponent = async (semIdx, subIdx) => {
    const updated = semesters.map((sem, i) => 
      i === semIdx ? {
        ...sem,
        subjects: sem.subjects.map((sub, j) => 
          j === subIdx ? { 
            ...sub, 
            components: [...sub.components, { name: '', max: 30, obtained: 0 }] 
          } : sub
        )
      } : sem
    );
    setSemesters(updated);
    await saveToDB(updated);
  };

  const removeComponent = async (semIdx, subIdx, compIdx) => {
    const updated = semesters.map((sem, i) => 
      i === semIdx ? {
        ...sem,
        subjects: sem.subjects.map((sub, j) => 
          j === subIdx ? { 
            ...sub, 
            components: sub.components.filter((_, k) => k !== compIdx) 
          } : sub
        )
      } : sem
    );
    setSemesters(updated);
    await saveToDB(updated);
  };

  const updateComponent = async (semIdx, subIdx, compIdx, field, val) => {
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
    await saveToDB(updated);
  };

  // ACCORDION TOGGLE
  const toggleSubject = (semIdx, subIdx) => {
    const id = `${semIdx}-${subIdx}`;
    setExpandedSubjects(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // 🧮 CALCULATIONS
  const calcSubjectTotals = (components) => {
    let max = 0;
    let obtained = 0;
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
    <div className="relative min-h-screen p-6 md:p-12 overflow-hidden font-sans text-sm md:text-base">
      
      {/* Background Ambient Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-400/20 blur-[100px] pointer-events-none" />
      <div className="fixed top-[30%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent-500/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-primary-600/20 blur-[100px] pointer-events-none" />

      {/* Datalist for fast component entry */}
      <datalist id="component-presets">
        {COMPONENT_PRESETS.map(preset => (
          <option key={preset} value={preset} />
        ))}
      </datalist>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/20 rounded-2xl text-primary-500 backdrop-blur-md border border-primary-500/30 shadow-lg">
              <HiOutlineAcademicCap className="text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text inline-block">Internal Marks Details</h1>
              <p className="opacity-70 text-sm mt-1">Semester-wise dynamic component tracking</p>
            </div>
          </div>
        </div>

        {/* SEMESTERS MAP */}
        <AnimatePresence>
          {semesters.map((sem, semIdx) => (
            <motion.div 
              key={`sem-${sem.semesterNo}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass p-6 md:p-8 shadow-xl relative"
            >
              {/* Semester Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-black/10 dark:border-white/10">
                <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  Semester {sem.semesterNo}
                </h2>
                <button onClick={() => removeSemester(semIdx)} className="p-2 text-danger-500 hover:bg-danger-500/10 rounded-full transition-colors">
                  <HiOutlineTrash className="text-xl" />
                </button>
              </div>

              {/* Subjects Container */}
              <div className="bg-white/40 dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden">
                
                {/* Global Table Header (Desktop only) */}
                {sem.subjects.length > 0 && (
                  <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 font-bold text-sm text-primary-600 dark:text-primary-400">
                    <div className="col-span-2 text-center">Subject Code</div>
                    <div className="col-span-6">Subject / Internal Component</div>
                    <div className="col-span-2 text-center">Maximum Marks</div>
                    <div className="col-span-2 text-center">Obtained Marks</div>
                  </div>
                )}

                <div className="divide-y divide-black/10 dark:divide-white/10">
                  <AnimatePresence>
                    {sem.subjects.map((sub, subIdx) => {
                      const { max, obtained } = calcSubjectTotals(sub.components);
                      const scaled = calcScaled(obtained, max, sub.scaledTarget);
                      const isExpanded = expandedSubjects.includes(`${semIdx}-${subIdx}`);

                      return (
                        <motion.div key={`sub-${subIdx}`} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">
                          
                          {/* ACCORDION HEADER (Subject Details) */}
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group gap-4 md:gap-0">
                            
                            <div className="flex items-center gap-3 w-full md:w-auto">
                              <button onClick={() => toggleSubject(semIdx, subIdx)} className="p-1.5 rounded-md bg-primary-500/10 text-primary-600 dark:text-primary-400 group-hover:bg-primary-500/20 transition-colors shrink-0">
                                {isExpanded ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
                              </button>
                              
                              <div className="flex gap-2 w-full">
                                <input
                                  value={sub.code}
                                  onChange={e => updateSubject(semIdx, subIdx, 'code', e.target.value)}
                                  placeholder="Code"
                                  className="input-glass w-24 font-mono text-sm uppercase outline-none focus:ring-2 focus:ring-primary-500/50"
                                />
                                <input
                                  value={sub.name}
                                  onChange={e => updateSubject(semIdx, subIdx, 'name', e.target.value)}
                                  placeholder="Subject Name"
                                  className="input-glass flex-1 min-w-[150px] font-bold outline-none focus:ring-2 focus:ring-primary-500/50"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                              <button onClick={() => removeSubject(semIdx, subIdx)} className="p-2 text-danger-500 hover:bg-danger-500/10 rounded-xl transition-colors">
                                <HiOutlineTrash className="text-xl" />
                              </button>
                            </div>
                          </div>

                          {/* EXPANDED CONTENT (Dynamic Components) */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }} 
                                animate={{ height: "auto", opacity: 1 }} 
                                exit={{ height: 0, opacity: 0 }} 
                                className="overflow-hidden bg-black/5 dark:bg-white/5"
                              >
                                <div className="p-2 md:p-0">
                                  
                                  {/* Component Rows */}
                                  {sub.components.map((comp, compIdx) => (
                                    <div key={`comp-${compIdx}`} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-3 md:p-4 border-b border-black/5 dark:border-white/5 items-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                                      
                                      <div className="col-span-2 text-center font-mono text-xs opacity-60 hidden md:block">
                                        {sub.code || '-'}
                                      </div>
                                      
                                      {/* Datalist Input for Component Name */}
                                      <div className="col-span-6 pl-4 md:pl-0 flex items-center gap-2">
                                        <button onClick={() => removeComponent(semIdx, subIdx, compIdx)} className="text-danger-500 hover:text-danger-600 transition-colors p-1">
                                          <HiOutlineTrash />
                                        </button>
                                        <input
                                          list="component-presets"
                                          value={comp.name}
                                          onChange={e => updateComponent(semIdx, subIdx, compIdx, 'name', e.target.value)}
                                          placeholder="Select or type component..."
                                          className="input-glass w-full text-sm outline-none focus:ring-2 focus:ring-primary-500/50 bg-white/50 dark:bg-black/20"
                                        />
                                      </div>
                                      
                                      {/* Mobile Labels */}
                                      <div className="col-span-12 flex justify-between md:hidden px-4 opacity-70 text-xs mt-1">
                                        <span>Max Marks:</span>
                                        <span>Obtained:</span>
                                      </div>

                                      <div className="col-span-2 flex justify-center px-4 md:px-0">
                                        <input
                                          type="number"
                                          value={comp.max}
                                          onChange={e => updateComponent(semIdx, subIdx, compIdx, 'max', e.target.value)}
                                          className="input-glass w-full md:w-20 text-center text-sm outline-none focus:ring-2 focus:ring-primary-500/50"
                                        />
                                      </div>
                                      <div className="col-span-2 flex justify-center px-4 md:px-0">
                                        <input
                                          type="number"
                                          value={comp.obtained}
                                          onChange={e => updateComponent(semIdx, subIdx, compIdx, 'obtained', e.target.value)}
                                          className="input-glass w-full md:w-20 text-center font-bold outline-none focus:ring-2 focus:ring-primary-500/50"
                                        />
                                      </div>
                                    </div>
                                  ))}

                                  {/* Add Component Button */}
                                  <div className="p-3 border-b border-black/5 dark:border-white/5">
                                    <button 
                                      onClick={() => addComponent(semIdx, subIdx)}
                                      className="text-xs text-primary-600 dark:text-primary-400 font-bold flex items-center gap-1 hover:underline ml-12 md:ml-[16.66%]"
                                    >
                                      <HiOutlinePlus /> Add Component
                                    </button>
                                  </div>

                                  {/* Totals Row */}
                                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 font-bold bg-primary-500/10 text-primary-700 dark:text-primary-300 items-center">
                                    <div className="col-span-8 text-right md:pl-0">Total :</div>
                                    <div className="col-span-2 text-center">{max}</div>
                                    <div className="col-span-2 text-center text-lg">{obtained}</div>
                                  </div>

                                  {/* Scaled Marks Row */}
                                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 font-bold bg-accent-500/10 text-accent-700 dark:text-accent-300 border-t border-black/10 dark:border-white/10 items-center">
                                    <div className="col-span-8 text-right md:pl-0 flex items-center justify-end gap-2">
                                      <span>Obtained Marks after Scaling to</span>
                                      <input
                                        type="number"
                                        value={sub.scaledTarget}
                                        onChange={e => updateSubject(semIdx, subIdx, 'scaledTarget', Math.max(1, Number(e.target.value)))}
                                        className="input-glass w-16 text-center text-xs py-1"
                                        title="Target Scale (e.g., 40, 30, 100)"
                                      />
                                      <span>:</span>
                                    </div>
                                    <div className="col-span-2 text-center opacity-0 hidden md:block">-</div>
                                    <div className="col-span-2 text-center text-xl">{scaled}</div>
                                  </div>
                                  
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Add Subject Button */}
                <button
                  onClick={() => addSubject(semIdx)}
                  className="w-full py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-primary-600 dark:text-primary-400 transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <HiOutlinePlus className="text-xl" /> Add Subject to Semester {sem.semesterNo}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ADD SEMESTER BUTTON */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 flex justify-center pb-12">
          <button
            onClick={addSemester}
            className="btn-glass flex items-center gap-2 font-medium px-8 py-4 text-lg hover:scale-105 transition-transform shadow-lg shadow-primary-500/30"
          >
            <HiOutlinePlus className="text-2xl" /> Add Semester
          </button>
        </motion.div>

      </div>
    </div>
  );
}