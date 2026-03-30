import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import {
  HiOutlineCalculator,
  HiOutlinePlus,
  HiOutlineTrash
} from "react-icons/hi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const gradeMap = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
  D: 4,
  F: 0
};

const gradeOptions = Object.keys(gradeMap);
const COLORS = ["#06b6d4", "#ec4899", "#8b5cf6", "#f59e0b", "#10b981"];

export default function GPACalculator() {
  const { dark } = useTheme();
  const [semesters, setSemesters] = useState([]);
  const token = localStorage.getItem("token");

  // 🔥 LOAD FROM BACKEND
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/gpa", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSemesters(res.data.semesters || []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, [token]);

  // 🔥 SAVE TO DB
  const saveToDB = async (updated) => {
    try {
      await axios.put(
        "http://localhost:5000/api/gpa",
        { semesters: updated },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // 🧮 CALCULATIONS
  const calcSGPA = (subjects) => {
    const totalCredits = subjects.reduce((s, x) => s + x.credits, 0);
    if (totalCredits === 0) return 0;

    const weighted = subjects.reduce(
      (s, x) => s + x.credits * (gradeMap[x.grade] || 0),
      0
    );
    return (weighted / totalCredits).toFixed(2);
  };

  const calcCGPA = () => {
    let totalCredits = 0,
      totalWeighted = 0;

    semesters.forEach((sem) => {
      sem.subjects.forEach((s) => {
        totalCredits += s.credits;
        totalWeighted += s.credits * (gradeMap[s.grade] || 0);
      });
    });

    return totalCredits ? (totalWeighted / totalCredits).toFixed(2) : "0.00";
  };

  // ➕ ADD SEM
  const addSemester = async () => {
    const updated = [
      ...semesters,
      {
        semesterNo: semesters.length + 1,
        subjects: [{ type: "Theory", code: "", name: "", credits: 4, grade: "A" }]
      }
    ];
    setSemesters(updated);
    await saveToDB(updated);
  };

  // ❌ DELETE SEM
  const removeSemester = async (semIdx) => {
    const updated = semesters.filter((_, i) => i !== semIdx);
    const reIndexed = updated.map((sem, idx) => ({ ...sem, semesterNo: idx + 1 }));
    setSemesters(reIndexed);
    await saveToDB(reIndexed);
  };

  // ➕ ADD SUBJECT
  const addSubject = async (semIdx) => {
    const updated = semesters.map((s, i) =>
      i === semIdx
        ? {
            ...s,
            subjects: [
              ...s.subjects,
              { type: "Theory", code: "", name: "", credits: 4, grade: "A" }
            ]
          }
        : s
    );
    setSemesters(updated);
    await saveToDB(updated);
  };

  // ❌ DELETE SUBJECT
  const removeSubject = async (semIdx, subIdx) => {
    const updated = semesters.map((s, i) =>
      i === semIdx
        ? {
            ...s,
            subjects: s.subjects.filter((_, j) => j !== subIdx)
          }
        : s
    );
    setSemesters(updated);
    await saveToDB(updated);
  };

  // ✏ UPDATE SUBJECT
  const updateSubject = async (semIdx, subIdx, field, value) => {
    const updated = semesters.map((s, i) =>
      i === semIdx
        ? {
            ...s,
            subjects: s.subjects.map((sub, j) =>
              j === subIdx
                ? {
                    ...sub,
                    [field]: field === "credits" ? Number(value) : value
                  }
                : sub
            )
          }
        : s
    );
    setSemesters(updated);
    await saveToDB(updated);
  };

  const cgpa = calcCGPA();

  const chartData = semesters.map((sem) => ({
    name: `Sem ${sem.semesterNo}`,
    SGPA: Number(calcSGPA(sem.subjects))
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 shadow-xl">
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-primary-500">
            SGPA: {payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative min-h-screen p-6 md:p-12 overflow-hidden font-sans text-sm md:text-base">
      
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-400/20 blur-[100px] pointer-events-none" />
      <div className="fixed top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-500/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-primary-600/20 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10 flex items-center gap-4">
          <div className="p-3 bg-primary-500/20 rounded-2xl text-primary-500 backdrop-blur-md border border-primary-500/30 shadow-lg">
            <HiOutlineCalculator className="text-3xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text inline-block">CGPA Calculator</h1>
            <p className="opacity-70 text-sm mt-1">Calculate your SGPA & CGPA precisely</p>
          </div>
        </div>

        {/* CGPA STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 text-center relative overflow-hidden group shadow-xl">
            <div className="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[16px] pointer-events-none" />
            <p className="text-sm uppercase tracking-wider opacity-70 mb-2">Overall CGPA</p>
            <p className="text-5xl font-bold gradient-text">{cgpa}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 text-center relative overflow-hidden group shadow-xl">
            <div className="absolute inset-0 bg-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[16px] pointer-events-none" />
            <p className="text-sm uppercase tracking-wider opacity-70 mb-2">Semesters</p>
            <p className="text-5xl font-bold">{semesters.length}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-6 text-center relative overflow-hidden group shadow-xl">
            <div className="absolute inset-0 bg-success-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[16px] pointer-events-none" />
            <p className="text-sm uppercase tracking-wider opacity-70 mb-2">Best SGPA</p>
            <p className="text-5xl font-bold text-success-500">
              {semesters.length > 0 ? Math.max(...semesters.map((s) => Number(calcSGPA(s.subjects) || 0))).toFixed(2) : "0.00"}
            </p>
          </motion.div>
        </div>

        {/* CHART */}
        {chartData.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-6 mb-10 shadow-xl">
            <h3 className="text-lg font-bold mb-6">GPA Trend</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.2} vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 10]} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="SGPA" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* SEMESTERS LIST */}
        <div className="space-y-6">
          <AnimatePresence>
            {semesters.map((sem, semIdx) => (
              <motion.div
                key={`sem-${sem.semesterNo}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass p-6 relative group shadow-xl"
              >
                {/* Semester Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-bold">Semester {sem.semesterNo}</h3>
                    <div className="flex flex-col md:flex-row gap-2">
                      <span className="bg-primary-500/20 text-primary-600 dark:text-primary-400 text-sm font-bold px-4 py-1.5 rounded-full border border-primary-500/20">
                        SGPA: {calcSGPA(sem.subjects)}
                      </span>
                      <span className="bg-black/5 dark:bg-white/10 opacity-80 text-sm font-bold px-4 py-1.5 rounded-full">
                        Credits: {sem.subjects.reduce((sum, sub) => sum + (sub.credits || 0), 0)}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => removeSemester(semIdx)} className="p-2 text-danger-500 hover:bg-danger-500/10 rounded-full transition-colors">
                    <HiOutlineTrash className="text-2xl" />
                  </button>
                </div>

                {/* Desktop Table Headers */}
                <div className="hidden xl:flex gap-3 mb-2 px-2 text-xs font-bold uppercase tracking-wider opacity-60">
                  <div className="w-30">Type</div>
                  <div className="w-25">Code</div>
                  <div className="flex-1">Subject Name</div>
                  <div className="w-20 text-center">Credits</div>
                  <div className="w-25 text-center">Grade</div>
                  <div className="w-25 text-center">Grade Point</div>
                  <div className="w-[40px]"></div>
                </div>

                {/* Subjects Grid */}
                <div className="space-y-3 mb-6">
                  {sem.subjects.map((sub, subIdx) => (
                    <div key={subIdx} className="flex flex-col xl:flex-row gap-3 relative items-center bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-black/5 dark:border-white/5">
                      
                      {/* Top Row on Mobile / Left side on Desktop */}
                      <div className="flex gap-3 w-full xl:w-auto">
                        <select
                          value={sub.type || "Theory"}
                          onChange={(e) => updateSubject(semIdx, subIdx, "type", e.target.value)}
                          className={`input-glass w-full xl:w-30 outline-none focus:ring-2 focus:ring-primary-500/50 ${dark ? 'bg-surface-800 text-white' : 'bg-white text-black'}`}
                        >
                          <option value="Theory">Theory</option>
                          <option value="Practical">Practical</option>
                        </select>
                        <input
                          value={sub.code || ""}
                          onChange={(e) => updateSubject(semIdx, subIdx, "code", e.target.value)}
                          placeholder="Code (e.g. CS31101)"
                          className="input-glass w-full xl:w-25 outline-none focus:ring-2 focus:ring-primary-500/50 uppercase font-mono text-sm"
                        />
                      </div>

                      <input
                        value={sub.name}
                        onChange={(e) => updateSubject(semIdx, subIdx, "name", e.target.value)}
                        placeholder="Subject Name"
                        className="input-glass flex-1 w-full outline-none focus:ring-2 focus:ring-primary-500/50"
                      />
                      
                      {/* Bottom Row on Mobile / Right side on Desktop */}
                      <div className="flex gap-3 w-full xl:w-auto items-center">
                        <div className="relative w-full xl:w-20">
                          <span className="xl:hidden absolute -top-4 left-1 text-[10px] opacity-60 uppercase font-bold">Credits</span>
                          <input
                            type="number"
                            value={sub.credits}
                            onChange={(e) => updateSubject(semIdx, subIdx, "credits", e.target.value)}
                            className="input-glass w-full text-center outline-none focus:ring-2 focus:ring-primary-500/50 font-bold"
                          />
                        </div>

                        <div className="relative w-full xl:w-25">
                          <span className="xl:hidden absolute -top-4 left-1 text-[10px] opacity-60 uppercase font-bold">Grade</span>
                          <select
                            value={sub.grade}
                            onChange={(e) => updateSubject(semIdx, subIdx, "grade", e.target.value)}
                            className={`input-glass w-full text-center outline-none focus:ring-2 focus:ring-primary-500/50 font-bold ${dark ? 'bg-surface-800 text-white' : 'bg-white text-black'}`}
                          >
                            {gradeOptions.map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </div>

                        {/* Automatic Grade Point Calculator based on your image! */}
                        <div className="relative w-full xl:w-25">
                          <span className="xl:hidden absolute -top-4 left-1 text-[10px] opacity-60 uppercase font-bold">Grade Point</span>
                          <div className="h-9.5 flex items-center justify-center bg-black/5 dark:bg-black/20 rounded-xl font-mono text-sm opacity-80 border border-black/5 dark:border-white/5">
                            {gradeMap[sub.grade]?.toFixed(2) || "0.00"}
                          </div>
                        </div>

                        <button
                          onClick={() => removeSubject(semIdx, subIdx)}
                          className="h-9.5 w-10 flex items-center justify-center text-danger-500 hover:bg-danger-500/10 rounded-xl transition-colors shrink-0 border border-transparent hover:border-danger-500/20"
                        >
                          <HiOutlineTrash className="text-xl" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addSubject(semIdx)}
                  className="w-full py-3 border border-dashed border-primary-500/40 text-primary-500 rounded-2xl hover:bg-primary-500/10 transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <HiOutlinePlus className="text-xl" /> Add Subject
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ADD SEMESTER BUTTON */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 flex justify-center pb-12">
          <button
            onClick={addSemester}
            className="btn-glass flex items-center gap-2 font-medium px-8 py-4 text-lg hover:scale-105 transition-transform shadow-lg shadow-primary-500/30"
          >
            <HiOutlinePlus className="text-2xl" /> Add Semester
          </button>
        </motion.div>

      </div>
    </div>
  );
}