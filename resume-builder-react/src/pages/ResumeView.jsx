// src/pages/dashboard/ResumeView.jsx
import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";
import { ThemeContext } from "../components/ThemeContext";

export default function ResumeView() {
  const { darkMode } = useContext(ThemeContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResume, setEditingResume] = useState(null);

  useEffect(() => {
    fetchResume();
  }, [id]);

  const fetchResume = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("resume")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setResume(data);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error.message, "error");
      setResume(null);
    }
    setLoading(false);
  };

  const handleEdit = () => {
    setEditingResume(resume);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete your resume!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb", // professional blue
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: darkMode ? "#1f2937" : "#fff",
      color: darkMode ? "#fff" : "#000",
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from("resume").delete().eq("id", resume.id);
      if (error) Swal.fire("Error", error.message, "error");
      else {
        Swal.fire("Deleted!", "Your resume has been deleted.", "success");
        navigate("/resumeDashboard"); // back to dashboard
      }
    }
  };

  const handleSave = async () => {
    if (!editingResume) return;

    const { full_name, email, phone, summary, education, experience, skills, projects, languages } = editingResume;

    const { error } = await supabase
      .from("resume")
      .update({ full_name, email, phone, summary, education, experience, skills, projects, languages })
      .eq("id", resume.id);

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
      fetchResume();
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading resume...</p>;
  if (!resume) return <p className="text-center mt-10 text-gray-500">Resume not found.</p>;

  return (
    <div className="max-w-4xl mx-auto my-10 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
      {/* Back Button */}
      <button
        onClick={() => navigate("/resumeDashboard")}
        className="mb-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
      >
        ← Back to Dashboard
      </button>

      {/* Profile */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gray-300 shadow-sm mb-3">
          {resume.profilepics ? (
            <img src={resume.profilepics} alt={resume.full_name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-700 text-gray-500">
              No Photo
            </div>
          )}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{resume.full_name}</h2>
        <p className="text-gray-500">{resume.email} | {resume.phone}</p>
      </div>

      {/* Sections */}
      <Section title="Profile Summary">{resume.summary}</Section>
      <Section title="Education">{resume.education}</Section>
      <Section title="Work Experience">{resume.experience}</Section>
      <Section title="Skills">{resume.skills}</Section>
      <Section title="Projects & Certifications">{resume.projects}</Section>
      <Section title="Languages">{resume.languages}</Section>

      {/* Edit/Delete Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
        <button
          onClick={handleEdit}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow font-medium transition"
        >
          ✏️ Edit Resume
        </button>
        <button
          onClick={handleDelete}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow font-medium transition"
        >
          🗑️ Delete Resume
        </button>
      </div>

      {/* Edit Modal */}
      {modalOpen && editingResume && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Edit Resume</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold text-xl"
              >
                ✖
              </button>
            </div>

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
                label="Skills"
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
                className="px-5 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Components
function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{title}</h3>
      <p className="text-gray-700 dark:text-gray-300">{children || "N/A"}</p>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col">
      <label className="text-gray-700 dark:text-gray-200 font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
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
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}
