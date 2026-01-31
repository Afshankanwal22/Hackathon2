
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/login.jsx';
import Signup from './pages/signup.jsx';
import Resume from './pages/resume.jsx';
import ResumeDashboard from './pages/ResumeDashboard.jsx';
import ResumeView from './pages/ResumeView.jsx';

export default function App() {
  return (
   
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/resumeDashboard" element={<ResumeDashboard />} />
          <Route path="/resume/view/:id" element={<ResumeView />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
  
  );
}
