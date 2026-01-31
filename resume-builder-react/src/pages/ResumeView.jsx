import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";

export default function ResumeView() {
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
      text: "This resume will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from("resume").delete().eq("id", resume.id);
      if (error) Swal.fire("Error", error.message, "error");
      else {
        Swal.fire("Deleted!", "Resume deleted successfully.", "success");
        navigate("/resumeDashboard");
      }
    }
  };

  const handleSave = async () => {
    const { full_name, email, phone, summary, education, experience, skills, projects, languages } = editingResume;

    const { error } = await supabase
      .from("resume")
      .update({ full_name, email, phone, summary, education, experience, skills, projects, languages })
      .eq("id", resume.id);

    if (error) Swal.fire("Error", error.message, "error");
    else {
      Swal.fire("Success", "Resume updated successfully!", "success");
      setModalOpen(false);
      fetchResume();
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!resume) return <p className="text-center mt-10">Resume not found.</p>;

  return (
    <div className="max-w-5xl mx-auto my-10 bg-white p-10 shadow-md rounded-lg font-sans">

      {/* HEADER */}
      <div className="flex justify-between items-start border-b pb-6 mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          {resume.full_name}
        </h1>

        <button
          onClick={() => navigate("/resumeDashboard")}
          className="no-print text-sm bg-gray-100 px-4 py-2 rounded hover:bg-gray-200"
        >
          ← Dashboard
        </button>
      </div>

      {/* BODY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* LEFT */}
        <aside className="md:col-span-1 border-r pr-6">

          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden border">
              {resume.profilepics ? (
                <img src={resume.profilepics} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="bg-gray-200 w-full h-full flex items-center justify-center text-sm text-gray-500">
                  No Photo
                </div>
              )}
            </div>
          </div>

          <CVSection title="Contact">
            <p><b>Email:</b> {resume.email}</p>
            <p><b>Phone:</b> {resume.phone}</p>
          </CVSection>

          <CVSection title="Skills">
            {resume.skills}
          </CVSection>

          <CVSection title="Languages">
            {resume.languages}
          </CVSection>
        </aside>

        {/* RIGHT */}
        <main className="md:col-span-2 space-y-8">

          <CVSection title="Profile Summary">
            {resume.summary}
          </CVSection>

          <CVSection title="Education">
            {resume.education}
          </CVSection>

          <CVSection title="Work Experience">
            {resume.experience}
          </CVSection>

          <CVSection title="Projects & Certifications">
            {resume.projects}
          </CVSection>

          {/* ACTION BUTTONS */}
          <div className="pt-6 flex gap-4 no-print">
            <button
              onClick={handleEdit}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Edit
            </button>

            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            >
              Delete
            </button>

            <button
              onClick={() => window.print()}
              className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-black"
            >
              Download Resume
            </button>
          </div>

        </main>
      </div>

      {/* EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 no-print">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Resume</h2>

            <Input label="Full Name" value={editingResume.full_name}
              onChange={(v) => setEditingResume({ ...editingResume, full_name: v })} />
            <Input label="Email" value={editingResume.email}
              onChange={(v) => setEditingResume({ ...editingResume, email: v })} />
            <Input label="Phone" value={editingResume.phone}
              onChange={(v) => setEditingResume({ ...editingResume, phone: v })} />

            <Textarea label="Summary" value={editingResume.summary}
              onChange={(v) => setEditingResume({ ...editingResume, summary: v })} />
            <Textarea label="Education" value={editingResume.education}
              onChange={(v) => setEditingResume({ ...editingResume, education: v })} />
            <Textarea label="Experience" value={editingResume.experience}
              onChange={(v) => setEditingResume({ ...editingResume, experience: v })} />
            <Textarea label="Skills" value={editingResume.skills}
              onChange={(v) => setEditingResume({ ...editingResume, skills: v })} />
            <Textarea label="Projects" value={editingResume.projects}
              onChange={(v) => setEditingResume({ ...editingResume, projects: v })} />
            <Textarea label="Languages" value={editingResume.languages}
              onChange={(v) => setEditingResume({ ...editingResume, languages: v })} />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded"
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

function CVSection({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
        {title}
      </h3>
      <p className="text-gray-800 text-sm leading-relaxed">
        {children || "N/A"}
      </p>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />
    </div>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />
    </div>
  );
}
