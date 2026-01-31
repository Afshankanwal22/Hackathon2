// src/pages/dashboard/MyResumes.jsx
import { useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

export default function MyResumes() {
  const { darkMode } = useContext(ThemeContext);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingResume, setEditingResume] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      Swal.fire("Error", "Please login again", "error");
      navigate("/login");
      return;
    }

    const { data, error } = await supabase
      .from("resume")
      .select("*")
      .eq("user_id", user.id);

    if (error) Swal.fire("Error", error.message, "error");
    else setResumes(data || []);

    setLoading(false);
  };

  const handleEdit = (resume) => {
    setEditingResume(resume);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Delete Resume?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6b21a8",
      cancelButtonColor: "#dc2626",
      background: darkMode ? "#111827" : "#fff",
      color: darkMode ? "#fff" : "#000",
    });

    if (res.isConfirmed) {
      const { error } = await supabase.from("resume").delete().eq("id", id);
      if (!error) fetchResumes();
    }
  };

  const handleSave = async () => {
    const { id, ...payload } = editingResume;
    const { error } = await supabase
      .from("resume")
      .update(payload)
      .eq("id", id);

    if (!error) {
      Swal.fire("Updated", "Resume updated successfully", "success");
      setModalOpen(false);
      fetchResumes();
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-6 px-2">
      <h2 className="text-3xl font-bold text-purple-700 mb-5 text-center">
        My Resumes
      </h2>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : resumes.length === 0 ? (
        <p className="text-center text-gray-500">No resumes found</p>
      ) : (
        /* 🔥 ULTRA COMPACT GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[3px]">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-3 flex flex-col items-center"
            >
              {/* Image */}
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-purple-500 mb-2">
                {resume.profilepics ? (
                  <img
                    src={resume.profilepics}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xs">
                    No Photo
                  </div>
                )}
              </div>

              <h3 className="text-sm font-semibold dark:text-white">
                {resume.full_name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {resume.email}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {resume.phone}
              </p>

              {/* Buttons */}
              <div className="mt-2 w-full flex gap-1">
                <button
                  onClick={() => handleEdit(resume)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-1.5 rounded-md text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(resume.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1.5 rounded-md text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      {modalOpen && editingResume && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-900 w-full max-w-4xl p-5 rounded-xl">
            <h3 className="text-xl font-bold text-purple-600 mb-3">
              Edit Resume
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                label="Full Name"
                value={editingResume.full_name}
                onChange={(v) =>
                  setEditingResume({ ...editingResume, full_name: v })
                }
              />
              <Input
                label="Email"
                value={editingResume.email}
                onChange={(v) =>
                  setEditingResume({ ...editingResume, email: v })
                }
              />
              <Input
                label="Phone"
                value={editingResume.phone}
                onChange={(v) =>
                  setEditingResume({ ...editingResume, phone: v })
                }
              />
              <Input
                label="Skills"
                value={editingResume.skills}
                onChange={(v) =>
                  setEditingResume({ ...editingResume, skills: v })
                }
              />
            </div>

            <Textarea
              label="Summary"
              value={editingResume.summary}
              onChange={(v) =>
                setEditingResume({ ...editingResume, summary: v })
              }
            />

            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-purple-600 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* COMPONENTS */
function Input({ label, value, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs mb-0.5">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1.5 border rounded-md text-sm dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <div className="flex flex-col mt-1">
      <label className="text-xs mb-0.5">{label}</label>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1.5 border rounded-md text-sm dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}
