import { useState, useEffect } from 'react';
import api from "../utils/api";
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  HiOutlineFire, 
  HiOutlinePencil, 
  HiOutlineCheck, 
  HiOutlineTrash, 
  HiOutlinePlus 
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function BunkPlanner() {
  const { dark } = useTheme();
  
  // --- STATE ---
  const [attendanceData, setAttendanceData] = useState({});
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [timetable, setTimetable] = useState({
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: []
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [subjectToAdd, setSubjectToAdd] = useState('');

  const token = localStorage.getItem("token");

  // 🔥 LOAD ATTENDANCE & TIMETABLE
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch live attendance data to calculate precise impacts
        const attRes = await api.get("/attendance", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const subjects = attRes.data.subjects || [];
        setAvailableSubjects(subjects.map(s => s.subject));
        
        // Convert array to a lookup object for easy math
        const attLookup = {};
        subjects.forEach(s => {
          attLookup[s.subject] = { total: s.totalClasses, attended: s.attendedClasses };
        });
        setAttendanceData(attLookup);

        // 2. Fetch Timetable
        // Note: You may need to create this backend route, or you can use localStorage for now!
        const timeRes = await axios.get("http://localhost:5000/api/timetable", {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { timetable: null } })); // Fallback if route doesn't exist yet

        if (timeRes.data && timeRes.data.timetable) {
          setTimetable(timeRes.data.timetable);
        } else {
          // Check local storage as a fallback so CRUD works immediately
          const local = localStorage.getItem("my_timetable");
          if (local) setTimetable(JSON.parse(local));
        }

      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, [token]);

  // 🔥 SAVE TIMETABLE TO DB
  const saveTimetable = async (updated) => {
    try {
      // Save to local storage as an immediate backup
      localStorage.setItem("my_timetable", JSON.stringify(updated));
      
      await axios.put(
        "http://localhost:5000/api/timetable",
        { timetable: updated },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Timetable updated!");
    } catch (err) {
      console.log("Backend route might not exist yet, saved locally!");
    }
  };

  // --- CRUD TIMETABLE ---
  const handleAddSubjectToDay = () => {
    if (!subjectToAdd) return toast.error("Select a subject first");
    
    const updated = {
      ...timetable,
      [selectedDay]: [...(timetable[selectedDay] || []), subjectToAdd]
    };
    
    setTimetable(updated);
    saveTimetable(updated);
    setSubjectToAdd('');
  };

  const handleRemoveSubjectFromDay = (day, index) => {
    const updated = {
      ...timetable,
      [day]: timetable[day].filter((_, i) => i !== index)
    };
    setTimetable(updated);
    saveTimetable(updated);
  };

  // --- CALCULATE BUNK IMPACT ---
  const getDayImpact = (day) => {
    const subjects = timetable[day] || [];
    let totalImpact = 0;
    let safeSubjects = 0;
    const details = [];

    subjects.forEach(subj => {
      const att = attendanceData[subj];
      
      // If subject exists in attendance DB, calculate. Otherwise assume 0/0.
      const total = att ? att.total : 0;
      const attended = att ? att.attended : 0;
      
      const currentPct = total > 0 ? (attended / total) * 100 : 0;
      // Missing a class: total increases by 1, attended stays same
      const afterBunkPct = (total + 1) > 0 ? (attended / (total + 1)) * 100 : 0; 
      
      const impact = currentPct - afterBunkPct;
      const safe = afterBunkPct >= 75; // Adjust this threshold if your college uses 80%!

      details.push({ 
        subject: subj, 
        currentPct: currentPct.toFixed(1), 
        afterBunkPct: afterBunkPct.toFixed(1), 
        impact: impact.toFixed(2), 
        safe 
      });
      
      totalImpact += impact;
      if (safe) safeSubjects++;
    });

    return {
      totalImpact: totalImpact.toFixed(2),
      safeSubjects,
      totalSubjects: subjects.length,
      allSafe: subjects.length > 0 && safeSubjects === subjects.length,
      details,
      classCount: subjects.length,
    };
  };

  // Generate rankings, filter out days with 0 classes
  const dayRankings = DAYS
    .map(day => ({ day, ...getDayImpact(day) }))
    .filter(item => item.classCount > 0)
    .sort((a, b) => a.totalImpact - b.totalImpact);

  const getBunkScore = (impact) => {
    const score = Number(impact.totalImpact);
    if (impact.allSafe) return { label: '🟢 Safe to Bunk', color: 'text-success-500 bg-success-500/10 border-success-500/20' };
    if (score < 3) return { label: '🟡 Minor Risk', color: 'text-warning-500 bg-warning-500/10 border-warning-500/20' };
    return { label: '🔴 Highly Risky', color: 'text-danger-500 bg-danger-500/10 border-danger-500/20' };
  };

  return (
    <div className="relative min-h-screen p-6 md:p-12 overflow-hidden font-sans text-sm md:text-base">
      
      {/* Background Ambient Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-success-400/20 blur-[100px] pointer-events-none" />
      <div className="fixed top-[30%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-500/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-danger-600/15 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/20 rounded-2xl text-primary-500 backdrop-blur-md border border-primary-500/30 shadow-lg">
              <HiOutlineFire className="text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text inline-block">Bunk Planner</h1>
              <p className="opacity-70 text-sm mt-1">Smart suggestions based on your live attendance</p>
            </div>
          </div>

          <button 
            onClick={() => setIsEditing(!isEditing)} 
            className={`px-6 py-3 rounded-2xl font-bold shadow-lg transition-all flex items-center gap-2 ${isEditing ? 'bg-success-500 text-white' : 'glass hover:bg-white/10'}`}
          >
            {isEditing ? <HiOutlineCheck className="text-xl" /> : <HiOutlinePencil className="text-xl" />}
            {isEditing ? 'Done Editing' : 'Edit Timetable'}
          </button>
        </div>

        {/* --- TIMETABLE EDITOR (CRUD) --- */}
        <AnimatePresence>
          {isEditing && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="glass p-6 md:p-8 shadow-xl mb-8 border border-primary-500/30">
                <h3 className="text-xl font-bold mb-6 gradient-text">Configure Your Week</h3>
                
                {/* Add Subject Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-black/5 dark:bg-white/5 rounded-2xl">
                  <select 
                    value={selectedDay} 
                    onChange={e => setSelectedDay(e.target.value)}
                    className={`input-glass w-full md:w-1/3 outline-none focus:ring-2 focus:ring-primary-500/50 ${dark ? 'bg-surface-800' : 'bg-white'}`}
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>

                  <select 
                    value={subjectToAdd} 
                    onChange={e => setSubjectToAdd(e.target.value)}
                    className={`input-glass w-full md:w-1/3 outline-none focus:ring-2 focus:ring-primary-500/50 ${dark ? 'bg-surface-800' : 'bg-white'}`}
                  >
                    <option value="">-- Select Subject from Attendance --</option>
                    {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <button onClick={handleAddSubjectToDay} className="btn-glass flex-1 flex items-center justify-center gap-2 font-bold hover:scale-105 transition-transform">
                    <HiOutlinePlus className="text-xl" /> Add to {selectedDay}
                  </button>
                </div>

                {/* Timetable Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DAYS.map(day => (
                    <div key={day} className="bg-white/40 dark:bg-black/20 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                      <h4 className="font-bold mb-3 text-primary-600 dark:text-primary-400">{day}</h4>
                      {timetable[day]?.length === 0 ? (
                        <p className="text-xs opacity-50 italic">No classes</p>
                      ) : (
                        <div className="space-y-2">
                          {timetable[day]?.map((subj, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-2 rounded-xl text-sm">
                              <span className="truncate pr-2 font-medium">{subj}</span>
                              <button onClick={() => handleRemoveSubjectFromDay(day, idx)} className="text-danger-500 hover:text-danger-600 p-1">
                                <HiOutlineTrash />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- HERO: BEST DAY TO BUNK --- */}
        {!isEditing && dayRankings.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass p-8 md:p-12 relative overflow-hidden shadow-2xl rounded-[32px] border border-success-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-success-500/10 to-primary-500/10 pointer-events-none" />
            <div className="relative z-10 text-center">
              <p className="text-sm md:text-base uppercase tracking-widest font-bold opacity-70 mb-2">
                Best day to bunk this week
              </p>
              <h2 className="text-6xl md:text-8xl font-extrabold tracking-tighter drop-shadow-lg text-success-500 mb-4">
                {dayRankings[0]?.day}
              </h2>
              <div className="inline-block bg-black/5 dark:bg-white/5 px-6 py-3 rounded-full border border-black/10 dark:border-white/10">
                <p className="font-bold opacity-90 text-sm md:text-base">
                  Only drops attendance by <span className="text-success-500">{dayRankings[0]?.totalImpact}%</span> overall • Skipping {dayRankings[0]?.classCount} classes
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {!isEditing && dayRankings.length === 0 && (
          <div className="glass p-12 text-center shadow-xl border-dashed opacity-70">
            <h3 className="text-xl font-bold mb-2">Timetable is empty!</h3>
            <p>Click "Edit Timetable" above to add your classes for the week so we can calculate your bunk stats.</p>
          </div>
        )}

        {/* --- DAY RANKINGS LIST --- */}
        {!isEditing && (
          <div className="space-y-4">
            {dayRankings.map((item, i) => {
              const score = getBunkScore(item);
              return (
                <motion.div 
                  key={item.day} 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.08 }}
                  className="glass p-6 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group"
                >
                  {/* Subtle highlight for the #1 spot */}
                  {i === 0 && <div className="absolute inset-0 bg-success-500/5 pointer-events-none" />}

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-inner ${i === 0 ? 'bg-gradient-to-br from-success-400 to-success-600 text-white shadow-success-500/30' : 'bg-black/5 dark:bg-white/10 opacity-80'}`}>
                        #{i + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-xl">{item.day}</h3>
                        <p className="text-xs uppercase tracking-wider opacity-60 font-semibold">{item.classCount} classes to skip</p>
                      </div>
                    </div>
                    <span className={`text-xs px-4 py-2 rounded-full font-bold border uppercase tracking-wider ${score.color}`}>
                      {score.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 relative z-10">
                    {item.details.map((d, j) => (
                      <div key={j} className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex flex-col justify-between">
                        <p className="font-bold truncate mb-2" title={d.subject}>{d.subject}</p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 opacity-80 font-mono">
                            <span>{d.currentPct}%</span>
                            <span className="opacity-50">→</span>
                            <span className={d.safe ? 'text-success-600 dark:text-success-400 font-bold' : 'text-danger-500 font-bold'}>
                              {d.afterBunkPct}%
                            </span>
                          </div>
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${d.safe ? 'bg-success-500/20 text-success-500' : 'bg-danger-500/20 text-danger-500'}`}>
                            {d.safe ? '✓' : '✗'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}