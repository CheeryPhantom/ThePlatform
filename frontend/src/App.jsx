import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import EmployerProfile from './components/EmployerProfile';
import JobList from './components/JobList';
import Assessment from './components/Assessment';
import TrainingHub from './components/TrainingHub';
import Messages from './components/Messages';
import Settings from './components/Settings';
import Landing from './components/Landing';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/employer-profile" element={<EmployerProfile />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/training" element={<TrainingHub />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>




        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
