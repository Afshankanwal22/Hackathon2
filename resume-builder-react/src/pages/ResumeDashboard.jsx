// src/pages/dashboard/ResumeDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";

export default function ResumeDashboard() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("my"); // "my" or "all"
  const [skillFilter, setSkillFilter] = useState(""); // new skill filter
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, [filter, skillFilter]);

  const fetchResumes = async () => {
    setLoading(true);

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      Swal.fire("Error", "Please login again", "error");
      navigate("/login");
      return;
    }

    let query = supabase.from("resume").select("*");

    // Filter by user
    if (filter === "my") query = query.eq("user_id", user.id);

    // Filter by skill if skillFilter is not empty
    if (skillFilter.trim() !== "") {
      query = query.ilike("skills", `%${skillFilter}%`);
    }

    const { data, error } = await query;

    if (error) Swal.fire("Error", error.message, "error");
    else setResumes(data || []);

    setLoading(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Swal.fire("Error", error.message, "error");
    else navigate("/ResumeView");
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-800">
      {/* SIDEBAR */}
      <div className="w-64 bg-purple-600 dark:bg-purple-900 text-white flex flex-col">
        <h2 className="text-2xl font-bold text-center py-6 border-b border-purple-400">
          Dashboard
        </h2>
        <nav className="flex flex-col flex-grow px-4 mt-6 space-y-2">
          <button
            onClick={() => setFilter("my")}
            className={`py-2 px-4 rounded-lg text-left hover:bg-purple-500 ${
              filter === "my" ? "bg-purple-500 font-semibold" : ""
            }`}
          >
            My Resumes
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`py-2 px-4 rounded-lg text-left hover:bg-purple-500 ${
              filter === "all" ? "bg-purple-500 font-semibold" : ""
            }`}
          >
            All Resumes
          </button>

          {/* Skill Filter Input */}
          <div className="mt-4">
            <label className="text-sm font-semibold mb-1 block">Filter by Skill</label>
            <input
              type="text"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              placeholder="e.g., Web, AI, ML"
              className="w-full px-3 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <button
            onClick={() => navigate("/resume")}
            className="py-2 px-4 rounded-lg text-left hover:bg-purple-500 mt-4"
          >
            Create Resume
          </button>
          <button
            onClick={handleLogout}
            className="mt-auto py-2 px-4 rounded-lg text-left hover:bg-red-500"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6">
        <h2 className="text-4xl font-bold text-purple-700 mb-8 text-center">
          {filter === "my" ? "My Resumes" : "All Resumes"}
        </h2>

        {loading ? (
          <div className="text-center text-gray-500">Loading resumes...</div>
        ) : resumes.length === 0 ? (
          <div className="text-center text-gray-500">No resumes found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-center">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- RESUME CARD ----------
function ResumeCard({ resume, navigate }) {
  const handleView = () => {
    navigate(`/resume/view/${resume.id}`);
  };

  const profilePicUrl = resume.profilepics || null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-200 border border-purple-200 hover:border-purple-400 w-full">
      {/* PROFILE PICTURE */}
      <div className="w-full h-40 bg-purple-50 dark:bg-purple-900 flex items-center justify-center">
        {profilePicUrl ? (
          <img
            src={profilePicUrl}
            alt={resume.full_name}
            className="w-24 h-24 rounded-full border-4 border-purple-400 shadow-lg object-cover -mt-12"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-500 -mt-12">
            No Photo
          </div>
        )}
      </div>

      {/* RESUME INFO */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {resume.full_name || "Unnamed"}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">{resume.email}</p>
        <p className="text-gray-600 dark:text-gray-300 text-sm">{resume.phone}</p>

        <div className="mt-4">
          <h4 className="font-semibold text-purple-700 dark:text-purple-400 text-sm">
            Skills
          </h4>
          <p className="text-gray-700 dark:text-gray-200 text-sm">
            {resume.skills || "No skills listed"}
          </p>
        </div>

        <div className="mt-3">
          <h4 className="font-semibold text-purple-700 dark:text-purple-400 text-sm">
            Summary
          </h4>
          <p className="text-gray-700 dark:text-gray-200 text-sm line-clamp-3">
            {resume.summary || "No summary provided"}
          </p>
        </div>

        <button
          onClick={handleView}
          className="mt-4 w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
