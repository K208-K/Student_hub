import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  HiOutlineMail, 
  HiOutlineLockClosed, 
  HiOutlineUser, 
  HiOutlineAcademicCap,
  HiOutlineIdentification,
  HiOutlineBookOpen
} from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', department: '', semester: 1, rollNo: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await register(form);
        toast.success('Account created successfully!');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 overflow-hidden relative ${dark ? 'bg-[#0f172a]' : 'bg-[#f1f5f9]'}`}>
      
      {/* Dynamic Background Orbs (Vibrant colors from image) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-400/30 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-500/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-5xl flex flex-col md:flex-row shadow-2xl rounded-[40px] overflow-hidden border border-white/20 backdrop-blur-md z-10"
      >
        {/* LEFT SIDE: WELCOME PANEL (Frosted Blue) */}
        <div className="md:w-5/12 bg-gradient-to-br from-cyan-500/80 to-blue-600/80 p-12 text-white flex flex-col justify-center items-center text-center relative">
            
            {/* StudentHub Branding in Front */}
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-8 flex flex-col items-center"
            >
                <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center mb-4 shadow-xl border border-white/30">
                    <HiOutlineBookOpen className="text-4xl text-white" />
                </div>
                <h2 className="text-3xl font-black tracking-tighter uppercase italic">StudentHub</h2>
                <div className="h-1 w-12 bg-white rounded-full mt-2" />
            </motion.div>
            
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <h1 className="text-4xl font-black mb-4 leading-tight">Welcome Back!</h1>
                <p className="text-base opacity-90 font-medium max-w-xs">
                    Your personal academic command center. Log in to access your notes, internal marks, and AI tutor.
                </p>
                
                <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="mt-10 px-10 py-3 border-2 border-white rounded-full font-bold hover:bg-white hover:text-blue-600 transition-all active:scale-95 text-sm tracking-widest"
                >
                    {isLogin ? "CREATE ACCOUNT" : "SIGN IN INSTEAD"}
                </button>
            </motion.div>
        </div>

        {/* RIGHT SIDE: FORM PANEL (Clean White/Dark Glass) */}
        <div className={`md:w-7/12 p-8 md:p-16 flex flex-col justify-center ${dark ? 'bg-slate-900/60' : 'bg-white/70'}`}>
          <div className="mb-8">
            <h2 className={`text-4xl font-black mb-2 ${dark ? 'text-white' : 'text-slate-800'}`}>
                {isLogin ? 'Login' : 'Join Us'}
            </h2>
            <p className="text-sm opacity-50 font-bold tracking-widest uppercase">
                {isLogin ? 'Sign in to your account' : 'Register your student profile'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
                {!isLogin && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <div className="relative group">
                            <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50 group-focus-within:text-cyan-500 transition-colors" />
                            <input type="text" placeholder="Full Name" value={form.name} onChange={e => update('name', e.target.value)}
                                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none border transition-all ${dark ? 'bg-slate-800/50 border-white/10 text-white focus:border-cyan-500' : 'bg-slate-100 border-slate-200 focus:border-cyan-500'}`} required />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <HiOutlineAcademicCap className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
                                <input placeholder="College" value={form.college} onChange={e => update('college', e.target.value)}
                                    className={`w-full pl-12 pr-4 py-3 rounded-2xl border ${dark ? 'bg-slate-800/50 border-white/10 text-white' : 'bg-slate-100 border-slate-200'}`} />
                            </div>
                            <div className="relative">
                                <HiOutlineIdentification className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
                                <input placeholder="Roll No" value={form.rollNo} onChange={e => update('rollNo', e.target.value)}
                                    className={`w-full pl-12 pr-4 py-3 rounded-2xl border ${dark ? 'bg-slate-800/50 border-white/10 text-white' : 'bg-slate-100 border-slate-200'}`} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative group">
              <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50 group-focus-within:text-cyan-500 transition-colors" />
              <input type="email" placeholder="Email Address" value={form.email} onChange={e => update('email', e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none border transition-all ${dark ? 'bg-slate-800/50 border-white/10 text-white focus:border-cyan-500' : 'bg-slate-100 border-slate-200 focus:border-cyan-500'}`} required />
            </div>

            <div className="relative group">
              <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50 group-focus-within:text-cyan-500 transition-colors" />
              <input type="password" placeholder="Password" value={form.password} onChange={e => update('password', e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none border transition-all ${dark ? 'bg-slate-800/50 border-white/10 text-white focus:border-cyan-500' : 'bg-slate-100 border-slate-200 focus:border-cyan-500'}`} required />
            </div>

            <div className="flex items-center justify-between text-[10px] font-black uppercase opacity-50 tracking-widest">
                <label className="flex items-center gap-2 cursor-pointer hover:opacity-100 transition-opacity">
                    <input type="checkbox" className="accent-cyan-500 w-4 h-4" /> Remember me
                </label>
                <button type="button" className="hover:text-cyan-500 transition-colors">Forgot password?</button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(6, 182, 212, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-lg uppercase tracking-[0.2em] shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isLogin ? 'SIGN IN' : 'GET STARTED'
              )}
            </motion.button>
          </form>

          <p className="text-center mt-10 text-sm opacity-50 font-bold">
            {isLogin ? "New here?" : "Already a member?"} <span onClick={() => setIsLogin(!isLogin)} className="text-cyan-600 dark:text-cyan-400 cursor-pointer hover:underline underline-offset-4 ml-1">
                {isLogin ? 'Create Account' : 'Sign In'}
            </span>
          </p>
        </div>
      </motion.div>

      {/* Footer Branding Signature */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 left-0 w-full text-center"
      >
        <p className={`text-[10px] font-black uppercase tracking-[0.5em] transition-all hover:opacity-100 cursor-default ${dark ? 'text-white' : 'text-slate-900'}`}>
          Designed & Created by <span className="text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">K208</span>
        </p>
      </motion.div>

    </div>
  );
}