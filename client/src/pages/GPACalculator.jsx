import { useState, useEffect } from "react";
import api from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import {
  HiOutlineCalculator,
  HiOutlinePlus,
  HiOutlineTrash,
} from "react-icons/hi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const gradeMap = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
  D: 4,
  F: 0,
};

const gradeOptions = Object.keys(gradeMap);
const COLORS = ["#06b6d4", "#ec4899", "#8b5cf6", "#f59e0b", "#10b981"];

export default function GPACalculator() {
  const { dark } = useTheme();
  const [semesters, setSemesters] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/gpa");
      setSemesters(res.data.semesters || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const saveToDB = async (updated) => {
    try {
      await api.put("/gpa", {
        semesters: updated,
      });
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const calcSGPA = (subjects) => {
    const totalCredits = subjects.reduce(
      (s, x) => s + x.credits,
      0
    );

    if (totalCredits === 0) return 0;

    const weighted = subjects.reduce(
      (s, x) =>
        s +
        x.credits *
          (gradeMap[x.grade] || 0),
      0
    );

    return (
      weighted / totalCredits
    ).toFixed(2);
  };

  const calcCGPA = () => {
    let totalCredits = 0;
    let totalWeighted = 0;

    semesters.forEach((sem) => {
      sem.subjects.forEach((s) => {
        totalCredits += s.credits;
        totalWeighted +=
          s.credits *
          (gradeMap[s.grade] || 0);
      });
    });

    return totalCredits
      ? (
          totalWeighted / totalCredits
        ).toFixed(2)
      : "0.00";
  };

  const addSemester = async () => {
    const updated = [
      ...semesters,
      {
        semesterNo:
          semesters.length + 1,
        subjects: [
          {
            type: "Theory",
            code: "",
            name: "",
            credits: 4,
            grade: "A",
          },
        ],
      },
    ];

    setSemesters(updated);
    await saveToDB(updated);
  };

  const removeSemester = async (
    semIdx
  ) => {
    const updated = semesters
      .filter((_, i) => i !== semIdx)
      .map((sem, idx) => ({
        ...sem,
        semesterNo: idx + 1,
      }));

    setSemesters(updated);
    await saveToDB(updated);
  };

  const addSubject = async (
    semIdx
  ) => {
    const updated = semesters.map(
      (s, i) =>
        i === semIdx
          ? {
              ...s,
              subjects: [
                ...s.subjects,
                {
                  type: "Theory",
                  code: "",
                  name: "",
                  credits: 4,
                  grade: "A",
                },
              ],
            }
          : s
    );

    setSemesters(updated);
    await saveToDB(updated);
  };

  const removeSubject = async (
    semIdx,
    subIdx
  ) => {
    const updated = semesters.map(
      (s, i) =>
        i === semIdx
          ? {
              ...s,
              subjects:
                s.subjects.filter(
                  (_, j) =>
                    j !== subIdx
                ),
            }
          : s
    );

    setSemesters(updated);
    await saveToDB(updated);
  };

  const updateSubject = async (
    semIdx,
    subIdx,
    field,
    value
  ) => {
    const updated = semesters.map(
      (s, i) =>
        i === semIdx
          ? {
              ...s,
              subjects:
                s.subjects.map(
                  (sub, j) =>
                    j === subIdx
                      ? {
                          ...sub,
                          [field]:
                            field ===
                            "credits"
                              ? Number(
                                  value
                                )
                              : value,
                        }
                      : sub
                ),
            }
          : s
    );

    setSemesters(updated);
    await saveToDB(updated);
  };

  const cgpa = calcCGPA();

  const chartData = semesters.map(
    (sem) => ({
      name: `Sem ${sem.semesterNo}`,
      SGPA: Number(
        calcSGPA(sem.subjects)
      ),
    })
  );

  const CustomTooltip = ({
    active,
    payload,
    label,
  }) => {
    if (
      active &&
      payload &&
      payload.length
    ) {
      return (
        <div className="glass p-3 shadow-xl">
          <p className="font-semibold">
            {label}
          </p>
          <p className="text-sm text-primary-500">
            SGPA:{" "}
            {payload[0].value.toFixed(
              2
            )}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative min-h-screen p-6 md:p-12 overflow-hidden font-sans text-sm md:text-base">
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-400/20 blur-[100px]" />
      <div className="fixed top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-500/20 blur-[120px]" />
      <div className="fixed bottom-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-primary-600/20 blur-[100px]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="mb-10 flex items-center gap-4">
          <div className="p-3 bg-primary-500/20 rounded-2xl">
            <HiOutlineCalculator className="text-3xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              CGPA Calculator
            </h1>
            <p className="opacity-70 text-sm mt-1">
              Calculate SGPA & CGPA
            </p>
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="glass p-6 mb-10 shadow-xl">
            <div className="w-full h-[300px]">
              <ResponsiveContainer>
                <BarChart
                  data={chartData}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    domain={[0, 10]}
                  />
                  <Tooltip
                    content={
                      <CustomTooltip />
                    }
                  />
                  <Bar dataKey="SGPA">
                    {chartData.map(
                      (_, i) => (
                        <Cell
                          key={i}
                          fill={
                            COLORS[
                              i %
                                COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <AnimatePresence>
            {semesters.map(
              (sem, semIdx) => (
                <motion.div
                  key={semIdx}
                  layout
                  className="glass p-6 shadow-xl"
                >
                  <div className="flex justify-between mb-6">
                    <h3 className="text-2xl font-bold">
                      Semester{" "}
                      {
                        sem.semesterNo
                      }
                    </h3>

                    <button
                      onClick={() =>
                        removeSemester(
                          semIdx
                        )
                      }
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>

                  {sem.subjects.map(
                    (
                      sub,
                      subIdx
                    ) => (
                      <div
                        key={subIdx}
                        className="space-y-3 mb-4"
                      >
                        <input
                          value={
                            sub.name
                          }
                          onChange={(
                            e
                          ) =>
                            updateSubject(
                              semIdx,
                              subIdx,
                              "name",
                              e
                                .target
                                .value
                            )
                          }
                          placeholder="Subject Name"
                          className="input-glass w-full"
                        />

                        <input
                          type="number"
                          value={
                            sub.credits
                          }
                          onChange={(
                            e
                          ) =>
                            updateSubject(
                              semIdx,
                              subIdx,
                              "credits",
                              e
                                .target
                                .value
                            )
                          }
                          className="input-glass w-full"
                        />

                        <select
                          value={
                            sub.grade
                          }
                          onChange={(
                            e
                          ) =>
                            updateSubject(
                              semIdx,
                              subIdx,
                              "grade",
                              e
                                .target
                                .value
                            )
                          }
                          className="input-glass w-full"
                        >
                          {gradeOptions.map(
                            (
                              g
                            ) => (
                              <option
                                key={
                                  g
                                }
                                value={
                                  g
                                }
                              >
                                {g}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    )
                  )}

                  <button
                    onClick={() =>
                      addSubject(
                        semIdx
                      )
                    }
                    className="w-full py-3 border border-dashed"
                  >
                    <HiOutlinePlus />
                    Add Subject
                  </button>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={addSemester}
            className="btn-glass"
          >
            <HiOutlinePlus />
            Add Semester
          </button>
        </div>
      </div>
    </div>
  );
}