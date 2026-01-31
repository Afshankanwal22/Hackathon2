// ================= LOGIN PAGE COMPONENT =================
// src/pages/login/Login.jsx

import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!email || !password) {
      Swal.fire('Error', 'Please enter email and password', 'error');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Swal.fire('Error', 'Enter a valid email', 'error');
      return false;
    }
    if (password.length < 6) {
      Swal.fire('Error', 'Password must be at least 6 characters', 'error');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      Swal.fire('Login Failed', error.message, 'error');
    } else {
      Swal.fire('Success', 'Login successful!', 'success').then(() =>
        navigate('/resume')
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-pink-800 px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 text-white">
        <h1 className="text-4xl font-extrabold text-center mb-3 drop-shadow-lg">Welcome Back</h1>
        <p className="text-center text-gray-300 mb-8">Login to your account to continue</p>

        {/* Email */}
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-5 py-3 rounded-xl bg-white/20 border border-gray-400 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-5 py-3 rounded-xl bg-white/20 border border-gray-400 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
        />

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 mb-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 font-semibold text-lg shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {/* Signup Link */}
        <p className="text-center text-gray-300 mt-2">
          Don't have an account?{' '}
          <Link to="/signup" className="text-pink-400 font-semibold hover:underline hover:text-pink-300 transition">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
