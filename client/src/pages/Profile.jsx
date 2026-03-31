import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { PageHeader, Card } from "../components/UI";
import {
  HiOutlineUser,
  HiOutlinePencil,
  HiOutlineCheck,
  HiOutlineCamera,
  HiOutlineAcademicCap,
  HiOutlineIdentification,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";
import toast from "react-hot-toast";
import api from "../utils/api";

export default function Profile() {
  const { dark } = useTheme();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profilePic, setProfilePic] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    college: "",
    university: "Quantum University",
    course: "Bachelor of Technology",
    branch: "",
    semester: 6,
    section: "Section-1",
    rollNo: "",
    studentType: "Regular",
    courseType: "Engineering",
    department: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/user");

      setForm((prev) => ({
        ...prev,
        ...res.data,
      }));

      setProfilePic(res.data.avatar || "");
    } catch (err) {
      console.error("Profile fetch error:", err);
      toast.error("Failed to load profile");
    }
  };

  const handleImageChange = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    toast.error("Image must be below 2MB");
    return;
  }

  const reader = new FileReader();

  reader.onloadend = () => {
    setProfilePic(reader.result);
  };

  reader.readAsDataURL(file);
};

  const handleSave = async () => {
    setSaving(true);

    try {
      const res = await api.put("/user", {
        ...form,
        avatar: profilePic,
      });

      setForm((prev) => ({
        ...prev,
        ...res.data,
      }));

      setEditing(false);

      toast.success("Profile synced successfully ✅");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Profile update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  const update = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="relative min-h-screen p-4 md:p-8 overflow-hidden font-sans">
      {/* Background Ambient Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-400/10 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent-500/10 blur-[100px] pointer-events-none" />

      <PageHeader
        title="Student Profile"
        subtitle="Academic Identity & Information"
        icon={HiOutlineUser}
      />

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        {/* HERO CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="glass p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8 border border-white/20">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent pointer-events-none" />

            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-primary-500/30 shadow-2xl relative">
                <img
                  src={
                    profilePic ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      form.name || "Student"
                    )}&background=random`
                  }
                  className="w-full h-full object-cover"
                  alt="Profile"
                />

                <AnimatePresence>
                  {editing && (
                    <motion.label
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm"
                    >
                      <HiOutlineCamera className="text-white text-3xl mb-1" />
                      <span className="text-[10px] text-white font-bold uppercase tracking-widest">
                        Update
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        hidden
                      />
                    </motion.label>
                  )}
                </AnimatePresence>
              </div>

              {!editing && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center text-white">
                  ✓
                </div>
              )}
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

            {/* Edit Button */}
            <button
              onClick={
                editing
                  ? handleSave
                  : () => setEditing(true)
              }
              disabled={saving}
              className={`p-4 rounded-2xl shadow-lg transition-all ${
                editing
                  ? "bg-success-500 text-white"
                  : "btn-glass text-primary-500"
              }`}
            >
              {editing ? (
                <HiOutlineCheck className="text-2xl" />
              ) : (
                <HiOutlinePencil className="text-2xl" />
              )}
            </button>
          </div>
        </motion.div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h4 className="font-bold mb-6">
              University Information
            </h4>

            <div className="space-y-4">
              <ProfileInput
                label="University"
                value={form.university}
                edit={editing}
                onChange={(v) =>
                  update("university", v)
                }
              />

              <ProfileInput
                label="College"
                value={form.college}
                edit={editing}
                onChange={(v) =>
                  update("college", v)
                }
              />

              <ProfileInput
                label="Department"
                value={form.department}
                edit={editing}
                onChange={(v) =>
                  update("department", v)
                }
              />
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="font-bold mb-6">
              Academic Records
            </h4>

            <div className="space-y-4">
              <ProfileInput
                label="Course"
                value={form.course}
                edit={editing}
                onChange={(v) =>
                  update("course", v)
                }
              />

              <ProfileInput
                label="Branch"
                value={form.branch}
                edit={editing}
                onChange={(v) =>
                  update("branch", v)
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <ProfileInput
                  label="Semester"
                  value={form.semester}
                  edit={editing}
                  type="number"
                  onChange={(v) =>
                    update("semester", v)
                  }
                />

                <ProfileInput
                  label="Section"
                  value={form.section}
                  edit={editing}
                  onChange={(v) =>
                    update("section", v)
                  }
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProfileInput({
  label,
  value,
  edit,
  onChange,
  type = "text",
}) {
  return (
    <div>
      <label className="text-xs font-bold opacity-50 block mb-1">
        {label}
      </label>

      <input
        type={type}
        value={value}
        disabled={!edit}
        onChange={(e) =>
          onChange?.(e.target.value)
        }
        className={`input-glass w-full ${
          !edit
            ? "opacity-80 cursor-not-allowed"
            : ""
        }`}
      />
    </div>
  );
}