import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import EmployerProfile from './components/EmployerProfile';
import JobList from './components/JobList';
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
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
