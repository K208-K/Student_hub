import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { 
  HiOutlineCalendar, HiOutlinePlus, HiOutlineTrash, 
  HiOutlineLocationMarker, HiOutlineUser, HiOutlineClock,
  HiOutlineStatusOnline
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimeTable() {
  const { dark } = useTheme();
  const [schedule, setSchedule] = useState([]); // Database returns an Array
  const [showAdd, setShowAdd] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const token = localStorage.getItem("token");

  const [entry, setEntry] = useState({
    day: "Monday",
    subject: "",
    type: "Theory",
    room: "",
    faculty: "",
    startTime: "09:00",
    endTime: "10:00"
  });

  // 🕒 1. READ: Fetch data from MongoDB on Load
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/timetable", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSchedule(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    if (token) fetchSchedule();
    
    // Timer for Live Highlight
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [token]);

  // 📝 2. CREATE: Save to MongoDB
  const addSlot = async () => {
    if (!entry.subject && entry.type !== "Lunch") return toast.error("Subject name is required");
    
    try {
      const res = await axios.post("http://localhost:5000/api/timetable", entry, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Add the new slot returned from DB to our state
      setSchedule([...schedule, res.data]);
      setShowAdd(false);
      toast.success("Scheduled Successfully!");
    } catch (err) {
      toast.error("Failed to save to database");
    }
  };

  // 🗑️ 3. DELETE: Remove from MongoDB
  const removeSlot = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/timetable/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchedule(schedule.filter(s => s._id !== id));
      toast.success("Slot Removed");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  // Logic to check if class is currently happening
  const checkIsLive = (day, start, end) => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    if (day !== dayNames[currentTime.getDay()]) return false;
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    return now >= (sH * 60 + sM) && now < (eH * 60 + eM);
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 relative transition-colors duration-500 ${dark ? 'text-white' : 'text-slate-900'}`}>
      <div className="fixed top-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Academic <span className="text-cyan-500">Scheduler</span></h1>
            <p className="text-[10px] font-black tracking-[0.4em] opacity-40 uppercase mt-2">Database Connected • Live Status Active</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="glass px-8 py-4 rounded-3xl border border-cyan-500/30 text-cyan-500 font-black text-[10px] tracking-widest uppercase hover:bg-cyan-500 transition-all shadow-xl">
            <HiOutlinePlus className="text-xl" /> {showAdd ? "Close" : "Add New Slot"}
          </button>
        </header>

        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="glass p-8 rounded-[40px] border border-white/10 shadow-2xl space-y-6 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <select value={entry.day} onChange={e => setEntry({...entry, day: e.target.value})} className={`input-glass ${dark ? 'text-white' : 'text-black'}`}>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input value={entry.subject} onChange={e => setEntry({...entry, subject: e.target.value})} placeholder="Subject" className="input-glass" />
                <select value={entry.type} onChange={e => setEntry({...entry, type: e.target.value})} className={`input-glass ${dark ? 'text-white' : 'text-black'}`}>
                  <option value="Theory">Theory</option>
                  <option value="Practical">Practical</option>
                  <option value="Lunch">Lunch</option>
                </select>
                <input value={entry.room} onChange={e => setEntry({...entry, room: e.target.value})} placeholder="Room" className="input-glass" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input value={entry.faculty} onChange={e => setEntry({...entry, faculty: e.target.value})} placeholder="Faculty" className="input-glass" />
                <input type="time" value={entry.startTime} onChange={e => setEntry({...entry, startTime: e.target.value})} className="input-glass" />
                <input type="time" value={entry.endTime} onChange={e => setEntry({...entry, endTime: e.target.value})} className="input-glass" />
              </div>
              <button onClick={addSlot} className="w-full py-4 bg-cyan-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Publish to Database</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-10">
          {days.map(day => (
            <div key={day} className="space-y-4">
              <h3 className="text-xl font-black uppercase tracking-tighter text-cyan-500 flex items-center gap-3">
                <div className="w-8 h-px bg-cyan-500/30" /> {day}
              </h3>
              <div className="flex flex-nowrap overflow-x-auto gap-4 pb-4">
                {schedule.filter(s => s.day === day).length > 0 ? (
                  schedule.filter(s => s.day === day).map((slot) => {
                    const isLive = checkIsLive(slot.day, slot.startTime, slot.endTime);
                    return (
                      <motion.div key={slot._id} whileHover={{ y: -5 }} className={`min-w-[280px] glass p-6 rounded-[35px] border transition-all relative group ${isLive ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] bg-cyan-500/5' : 'border-white/10'}`}>
                        {isLive && <div className="absolute top-4 right-4 text-cyan-400 animate-pulse flex items-center gap-1 font-black text-[8px] uppercase tracking-widest"><HiOutlineStatusOnline /> Live Now</div>}
                        <div className="flex justify-between items-start mb-4">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${slot.type === 'Practical' ? 'bg-purple-500' : slot.type === 'Lunch' ? 'bg-amber-500' : 'bg-cyan-500'} text-white`}>{slot.type}</span>
                          <button onClick={() => removeSlot(slot._id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><HiOutlineTrash /></button>
                        </div>
                        <h4 className={`text-lg font-black uppercase tracking-tight mb-4 ${isLive ? 'text-cyan-400' : ''}`}>{slot.subject || "Lunch Break"}</h4>
                        <div className="space-y-2 opacity-60 text-[10px] font-bold">
                          <div className="flex items-center gap-2"><HiOutlineClock className="text-cyan-500" /> {slot.startTime} - {slot.endTime}</div>
                          {slot.type !== 'Lunch' && (
                            <><div className="flex items-center gap-2"><HiOutlineLocationMarker className="text-cyan-500" /> Room: {slot.room}</div>
                            <div className="flex items-center gap-2"><HiOutlineUser className="text-cyan-500" /> {slot.faculty}</div></>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                ) : <div className="text-[10px] font-black uppercase tracking-widest opacity-20 py-6">Free Schedule</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}