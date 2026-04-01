import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api"; 
import { useTheme } from "../context/ThemeContext";
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineLocationMarker,
  HiOutlineUser,
  HiOutlineClock,
  HiOutlineStatusOnline,
  HiOutlinePencilAlt,
  HiOutlineX
} from "react-icons/hi";
import toast from "react-hot-toast";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimeTable() {
  const { dark } = useTheme();
  const [schedule, setSchedule] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isEditing, setIsEditing] = useState(null); // Stores ID of slot being edited

  const initialState = {
    day: "Monday",
    subject: "",
    type: "Theory",
    room: "",
    faculty: "",
    startTime: "09:00",
    endTime: "10:00",
  };

  const [entry, setEntry] = useState(initialState);

  useEffect(() => {
    fetchSchedule();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await api.get("/timetable");
      setSchedule(res.data || []);
    } catch (err) {
      toast.error("Failed to load timetable");
    }
  };

  const handleSubmit = async () => {
    if (!entry.subject && entry.type !== "Lunch") {
      return toast.error("Subject name is required");
    }

    try {
      if (isEditing) {
        // UPDATE LOGIC
        const res = await api.put(`/timetable/${isEditing}`, entry);
        setSchedule((prev) => prev.map(s => s._id === isEditing ? res.data : s));
        toast.success("Updated Successfully!");
      } else {
        // CREATE LOGIC
        const res = await api.post("/timetable", entry);
        setSchedule((prev) => [...prev, res.data]);
        toast.success("Scheduled Successfully!");
      }
      resetForm();
    } catch (err) {
      toast.error("Database sync failed");
    }
  };

  const resetForm = () => {
    setShowAdd(false);
    setIsEditing(null);
    setEntry(initialState);
  };

  const handleEditClick = (slot) => {
    setEntry({
      day: slot.day,
      subject: slot.subject,
      type: slot.type,
      room: slot.room,
      faculty: slot.faculty,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
    setIsEditing(slot._id);
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeSlot = async (id) => {
    if (!window.confirm("Delete this slot permanently?")) return;
    try {
      await api.delete(`/timetable/${id}`);
      setSchedule((prev) => prev.filter((slot) => slot._id !== id));
      toast.success("Slot Removed");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const checkIsLive = (day, start, end) => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    if (day !== dayNames[currentTime.getDay()]) return false;
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const [sH, sM] = start.split(":").map(Number);
    const [eH, eM] = end.split(":").map(Number);
    return now >= sH * 60 + sM && now < eH * 60 + eM;
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 relative transition-colors duration-500 ${dark ? "bg-[#0a0f1d] text-white" : "bg-slate-50 text-slate-900"}`}>
      <div className="fixed top-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
              Academic <span className="text-cyan-500">Scheduler</span>
            </h1>
            <p className="text-[10px] font-black tracking-[0.4em] opacity-40 uppercase mt-2">
              System Console • {isEditing ? "Editing Mode" : "View Mode"}
            </p>
          </div>
          <button
            onClick={() => isEditing ? resetForm() : setShowAdd(!showAdd)}
            className="glass px-8 py-4 rounded-3xl border border-cyan-500/30 text-cyan-500 font-black text-[10px] tracking-widest uppercase hover:bg-cyan-500 hover:text-white transition-all shadow-xl flex items-center gap-2"
          >
            {showAdd ? <HiOutlineX className="text-xl" /> : <HiOutlinePlus className="text-xl" />} 
            {showAdd ? "Cancel" : "Add New Slot"}
          </button>
        </header>

        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="glass p-8 rounded-[40px] border border-white/10 shadow-2xl space-y-6 overflow-hidden"
            >
              <h3 className="text-xl font-black italic uppercase text-cyan-500">
                {isEditing ? "Update Existing Slot" : "Register New Entry"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <select
                  value={entry.day}
                  onChange={(e) => setEntry({ ...entry, day: e.target.value })}
                  className="input-glass font-bold text-xs uppercase"
                >
                  {days.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <input
                  value={entry.subject}
                  onChange={(e) => setEntry({ ...entry, subject: e.target.value })}
                  placeholder="Subject Title"
                  className="input-glass font-bold"
                />
                <select
                  value={entry.type}
                  onChange={(e) => setEntry({ ...entry, type: e.target.value })}
                  className="input-glass font-bold text-xs uppercase"
                >
                  <option value="Theory">Theory</option>
                  <option value="Practical">Lab/Practical</option>
                  <option value="Lunch">Lunch Break</option>
                </select>
                <input
                  value={entry.room}
                  onChange={(e) => setEntry({ ...entry, room: e.target.value })}
                  placeholder="Room No"
                  className="input-glass"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input
                  value={entry.faculty}
                  onChange={(e) => setEntry({ ...entry, faculty: e.target.value })}
                  placeholder="Faculty Name"
                  className="input-glass"
                />
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black opacity-30 uppercase">Start</span>
                    <input type="time" value={entry.startTime} onChange={(e) => setEntry({ ...entry, startTime: e.target.value })} className="input-glass flex-1" />
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black opacity-30 uppercase">End</span>
                    <input type="time" value={entry.endTime} onChange={(e) => setEntry({ ...entry, endTime: e.target.value })} className="input-glass flex-1" />
                </div>
              </div>
              <button
                onClick={handleSubmit}
                className="w-full py-5 bg-cyan-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20"
              >
                {isEditing ? "Update Database Entry" : "Publish to Cloud"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-12">
          {days.map((day) => (
            <div key={day} className="space-y-6">
              <div className="flex items-center gap-4">
                 <h3 className="text-2xl font-black uppercase italic tracking-tighter text-cyan-500">{day}</h3>
                 <div className="h-px flex-1 bg-white/5" />
              </div>
              
              <div className="flex flex-nowrap overflow-x-auto gap-6 pb-6 scrollbar-hide">
                {schedule.filter((s) => s.day === day).length > 0 ? (
                  schedule
                    .filter((s) => s.day === day)
                    .sort((a,b) => a.startTime.localeCompare(b.startTime)) // Sort by time
                    .map((slot) => {
                      const isLive = checkIsLive(slot.day, slot.startTime, slot.endTime);
                      return (
                        <motion.div
                          key={slot._id}
                          layout
                          whileHover={{ y: -8 }}
                          className={`min-w-[300px] glass p-7 rounded-[40px] border transition-all relative group shadow-xl ${
                            isLive ? "border-cyan-400 bg-cyan-500/5" : "border-white/10"
                          }`}
                        >
                          {isLive && (
                            <div className="absolute top-6 right-6 text-cyan-400 animate-pulse flex items-center gap-1 font-black text-[8px] uppercase tracking-widest bg-cyan-400/10 px-2 py-1 rounded-full border border-cyan-400/20">
                              <HiOutlineStatusOnline className="text-xs" /> Live
                            </div>
                          )}

                          <div className="flex justify-between items-start mb-6">
                            <span className={`px-4 py-1.5 rounded-2xl text-[8px] font-black uppercase tracking-widest text-white shadow-lg ${
                                slot.type === "Practical" ? "bg-purple-500" : 
                                slot.type === "Lunch" ? "bg-amber-500" : "bg-cyan-500"
                            }`}>
                              {slot.type}
                            </span>
                            
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEditClick(slot)} className="p-2 bg-white/5 rounded-xl text-primary-400 hover:bg-white/10"><HiOutlinePencilAlt /></button>
                              <button onClick={() => removeSlot(slot._id)} className="p-2 bg-white/5 rounded-xl text-red-500 hover:bg-white/10"><HiOutlineTrash /></button>
                            </div>
                          </div>

                          <h4 className={`text-xl font-black uppercase tracking-tight mb-6 leading-tight ${isLive ? "text-cyan-400" : ""}`}>
                            {slot.subject || "Lunch Break"}
                          </h4>

                          <div className="space-y-3 opacity-50 text-[10px] font-black uppercase tracking-widest">
                            <div className="flex items-center gap-3">
                              <HiOutlineClock className="text-cyan-500 text-lg" /> {slot.startTime} — {slot.endTime}
                            </div>
                            {slot.type !== "Lunch" && (
                              <>
                                <div className="flex items-center gap-3">
                                  <HiOutlineLocationMarker className="text-cyan-500 text-lg" /> {slot.room || "TBA"}
                                </div>
                                <div className="flex items-center gap-3">
                                  <HiOutlineUser className="text-cyan-500 text-lg" /> {slot.faculty || "Staff"}
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                ) : (
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-10 py-10 px-4 border-2 border-dashed border-white/5 rounded-[40px] w-full text-center">
                    No Sessions Defined
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}