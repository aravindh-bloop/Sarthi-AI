import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PlannerPage from './pages/PlannerPage';
import CropHealthPage from './pages/CropHealthPage';
import NewsPage from './pages/NewsPage';
import InventoryPage from './pages/InventoryPage';
import SettingsPage from './pages/SettingsPage';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { SettingsProvider } from './context/SettingsContext';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/planner" element={
              <ProtectedRoute>
                <PlannerPage />
              </ProtectedRoute>
            } />
            <Route path="/health" element={
              <ProtectedRoute>
                <CropHealthPage />
              </ProtectedRoute>
            } />
            <Route path="/news" element={
              <ProtectedRoute>
                <NewsPage />
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />

            {/* Redirect Tasks to Planner */}
            <Route path="/tasks" element={<Navigate to="/planner" replace />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
