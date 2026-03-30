import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import GPACalculator from './pages/GPACalculator';
import InternalMarks from './pages/InternalMarks';
import StudyPlanner from './pages/StudyPlanner';
import Notes from './pages/Notes';
import GPAGoal from './pages/GPAGoal';
import Placement from './pages/Placement';
import BunkPlanner from './pages/BunkPlanner';
import ExamCountdown from './pages/ExamCountdown';
import NoticeBoard from './pages/NoticeBoard';
import AIDoubtSolver from './pages/AIDoubtSolver';
import Profile from './pages/Profile';

// 1. IMPORT YOUR NEW TIMETABLE PAGE 👇
import TimeTable from './pages/TimeTable'; 

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-cyan-500 animate-pulse">Initializing OS...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { 
              background: 'rgba(30, 27, 75, 0.8)', 
              backdropFilter: 'blur(12px)',
              color: '#e2e8f0', 
              borderRadius: '16px', 
              border: '1px solid rgba(139, 92, 246, 0.2)',
              fontSize: '12px',
              fontWeight: '900',
              textTransform: 'uppercase'
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Router>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="gpa" element={<GPACalculator />} />
              
              {/* 2. REGISTER THE TIMETABLE ROUTE HERE 👇 */}
              <Route path="timetable" element={<TimeTable />} />

              <Route path="internal" element={<InternalMarks />} />
              <Route path="planner" element={<StudyPlanner />} />
              <Route path="notes" element={<Notes />} />
              <Route path="gpa-goal" element={<GPAGoal />} />
              <Route path="placement" element={<Placement />} />
              <Route path="bunk" element={<BunkPlanner />} />
              <Route path="exams" element={<ExamCountdown />} />
              <Route path="notices" element={<NoticeBoard />} />
              <Route path="ai" element={<AIDoubtSolver />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}