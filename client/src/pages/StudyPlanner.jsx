import { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  HiOutlineCalendar, 
  HiOutlinePlus, 
  HiOutlineTrash, 
  HiCheck, 
  HiOutlineClock, 
  HiOutlineAcademicCap 
} from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function StudyPlanner() {
  const { dark } = useTheme();

  // --- TASK STATE ---
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newPriority, setNewPriority] = useState('medium');

  const token = localStorage.getItem("token");

  // 🔥 LOAD FROM BACKEND
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/planner", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(res.data.tasks || []);
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
        "http://localhost:5000/api/planner",
        { tasks: updated },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // ➕ ADD TASK
  const addTask = async () => {
    if (!newTask.trim()) return;

    const updated = [
      ...tasks,
      {
        id: Date.now(),
        title: newTask,
        subject: newSubject || 'General',
        priority: newPriority,
        completed: false,
        dueDate: ''
      }
    ];

    setTasks(updated);
    await saveToDB(updated);

    setNewTask('');
    setNewSubject('');
    toast.success('Task added!');
  };

  // ✅ TOGGLE TASK
  const toggleTask = async (id) => {
    const updated = tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);
    await saveToDB(updated);
  };

  // ❌ DELETE TASK
  const deleteTask = async (id) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    await saveToDB(updated);
    toast.success('Task removed');
  };

  // --- STATS ---
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // --- POMODORO STATE & LOGIC ---
  const MODES = {
    work: { label: 'Focus', time: 25 * 60, color: 'text-primary-500', stroke: '#3b82f6' },
    shortBreak: { label: 'Short Break', time: 5 * 60, color: 'text-success-500', stroke: '#22c55e' },
    longBreak: { label: 'Long Break', time: 15 * 60, color: 'text-accent-500', stroke: '#8b5cf6' }
  };

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
      toast.success(pomodoroType === 'work' ? '🎉 Focus session complete!' : '💪 Break over! Back to work!');
      
      // Auto-switch mode
      if (pomodoroType === 'work') switchMode('shortBreak');
      else switchMode('work');
    }
    return () => clearInterval(intervalRef.current);
  }, [pomodoroRunning, pomodoroTime]);

  const switchMode = (mode) => {
    setPomodoroRunning(false);
    setPomodoroType(mode);
    setPomodoroTime(MODES[mode].time);
    setPomodoroMaxTime(MODES[mode].time);
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // SVG Circle Math for Pomodoro
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pomodoroTime / pomodoroMaxTime) * circumference;

  // Helpers
  const priorityStyles = {
    high: 'bg-danger-500/10 text-danger-500 border-danger-500/20',
    medium: 'bg-warning-500/10 text-warning-500 border-warning-500/20',
    low: 'bg-success-500/10 text-success-500 border-success-500/20'
  };

  return (
    <div className="relative min-h-screen p-6 md:p-12 overflow-hidden font-sans text-sm md:text-base">
      
      {/* Background Ambient Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-400/20 blur-[100px] pointer-events-none" />
      <div className="fixed top-[30%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent-500/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-primary-600/20 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* HEADER & GLOBAL PROGRESS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/20 rounded-2xl text-primary-500 backdrop-blur-md border border-primary-500/30 shadow-lg">
              <HiOutlineCalendar className="text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text inline-block">Study Command Center</h1>
              <p className="opacity-70 text-sm mt-1">Plan, track, and conquer your studies</p>
            </div>
          </div>

          {/* Progress Widget */}
          <div className="glass px-6 py-4 rounded-2xl flex flex-col gap-2 w-full md:w-64 shadow-xl">
            <div className="flex justify-between items-center text-sm font-bold">
              <span>Daily Progress</span>
              <span className="text-primary-500">{progressPct}%</span>
            </div>
            <div className="h-2 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                className="h-full bg-linear-to-r from-primary-500 to-accent-500"
              />
            </div>
            <p className="text-xs opacity-60 text-right">{completedCount} of {totalCount} tasks completed</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: TASK MANAGER */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* ADD TASK FORM */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 shadow-xl">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <HiOutlinePlus className="text-primary-500" /> New Assignment
              </h3>
              
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  placeholder="What needs to be done?"
                  className="input-glass flex-1 outline-none focus:ring-2 focus:ring-primary-500/50 text-base py-3 px-4"
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                />
                
                <div className="flex gap-4">
                  <div className="relative w-full md:w-40 flex items-center">
                    <HiOutlineAcademicCap className="absolute left-3 opacity-50" />
                    <input
                      value={newSubject}
                      onChange={e => setNewSubject(e.target.value)}
                      placeholder="Subject"
                      className="input-glass w-full pl-9 py-3 outline-none focus:ring-2 focus:ring-primary-500/50"
                    />
                  </div>
                  
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value)}
                    className={`input-glass py-3 w-32 outline-none focus:ring-2 focus:ring-primary-500/50 ${dark ? 'bg-surface-800' : 'bg-white'}`}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>

                  <button 
                    onClick={addTask} 
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>
            </motion.div>

            {/* TASK LIST */}
            <div className="space-y-3">
              <AnimatePresence>
                {tasks.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-10 text-center opacity-70 border-dashed">
                    No tasks remaining. Time to relax or add a new goal!
                  </motion.div>
                ) : (
                  tasks.map(task => (
                    <motion.div 
                      key={task.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, x: -50 }}
                      className={`glass p-4 md:p-5 flex items-center gap-4 group transition-all duration-300 ${task.completed ? 'opacity-60 bg-black/5 dark:bg-white/5' : 'shadow-lg hover:shadow-xl hover:bg-white/40 dark:hover:bg-black/40'}`}
                    >
                      {/* Custom Animated Checkbox */}
                      <button 
                        onClick={() => toggleTask(task.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-300 ${task.completed ? 'bg-primary-500 border-primary-500 text-white' : 'border-primary-500/50 text-transparent hover:border-primary-500'}`}
                      >
                        <HiCheck className="text-sm" />
                      </button>

                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-lg truncate transition-all duration-300 ${task.completed ? 'line-through opacity-70' : ''}`}>
                          {task.title}
                        </p>
                      </div>

                      {/* Badges (Hidden on tiny screens, shown on md+) */}
                      <div className="hidden md:flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 uppercase tracking-wider">
                          {task.subject}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${priorityStyles[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Delete Button */}
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-danger-500 opacity-0 group-hover:opacity-100 hover:bg-danger-500/10 rounded-xl transition-all"
                      >
                        <HiOutlineTrash className="text-xl" />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT COLUMN: POMODORO WIDGET */}
          <div className="xl:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass p-8 shadow-2xl rounded-4xl sticky top-8 flex flex-col items-center">
              
              <div className="flex items-center gap-2 mb-8">
                <HiOutlineClock className="text-2xl opacity-70" />
                <h3 className="font-bold text-xl">Timer</h3>
              </div>

              {/* Mode Selector Tabs */}
              <div className="flex bg-black/5 dark:bg-white/5 rounded-full p-1 mb-8 w-full border border-black/10 dark:border-white/10">
                {Object.keys(MODES).map(mode => (
                  <button
                    key={mode}
                    onClick={() => switchMode(mode)}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${pomodoroType === mode ? 'bg-white dark:bg-surface-800 shadow-md text-primary-500' : 'opacity-60 hover:opacity-100'}`}
                  >
                    {MODES[mode].label}
                  </button>
                ))}
              </div>

              {/* Glowing SVG Timer Ring */}
              <div className="relative w-55 h-55 flex items-center justify-center mb-8">
                {/* Background Ring */}
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle
                    cx="110" cy="110" r={radius}
                    fill="transparent"
                    strokeWidth="10"
                    className="stroke-black/5 dark:stroke-white/5"
                  />
                  {/* Progress Ring */}
                  <motion.circle
                    cx="110" cy="110" r={radius}
                    fill="transparent"
                    strokeWidth="10"
                    strokeLinecap="round"
                    stroke={MODES[pomodoroType].stroke}
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: "linear" }}
                    className="drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  />
                </svg>

                {/* Digital Time Display */}
                <div className="absolute flex flex-col items-center">
                  <span className={`text-5xl font-mono font-bold tracking-tighter ${MODES[pomodoroType].color}`}>
                    {formatTime(pomodoroTime)}
                  </span>
                  <span className="text-xs uppercase tracking-widest opacity-50 mt-1">
                    {MODES[pomodoroType].label}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setPomodoroRunning(!pomodoroRunning)}
                  className={`flex-1 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all hover:scale-105 active:scale-95 ${pomodoroRunning ? 'bg-warning-500 text-white shadow-warning-500/30' : 'bg-primary-500 text-white shadow-primary-500/30'}`}
                >
                  {pomodoroRunning ? 'PAUSE' : 'START'}
                </button>
                
                <button
                  onClick={() => switchMode(pomodoroType)}
                  className="px-6 py-4 rounded-2xl font-bold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  RESET
                </button>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}