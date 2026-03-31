import { useState, useEffect } from 'react';
import api from "../utils/api"; // ✅ Using centralized API utility
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

  // 🔥 LOAD DATA (Synced with your local server logic)
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // 1. Fetch live attendance data
      const attRes = await api.get("/attendance");
      const subjects = attRes.data.subjects || [];
      setAvailableSubjects(subjects.map(s => s.subject));
      
      const attLookup = {};
      subjects.forEach(s => {
        attLookup[s.subject] = { total: s.totalClasses, attended: s.attendedClasses };
      });
      setAttendanceData(attLookup);

      // 2. Fetch Timetable from Backend
      const timeRes = await api.get("/timetable");
      if (timeRes.data && timeRes.data.timetable) {
        setTimetable(timeRes.data.timetable);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      // Removed manual localStorage fallback to keep it "Clean Server Only"
    }
  };

  // 🔥 SAVE TO DB (Corrected Logic)
  const saveTimetable = async (updated) => {
    try {
      await api.put("/timetable", { timetable: updated });
      toast.success("Timetable updated!");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save to server");
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
    const subjectsInDay = timetable[day] || [];
    let totalImpact = 0;
    let safeSubjects = 0;
    const details = [];

    subjectsInDay.forEach(subj => {
      const att = attendanceData[subj];
      const total = att ? att.total : 0;
      const attended = att ? att.attended : 0;
      
      const currentPct = total > 0 ? (attended / total) * 100 : 0;
      const afterBunkPct = (total + 1) > 0 ? (attended / (total + 1)) * 100 : 0; 
      
      const impact = currentPct - afterBunkPct;
      const safe = afterBunkPct >= 75; // College standard threshold

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
      totalSubjects: subjectsInDay.length,
      allSafe: subjectsInDay.length > 0 && safeSubjects === subjectsInDay.length,
      details,
      classCount: subjectsInDay.length,
    };
  };

  const dayRankings = DAYS
    .map(day => ({ day, ...getDayImpact(day) }))
    .filter(item => item.classCount > 0)
    .sort((a, b) => a.totalImpact - b.totalImpact);

  const getBunkScore = (item) => {
    const impactVal = Number(item.totalImpact);
    if (item.allSafe) return { label: '🟢 Safe to Bunk', color: 'text-green-500 bg-green-500/10 border-green-500/20' };
    if (impactVal < 3) return { label: '🟡 Minor Risk', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' };
    return { label: '🔴 Highly Risky', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
  };

  return (
    <div className={`relative min-h-screen p-6 md:p-12 overflow-hidden transition-colors duration-500 ${dark ? 'bg-[#0a0f1d] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Background Ambient Orbs (Same UI style as Attendance) */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-green-500/10 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-500 border border-cyan-500/30 shadow-lg">
              <HiOutlineFire className="text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter">Bunk Planner</h1>
              <p className="opacity-40 text-[10px] font-bold uppercase tracking-widest">Attendance Impact Calculator</p>
            </div>
          </div>

          <button 
            onClick={() => setIsEditing(!isEditing)} 
            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center gap-2 ${isEditing ? 'bg-green-500 text-white' : 'glass border border-white/10 hover:bg-white/10'}`}
          >
            {isEditing ? <HiOutlineCheck className="text-xl" /> : <HiOutlinePencil className="text-xl" />}
            {isEditing ? 'Save Week' : 'Edit Timetable'}
          </button>
        </div>

        {/* --- TIMETABLE EDITOR --- */}
        <AnimatePresence>
          {isEditing && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="glass p-6 md:p-8 shadow-xl mb-8 border border-white/10">
                <h3 className="text-lg font-black uppercase mb-6 italic">Setup your Routine</h3>
                
                <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-black/10 rounded-2xl">
                  <select 
                    value={selectedDay} onChange={e => setSelectedDay(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 font-bold outline-none text-cyan-500"
                  >
                    {DAYS.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
                  </select>

                  <select 
                    value={subjectToAdd} onChange={e => setSubjectToAdd(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 font-bold outline-none text-cyan-500"
                  >
                    <option value="" className="bg-slate-900">Select Subject</option>
                    {availableSubjects.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                  </select>

                  <button onClick={handleAddSubjectToDay} className="bg-cyan-500 text-white px-6 rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110">
                    Add Class
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DAYS.map(day => (
                    <div key={day} className="bg-black/10 p-4 rounded-2xl border border-white/5">
                      <h4 className="font-black text-xs uppercase tracking-widest mb-3 text-cyan-500">{day}</h4>
                      <div className="space-y-2">
                        {timetable[day]?.map((subj, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white/5 p-2 px-3 rounded-xl text-xs">
                            <span className="truncate font-bold opacity-80">{subj}</span>
                            <button onClick={() => handleRemoveSubjectFromDay(day, idx)} className="text-red-500">
                              <HiOutlineTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- BEST DAY TO BUNK HERO --- */}
        {!isEditing && dayRankings.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-10 relative overflow-hidden shadow-2xl border border-green-500/20 text-center">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-2">Recommendation</p>
              <h2 className="text-7xl font-black italic tracking-tighter text-green-500 mb-4">{dayRankings[0]?.day}</h2>
              <div className="inline-block bg-green-500/10 px-6 py-2 rounded-full border border-green-500/20">
                <p className="font-black text-xs uppercase tracking-widest opacity-80">
                   Impact: -{dayRankings[0]?.totalImpact}% Overall
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- RANKINGS LIST --- */}
        {!isEditing && (
          <div className="space-y-4">
            {dayRankings.map((item, i) => {
              const score = getBunkScore(item);
              return (
                <motion.div key={item.day} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="glass p-6 shadow-lg border border-white/5 group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${i === 0 ? 'bg-green-500 text-white' : 'bg-white/5'}`}>
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-black text-xl uppercase italic">{item.day}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{item.classCount} Lectures</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-4 py-2 rounded-full font-black uppercase tracking-widest border ${score.color}`}>
                      {score.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {item.details.map((d, j) => (
                      <div key={j} className="p-3 rounded-2xl bg-black/10 border border-white/5">
                        <p className="text-[11px] font-black uppercase truncate mb-2 opacity-80">{d.subject}</p>
                        <div className="flex items-center justify-between">
                           <span className={`text-xs font-black ${d.safe ? 'text-green-500' : 'text-red-500'}`}>{d.afterBunkPct}%</span>
                           <span className="text-[9px] font-bold opacity-30">Min 75%</span>
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