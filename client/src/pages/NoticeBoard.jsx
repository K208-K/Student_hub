import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  HiOutlineBell, 
  HiOutlinePlus, 
  HiOutlineTrash, 
  HiOutlineSpeakerphone,
  HiOutlineInbox
} from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function NoticeBoard() {
  const { dark } = useTheme();
  
  // --- STATE ---
  const [notices, setNotices] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newNotice, setNewNotice] = useState({ title: '', content: '', category: 'general' });

  const token = localStorage.getItem("token");

  // 🔥 LOAD FROM BACKEND (READ)
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/notices", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotices(res.data.notices || []);
      } catch (err) {
        console.error("Backend not connected yet, using empty state.");
      }
    };
    fetchNotices();
  }, [token]);

  // 🔥 ADD NOTICE (CREATE)
  const addNotice = async () => {
    if (!newNotice.title || !newNotice.content) return toast.error('Please fill all fields');
    
    try {
      const res = await axios.post(
        "http://localhost:5000/api/notices",
        newNotice,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotices(prev => [res.data.notice, ...prev]);
      setNewNotice({ title: '', content: '', category: 'general' });
      setShowAdd(false);
      toast.success('Broadcast sent!');
    } catch (err) {
      // Local fallback
      const localNotice = {
        ...newNotice,
        _id: Date.now().toString(),
        date: new Date().toISOString(),
        read: false
      };
      setNotices(prev => [localNotice, ...prev]);
      setNewNotice({ title: '', content: '', category: 'general' });
      setShowAdd(false);
      toast.success('Broadcast posted (Local Mode)');
    }
  };

  // 🔥 MARK AS READ (UPDATE)
  const markRead = async (id) => {
    // Optimistic UI update
    setNotices(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    
    try {
      await axios.put(`http://localhost:5000/api/notices/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.log("Mark read (Local Mode)");
    }
  };

  // 🔥 DELETE NOTICE (DELETE)
  const deleteNotice = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotices(prev => prev.filter(n => n._id !== id));
      toast.success('Notice deleted');
    } catch (err) {
      // Local fallback
      setNotices(prev => prev.filter(n => n._id !== id));
      toast.success('Notice deleted (Local Mode)');
    }
  };

  // --- HELPERS ---
  const unreadCount = notices.filter(n => !n.read).length;
  const filtered = notices.filter(n => filter === 'all' || n.category === filter);

  const catColors = { 
    general: 'bg-primary-500/20 text-primary-600 dark:text-primary-400 border-primary-500/30', 
    exam: 'bg-warning-500/20 text-warning-600 dark:text-warning-400 border-warning-500/30', 
    event: 'bg-accent-500/20 text-accent-600 dark:text-accent-400 border-accent-500/30', 
    urgent: 'bg-danger-500/20 text-danger-600 dark:text-danger-400 border-danger-500/30' 
  };
  
  const catBorders = {
    general: 'border-l-primary-500',
    exam: 'border-l-warning-500',
    event: 'border-l-accent-500',
    urgent: 'border-l-danger-500'
  };

  const catIcons = { general: '📌', exam: '📝', event: '🎉', urgent: '🚨' };

  return (
    <div className="relative min-h-screen p-6 md:p-12 overflow-hidden font-sans text-sm md:text-base">
      
      {/* --- AMBIENT ORBS --- */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-400/20 blur-[100px] pointer-events-none" />
      <div className="fixed top-[40%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-accent-500/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-warning-500/15 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        
        {/* HEADER & UNREAD WIDGET */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/20 rounded-2xl text-primary-500 backdrop-blur-md border border-primary-500/30 shadow-lg">
              <HiOutlineSpeakerphone className="text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text inline-block">Broadcast Hub</h1>
              <p className="opacity-70 text-sm mt-1">Official notices, events, and alerts</p>
            </div>
          </div>

          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="relative flex h-4 w-4">
              {unreadCount > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75"></span>}
              <span className="relative inline-flex rounded-full h-4 w-4 bg-danger-500"></span>
            </div>
            <div className="font-bold">
              <span className="text-xl mr-2 text-danger-500">{unreadCount}</span>
              <span className="text-sm opacity-70 uppercase tracking-widest">Unread</span>
            </div>
          </div>
        </div>

        {/* 🎛️ CONTROL PANEL (Filters + Post Button) */}
        <div className="glass p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xl">
          
          {/* Scrollable Filters */}
          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide snap-x">
            {['all', 'general', 'exam', 'event', 'urgent'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap snap-center border ${
                  filter === f 
                    ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/30' 
                    : 'bg-black/5 dark:bg-white/5 border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                {f === 'all' ? 'All Updates' : `${catIcons[f]} ${f}`}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setShowAdd(p => !p)} 
            className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shrink-0"
          >
            <HiOutlinePlus className="text-lg" /> {showAdd ? 'Cancel' : 'New Post'}
          </button>
        </div>

        {/* 🚀 COMPOSE NEW NOTICE */}
        <AnimatePresence>
          {showAdd && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="glass p-6 md:p-8 shadow-xl mb-4 border border-primary-500/30">
                <h3 className="text-xl font-bold mb-6 gradient-text">Compose Broadcast</h3>
                
                <div className="space-y-4">
                  <input 
                    value={newNotice.title} 
                    onChange={e => setNewNotice(p => ({ ...p, title: e.target.value }))} 
                    placeholder="Headline / Subject" 
                    className="input-glass w-full outline-none focus:ring-2 focus:ring-primary-500/50 font-bold text-lg" 
                  />
                  
                  <textarea 
                    value={newNotice.content} 
                    onChange={e => setNewNotice(p => ({ ...p, content: e.target.value }))} 
                    placeholder="Write your announcement here..." 
                    className="input-glass w-full outline-none focus:ring-2 focus:ring-primary-500/50 resize-none py-3" 
                    rows="4" 
                  />
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <div className="flex-1">
                      <label className="text-xs uppercase tracking-wider opacity-60 font-semibold mb-2 block pl-1">Category</label>
                      <select 
                        value={newNotice.category} 
                        onChange={e => setNewNotice(p => ({ ...p, category: e.target.value }))} 
                        className={`input-glass w-full outline-none focus:ring-2 focus:ring-primary-500/50 ${dark ? 'bg-surface-800' : 'bg-white'}`}
                      >
                        {Object.keys(catIcons).map(c => (
                          <option key={c} value={c}>{catIcons[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <button onClick={addNotice} className="w-full sm:w-auto bg-primary-500 text-white px-10 py-3 rounded-xl font-bold shadow-lg transition-all hover:bg-primary-600 hover:scale-105 active:scale-95">
                        Publish
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 📜 NOTICES FEED */}
        <div className="space-y-4 relative z-10">
          <AnimatePresence>
            {filtered.map((n, i) => (
              <motion.div 
                key={n._id} 
                layout
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, x: -50 }} 
                transition={{ delay: i * 0.05 }}
              >
                <div 
                  onClick={() => !n.read && markRead(n._id)}
                  className={`glass p-6 md:p-8 relative overflow-hidden transition-all duration-300 group ${
                    n.read 
                      ? 'opacity-70 bg-black/5 dark:bg-white/5 border-transparent shadow-sm' 
                      : `shadow-xl cursor-pointer hover:shadow-2xl border-l-4 ${catBorders[n.category]} hover:bg-white/40 dark:hover:bg-white/5`
                  }`}
                >
                  
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      
                      {/* Meta Data Row */}
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${catColors[n.category]}`}>
                          {catIcons[n.category]} {n.category}
                        </span>
                        <span className="text-xs font-semibold opacity-50">
                          {new Date(n.date || Date.now()).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {!n.read && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                          </span>
                        )}
                      </div>
                      
                      <h3 className={`text-xl font-bold mb-2 transition-colors ${n.read ? 'opacity-80' : 'text-primary-600 dark:text-primary-400'}`}>
                        {n.title}
                      </h3>
                      <p className="text-sm opacity-80 leading-relaxed max-w-3xl whitespace-pre-wrap">
                        {n.content}
                      </p>

                    </div>

                    {/* Delete Button (Visible on hover for read, or always for admins) */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteNotice(n._id); }} 
                      className={`p-3 text-danger-500 hover:bg-danger-500/20 rounded-xl transition-all shrink-0 ${n.read ? 'opacity-0 group-hover:opacity-100' : 'opacity-50 hover:opacity-100'}`}
                      title="Delete Broadcast"
                    >
                      <HiOutlineTrash className="text-xl" />
                    </button>

                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* EMPTY STATE */}
          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-12 text-center shadow-xl border-dashed flex flex-col items-center">
              <HiOutlineInbox className="text-6xl mb-4 opacity-30" />
              <h3 className="text-xl font-bold mb-2">Inbox Empty</h3>
              <p className="opacity-60">There are no {filter !== 'all' ? filter : ''} broadcasts to show right now.</p>
            </motion.div>
          )}

        </div>

      </div>
    </div>
  );
}