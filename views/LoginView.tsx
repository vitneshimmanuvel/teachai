
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { AppRole } from '../types';

const LoginView: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<AppRole>(AppRole.CUSTOMER);
  const { setCurrentUser } = useApp();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!phone) return alert('Enter mobile number');
    
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      name: role === AppRole.CUSTOMER ? 'Prashant' : (role === AppRole.DRIVER ? 'Ravi' : 'Admin Hub'),
      phone,
      role,
      goldPoints: role === AppRole.CUSTOMER ? 840 : undefined,
      bonusCredits: role === AppRole.DRIVER ? 1250 : undefined,
      salesTarget: role === AppRole.DRIVER ? 50 : undefined
    };

    setCurrentUser(user);
    if (role === AppRole.CUSTOMER) navigate('/customer');
    else if (role === AppRole.DRIVER) navigate('/driver');
    else navigate('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f3f4f6]">
      <div className="w-full max-w-sm bg-white rounded-[48px] shadow-2xl overflow-hidden">
        <div className="h-64 brand-gradient flex flex-col items-center justify-center p-8 text-center relative">
          <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center mb-4 shadow-xl">
             <span className="text-4xl">☕</span>
          </div>
          <h1 className="text-3xl font-[900] tracking-tighter text-white">THAMBI</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80 mt-1">Oru Tea - Digital</p>
        </div>
        
        <div className="p-10 space-y-8">
          <div className="space-y-4">
            <div className="flex bg-gray-100 p-1 rounded-2xl">
              {Object.values(AppRole).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${
                    role === r ? 'bg-white shadow-sm text-[#D32F2F]' : 'text-gray-400'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Mobile</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">+91</span>
                <input
                  type="tel"
                  placeholder="00000 00000"
                  className="w-full pl-14 pr-4 py-5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#FBC02D] text-lg font-bold"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-5 bg-[#D32F2F] text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            GET STARTED →
          </button>
          
          <p className="text-[9px] text-center text-gray-400 font-bold uppercase tracking-tight">
            Franchise Certified Platform v2.5
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
