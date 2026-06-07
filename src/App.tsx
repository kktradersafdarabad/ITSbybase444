import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import TenantBookingForm from './pages/TenantBookingForm';
import BookingStatus from './pages/BookingStatus';
import DriverApp from './pages/DriverApp';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import TenantAdminDashboard from './pages/tenant/TenantAdminDashboard';
import { ITSLocalStorageDB } from './lib/db';

export default function App() {
  const [selectedTenantSlug, setSelectedTenantSlug] = useState('elite-ride');
  const navigate = useNavigate();

  useEffect(() => {
    // Seed initial database items
    ITSLocalStorageDB.initialize();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 antialiased font-sans flex flex-col justify-between">
      <Routes>
        <Route 
          path="/" 
          element={
            <WelcomePage
              onNavigate={(route) => navigate(route)}
              selectedTenantSlug={selectedTenantSlug}
              setSelectedTenantSlug={setSelectedTenantSlug}
            />
          } 
        />
        <Route 
          path="/book/:slug" 
          element={<TenantBookingForm onBack={() => navigate('/')} />} 
        />
        <Route 
          path="/tenant/:slug" 
          element={<TenantAdminDashboard />} 
        />
        <Route 
          path="/driver/:slug" 
          element={<DriverApp />} 
        />
        <Route 
          path="/booking/status" 
          element={
            <div className="bg-slate-50 min-h-screen text-slate-800 text-left p-6">
              <button 
                onClick={() => navigate('/')}
                className="mb-4 bg-white border border-slate-200 text-slate-600 font-bold px-4 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ← Back to Landing
              </button>
              <BookingStatus />
            </div>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <div className="bg-slate-50 min-h-screen text-slate-800 text-left p-6">
              <button 
                onClick={() => navigate('/')}
                className="mb-4 bg-white border border-slate-200 text-slate-600 font-bold px-4 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ← Back to Landing
              </button>
              <SuperAdminDashboard />
            </div>
          } 
        />
        <Route 
          path="*" 
          element={
            <WelcomePage
              onNavigate={(route) => navigate(route)}
              selectedTenantSlug={selectedTenantSlug}
              setSelectedTenantSlug={setSelectedTenantSlug}
            />
          } 
        />
      </Routes>
    </div>
  );
}
