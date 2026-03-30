import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { HiOutlineChartBar, HiOutlineTrendingUp } from 'react-icons/hi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function GPAGoal() {
  const { dark } = useTheme();
  const [currentCGPA, setCurrentCGPA] = useState(7.8);
  const [targetCGPA, setTargetCGPA] = useState(8.5);
  const [completedSems, setCompletedSems] = useState(4);
  const [totalSems, setTotalSems] = useState(8);

  // --- CALCULATIONS ---
  const remainingSems = totalSems - completedSems;
  const requiredSGPA = remainingSems > 0
    ? ((targetCGPA * totalSems - currentCGPA * completedSems) / remainingSems).toFixed(2)
    : 0;

  const isAchievable = Number(requiredSGPA) <= 10 && Number(requiredSGPA) > 0;

  // --- CHART DATA GENERATION ---
  const projectionData = [];
  for (let i = 1; i <= completedSems; i++) {
    projectionData.push({ 
      sem: `Sem ${i}`, 
      CGPA: Number((currentCGPA - (completedSems - i) * 0.15 + Math.random() * 0.3).toFixed(2)) 
    });
  }
  for (let i = 1; i <= remainingSems; i++) {
    const projected = currentCGPA + (targetCGPA - currentCGPA) * (i / remainingSems);
    projectionData.push({ 
      sem: `Sem ${completedSems + i}`, 
      CGPA: Number(projected.toFixed(2)), 
      projected: true 
    });
  }

  // --- CUSTOM RECHARTS TOOLTIP ---
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 shadow-xl">
          <p className="font-bold text-primary-600 dark:text-primary-400 mb-1">{label}</p>
          <p className="text-sm font-semibold">
            CGPA: <span className="text-xl">{payload[0].value.toFixed(2)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative min-h-screen p-6 md:p-12 overflow-hidden font-sans text-sm md:text-base">
      
      {/* --- BACKGROUND AMBIENT ORBS --- */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-400/20 blur-[100px] pointer-events-none" />
      <div className="fixed top-[30%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent-500/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-primary-600/20 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-primary-500/20 rounded-2xl text-primary-500 backdrop-blur-md border border-primary-500/30 shadow-lg">
            <HiOutlineTrendingUp className="text-3xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text inline-block">GPA Goal Predictor</h1>
            <p className="opacity-70 text-sm mt-1">Set targets and calculate your required trajectory</p>
          </div>
        </div>

        {/* --- MAIN HERO RESULT --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
          className="glass p-8 md:p-12 text-center relative overflow-hidden shadow-2xl rounded-3xl border border-primary-500/30"
        >
          {/* Inner ambient glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10 pointer-events-none" />
          
          <div className="relative z-10">
            <p className="text-sm md:text-base uppercase tracking-widest font-bold opacity-70 mb-2">
              Required SGPA per remaining semester
            </p>
            
            <motion.p
              key={requiredSGPA}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={`text-7xl md:text-9xl font-extrabold tracking-tighter drop-shadow-lg ${isAchievable ? 'gradient-text' : 'text-danger-500'}`}
            >
              {isAchievable ? requiredSGPA : 'N/A'}
            </motion.p>
            
            <div className="mt-6 inline-block bg-black/5 dark:bg-white/5 px-6 py-3 rounded-full border border-black/10 dark:border-white/10">
              <p className={`text-sm md:text-base font-bold ${isAchievable ? 'text-success-600 dark:text-success-400' : 'text-danger-500'}`}>
                {isAchievable
                  ? `Maintain a ${requiredSGPA} average for your final ${remainingSems} semesters to reach ${targetCGPA}.`
                  : remainingSems <= 0 
                    ? 'No semesters remaining to improve your score.' 
                    : 'Target is mathematically impossible with remaining semesters.'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* --- CONTROL PANEL (Inputs) --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 md:p-8 shadow-xl">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <HiOutlineChartBar className="text-primary-500" /> Goal Parameters
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Current CGPA', value: currentCGPA, setter: setCurrentCGPA, max: 10, step: 0.1 },
              { label: 'Target CGPA', value: targetCGPA, setter: setTargetCGPA, max: 10, step: 0.1 },
              { label: 'Completed Sems', value: completedSems, setter: setCompletedSems, max: 8, step: 1 },
              { label: 'Total Sems', value: totalSems, setter: setTotalSems, max: 10, step: 1 },
            ].map((item, i) => (
              <div key={i} className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-bold opacity-60 mb-2 pl-1">
                  {item.label}
                </label>
                <input 
                  type="number" 
                  value={item.value} 
                  onChange={e => item.setter(Number(e.target.value))}
                  step={item.step} 
                  max={item.max} 
                  min="0"
                  className="input-glass text-xl md:text-2xl font-bold py-3 text-center outline-none focus:ring-2 focus:ring-primary-500/50 bg-white/50 dark:bg-black/20" 
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* --- PROGRESS BARS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-6 shadow-xl">
            <p className="text-sm font-bold uppercase tracking-wider opacity-70 mb-4">Goal Progress</p>
            <div className="h-4 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shadow-inner mb-3">
              <motion.div 
                initial={{ width: 0 }} animate={{ width: `${(currentCGPA / targetCGPA) * 100}%` }} transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary-400 to-primary-600"
              />
            </div>
            <div className="flex justify-between font-bold text-sm">
              <span>Current: <span className="text-primary-600 dark:text-primary-400">{currentCGPA}</span></span>
              <span>Target: <span className="text-primary-600 dark:text-primary-400">{targetCGPA}</span></span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass p-6 shadow-xl">
            <p className="text-sm font-bold uppercase tracking-wider opacity-70 mb-4">Time Progress</p>
            <div className="h-4 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shadow-inner mb-3">
              <motion.div 
                initial={{ width: 0 }} animate={{ width: `${(completedSems / totalSems) * 100}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="h-full bg-gradient-to-r from-accent-400 to-accent-600"
              />
            </div>
            <div className="flex justify-between font-bold text-sm">
              <span>Done: <span className="text-accent-600 dark:text-accent-400">{completedSems} Sems</span></span>
              <span>Left: <span className="text-accent-600 dark:text-accent-400">{remainingSems} Sems</span></span>
            </div>
          </motion.div>
        </div>

        {/* --- PROJECTION CHART --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass p-6 md:p-8 shadow-xl">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <HiOutlineTrendingUp className="text-accent-500" /> Trajectory Projection
          </h3>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.2} vertical={false} />
                <XAxis dataKey="sem" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 10]} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', strokeWidth: 2 }} />
                
                {/* Target Line */}
                <ReferenceLine 
                  y={targetCGPA} 
                  stroke="#22c55e" 
                  strokeDasharray="5 5" 
                  label={{ value: 'Target Goal', fill: '#22c55e', fontSize: 12, position: 'top' }} 
                />
                
                {/* Projected Line */}
                <Line 
                  type="monotone" 
                  dataKey="CGPA" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: dark ? '#0f172a' : '#ffffff', stroke: '#3b82f6', strokeWidth: 2 }} 
                  activeDot={{ r: 8, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
}