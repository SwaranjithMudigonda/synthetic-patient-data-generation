import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import CreateCohort from './pages/CreateCohort';
import GenerateCohort from './pages/GenerateCohort';
import Validation from './pages/Validation';
import PrivacyAudit from './pages/PrivacyAudit';
import PatientInspector from './pages/PatientInspector';
import ApiHub from './pages/ApiHub';
import StressTest from './pages/StressTest';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          {/* Public Landing & Authentication */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Authenticated Clinical Workspaces */}
          <Route path="/create" element={<ProtectedRoute><CreateCohort /></ProtectedRoute>} />
          <Route path="/generate" element={<ProtectedRoute><GenerateCohort /></ProtectedRoute>} />
          <Route path="/validation" element={<ProtectedRoute><Validation /></ProtectedRoute>} />
          <Route path="/privacy" element={<ProtectedRoute><PrivacyAudit /></ProtectedRoute>} />
          <Route path="/patient" element={<ProtectedRoute><PatientInspector /></ProtectedRoute>} />
          <Route path="/api-hub" element={<ProtectedRoute><ApiHub /></ProtectedRoute>} />
          <Route path="/stress-test" element={<ProtectedRoute><StressTest /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
