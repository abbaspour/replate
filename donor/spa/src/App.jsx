import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Donate from './pages/Donate';
import History from './pages/History';
import Suggest from './pages/Suggest';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import Callback from './pages/Callback';
import {ProtectedRoute} from './auth/AuthContext';

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/callback" element={<Callback />} />

        <Route path="/" element={<Home />} />
        <Route
          path="/donate"
          element={
            <ProtectedRoute>
              <Donate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/suggest"
          element={
            <ProtectedRoute>
              <Suggest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
