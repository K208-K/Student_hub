import { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  HiOutlineBookOpen,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineClock,
  HiCheck,
  HiOutlineExclamation,
  HiOutlineFilter
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const PRIORITY_STYLES = {
  high: 'border-red-500 text-red-500',
  medium: 'border-yellow-500 text-yellow-500',
  low: 'border-green-500 text-green-500'
};

export default function Homework() {
  const { dark } = useTheme();

  const [homework, setHomework] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all | pending | done
  const [newHW, setNewHW] = useState({
    title: '',
    subject: '',
    description: '',
    dueDate: '',
    priority: 'medium'
  });

  // Load homework from backend
  useEffect(() => {
    const fetchHomework = async () => {
      try {
        const res = await api.get('/homework');
        setHomework(res.data.homework || []);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchHomework();
  }, []);

  // Add new homework
  const addHomework = async () => {
    if (!newHW.title.trim() || !newHW.subject.trim()) {
      return toast.error('Title and subject are required.');
    }
    try {
      const res = await api.post('/homework', newHW);
      setHomework(prev => [res.data, ...prev]);
      setNewHW({ title: '', subject: '', description: '', dueDate: '', priority: 'medium' });
      setShowForm(false);
      toast.success('Homework added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add homework.');
    }
  };

  // Toggle completed
  const toggleDone = async (id, completed) => {
    try {
      const res = await api.patch(`/homework/${id}`, { completed: !completed });
      setHomework(prev => prev.map(h => h._id === id ? res.data : h));
    } catch (err) {
      toast.error('Failed to update homework.');
    }
  };

  // Delete homework
  const deleteHomework = async (id) => {
    try {
      await api.delete(`/homework/${id}`);
      setHomework(prev => prev.filter(h => h._id !== id));
      toast.success('Homework removed.');
    } catch (err) {
      toast.error('Failed to delete homework.');
    }
  };

  // Filter
  const filtered = homework.filter(h => {
    if (filter === 'pending') return !h.completed;
    if (filter === 'done') return h.completed;
    return true;
  });

  const pendingCount = homework.filter(h => !h.completed).length;
  const doneCount = homework.filter(h => h.completed).length;

  return (
    <div className={`relative min-h-screen p-6 md:p-12 overflow-hidden font-sans transition-colors duration-500 ${dark ? 'text-white' : 'text-slate-900'}`}>

      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-yellow-500/10 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-yellow-500/20 rounded-3xl text-yellow-400 border border-yellow-500/20 backdrop-blur-xl">
              <HiOutlineBookOpen className="text-4xl" />
            </div>
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter uppercase">Homework Hub</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Assignment Tracker / Due Dates</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="glass px-6 py-3 rounded-[24px] border border-white/10 text-center">
              <p className="text-2xl font-black text-yellow-400">{pendingCount}</p>
              <p className="text-[9px] font-black uppercase opacity-40 tracking-widest">Pending</p>
            </div>
            <div className="glass px-6 py-3 rounded-[24px] border border-white/10 text-center">
              <p className="text-2xl font-black text-green-400">{doneCount}</p>
              <p className="text-[9px] font-black uppercase opacity-40 tracking-widest">Done</p>
            </div>
          </div>
        </div>

        {/* CONTROL BAR */}
        <div className="glass p-5 rounded-[35px] flex flex-col sm:flex-row gap-4 items-center justify-between border border-white/10 shadow-xl">
          {/* Filter Tabs */}
          <div className="flex gap-2">
            {['all', 'pending', 'done'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30' : 'bg-white/5 opacity-50 hover:opacity-100'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowForm(p => !p)}
            className="flex items-center gap-3 px-8 py-3 bg-yellow-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-yellow-500/30 hover:scale-105 transition-all"
          >
            <HiOutlinePlus className="text-lg" /> {showForm ? 'Cancel' : 'Add Homework'}
          </button>
        </div>

        {/* ADD FORM */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="glass p-8 rounded-[40px] border border-yellow-500/20 shadow-2xl">
                <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-3">
                  <HiOutlinePlus className="text-yellow-400" /> New Assignment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest opacity-40 font-black mb-2 block ml-1">Title *</label>
                    <input
                      value={newHW.title}
                      onChange={e => setNewHW(p => ({ ...p, title: e.target.value }))}
                      placeholder="e.g. Math Assignment 3"
                      className="input-glass w-full p-4 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest opacity-40 font-black mb-2 block ml-1">Subject *</label>
                    <input
                      value={newHW.subject}
                      onChange={e => setNewHW(p => ({ ...p, subject: e.target.value }))}
                      placeholder="e.g. Mathematics"
                      className="input-glass w-full p-4"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest opacity-40 font-black mb-2 block ml-1">Due Date</label>
                    <input
                      type="date"
                      value={newHW.dueDate}
                      onChange={e => setNewHW(p => ({ ...p, dueDate: e.target.value }))}
                      className="input-glass w-full p-4"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest opacity-40 font-black mb-2 block ml-1">Priority</label>
                    <div className="flex gap-3">
                      {['high', 'medium', 'low'].map(pr => (
                        <button
                          key={pr}
                          onClick={() => setNewHW(p => ({ ...p, priority: pr }))}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${newHW.priority === pr ? 'bg-yellow-500 text-white shadow-lg' : 'bg-white/5 opacity-50'}`}
                        >
                          {pr}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest opacity-40 font-black mb-2 block ml-1">Description</label>
                    <textarea
                      value={newHW.description}
                      onChange={e => setNewHW(p => ({ ...p, description: e.target.value }))}
                      placeholder="Optional details..."
                      rows={3}
                      className="input-glass w-full p-4 resize-none"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={addHomework}
                    className="bg-yellow-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-yellow-500/40 hover:scale-105 transition-all"
                  >
                    Save Assignment
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HOMEWORK LIST */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center opacity-20">
            <HiOutlineBookOpen className="text-6xl mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest text-xs">No assignments here. Stay ahead!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map(hw => (
                <motion.div
                  key={hw._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`glass p-6 rounded-[30px] border border-white/10 group flex items-start gap-5 transition-all hover:border-yellow-500/30 shadow-xl ${hw.completed ? 'opacity-50' : ''}`}
                >
                  {/* Complete toggle */}
                  <button
                    onClick={() => toggleDone(hw._id, hw.completed)}
                    className={`mt-1 w-8 h-8 shrink-0 rounded-xl border-2 flex items-center justify-center transition-all ${hw.completed ? 'bg-green-500 border-green-500 text-white' : 'border-white/20 hover:border-yellow-500'}`}
                  >
                    {hw.completed && <HiCheck className="text-sm" />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h3 className={`text-lg font-black italic tracking-tighter ${hw.completed ? 'line-through' : ''}`}>
                        {hw.title}
                      </h3>
                      <span className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase border ${PRIORITY_STYLES[hw.priority]}`}>
                        {hw.priority}
                      </span>
                    </div>
                    <p className="text-[10px] font-black uppercase opacity-30 tracking-widest mb-1">{hw.subject}</p>
                    {hw.description && (
                      <p className="text-[11px] opacity-60 mt-1">{hw.description}</p>
                    )}
                    {hw.dueDate && (
                      <div className="flex items-center gap-1 mt-2">
                        <HiOutlineClock className="text-xs text-yellow-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">
                          Due: {(() => { const d = new Date(hw.dueDate); return isNaN(d.getTime()) ? hw.dueDate : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); })()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteHomework(hw._id)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 p-2 hover:bg-red-500/10 rounded-xl transition-all shrink-0"
                  >
                    <HiOutlineTrash className="text-lg" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
