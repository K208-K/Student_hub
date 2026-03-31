import { useState, useEffect } from 'react';
import api from "../utils/api"; 
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  HiOutlineFire, 
  HiOutlinePencil, 
  HiOutlineCheck, 
  HiOutlineTrash, 
  HiOutlineShieldCheck,
  HiOutlineExclamationCircle,
  HiOutlineBan
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function BunkPlanner() {
  const { dark } = useTheme();
  const [attendanceData, setAttendanceData] = useState({});
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [timetable, setTimetable] = useState({
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [subjectToAdd, setSubjectToAdd] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const attRes = await api.get("/attendance");
      const subjects = attRes.data.subjects || [];
      setAvailableSubjects(subjects.map(s => s.subject));
      
      const attLookup = {};
      subjects.forEach(s => {
        attLookup[s.subject] = { total: s.totalClasses, attended: s.attendedClasses };
      });
      setAttendanceData(attLookup);

      const timeRes = await api.get("/timetable");
      if (timeRes.data && timeRes.data.timetable) {
        setTimetable(timeRes.data.timetable);
      }
    } catch (err) {
      console.error("Sync Error:", err);
    }
  };

  const saveTimetable = async (updated) => {
    try {
      await api.put("/timetable", { timetable: updated });
    } catch (err) {
      toast.error("Cloud Sync Failed");
    }
  };

  const handleAddSubjectToDay = () => {
    if (!subjectToAdd) return;
    const updated = { ...timetable, [selectedDay]: [...(timetable[selectedDay] || []), subjectToAdd] };
    setTimetable(updated);
    saveTimetable(updated);
    setSubjectToAdd('');
  };

  const handleRemoveSubjectFromDay = (day, index) => {
    const updated = { ...timetable, [day]: timetable[day].filter((_, i) => i !== index) };
    setTimetable(updated);
    saveTimetable(updated);
  };

  // 🧠 CORE LOGIC: Determine if a day is "Skipable" or "Risky"
  const getDayStatus = (day) => {
    const subjectsInDay = timetable[day] || [];
    if (subjectsInDay.length === 0) return null;

    let criticalCount = 0;
    const details = subjectsInDay.map(subj => {
      const att = attendanceData[subj] || { total: 0, attended: 0 };
      const total = Number(att.total);
      const attended = Number(att.attended);
      
      // Calculate % if you skip today (total + 1)
      const pctAfterSkip = total + 1 > 0 ? (attended / (total + 1)) * 100 : 0;
      const isDangerous = pctAfterSkip < 75;
      if (isDangerous) criticalCount++;

      return { subject: subj, nextPct: pctAfterSkip.toFixed(1), isDangerous };
    });

    // Ranking Logic
    let status = "SAFE"; // Default
    if (criticalCount > 0) status = "RISKY";
    if (criticalCount >= 2 || criticalCount === subjectsInDay.length) status = "DANGER";

    return { day, status, details, criticalCount };
  };

  const processedDays = DAYS.map(d => getDayStatus(d)).filter(d => d !== null);

  return (
    <div className={`min-h-screen p-4 md:p-10 font-sans transition-colors duration-500 ${dark ? 'text-white' : 'text-slate-900'}`}>
      
      <div className="fixed top-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-5%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-10">
        
        {/* HEADER */}
        <header className="glass p-8 rounded-[40px] border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-red-500/20 rounded-3xl text-red-500 border border-red-500/20 backdrop-blur-xl">
              <HiOutlineFire className="text-4xl" />
            </div>
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Bunk <span className="text-red-500">Intelligence</span></h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mt-2">Skip classes without getting debarred</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsEditing(!isEditing)} 
            className={`btn-glass px-10 py-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-primary-500 text-white shadow-primary-500/30' : ''}`}
          >
            {isEditing ? <HiOutlineCheck className="text-xl" /> : <HiOutlinePencil className="text-xl" />}
            {isEditing ? 'Finish Setup' : 'Edit Timetable'}
          </button>
        </header>

        {/* EDITOR SECTION */}
        <AnimatePresence>
          {isEditing && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="glass p-8 rounded-[40px] border border-white/20 shadow-2xl mb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-3xl mb-8">
                  <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} className="input-glass p-3 font-bold uppercase text-[10px] tracking-widest">
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={subjectToAdd} onChange={e => setSubjectToAdd(e.target.value)} className="input-glass p-3 font-bold uppercase text-[10px] tracking-widest">
                    <option value="">Select Subject</option>
                    {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={handleAddSubjectToDay} className="bg-primary-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg">Add to Day</button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {DAYS.map(day => (
                    <div key={day} className="bg-black/20 p-4 rounded-[25px] border border-white/5 min-h-[120px]">
                      <h4 className="font-black text-[10px] uppercase tracking-widest mb-3 opacity-40">{day}</h4>
                      <div className="space-y-2">
                        {timetable[day]?.map((subj, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white/5 p-2 px-3 rounded-xl group transition-all">
                            <span className="text-[10px] font-bold truncate mr-2">{subj}</span>
                            <button onClick={() => handleRemoveSubjectFromDay(day, idx)} className="text-red-500"><HiOutlineTrash /></button>
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

        {/* --- MAIN RISK DISPLAY --- */}
        {!isEditing && (
          <div className="space-y-6">
            {processedDays.length === 0 ? (
              <div className="text-center py-20 opacity-20">
                <HiOutlineBan className="text-6xl mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">Define your timetable to see risk levels</p>
              </div>
            ) : (
              processedDays.map((item, i) => (
                <motion.div 
                  key={item.day} 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.1 }}
                  className={`glass p-8 rounded-[40px] border transition-all shadow-xl group ${
                    item.status === 'SAFE' ? 'border-emerald-500/20' : 
                    item.status === 'RISKY' ? 'border-yellow-500/20' : 'border-red-500/20'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${
                        item.status === 'SAFE' ? 'bg-emerald-500 text-white' : 
                        item.status === 'RISKY' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'
                      }`}>
                         {item.day[0]}
                      </div>
                      <div>
                        <h3 className="font-black text-2xl uppercase italic tracking-tighter">{item.day}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-30">{item.details.length} Classes Today</p>
                      </div>
                    </div>

                    <div className={`px-6 py-3 rounded-2xl border font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 ${
                      item.status === 'SAFE' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 
                      item.status === 'RISKY' ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400' : 
                      'border-red-500/30 bg-red-500/10 text-red-400'
                    }`}>
                       {item.status === 'SAFE' ? <HiOutlineShieldCheck className="text-xl" /> : 
                        item.status === 'RISKY' ? <HiOutlineExclamationCircle className="text-xl" /> : 
                        <HiOutlineBan className="text-xl" />}
                       {item.status === 'SAFE' ? 'Safe to Skip Today' : 
                        item.status === 'RISKY' ? 'Risky - 75% Alert' : 'Critical - Do Not Bunk'}
                    </div>
                  </div>

                  {/* Subject Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/5">
                    {item.details.map((d, j) => (
                      <div key={j} className={`p-5 rounded-[30px] bg-black/20 border border-white/5 ${d.isDangerous ? 'border-red-500/30' : ''}`}>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-3 truncate">{d.subject}</p>
                        <div className="flex justify-between items-end">
                           <div>
                              <p className="text-[8px] font-black opacity-30 uppercase mb-1">Resulting %</p>
                              <p className={`text-xl font-black tracking-tighter ${d.isDangerous ? 'text-red-400' : 'text-emerald-400'}`}>{d.nextPct}%</p>
                           </div>
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${d.isDangerous ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                              {d.isDangerous ? '!' : '✓'}
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        <footer className="mt-20 text-center opacity-10 pb-10">
           <p className="text-[10px] font-black uppercase tracking-[1em]">SKIP INTELLIGENCE UNIT</p>
        </footer>
      </div>
    </div>
  );
}