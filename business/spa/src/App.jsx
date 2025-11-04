import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import JobsList from './pages/JobsList';
import JobNew from './pages/JobNew';
import SchedulesList from './pages/SchedulesList';
import ScheduleNew from './pages/ScheduleNew';
import Organization from './pages/Organization';
import Callback from './pages/Callback';
import ErrorPage from './pages/Error';
import Calendar from './pages/Calendar';
import {ProtectedRoute} from './auth/AuthContext';

export default function App() {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/callback" element={<Callback />} />
                <Route path="/error" element={<ErrorPage />} />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/jobs"
                    element={
                        <ProtectedRoute requirePermissions={['read:pickups']}>
                            <JobsList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/jobs/new"
                    element={
                        <ProtectedRoute requirePermissions={['create:pickups']}>
                            <JobNew />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/schedules"
                    element={
                        <ProtectedRoute requirePermissions={['read:schedules']}>
                            <SchedulesList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/schedules/new"
                    element={
                        <ProtectedRoute requirePermissions={['update:schedules']}>
                            <ScheduleNew />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/organization"
                    element={
                        <ProtectedRoute requirePermissions={['read:organization']}>
                            <Organization />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/calendar"
                    element={
                        <ProtectedRoute requirePermissions={['read:schedules']}>
                            <Calendar />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}
