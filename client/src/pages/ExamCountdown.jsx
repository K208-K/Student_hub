import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  HiOutlineClock, 
  HiOutlinePlus, 
  HiOutlineTrash,
  HiOutlineLocationMarker,
  HiOutlineBookOpen
} from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function ExamCountdown() {
  const { dark } = useTheme();
  
  const [exams, setExams] = useState([]);
  const [now, setNow] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [newExam, setNewExam] = useState({ subject: '', date: '', venue: '' });

  const token = localStorage.getItem("token");

  // 🔥 LIVE CLOCK
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🔥 LOAD FROM BACKEND (READ)
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/exams", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExams(res.data.exams || []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchExams();
  }, [token]);

  // 🔥 ADD EXAM (CREATE)
  const addExam = async () => {
    if (!newExam.subject || !newExam.date) {
      return toast.error('Subject and Date are required!');
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/exams",
        newExam,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setExams(prev => [...prev, res.data.exam || res.data]);
      setNewExam({ subject: '', date: '', venue: '' });
      setShowAdd(false);
      toast.success('Exam added successfully!');
    } catch (err) {
      // Fallback for local testing if backend isn't ready
      const fallbackExam = { ...newExam, _id: Date.now().toString() };
      setExams(prev => [...prev, fallbackExam]);
      setNewExam({ subject: '', date: '', venue: '' });
      setShowAdd(false);
      toast.success('Exam added (Local Mode)');
    }
  };

  // 🔥 DELETE EXAM (DELETE)
  const deleteExam = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/exams/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExams(prev => prev.filter(e => e._id !== id));
      toast.success('Exam removed');
    } catch (err) {
      // Fallback for local testing
      setExams(prev => prev.filter(e => e._id !== id));
      toast.success('Exam removed (Local Mode)');
    }
  };

  // 🧮 COUNTDOWN MATH
  const getCountdown = (dateStr) => {
    const target = new Date(dateStr);
    const diff = target - now;
    
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, passed: true };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    
    return { days, hours, mins, secs, passed: false };
  };

  const getUrgencyColor = (days, passed) => {
    if (passed) return { border: 'border-surface-500/30', bg: 'bg-surface-500/10', text: 'text-surface-500' };
    if (days <= 3) return { border: 'border-danger-500/50', bg: 'bg-danger-500/10', text: 'text-danger-500' };
    if (days <= 7) return { border: 'border-warning-500/50', bg: 'bg-warning-500/10', text: 'text-warning-500' };
    if (days <= 14) return { border: 'border-primary-500/50', bg: 'bg-primary-500/10', text: 'text-primary-500' };
    return { border: 'border-success-500/50', bg: 'bg-success-500/10', text: 'text-success-500' };
  };

  // Sort exams: Upcoming first, then by date. Passed exams go to the bottom.
  const sortedExams = [...exams].sort((a, b) => {
    const timeA = new Date(a.date) - now;
    const timeB = new Date(b.date) - now;
    if (timeA < 0 && timeB >= 0) return 1;
    if (timeB < 0 && timeA >= 0) return -1;
    return new Date(a.date) - new Date(b.date);
  });

  const nextExam = sortedExams.find(e => new Date(e.date) - now > 0);
  const otherExams = sortedExams.filter(e => e._id !== nextExam?._id);

  return (
    <div className="relative min-h-screen p-6 md:p-12 overflow-hidden font-sans text-sm md:text-base">
      
      {/* Background Ambient Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-400/20 blur-[100px] pointer-events-none" />
      <div className="fixed top-[30%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent-500/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-danger-600/15 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/20 rounded-2xl text-primary-500 backdrop-blur-md border border-primary-500/30 shadow-lg">
              <HiOutlineClock className="text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text inline-block">Exam Countdown</h1>
              <p className="opacity-70 text-sm mt-1">Track deadlines down to the exact second</p>
            </div>
          </div>

          <button 
            onClick={() => setShowAdd(p => !p)} 
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <HiOutlinePlus className="text-xl" /> {showAdd ? 'Close' : 'Add Exam'}
          </button>
        </div>

        {/* 🚀 ADD EXAM FORM */}
        <AnimatePresence>
          {showAdd && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="glass p-6 md:p-8 shadow-xl mb-8 border border-primary-500/30">
                <h3 className="text-xl font-bold mb-6 gradient-text">New Exam Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs uppercase tracking-wider opacity-60 font-semibold mb-2 block pl-1">Subject / Course</label>
                    <input 
                      value={newExam.subject} 
                      onChange={e => setNewExam(p => ({ ...p, subject: e.target.value }))}
                      placeholder="e.g. Advanced Mathematics" 
                      className="input-glass w-full outline-none focus:ring-2 focus:ring-primary-500/50" 
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider opacity-60 font-semibold mb-2 block pl-1">Date & Time</label>
                    <input 
                      type="datetime-local" 
                      value={newExam.date} 
                      onChange={e => setNewExam(p => ({ ...p, date: e.target.value }))}
                      className={`input-glass w-full outline-none focus:ring-2 focus:ring-primary-500/50 ${dark ? 'bg-surface-800 text-white' : 'bg-white text-black'}`} 
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider opacity-60 font-semibold mb-2 block pl-1">Venue / Room (Optional)</label>
                    <input 
                      value={newExam.venue} 
                      onChange={e => setNewExam(p => ({ ...p, venue: e.target.value }))}
                      placeholder="e.g. Main Hall A" 
                      className="input-glass w-full outline-none focus:ring-2 focus:ring-primary-500/50" 
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button onClick={addExam} className="w-full md:w-auto bg-primary-500 hover:bg-primary-600 text-white px-10 py-3 rounded-xl font-bold shadow-lg transition-all hover:scale-105 active:scale-95">
                    Save Exam
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {exams.length === 0 && !showAdd && (
          <div className="glass p-12 text-center shadow-xl border-dashed opacity-70 flex flex-col items-center">
            <HiOutlineBookOpen className="text-6xl mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">No exams scheduled</h3>
            <p>You're all clear! Click "Add Exam" when your timetable is released.</p>
          </div>
        )}

        {/* 🔥 HERO SECTION: NEXT UPCOMING EXAM */}
        {nextExam && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h2 className="text-sm uppercase tracking-widest font-bold opacity-60 mb-3 pl-2">Next Major Objective</h2>
            
            {(() => {
              const cd = getCountdown(nextExam.date);
              const urgency = getUrgencyColor(cd.days, cd.passed);
              
              return (
                <div className={`glass p-8 md:p-10 shadow-2xl relative overflow-hidden rounded-[32px] border-2 ${urgency.border}`}>
                  {/* Glowing Background Pulse */}
                  <div className={`absolute inset-0 ${urgency.bg} opacity-50 pointer-events-none`} />
                  
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    
                    <div className="text-center md:text-left w-full md:w-auto">
                      <h3 className="text-4xl md:text-5xl font-extrabold mb-2">{nextExam.subject}</h3>
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 opacity-80 font-medium">
                        <span className="flex items-center gap-1"><HiOutlineClock /> {new Date(nextExam.date).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        {nextExam.venue && <span className="flex items-center gap-1"><HiOutlineLocationMarker /> {nextExam.venue}</span>}
                      </div>
                    </div>

                    <div className="flex gap-3 md:gap-4 justify-center">
                      {[
                        { val: cd.days, label: 'DAYS' },
                        { val: cd.hours, label: 'HRS' },
                        { val: cd.mins, label: 'MIN' },
                        { val: cd.secs, label: 'SEC' },
                      ].map((unit, i) => (
                        <div key={unit.label} className={`flex flex-col items-center justify-center w-20 h-24 md:w-24 md:h-28 rounded-2xl bg-black/10 dark:bg-white/10 border ${urgency.border} backdrop-blur-md shadow-inner`}>
                          <motion.span 
                            key={unit.val}
                            initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                            className={`text-4xl md:text-5xl font-mono font-bold tracking-tighter ${urgency.text}`}
                          >
                            {String(unit.val).padStart(2, '0')}
                          </motion.span>
                          <span className="text-[10px] md:text-xs font-bold opacity-60 mt-1">{unit.label}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Delete Button (Absolute on desktop, relative on mobile) */}
                    <button onClick={() => deleteExam(nextExam._id)} className="md:absolute top-6 right-6 p-3 text-danger-500 hover:bg-danger-500/20 rounded-xl transition-colors">
                      <HiOutlineTrash className="text-xl" />
                    </button>
                    
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* 📚 OTHER EXAMS GRID */}
        {otherExams.length > 0 && (
          <div>
            <h2 className="text-sm uppercase tracking-widest font-bold opacity-60 mb-4 pl-2">Following Exams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {otherExams.map((exam, i) => {
                  const cd = getCountdown(exam.date);
                  const urgency = getUrgencyColor(cd.days, cd.passed);
                  
                  return (
                    <motion.div 
                      key={exam._id} 
                      layout
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }} 
                      className={`glass p-6 relative overflow-hidden shadow-lg border-t-4 ${cd.passed ? 'border-surface-500/30 opacity-60' : urgency.border}`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className={`text-xl font-bold mb-1 ${cd.passed ? 'line-through opacity-70' : ''}`}>{exam.subject}</h3>
                          <p className="text-xs opacity-70 font-medium">
                            {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            {exam.venue && ` • ${exam.venue}`}
                          </p>
                        </div>
                        <button onClick={() => deleteExam(exam._id)} className="text-danger-500 hover:bg-danger-500/20 p-2 rounded-lg transition-colors shrink-0">
                          <HiOutlineTrash className="text-lg" />
                        </button>
                      </div>

                      {cd.passed ? (
                        <div className="bg-surface-500/10 text-surface-500 dark:text-surface-400 py-3 rounded-xl text-center font-bold text-sm">
                          ✓ Exam Completed
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { val: cd.days, label: 'D' },
                            { val: cd.hours, label: 'H' },
                            { val: cd.mins, label: 'M' },
                            { val: cd.secs, label: 'S' },
                          ].map(unit => (
                            <div key={unit.label} className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/5 dark:bg-white/5">
                              <motion.span 
                                key={unit.val}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className={`text-xl font-mono font-bold ${urgency.text}`}
                              >
                                {String(unit.val).padStart(2, '0')}
                              </motion.span>
                              <span className="text-[10px] font-bold opacity-50">{unit.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}