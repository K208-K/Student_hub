import { useState, useEffect } from 'react';
import api from "../utils/api"; // Centralized API utility
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  HiOutlineDocumentText,
  HiOutlineUpload,
  HiOutlineDownload,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineFilter,
  HiOutlineFolderOpen
} from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function Notes() {
  const { dark } = useTheme();

  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);

  // 🔥 FILTER STATES
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");

  const [newNote, setNewNote] = useState({
    title: '',
    subject: '',
    type: 'notes',
    semester: 1,
    description: ''
  });

  // Base URL for viewing uploaded files (derived from your API config)
  const FILE_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // 🔥 LOAD NOTES (Production Ready)
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get("/notes");
        setNotes(res.data.notes || []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchNotes();
  }, []);

  // 🔥 UPLOAD (Multipart handling)
  const handleUpload = async () => {
    if (!newNote.title || !newNote.subject || !file) {
      return toast.error("Please fill all required fields and select a file.");
    }

    const formData = new FormData();
    Object.keys(newNote).forEach(key => formData.append(key, newNote[key]));
    formData.append("file", file);

    try {
      // Note: We use 'api' utility but must specify Content-Type for files
      const res = await api.post("/notes", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setNotes(p => [...p, res.data]);
      setShowUpload(false);
      setFile(null);
      setNewNote({ title: '', subject: '', type: 'notes', semester: 1, description: '' });
      toast.success("File Uploaded Successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed.");
    }
  };

  // 🔥 DELETE
  const deleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes(p => p.filter(n => n._id !== id));
      toast.success("Note Deleted");
    } catch (err) {
      toast.error("Failed to delete note");
    }
  };

  // 🔍 FILTER LOGIC
  const filteredNotes = notes.filter(n => {
    return (
      n.title.toLowerCase().includes(search.toLowerCase()) &&
      (selectedSubject === "all" || n.subject === selectedSubject) &&
      (selectedType === "all" || n.type === selectedType) &&
      (selectedSemester === "all" || n.semester == selectedSemester)
    );
  });

  const subjects = [...new Set(notes.map(n => n.subject))];

  const getTypeStyles = (type) => {
    switch(type) {
      case 'pyq': return 'bg-warning-500/10 text-warning-500 border-warning-500/20';
      case 'resource': return 'bg-success-500/10 text-success-500 border-success-500/20';
      default: return 'bg-primary-500/10 text-primary-500 border-primary-500/20';
    }
  };

  return (
    <div className={`relative min-h-screen p-6 md:p-12 overflow-hidden font-sans transition-colors duration-500 ${dark ? 'text-white' : 'text-slate-900'}`}>
      
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-500/10 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-primary-500/20 rounded-3xl text-primary-500 border border-primary-500/20 backdrop-blur-xl">
              <HiOutlineFolderOpen className="text-4xl" />
            </div>
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter uppercase">Knowledge Vault</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Command Center / Materials</p>
            </div>
          </div>
          <button 
            onClick={() => setShowUpload(p => !p)} 
            className="btn-glass px-8 py-3 flex items-center gap-3 text-xs font-black uppercase tracking-widest hover:scale-105 transition-all"
          >
            <HiOutlineUpload className="text-xl text-primary-500" /> {showUpload ? 'Close' : 'Upload File'}
          </button>
        </div>

        {/* UPLOAD DRAWER */}
        <AnimatePresence>
          {showUpload && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="glass p-8 rounded-[40px] border border-primary-500/20 shadow-2xl mb-8 relative">
                <h3 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3">
                  <HiOutlineUpload className="text-primary-500" /> New Entry
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest opacity-40 font-black mb-2 block ml-1">Document Title</label>
                      <input value={newNote.title} onChange={(e) => setNewNote(p => ({ ...p, title: e.target.value }))} placeholder="Title..." className="input-glass w-full p-4 font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest opacity-40 font-black mb-2 block ml-1">Subject Area</label>
                      <input value={newNote.subject} onChange={(e) => setNewNote(p => ({ ...p, subject: e.target.value }))} placeholder="Subject..." className="input-glass w-full p-4" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-widest opacity-40 font-black mb-2 block ml-1">Category</label>
                        <select value={newNote.type} onChange={(e) => setNewNote(p => ({ ...p, type: e.target.value }))} className="input-glass w-full p-4 text-[10px] font-black uppercase">
                          <option value="notes">Notes</option>
                          <option value="pyq">PYQ</option>
                          <option value="resource">Resource</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest opacity-40 font-black mb-2 block ml-1">Semester</label>
                        <select value={newNote.semester} onChange={(e) => setNewNote(p => ({ ...p, semester: e.target.value }))} className="input-glass w-full p-4 text-[10px] font-black uppercase">
                          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest opacity-40 font-black mb-2 block ml-1">Description</label>
                      <input value={newNote.description} onChange={(e) => setNewNote(p => ({ ...p, description: e.target.value }))} placeholder="Description..." className="input-glass w-full p-4" />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex flex-col sm:flex-row gap-6 items-center bg-white/5 p-6 rounded-[30px] border border-white/5">
                      <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-xs file:btn-glass file:mr-4" />
                      <button onClick={handleUpload} className="w-full sm:w-auto bg-primary-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary-500/40">Confirm Upload</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONTROL PANEL */}
        <div className="glass p-6 rounded-[35px] flex flex-col lg:flex-row gap-6 border border-white/10 shadow-xl">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-xl opacity-20" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH REPOSITORY..." className="input-glass w-full pl-14 p-4 text-[10px] font-black uppercase tracking-widest" />
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="input-glass p-3 text-[10px] font-black uppercase">
              <option value="all">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="input-glass p-3 text-[10px] font-black uppercase">
              <option value="all">All Types</option>
              <option value="notes">Notes</option>
              <option value="pyq">PYQ</option>
              <option value="resource">Resource</option>
            </select>
          </div>
        </div>

        {/* NOTES GRID */}
        {filteredNotes.length === 0 ? (
          <div className="py-20 text-center opacity-20">
             <HiOutlineDocumentText className="text-6xl mx-auto mb-4" />
             <p className="font-black uppercase tracking-widest text-xs">No documents found in registry.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {filteredNotes.map(note => (
                <motion.div key={note._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass flex flex-col rounded-[40px] border border-white/10 group overflow-hidden hover:border-primary-500/50 transition-all shadow-xl">
                  <div className="p-7 flex-1 flex flex-col">
                    <div className="flex justify-between mb-6">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${getTypeStyles(note.type)}`}>{note.type}</span>
                      <span className="text-[8px] font-black uppercase opacity-40">Sem {note.semester}</span>
                    </div>
                    <h3 className="text-xl font-black italic tracking-tighter uppercase mb-1 line-clamp-2">{note.title}</h3>
                    <p className="text-[10px] font-black uppercase opacity-30 tracking-widest mb-6">{note.subject}</p>
                    
                    {/* Iframe Preview using Server Base URL */}
                    <div className="relative w-full h-40 bg-black/40 rounded-[25px] overflow-hidden mt-auto border border-white/5">
                      <iframe
                        src={`${FILE_BASE_URL}/uploads/${note.fileName}`}
                        className="w-full h-[200%] origin-top scale-50 opacity-40 group-hover:opacity-100 transition-opacity"
                        loading="lazy"
                        scrolling="no"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 border-t border-white/5 bg-white/5">
                    <a href={`${FILE_BASE_URL}/uploads/${note.fileName}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-5 text-[10px] font-black uppercase tracking-widest text-primary-400 hover:bg-primary-500/10 transition-all border-r border-white/5">
                      <HiOutlineDownload /> Open
                    </a>
                    <button onClick={() => deleteNote(note._id)} className="flex items-center justify-center gap-2 py-5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all">
                      <HiOutlineTrash /> Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}