// src/pages/dashboard/MyResumes.jsx
import { useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../components/ThemeContext";

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
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete your resume!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6b21a8",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: darkMode ? "#1f2937" : "#fff",
      color: darkMode ? "#fff" : "#000",
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from("resume").delete().eq("id", id);
      if (error) Swal.fire("Error", error.message, "error");
      else {
        Swal.fire("Deleted!", "Your resume has been deleted.", "success");
        fetchResumes();
      }
    }
  };

  const handleSave = async () => {
    if (!editingResume) return;
    const { id, full_name, email, phone, summary, education, experience, skills, projects, languages } = editingResume;

    const { error } = await supabase
      .from("resume")
      .update({ full_name, email, phone, summary, education, experience, skills, projects, languages })
      .eq("id", id);

    if (error) Swal.fire("Error", error.message, "error");
    else {
      Swal.fire({
        title: "Success",
        text: "Resume updated successfully!",
        icon: "success",
        background: darkMode ? "#1f2937" : "#fff",
        color: darkMode ? "#fff" : "#000",
      });
      setModalOpen(false);
      fetchResumes();
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-10 px-4">
      <h2 className="text-4xl font-bold text-purple-700 mb-8 text-center">My Resumes</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading resumes...</p>
      ) : resumes.length === 0 ? (
        <p className="text-center text-gray-500">You have no resumes yet.</p>
      ) : (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 flex flex-col items-center transition-transform transform hover:scale-105"
            >
              {/* Profile */}
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-400 shadow-lg mb-3">
                {resume.profilepics ? (
                  <img src={resume.profilepics} alt={resume.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                    No Photo
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{resume.full_name}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{resume.email}</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{resume.phone}</p>

              {/* Edit/Delete Buttons */}
              <div className="mt-6 w-full flex justify-between">
                <button
                  onClick={() => handleEdit(resume)}
                  className="w-1/2 mr-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow font-semibold flex items-center justify-center"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(resume.id)}
                  className="w-1/2 ml-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow font-semibold flex items-center justify-center"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {modalOpen && editingResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-4">Edit Resume</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Full Name"
                value={editingResume.full_name}
                onChange={(val) => setEditingResume({ ...editingResume, full_name: val })}
              />
              <InputField
                label="Email"
                type="email"
                value={editingResume.email}
                onChange={(val) => setEditingResume({ ...editingResume, email: val })}
              />
              <InputField
                label="Phone"
                value={editingResume.phone}
                onChange={(val) => setEditingResume({ ...editingResume, phone: val })}
              />
              <InputField
                label="Skills (comma separated)"
                value={editingResume.skills}
                onChange={(val) => setEditingResume({ ...editingResume, skills: val })}
              />
            </div>

            <TextAreaField
              label="Summary"
              value={editingResume.summary}
              onChange={(val) => setEditingResume({ ...editingResume, summary: val })}
              rows={3}
            />
            <TextAreaField
              label="Education"
              value={editingResume.education}
              onChange={(val) => setEditingResume({ ...editingResume, education: val })}
              rows={3}
            />
            <TextAreaField
              label="Experience"
              value={editingResume.experience}
              onChange={(val) => setEditingResume({ ...editingResume, experience: val })}
              rows={3}
            />
            <TextAreaField
              label="Projects & Certifications"
              value={editingResume.projects}
              onChange={(val) => setEditingResume({ ...editingResume, projects: val })}
              rows={3}
            />
            <TextAreaField
              label="Languages"
              value={editingResume.languages}
              onChange={(val) => setEditingResume({ ...editingResume, languages: val })}
              rows={2}
            />

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
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

// Reusable Input Components
function InputField({ label, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col">
      <label className="text-gray-700 dark:text-gray-200 font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-400 dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, rows = 3 }) {
  return (
    <div className="flex flex-col mt-2">
      <label className="text-gray-700 dark:text-gray-200 font-medium mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-400 dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}
