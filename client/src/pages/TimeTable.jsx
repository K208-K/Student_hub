import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { useTheme } from "../context/ThemeContext";
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineLocationMarker,
  HiOutlineUser,
  HiOutlineClock,
  HiOutlineStatusOnline,
} from "react-icons/hi";
import toast from "react-hot-toast";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function TimeTable() {
  const { dark } = useTheme();
  const [schedule, setSchedule] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [entry, setEntry] = useState({
    day: "Monday",
    subject: "",
    type: "Theory",
    room: "",
    faculty: "",
    startTime: "09:00",
    endTime: "10:00",
  });

  useEffect(() => {
    fetchSchedule();

    const timer = setInterval(
      () => setCurrentTime(new Date()),
      60000
    );

    return () => clearInterval(timer);
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await api.get("/timetable");
      setSchedule(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load timetable");
    }
  };

  const addSlot = async () => {
    if (!entry.subject && entry.type !== "Lunch") {
      return toast.error("Subject name is required");
    }

    try {
      const res = await api.post("/timetable", entry);

      setSchedule((prev) => [...prev, res.data]);
      setShowAdd(false);

      setEntry({
        day: "Monday",
        subject: "",
        type: "Theory",
        room: "",
        faculty: "",
        startTime: "09:00",
        endTime: "10:00",
      });

      toast.success("Scheduled Successfully!");
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          "Failed to save to database"
      );
    }
  };

  const removeSlot = async (id) => {
    try {
      await api.delete(`/timetable/${id}`);

      setSchedule((prev) =>
        prev.filter((slot) => slot._id !== id)
      );

      toast.success("Slot Removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  const checkIsLive = (day, start, end) => {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    if (day !== dayNames[currentTime.getDay()])
      return false;

    const now =
      currentTime.getHours() * 60 +
      currentTime.getMinutes();

    const [sH, sM] = start.split(":").map(Number);
    const [eH, eM] = end.split(":").map(Number);

    return (
      now >= sH * 60 + sM &&
      now < eH * 60 + eM
    );
  };

  return (
    <div
      className={`min-h-screen p-4 md:p-8 ${
        dark ? "text-white" : "text-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex justify-between">
          <h1 className="text-4xl font-black">
            Academic Scheduler
          </h1>

          <button
            onClick={() => setShowAdd(!showAdd)}
            className="px-6 py-3 rounded-xl bg-cyan-500 text-white"
          >
            {showAdd ? "Close" : "Add Slot"}
          </button>
        </header>

        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 border rounded-xl space-y-4"
            >
              <select
                value={entry.day}
                onChange={(e) =>
                  setEntry({
                    ...entry,
                    day: e.target.value,
                  })
                }
              >
                {days.map((d) => (
                  <option key={d}>
                    {d}
                  </option>
                ))}
              </select>

              <input
                value={entry.subject}
                onChange={(e) =>
                  setEntry({
                    ...entry,
                    subject: e.target.value,
                  })
                }
                placeholder="Subject"
              />

              <button
                onClick={addSlot}
                className="bg-cyan-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {days.map((day) => (
          <div key={day}>
            <h2 className="text-xl font-bold mb-4">
              {day}
            </h2>

            <div className="flex gap-4 overflow-x-auto">
              {schedule
                .filter(
                  (slot) => slot.day === day
                )
                .map((slot) => {
                  const isLive =
                    checkIsLive(
                      slot.day,
                      slot.startTime,
                      slot.endTime
                    );

                  return (
                    <div
                      key={slot._id}
                      className={`min-w-[280px] border rounded-xl p-4 ${
                        isLive
                          ? "border-cyan-500"
                          : ""
                      }`}
                    >
                      <h3>
                        {slot.subject}
                      </h3>

                      <p>
                        {slot.startTime} -{" "}
                        {slot.endTime}
                      </p>

                      <button
                        onClick={() =>
                          removeSlot(
                            slot._id
                          )
                        }
                        className="text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}