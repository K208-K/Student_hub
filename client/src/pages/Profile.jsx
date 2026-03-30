import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { PageHeader, Card } from '../components/UI';
import { 
  HiOutlineUser, 
  HiOutlinePencil, 
  HiOutlineCheck, 
  HiOutlineCamera,
  HiOutlineAcademicCap,
  HiOutlineIdentification,
  HiOutlineOfficeBuilding
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function Profile() {
  const { dark } = useTheme();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profilePic, setProfilePic] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    college: '',
    university: 'Quantum University',
    course: 'Bachelor of Technology',
    branch: '',
    semester: 6,
    section: 'Section-1',
    rollNo: '',
    studentType: 'Regular',
    courseType: 'Engineering'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user');
        setForm(prev => ({ ...prev, ...res.data }));
        setProfilePic(res.data.avatar || '');
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/user', { ...form, avatar: profilePic });
      setForm(res.data);
      setEditing(false);
      toast.success('Profile Synced Securely ✅');
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="relative min-h-screen p-4 md:p-8 overflow-hidden font-sans">
      {/* Background Ambient Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-400/10 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent-500/10 blur-[100px] pointer-events-none" />

      <PageHeader title="Student Profile" subtitle="Academic Identity & Information" icon={HiOutlineUser} />

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        
        {/* HEADER HERO CARD */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8 border border-white/20">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent pointer-events-none" />
            
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-primary-500/30 shadow-2xl relative">
                <img
                  src={profilePic || `https://ui-avatars.com/api/?name=${form.name}&background=random`}
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
                <AnimatePresence>
                  {editing && (
                    <motion.label 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm"
                    >
                      <HiOutlineCamera className="text-white text-3xl mb-1" />
                      <span className="text-[10px] text-white font-bold uppercase tracking-widest">Update</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                    </motion.label>
                  )}
                </AnimatePresence>
              </div>
              {!editing && <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center text-white" title="Active Student">✓</div>}
            </div>

            {/* Basic Info */}
            <div className="text-center md:text-left flex-1">
              <h2 className="text-4xl font-black gradient-text uppercase tracking-tighter mb-1">
                {form.name || "Student Name"}
              </h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                <span className="px-3 py-1 bg-primary-500/10 text-primary-500 border border-primary-500/20 rounded-lg text-xs font-bold uppercase tracking-wider">
                  {form.studentType}
                </span>
                <span className="px-3 py-1 bg-accent-500/10 text-accent-500 border border-accent-500/20 rounded-lg text-xs font-bold uppercase tracking-wider">
                  {form.courseType}
                </span>
                <span className="px-3 py-1 bg-black/5 dark:bg-white/5 rounded-lg text-xs font-semibold opacity-70">
                  Roll: {form.rollNo || "N/A"}
                </span>
              </div>
            </div>

            {/* Edit Toggle */}
            <button
              onClick={editing ? handleSave : () => setEditing(true)}
              className={`p-4 rounded-2xl shadow-lg transition-all ${editing ? 'bg-success-500 text-white shadow-success-500/30' : 'btn-glass text-primary-500'}`}
              disabled={saving}
            >
              {editing ? <HiOutlineCheck className="text-2xl" /> : <HiOutlinePencil className="text-2xl" />}
            </button>
          </div>
        </motion.div>

        {/* DETAILED INFORMATION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Institution Details */}
          <Card className="p-6">
            <h4 className="flex items-center gap-2 font-bold uppercase tracking-widest text-xs opacity-60 mb-6">
              <HiOutlineOfficeBuilding className="text-lg" /> University Information
            </h4>
            <div className="space-y-4">
              <ProfileInput label="University" value={form.university} edit={editing} onChange={(v) => update('university', v)} />
              <ProfileInput label="College / School" value={form.college} edit={editing} onChange={(v) => update('college', v)} icon={HiOutlineAcademicCap} />
              <ProfileInput label="Department" value={form.department} edit={editing} onChange={(v) => update('department', v)} />
            </div>
          </Card>

          {/* Academic Path */}
          <Card className="p-6">
            <h4 className="flex items-center gap-2 font-bold uppercase tracking-widest text-xs opacity-60 mb-6">
              <HiOutlineAcademicCap className="text-lg" /> Academic Records
            </h4>
            <div className="space-y-4">
              <ProfileInput label="Course" value={form.course} edit={editing} onChange={(v) => update('course', v)} />
              <ProfileInput label="Branch / Specialization" value={form.branch} edit={editing} onChange={(v) => update('branch', v)} />
              <div className="grid grid-cols-2 gap-4">
                <ProfileInput label="Semester" value={form.semester} edit={editing} type="number" onChange={(v) => update('semester', v)} />
                <ProfileInput label="Section" value={form.section} edit={editing} onChange={(v) => update('section', v)} />
              </div>
            </div>
          </Card>

          {/* Personal & Admin */}
          <Card className="md:col-span-2 p-6">
            <h4 className="flex items-center gap-2 font-bold uppercase tracking-widest text-xs opacity-60 mb-6">
              <HiOutlineIdentification className="text-lg" /> Administrative Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ProfileInput label="Contact Email" value={form.email} edit={false} />
              <ProfileInput label="Student Status" value={form.studentType} edit={editing} onChange={(v) => update('studentType', v)} />
              <ProfileInput label="Roll Number" value={form.rollNo} edit={editing} onChange={(v) => update('rollNo', v)} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Reusable Professional Input Component
function ProfileInput({ label, value, edit, onChange, type = "text", icon: Icon }) {
  const { dark } = useTheme();
  return (
    <div className="relative group">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1 mb-1 block">
        {label}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-primary-500 transition-colors" />}
        <input
          type={type}
          value={value}
          disabled={!edit}
          onChange={(e) => onChange(e.target.value)}
          className={`input-glass w-full font-bold text-sm py-3 transition-all ${Icon ? 'pl-10' : 'pl-4'} ${
            !edit ? 'opacity-80 border-transparent bg-black/5 dark:bg-white/5 cursor-not-allowed shadow-none' : 'focus:ring-2 focus:ring-primary-500/30'
          }`}
        />
      </div>
    </div>
  );
}