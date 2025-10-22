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
                        <ProtectedRoute requireScopes={['read:pickups']}>
                            <JobsList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/jobs/new"
                    element={
                        <ProtectedRoute requireScopes={['create:pickups']}>
                            <JobNew />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/schedules"
                    element={
                        <ProtectedRoute requireScopes={['read:schedules']}>
                            <SchedulesList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/schedules/new"
                    element={
                        <ProtectedRoute requireScopes={['update:schedules']}>
                            <ScheduleNew />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/organization"
                    element={
                        <ProtectedRoute requireScopes={['read:organization']}>
                            <Organization />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}
