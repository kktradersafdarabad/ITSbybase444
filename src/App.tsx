import React, { useState, useEffect } from 'react';
import WelcomePage from './pages/WelcomePage';
import TenantBookingForm from './pages/TenantBookingForm';
import BookingStatus from './pages/BookingStatus';
import DriverApp from './pages/DriverApp';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import TenantAdminDashboard from './pages/tenant/TenantAdminDashboard';
import { ITSLocalStorageDB } from './lib/db';

export default function App() {
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedTenantSlug, setSelectedTenantSlug] = useState('elite-ride');

  // Synchronize hash paths on component launch
  useEffect(() => {
    // Seed initial database items
    ITSLocalStorageDB.initialize();

    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      // Strip starting '#' character
      const resolved = hash.substring(1) || '/';
      setCurrentPath(resolved);
    };

    // Trigger initial check
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
  };

  // Helper selectors or routing maps
  const renderRouteView = () => {
    // Simple path parser
    const p = currentPath;

    if (p.startsWith('/book/')) {
      return (
        <TenantBookingForm 
          onBack={() => navigateTo('/')} 
        />
      );
    }

    if (p.startsWith('/tenant/')) {
      return (
        <TenantAdminDashboard />
      );
    }

    if (p.startsWith('/driver/')) {
      return (
        <DriverApp />
      );
    }

    switch (p) {
      case '/booking/status':
        return (
          <div className="bg-slate-50 min-h-screen text-slate-805 text-left p-6">
            <button 
              onClick={() => navigateTo('/')}
              className="mb-4 bg-white border border-slate-200 text-slate-600 font-bold px-4 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              ← Back to Landing
            </button>
            <BookingStatus />
          </div>
        );
      case '/admin':
        return (
          <div className="bg-slate-50 min-h-screen text-slate-805 text-left p-6">
            <button 
              onClick={() => navigateTo('/')}
              className="mb-4 bg-white border border-slate-200 text-slate-600 font-bold px-4 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              ← Back to Landing
            </button>
            <SuperAdminDashboard />
          </div>
        );
      default:
        return (
          <WelcomePage
            onNavigate={(route) => navigateTo(route)}
            selectedTenantSlug={selectedTenantSlug}
            setSelectedTenantSlug={setSelectedTenantSlug}
          />
        );
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 antialiased font-sans flex flex-col justify-between">
      {renderRouteView()}
    </div>
  );
}
