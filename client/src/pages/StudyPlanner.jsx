import { useState, useEffect, useRef, useCallback } from 'react';
import api from "../utils/api"; // Centralized API
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  HiOutlineCalendar, 
  HiOutlinePlus, 
  HiOutlineTrash, 
  HiCheck, 
  HiOutlineClock, 
  HiOutlineAcademicCap,
  HiOutlineFire,
  HiOutlineSparkles,
  HiOutlineBookmark
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const MODES = {
  work: { label: 'Focus', time: 25 * 60, color: 'text-primary-500', stroke: '#3b82f6', icon: HiOutlineFire },
  shortBreak: { label: 'Short Break', time: 5 * 60, color: 'text-success-500', stroke: '#22c55e', icon: HiOutlineSparkles },
  longBreak: { label: 'Long Break', time: 15 * 60, color: 'text-accent-500', stroke: '#8b5cf6', icon: HiOutlineBookmark }
};

export default function StudyPlanner() {
  const { dark } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [showAddForm, setShowAddForm] = useState(false);
  const saveTimerRef = useRef(null);

  // 🔥 LOAD FROM BACKEND (Production Ready)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/planner");
        setTasks(res.data.tasks || []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, []);

  // ☁️ DEBOUNCED SAVE
  const saveToDB = useCallback((updated) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await api.put("/planner", { tasks: updated });
      } catch (err) {
        console.error("Save error:", err);
      }
    }, 1500);
  }, []);

  // ➕ ACTIONS
  const addTask = () => {
    if (!newTask.trim()) return;
    const updated = [
      ...tasks,
      { id: Date.now(), title: newTask, subject: newSubject || 'General', priority: newPriority, completed: false }
    ];
    setTasks(updated);
    saveToDB(updated);
    setNewTask('');
    setNewSubject('');
    setShowAddForm(false);
    toast.success('Goal set!');
  };

  const toggleTask = (id) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    saveToDB(updated);
  };

  const deleteTask = (id) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    saveToDB(updated);
    toast.error('Task removed');
  };

  // --- POMODORO LOGIC ---
  const [pomodoroType, setPomodoroType] = useState('work');
  const [pomodoroTime, setPomodoroTime] = useState(MODES.work.time);
  const [pomodoroMaxTime, setPomodoroMaxTime] = useState(MODES.work.time);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (pomodoroRunning && pomodoroTime > 0) {
      intervalRef.current = setInterval(() => setPomodoroTime(p => p - 1), 1000);
    } else if (pomodoroTime === 0 && pomodoroRunning) {
      setPomodoroRunning(false);
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play();
      toast.success(pomodoroType === 'work' ? 'Focus session complete!' : 'Break over!');
      switchMode(pomodoroType === 'work' ? 'shortBreak' : 'work');
    }
    return () => clearInterval(intervalRef.current);
  }, [pomodoroRunning, pomodoroTime]);

  const switchMode = (mode) => {
    setPomodoroRunning(false);
    setPomodoroType(mode);
    setPomodoroTime(MODES[mode].time);
    setPomodoroMaxTime(MODES[mode].time);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pomodoroTime / pomodoroMaxTime) * circumference;

  return (
    <div className={`min-h-screen p-4 md:p-10 relative overflow-hidden transition-colors duration-500 ${dark ? 'text-white' : 'text-slate-900'}`}>
      
      {/* 🔮 DYNAMIC BACKGROUND */}
      <div className="fixed top-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-primary-500/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-5%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-primary-500/20 rounded-3xl text-primary-500 border border-primary-500/30 shadow-2xl backdrop-blur-xl">
              <HiOutlineCalendar className="text-4xl" />
            </div>
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase">Study Planner</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Optimize. Focus. Conquer.</p>
            </div>
          </div>

          <div className="glass px-8 py-4 rounded-[30px] border border-white/10 shadow-xl flex items-center gap-6">
            <div className="text-right">
              <p className="text-[9px] font-black uppercase opacity-40 tracking-widest">Progress</p>
              <p className="text-2xl font-black text-primary-400">{Math.round((tasks.filter(t=>t.completed).length / (tasks.length || 1)) * 100)}%</p>
            </div>
            <div className="w-16 h-16 relative">
               <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="#3b82f6" strokeWidth="4" strokeDasharray={175.9} strokeDashoffset={175.9 - (tasks.filter(t=>t.completed).length / (tasks.length || 1)) * 175.9} strokeLinecap="round" />
               </svg>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* TASK VIEW */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* ADD TASK TRIGGER */}
            <AnimatePresence>
              {!showAddForm ? (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-6 border-2 border-dashed border-primary-500/30 rounded-[35px] flex items-center justify-center gap-3 text-primary-400 font-black uppercase tracking-widest text-xs hover:bg-primary-500/5 transition-all"
                >
                  <HiOutlinePlus className="text-xl" /> Create New Study Goal
                </motion.button>
              ) : (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass p-8 rounded-[40px] border border-primary-500/20 shadow-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input 
                      value={newTask} onChange={e => setNewTask(e.target.value)} 
                      placeholder="Goal Title..." className="input-glass p-4 rounded-2xl font-bold" 
                    />
                    <input 
                      value={newSubject} onChange={e => setNewSubject(e.target.value)} 
                      placeholder="Subject (e.g. AI/ML)" className="input-glass p-4 rounded-2xl" 
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {['high', 'medium', 'low'].map(p => (
                        <button key={p} onClick={() => setNewPriority(p)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${newPriority === p ? 'bg-primary-500 text-white shadow-lg' : 'bg-white/5 opacity-40'}`}>{p}</button>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setShowAddForm(false)} className="px-6 py-3 text-xs font-bold opacity-40">Cancel</button>
                      <button onClick={addTask} className="bg-primary-500 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/40">Add Goal</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TASK CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode='popLayout'>
                {tasks.map(task => (
                  <motion.div 
                    key={task.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -20 }}
                    className={`glass p-6 rounded-[35px] border border-white/10 group relative transition-all ${task.completed ? 'opacity-40' : 'hover:border-primary-500/50 shadow-xl'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border ${task.priority === 'high' ? 'border-red-500 text-red-500' : 'border-cyan-500 text-cyan-500'}`}>
                        {task.priority}
                      </span>
                      <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-red-500 p-2 hover:bg-red-500/10 rounded-full transition-all">
                        <HiOutlineTrash />
                      </button>
                    </div>
                    <h3 className={`text-lg font-bold mb-1 truncate ${task.completed ? 'line-through' : ''}`}>{task.title}</h3>
                    <p className="text-[10px] font-black uppercase opacity-30 tracking-widest mb-6">{task.subject}</p>
                    
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className={`w-full py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${task.completed ? 'bg-green-500 text-white' : 'bg-primary-500/10 text-primary-400 border border-primary-500/20'}`}
                    >
                      {task.completed ? <><HiCheck className="inline mr-2" /> Done</> : 'Complete Goal'}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* POMODORO COLUMN */}
          <div className="lg:col-span-4">
            <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass p-10 rounded-[50px] border border-white/10 shadow-2xl sticky top-10 flex flex-col items-center">
              <div className="flex gap-3 mb-10 w-full">
                {Object.keys(MODES).map(m => (
                  <button key={m} onClick={() => switchMode(m)} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${pomodoroType === m ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-white/5 opacity-40'}`}>
                    {MODES[m].label.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* TIMER RING */}
              <div className="relative w-64 h-64 flex items-center justify-center mb-10">
                 <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="128" cy="128" r={radius} fill="transparent" stroke="currentColor" strokeWidth="12" className="text-white/5" />
                    <motion.circle 
                      cx="128" cy="128" r={radius} fill="transparent" stroke={MODES[pomodoroType].stroke} strokeWidth="12" strokeLinecap="round"
                      animate={{ strokeDashoffset }} transition={{ duration: 1, ease: 'linear' }}
                      strokeDasharray={circumference}
                      className="drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    />
                 </svg>
                 <div className="text-center z-10">
                    <p className={`text-6xl font-black tracking-tighter ${MODES[pomodoroType].color}`}>{formatTime(pomodoroTime)}</p>
                    <p className="text-[10px] font-black uppercase opacity-30 tracking-[0.4em] mt-2">Focus Mode</p>
                 </div>
              </div>

              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setPomodoroRunning(!pomodoroRunning)}
                  className={`flex-1 py-5 rounded-[25px] font-black uppercase tracking-widest text-xs shadow-xl transition-all ${pomodoroRunning ? 'bg-orange-500' : 'bg-primary-500 shadow-primary-500/30'}`}
                >
                  {pomodoroRunning ? 'Pause' : 'Start'}
                </button>
                <button onClick={() => switchMode(pomodoroType)} className="p-5 rounded-[25px] bg-white/5 border border-white/10"><HiOutlineClock className="text-xl" /></button>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}