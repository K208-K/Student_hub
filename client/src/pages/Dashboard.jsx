import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  HiOutlineAcademicCap,
  HiOutlineFire,
  HiOutlineTrendingUp,
  HiOutlineOfficeBuilding,
  HiOutlineClipboardList,
  HiOutlineCalculator,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineLightBulb,
} from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";

const menuCards = [
  {
    path: "/attendance",
    label: "Attendance",
    icon: HiOutlineClipboardList,
    color: "from-blue-500 to-cyan-500",
  },
  {
    path: "/gpa",
    label: "GPA Calc",
    icon: HiOutlineCalculator,
    color: "from-violet-500 to-purple-500",
  },
  {
    path: "/planner",
    label: "Planner",
    icon: HiOutlineCalendar,
    color: "from-emerald-500 to-teal-500",
  },
  {
    path: "/exams",
    label: "Exams",
    icon: HiOutlineClock,
    color: "from-orange-500 to-red-500",
  },
  {
    path: "/ai",
    label: "AI Solver",
    icon: HiOutlineLightBulb,
    color: "from-pink-500 to-rose-500",
  },
  {
    path: "/bunk",
    label: "Bunk Plan",
    icon: HiOutlineFire,
    color: "from-amber-500 to-yellow-500",
  },
];

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

export default function Dashboard() {
  const { user } = useAuth();
  const { dark } = useTheme();
  const location = useLocation();

  const [currentTime, setCurrentTime] = useState(
    new Date()
  );
  const [realAttendance, setRealAttendance] =
    useState("0.0");
  const [overallCGPA, setOverallCGPA] =
    useState("0.00");

  // LIVE CLOCK
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // AUTO SYNC DASHBOARD STATS
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Attendance
        const attRes = await api.get(
          "/attendance"
        );

        const subjects =
          attRes.data.subjects || [];

        const totalClasses =
          subjects.reduce(
            (sum, sub) =>
              sum +
              (sub.totalClasses || 0),
            0
          );

        const attendedClasses =
          subjects.reduce(
            (sum, sub) =>
              sum +
              (sub.attendedClasses ||
                0),
            0
          );

        const attendance =
          totalClasses > 0
            ? (
                (attendedClasses /
                  totalClasses) *
                100
              ).toFixed(1)
            : "0.0";

        setRealAttendance(attendance);

        // GPA
        const gpaRes = await api.get(
          "/gpa"
        );

        const semesters =
          gpaRes.data.semesters || [];

        let totalCredits = 0;
        let totalWeighted = 0;

        semesters.forEach((sem) => {
          sem.subjects?.forEach(
            (sub) => {
              totalCredits +=
                sub.credits || 0;

              totalWeighted +=
                (sub.credits || 0) *
                (gradeMap[
                  sub.grade
                ] || 0);
            }
          );
        });

        const cgpa =
          totalCredits > 0
            ? (
                totalWeighted /
                totalCredits
              ).toFixed(2)
            : "0.00";

        setOverallCGPA(cgpa);
      } catch (error) {
        console.error(
          "Dashboard Sync Error:",
          error
        );
      }
    };

    fetchStats();

    const interval = setInterval(
      fetchStats,
      30000
    );

    return () =>
      clearInterval(interval);
  }, [location.pathname]);

  const formatTime = (date) =>
    date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (date) =>
    date.toLocaleDateString([], {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

  const greeting =
    currentTime.getHours() < 12
      ? "Good Morning"
      : currentTime.getHours() < 17
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <div
      className={`min-h-screen p-4 md:p-8 ${
        dark
          ? "bg-[#0a0f1d] text-white"
          : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black">
            {greeting},{" "}
            <span className="text-cyan-400">
              {user?.name?.split(
                " "
              )[0] || "Scholar"}
            </span>
          </h1>

          <p className="text-sm opacity-60 mt-2">
            {formatDate(currentTime)} •{" "}
            {formatTime(currentTime)}
          </p>
        </header>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Attendance"
            value={`${realAttendance}%`}
            color="bg-blue-500"
            icon={<HiOutlineFire />}
          />

          <MetricCard
            label="Overall CGPA"
            value={overallCGPA}
            color="bg-indigo-500"
            icon={
              <HiOutlineTrendingUp />
            }
          />

          <MetricCard
            label="Current Sem"
            value={`${
              user?.semester || "6"
            }th`}
            color="bg-pink-500"
            icon={
              <HiOutlineAcademicCap />
            }
          />

          <MetricCard
            label="Institution"
            value={
              user?.college?.split(
                " "
              )[0] || "Quantum"
            }
            color="bg-amber-500"
            icon={
              <HiOutlineOfficeBuilding />
            }
          />
        </div>

        {/* QUICK NAVIGATION */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {menuCards.map(
            (card, index) => (
              <Link
                key={index}
                to={card.path}
              >
                <motion.div
                  whileHover={{
                    y: -5,
                    scale: 1.05,
                  }}
                  className="glass p-6 rounded-[30px] border border-white/10 flex flex-col items-center"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white mb-4`}
                  >
                    <card.icon className="text-2xl" />
                  </div>

                  <p className="text-xs font-bold uppercase">
                    {card.label}
                  </p>
                </motion.div>
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
  icon,
}) {
  const { dark } = useTheme();

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="glass p-5 rounded-[30px] shadow-xl"
    >
      <div
        className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center text-white mb-4`}
      >
        {icon}
      </div>

      <h4 className="text-[10px] font-black uppercase opacity-50">
        {label}
      </h4>

      <p className="text-lg font-bold">
        {value}
      </p>
    </motion.div>
  );
}