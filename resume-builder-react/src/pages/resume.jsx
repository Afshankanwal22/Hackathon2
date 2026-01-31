// src/pages/dashboard/ResumeForm.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Swal from 'sweetalert2';

export default function ResumeForm({ resumeId }) {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [summary, setSummary] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [projects, setProjects] = useState('');
  const [languages, setLanguages] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resumeId) fetchResume();
  }, [resumeId]);

  // -------- Fetch resume data for editing --------
  const fetchResume = async () => {
    const { data, error } = await supabase
      .from('resume')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (error) Swal.fire('Error', error.message, 'error');
    else {
      setFullName(data.full_name);
      setEmail(data.email);
      setPhone(data.phone);
      setSummary(data.summary);
      setEducation(data.education);
      setExperience(data.experience);
      setSkills(data.skills);
      setProjects(data.projects);
      setLanguages(data.languages);
      setProfilePic(data.profilepics || null); // already a public URL
    }
  };

  // -------- Save resume with confirmation --------
  const handleSave = async () => {
    const userRes = await supabase.auth.getUser();
    const user = userRes.data.user;

    if (!user) return Swal.fire('Error', 'Please login again', 'error');

    // Show confirmation modal
    const result = await Swal.fire({
      title: resumeId ? 'Update Resume?' : 'Save Resume?',
      text: "Do you want to save your resume?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      color: '#000',
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    let profileUrl = profilePic;

    // -------- Upload profile picture if selected --------
    if (profilePic && profilePic instanceof File) {
      const fileName = `${user.id}/${profilePic.name}`;
      const { error } = await supabase.storage
        .from('profile-pics')
        .upload(fileName, profilePic, { upsert: true });

      if (error) {
        setLoading(false);
        return Swal.fire('Error', error.message, 'error');
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('profile-pics')
        .getPublicUrl(fileName);

      profileUrl = publicUrlData.publicUrl;
    }

    // -------- Prepare payload --------
    const payload = {
      user_id: user.id,
      full_name: fullName,
      email,
      phone,
      summary,
      education,
      experience,
      skills,
      projects,
      languages,
      profilepics: profileUrl,
    };

    let error;
    if (resumeId) {
      ({ error } = await supabase.from('resume').update(payload).eq('id', resumeId));
    } else {
      ({ error } = await supabase.from('resume').insert(payload));
    }

    setLoading(false);

    if (error) Swal.fire('Error', error.message, 'error');
    else {
      Swal.fire({
        title: 'Success!',
        text: `Resume ${resumeId ? 'updated' : 'saved'} successfully.`,
        icon: 'success',
        background: '#fff',
        color: '#000',
      }).then(() => {
        navigate('/resumeDashboard');
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto my-10">
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1 rounded-3xl shadow-2xl">
        <div className="bg-white rounded-3xl p-8 backdrop-blur-md">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Resume Builder ✨
          </h2>

          {/* PROFILE PICTURE */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-purple-400 shadow-lg mb-3">
              {profilePic ? (
                typeof profilePic === 'string' ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <img
                    src={URL.createObjectURL(profilePic)}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500">
                  No Photo
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePic(e.target.files[0])}
              className="text-sm text-gray-700"
            />
          </div>

          {/* PERSONAL INFO */}
          <Section title="Personal Information">
            <div className="grid md:grid-cols-2 gap-4">
              <FancyInput placeholder="Full Name" value={fullName} onChange={setFullName} />
              <FancyInput placeholder="Email" type="email" value={email} onChange={setEmail} />
              <FancyInput placeholder="Phone" value={phone} onChange={setPhone} />
            </div>
          </Section>

          <Section title="Profile Summary">
            <FancyTextarea
              placeholder="Write a brief summary about yourself..."
              value={summary}
              onChange={setSummary}
              rows={4}
            />
          </Section>

          <Section title="Education">
            <FancyTextarea
              placeholder="Your educational background..."
              value={education}
              onChange={setEducation}
              rows={4}
            />
          </Section>

          <Section title="Work Experience">
            <FancyTextarea
              placeholder="Your past work experiences..."
              value={experience}
              onChange={setExperience}
              rows={4}
            />
          </Section>

          <Section title="Skills">
            <FancyTextarea
              placeholder="List your skills, separated by commas..."
              value={skills}
              onChange={setSkills}
              rows={2}
            />
          </Section>

          <Section title="Projects & Certifications">
            <FancyTextarea
              placeholder="Highlight your projects or certifications..."
              value={projects}
              onChange={setProjects}
              rows={3}
            />
          </Section>

          <Section title="Languages">
            <FancyTextarea
              placeholder="Languages you know, separated by commas..."
              value={languages}
              onChange={setLanguages}
              rows={2}
            />
          </Section>

          <button
            onClick={handleSave}
            disabled={loading}
            className="mt-6 w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            {loading ? 'Saving...' : resumeId ? 'Update Resume' : 'Save Resume'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- REUSABLE COMPONENTS ----------
function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-purple-700 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function FancyInput({ placeholder, value, onChange, type = 'text' }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm bg-white text-gray-900"
    />
  );
}

function FancyTextarea({ placeholder, value, onChange, rows = 3 }) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm bg-white text-gray-900"
    />
  );
}
