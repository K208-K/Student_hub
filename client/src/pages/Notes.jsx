import { useState, useEffect } from 'react';
import axios from "axios";
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

  const token = localStorage.getItem("token");

  // 🔥 LOAD NOTES
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/notes", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotes(res.data.notes || []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchNotes();
  }, [token]);

  // 🔥 UPLOAD
  const handleUpload = async () => {
    if (!newNote.title || !newNote.subject || !file) {
      return toast.error("Please fill all required fields and select a file.");
    }

    const formData = new FormData();
    Object.keys(newNote).forEach(key => formData.append(key, newNote[key]));
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/notes",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setNotes(p => [...p, res.data]);
      setShowUpload(false);
      setFile(null);
      setNewNote({ title: '', subject: '', type: 'notes', semester: 1, description: '' });
      toast.success("File Uploaded Successfully!");
    } catch (err) {
      toast.error("Upload failed.");
      console.error(err);
    }
  };

  // 🔥 DELETE
  const deleteNote = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  // Helper for badge colors
  const getTypeStyles = (type) => {
    switch(type) {
      case 'pyq': return 'bg-warning-500/10 text-warning-500 border-warning-500/20';
      case 'resource': return 'bg-success-500/10 text-success-500 border-success-500/20';
      default: return 'bg-primary-500/10 text-primary-500 border-primary-500/20';
    }
  };

  return (
    <div className="relative min-h-screen p-6 md:p-12 overflow-hidden font-sans text-sm md:text-base">
      
      {/* Background Ambient Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-400/20 blur-[100px] pointer-events-none" />
      <div className="fixed top-[30%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent-500/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-primary-600/20 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/20 rounded-2xl text-primary-500 backdrop-blur-md border border-primary-500/30 shadow-lg">
              <HiOutlineFolderOpen className="text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text inline-block">Knowledge Vault</h1>
              <p className="opacity-70 text-sm mt-1">Upload, preview & manage your study materials</p>
            </div>
          </div>
          <button 
            onClick={() => setShowUpload(p => !p)} 
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <HiOutlineUpload className="text-xl" /> {showUpload ? 'Close Upload' : 'Upload Material'}
          </button>
        </div>

        {/* 🚀 UPLOAD DRAWER */}
        <AnimatePresence>
          {showUpload && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="glass p-6 md:p-8 shadow-xl mb-4 border border-primary-500/30 relative">
                <div className="absolute inset-0 bg-primary-500/5 pointer-events-none rounded-[16px]" />
                
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <HiOutlineUpload className="text-primary-500" /> New Document Entry
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider opacity-60 font-semibold mb-1 block pl-1">Document Title *</label>
                      <input
                        value={newNote.title}
                        onChange={(e) => setNewNote(p => ({ ...p, title: e.target.value }))}
                        placeholder="e.g. Chapter 4 Thermodynamics"
                        className="input-glass w-full outline-none focus:ring-2 focus:ring-primary-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider opacity-60 font-semibold mb-1 block pl-1">Subject *</label>
                      <input
                        value={newNote.subject}
                        onChange={(e) => setNewNote(p => ({ ...p, subject: e.target.value }))}
                        placeholder="e.g. Physics 101"
                        className="input-glass w-full outline-none focus:ring-2 focus:ring-primary-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs uppercase tracking-wider opacity-60 font-semibold mb-1 block pl-1">Material Type</label>
                        <select
                          value={newNote.type}
                          onChange={(e) => setNewNote(p => ({ ...p, type: e.target.value }))}
                          className={`input-glass w-full outline-none focus:ring-2 focus:ring-primary-500/50 ${dark ? 'bg-surface-800' : 'bg-white'}`}
                        >
                          <option value="notes">Notes</option>
                          <option value="pyq">Past Year Paper (PYQ)</option>
                          <option value="resource">Resource / Book</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wider opacity-60 font-semibold mb-1 block pl-1">Semester</label>
                        <select
                          value={newNote.semester}
                          onChange={(e) => setNewNote(p => ({ ...p, semester: e.target.value }))}
                          className={`input-glass w-full outline-none focus:ring-2 focus:ring-primary-500/50 ${dark ? 'bg-surface-800' : 'bg-white'}`}
                        >
                          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider opacity-60 font-semibold mb-1 block pl-1">Description (Optional)</label>
                      <input
                        value={newNote.description}
                        onChange={(e) => setNewNote(p => ({ ...p, description: e.target.value }))}
                        placeholder="Brief details about this file..."
                        className="input-glass w-full outline-none focus:ring-2 focus:ring-primary-500/50"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 mt-2">
                    <label className="text-xs uppercase tracking-wider opacity-60 font-semibold mb-1 block pl-1">File Attachment *</label>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <input 
                        type="file" 
                        onChange={(e) => setFile(e.target.files[0])} 
                        className="input-glass w-full sm:flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary-500/20 file:text-primary-600 dark:file:text-primary-400 hover:file:bg-primary-500/30 cursor-pointer"
                      />
                      <button onClick={handleUpload} className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg">
                        Submit File
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🔍 CONTROL PANEL (SEARCH + FILTERS) */}
        <div className="glass p-4 rounded-2xl flex flex-col lg:flex-row gap-4 shadow-xl z-20 relative">
          
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title..."
              className="input-glass w-full pl-12 py-3 outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 px-2 opacity-60">
              <HiOutlineFilter /> <span className="text-sm font-bold uppercase tracking-wider">Filters:</span>
            </div>
            
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className={`input-glass py-3 outline-none focus:ring-2 focus:ring-primary-500/50 ${dark ? 'bg-surface-800' : 'bg-white'}`}
            >
              <option value="all">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`input-glass py-3 outline-none focus:ring-2 focus:ring-primary-500/50 ${dark ? 'bg-surface-800' : 'bg-white'}`}
            >
              <option value="all">All Types</option>
              <option value="notes">Notes</option>
              <option value="pyq">PYQ</option>
              <option value="resource">Resource</option>
            </select>

            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className={`input-glass py-3 outline-none focus:ring-2 focus:ring-primary-500/50 ${dark ? 'bg-surface-800' : 'bg-white'}`}
            >
              <option value="all">All Sems</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
          </div>

        </div>

        {/* 📄 NOTES GRID */}
        {filteredNotes.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-12 text-center shadow-xl border-dashed flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
              <HiOutlineDocumentText className="text-4xl opacity-40" />
            </div>
            <h3 className="text-xl font-bold mb-2">No materials found</h3>
            <p className="opacity-60 max-w-sm">Try adjusting your filters or upload a new document to your vault.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredNotes.map(note => (
                <motion.div 
                  key={note._id} 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  className="glass flex flex-col h-full shadow-lg hover:shadow-2xl transition-all group overflow-hidden"
                >
                  
                  {/* Card Content Top */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4 gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getTypeStyles(note.type)}`}>
                        {note.type}
                      </span>
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/5 dark:bg-white/10 opacity-80">
                        Sem {note.semester}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold line-clamp-2 leading-tight mb-1" title={note.title}>
                      {note.title}
                    </h3>
                    <p className="text-xs opacity-60 font-semibold uppercase tracking-wider mb-4 line-clamp-1">
                      {note.subject}
                    </p>

                    {note.description && (
                      <p className="text-sm opacity-70 line-clamp-2 mb-4">
                        {note.description}
                      </p>
                    )}

                    {/* Styled Iframe Container */}
                    <div className="relative w-full h-32 bg-black/5 dark:bg-white/5 rounded-xl overflow-hidden mt-auto border border-black/10 dark:border-white/10 group-hover:border-primary-500/30 transition-colors">
                      <div className="absolute inset-0 z-10 bg-transparent group-hover:bg-primary-500/10 transition-colors pointer-events-none" />
                      <iframe
                        src={`http://localhost:5000/uploads/${note.fileName}`}
                        className="w-full h-[200%] transform origin-top scale-50 opacity-80 group-hover:opacity-100 transition-opacity"
                        loading="lazy"
                        title={note.title}
                        scrolling="no"
                      />
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="grid grid-cols-2 border-t border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                    <a
                      href={`http://localhost:5000/uploads/${note.fileName}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-500/10 transition-colors border-r border-black/10 dark:border-white/10"
                    >
                      <HiOutlineDownload className="text-lg" /> Open
                    </a>
                    <button
                      onClick={() => deleteNote(note._id)}
                      className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-danger-500 hover:bg-danger-500/10 transition-colors"
                    >
                      <HiOutlineTrash className="text-lg" /> Delete
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