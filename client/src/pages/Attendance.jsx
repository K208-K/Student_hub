import { useState, useEffect } from "react";
import api from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineChartPie,
  HiOutlineBadgeCheck,
} from "react-icons/hi";
import { useTheme } from "../context/ThemeContext";

const COLORS = ["#06b6d4", "#ec4899", "#8b5cf6", "#f59e0b", "#10b981"];

export default function Attendance() {
  const { dark } = useTheme();
  const [subjects, setSubjects] = useState([]);
  const [newSubj, setNewSubj] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/attendance");
      setSubjects(res.data.subjects || []);
    } catch (error) {
      console.error("Failed to fetch attendance data:", error);
      toast.error("Failed to load attendance data");
    }
  };

  const updateDB = async (updatedSubjects) => {
    try {
      const res = await api.put("/attendance", {
        subjects: updatedSubjects,
      });

      setSubjects(res.data.subjects || updatedSubjects);
      toast.success("Updated successfully!");
    } catch (error) {
      console.error("Database update failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to update database"
      );
    }
  };

  const addSubject = () => {
    if (!newSubj.trim()) {
      toast.error("Please enter subject name");
      return;
    }

    const updated = [
      ...subjects,
      {
        subject: newSubj,
        totalClasses: 0,
        attendedClasses: 0,
      },
    ];

    updateDB(updated);
    setNewSubj("");
  };

  const removeSubject = (index) => {
    const updated = subjects.filter((_, i) => i !== index);
    updateDB(updated);
  };

  const updateSubject = (index, field, value) => {
    const updated = subjects.map((subj, i) =>
      i === index
        ? { ...subj, [field]: Number(value) }
        : subj
    );

    updateDB(updated);
  };

  const markAttendance = (index, present) => {
    const updated = subjects.map((subj, i) => {
      if (i === index) {
        return {
          ...subj,
          totalClasses: subj.totalClasses + 1,
          attendedClasses: present
            ? subj.attendedClasses + 1
            : subj.attendedClasses,
        };
      }
      return subj;
    });

    updateDB(updated);
  };

  const getInfo = (total, attended) => {
    if (total === 0) {
      return { pct: 0, needed: 0, bunk: 0 };
    }

    const pct = (attended / total) * 100;
    const needed = Math.max(
      0,
      Math.ceil((0.75 * total - attended) / 0.25)
    );
    const bunk = Math.max(
      0,
      Math.floor((attended - 0.75 * total) / 0.75)
    );

    return {
      pct: Number(pct.toFixed(1)),
      needed,
      bunk,
    };
  };

  const totalClassesSum = subjects.reduce(
    (sum, s) => sum + s.totalClasses,
    0
  );

  const attendedClassesSum = subjects.reduce(
    (sum, s) => sum + s.attendedClasses,
    0
  );

  const overallPct =
    totalClassesSum > 0
      ? (
          (attendedClassesSum / totalClassesSum) *
          100
        ).toFixed(1)
      : 0;

  const pieData = subjects.map((s) => ({
    name: s.subject,
    value: s.attendedClasses,
  }));

  const barData = subjects.map((s) => ({
    name: s.subject,
    attendance:
      s.totalClasses > 0
        ? Number(
            (
              (s.attendedClasses / s.totalClasses) *
              100
            ).toFixed(1)
          )
        : 0,
  }));

  return (
    <div
      className={`min-h-screen p-6 ${
        dark
          ? "bg-[#0a0f1d] text-white"
          : "bg-white text-black"
      }`}
    >
      <h1 className="text-3xl font-bold mb-6">
        Attendance Hub
      </h1>

      {/* Add Subject */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={newSubj}
          onChange={(e) => setNewSubj(e.target.value)}
          placeholder="Enter subject"
          className="border px-4 py-2 rounded w-full text-black"
        />

        <button
          onClick={addSubject}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* Subject Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {subjects.map((s, i) => {
            const info = getInfo(
              s.totalClasses,
              s.attendedClasses
            );

            return (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border rounded p-4 shadow"
              >
                <div className="flex justify-between mb-4">
                  <h2 className="font-bold">
                    {s.subject}
                  </h2>

                  <button
                    onClick={() =>
                      removeSubject(i)
                    }
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </div>

                <input
                  type="number"
                  value={s.totalClasses}
                  onChange={(e) =>
                    updateSubject(
                      i,
                      "totalClasses",
                      e.target.value
                    )
                  }
                  className="border p-2 mb-2 w-full text-black"
                  placeholder="Total Classes"
                />

                <input
                  type="number"
                  value={s.attendedClasses}
                  onChange={(e) =>
                    updateSubject(
                      i,
                      "attendedClasses",
                      e.target.value
                    )
                  }
                  className="border p-2 mb-4 w-full text-black"
                  placeholder="Attended Classes"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      markAttendance(i, true)
                    }
                    className="bg-green-500 text-white px-3 py-2 rounded"
                  >
                    Present
                  </button>

                  <button
                    onClick={() =>
                      markAttendance(i, false)
                    }
                    className="bg-red-500 text-white px-3 py-2 rounded"
                  >
                    Absent
                  </button>
                </div>

                <p className="mt-4">
                  Attendance: {info.pct}%
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Charts */}
      {subjects.length > 0 && (
        <div className="grid md:grid-cols-2 gap-8 mt-10">
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  outerRadius={100}
                >
                  {pieData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        COLORS[
                          i % COLORS.length
                        ]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attendance">
                  {barData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        COLORS[
                          i % COLORS.length
                        ]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <h2 className="mt-8 text-xl font-bold">
        Overall Attendance: {overallPct}%
      </h2>
    </div>
  );
}