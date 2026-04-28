import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import UploadFood from './pages/UploadFood';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import LogFood from './pages/LogFood';
import FoodMenu from './pages/FoodMenu';
import Recommendations from './pages/Recommendations';
import WeightHistory from './pages/WeightHistory';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/food-menu" element={<FoodMenu />} />
        <Route path="/log-food" element={<LogFood />} />
        <Route path="/report" element={<Report />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/upload-food" element={<UploadFood />} />
        <Route path="/weight-history" element={<WeightHistory />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

