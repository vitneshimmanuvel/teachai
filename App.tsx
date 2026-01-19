import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './store';
import { AppRole } from './types';
import LoginView from './views/LoginView';
import CustomerView from './views/CustomerView';
import DriverView from './views/DriverView';
import AdminView from './views/AdminView';

const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 3200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[999] splash-bg-gradient flex flex-col items-center justify-center p-8 transition-all duration-1000">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-white/20 rounded-full blur-[80px] animate-pulse"></div>
        <div className="absolute bottom-[15%] right-[10%] w-80 h-80 bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Tea Glass Container */}
        <div className="mb-12 relative">
          <div className="steam">
            <div className="steam-line" style={{ animationDelay: '0s' }}></div>
            <div className="steam-line" style={{ animationDelay: '0.4s' }}></div>
            <div className="steam-line" style={{ animationDelay: '0.8s' }}></div>
          </div>
          <div className="tea-glass">
            <div className="tea-liquid"></div>
            {/* Glass Highlights */}
            <div className="absolute inset-0 flex justify-between px-3 opacity-20">
              <div className="w-0.5 h-full bg-white"></div>
              <div className="w-0.5 h-full bg-white"></div>
            </div>
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-5xl font-[900] tracking-tighter text-white drop-shadow-md mb-2">THAMBI</h1>
          <p className="text-[12px] font-black uppercase tracking-[0.6em] text-white/80 leading-none">Oru Tea • Digital</p>
        </div>
        
        <div className="w-56 space-y-4">
          <p className="text-center text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Brewing Fresh Chai...</p>
        </div>
      </div>
      
      <div className="absolute bottom-12 text-white/30 text-[8px] font-bold uppercase tracking-widest">
        Hyperlocal Digital Franchise v4.1
      </div>
    </div>
  );
};

const RoleBasedRoute: React.FC<{ children: React.ReactNode; roles: AppRole[] }> = ({ children, roles }) => {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!roles.includes(currentUser.role)) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const MainContent: React.FC = () => {
  const [loading, setLoading] = useState(true);

  if (loading) return <SplashScreen onFinish={() => setLoading(false)} />;

  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route path="/customer/*" element={
        <RoleBasedRoute roles={[AppRole.CUSTOMER]}>
          <CustomerView />
        </RoleBasedRoute>
      } />
      <Route path="/driver/*" element={
        <RoleBasedRoute roles={[AppRole.DRIVER]}>
          <DriverView />
        </RoleBasedRoute>
      } />
      <Route path="/admin/*" element={
        <RoleBasedRoute roles={[AppRole.ADMIN]}>
          <AdminView />
        </RoleBasedRoute>
      } />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <MainContent />
      </HashRouter>
    </AppProvider>
  );
};

export default App;