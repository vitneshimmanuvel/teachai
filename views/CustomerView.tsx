
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { TEA_TYPES, SNACK_TYPES } from '../constants';
import MapView from '../components/MapView';
import { Vehicle, Order } from '../types';

const CustomerView: React.FC = () => {
  const { vehicles, currentUser, placeOrder, orders, sendMessage, messages, updateOrderStatus } = useApp();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'profile' | 'support'>('home');
  const [view, setView] = useState<'main' | 'detail' | 'menu' | 'tracking'>('main');
  const [chatInput, setChatInput] = useState('');

  const myOrders = orders.filter(o => o.customerId === currentUser?.id);
  const activeOrder = myOrders.find(o => ['pending', 'accepted', 'preparing', 'on-the-way'].includes(o.status));
  const customerLoc = { lat: 13.0827, lng: 80.2707 };

  const totalAmount = Object.entries(cart).reduce((acc, [id, qty]) => {
    const item = [...TEA_TYPES, ...SNACK_TYPES].find(t => t.id === id);
    return acc + (item?.price || 0) * (qty as number);
  }, 0);

  const calculateETASymbolic = (v: Vehicle) => {
    const dLat = v.location.lat - customerLoc.lat;
    const dLng = v.location.lng - customerLoc.lng;
    const distance = Math.sqrt(dLat * dLat + dLng * dLng);
    // Rough calculation: 1 degree approx 111km. 0.01 is ~1km.
    // We want a countdown in seconds. Let's say 1km (0.01) takes 5 mins (300s).
    // Factor: 300 / 0.01 = 30,000.
    return Math.max(10, Math.round(distance * 30000));
  };

  const handleOrder = () => {
    if (!selectedVehicle || totalAmount === 0 || !currentUser) return;
    const newOrder: Order = {
      id: 'TH-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      customerId: currentUser.id,
      customerName: currentUser.name,
      vehicleId: selectedVehicle.id,
      items: Object.entries(cart).map(([id, qty]) => {
        const item = [...TEA_TYPES, ...SNACK_TYPES].find(t => t.id === id)!;
        return { type: item.name, quantity: qty as number, price: item.price };
      }),
      totalPrice: totalAmount,
      status: 'pending',
      paymentStatus: 'unpaid',
      timestamp: Date.now(),
      location: customerLoc
    };
    placeOrder(newOrder);
    setCart({});
    setView('tracking');
  };

  const renderHome = () => (
    <div className="h-full bg-white">
      {view === 'main' ? (
        <div className="p-6 space-y-6">
          <header className="flex justify-between items-center">
            <h2 className="text-3xl font-[900] tracking-tighter text-gray-900 uppercase">THAMBI</h2>
            <div className="w-10 h-10 bg-[#FBC02D] rounded-full flex items-center justify-center text-white font-black shadow-lg">👤</div>
          </header>
          
          {activeOrder && (
            <div onClick={() => setView('tracking')} className="bg-[#D32F2F] p-4 rounded-2xl flex items-center justify-between text-white shadow-lg animate-pulse cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-2xl">☕</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Active Order</p>
                  <p className="font-black uppercase text-xs">Tracking Thambi Pilot...</p>
                </div>
              </div>
              <span className="font-black text-xs">VIEW →</span>
            </div>
          )}

          <MapView vehicles={vehicles.filter(v => v.status !== 'offline')} onVehicleClick={(v) => { setSelectedVehicle(v); setView('detail'); }} className="h-64 rounded-3xl" />
          
          <section className="space-y-4">
             <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Select Truck</h3>
             <div className="grid gap-4">
                {vehicles.filter(v => v.status !== 'offline').map(v => (
                  <div key={v.id} onClick={() => { setSelectedVehicle(v); setView('detail'); }} className="bg-white p-5 rounded-[28px] border-2 border-gray-100 flex items-center justify-between shadow-sm active:scale-95 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <span className="text-2xl">🚲</span>
                       <div>
                          <h4 className="font-black text-gray-800 text-sm uppercase">{v.driverName}</h4>
                          <p className="text-[10px] font-bold text-gray-400">Rating ★{v.rating}</p>
                       </div>
                    </div>
                    <span className="text-[10px] font-black text-[#D32F2F] uppercase">View Menu</span>
                  </div>
                ))}
             </div>
          </section>
        </div>
      ) : view === 'detail' && selectedVehicle ? (
        <div className="h-full bg-white flex flex-col p-6 animate-in slide-in-from-bottom">
           <button onClick={() => setView('main')} className="mb-6 font-black text-gray-400">← Back</button>
           <div className="flex-1 space-y-8">
              <div className="bg-gray-50 p-6 rounded-[32px] text-center border">
                 <span className="text-6xl">🚲</span>
                 <h2 className="text-2xl font-black uppercase mt-4">{selectedVehicle.driverName}</h2>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Pilot Certified by Thambi</p>
              </div>
              <button onClick={() => setView('menu')} className="w-full py-5 bg-[#D32F2F] text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl">ORDER FROM THIS TRUCK</button>
           </div>
        </div>
      ) : view === 'menu' && selectedVehicle ? (
        <div className="h-full bg-white flex flex-col p-6 animate-in slide-in-from-right">
           <button onClick={() => setView('detail')} className="mb-6 font-black text-gray-400">← Truck</button>
           <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
              <h3 className="text-xl font-black uppercase">Chai & Snacks</h3>
              <div className="space-y-4">
                 {[...TEA_TYPES, ...SNACK_TYPES].map(item => (
                   <div key={item.id} className="bg-white p-4 rounded-2xl border flex items-center justify-between">
                      <div><p className="font-black text-sm uppercase">{item.name}</p><p className="text-[#D32F2F] font-black">₹{item.price}</p></div>
                      <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-xl">
                         <button onClick={() => setCart(p => ({...p, [item.id]: Math.max(0, (p[item.id] || 0) - 1)}))} className="w-8 h-8 bg-white rounded-lg font-bold shadow-sm">-</button>
                         <span className="font-black">{cart[item.id] || 0}</span>
                         <button onClick={() => setCart(p => ({...p, [item.id]: (p[item.id] || 0) + 1}))} className="w-8 h-8 bg-[#FBC02D] rounded-lg font-bold shadow-sm">+</button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           {totalAmount > 0 && (
             <button onClick={handleOrder} className="mt-6 w-full py-5 bg-[#D32F2F] text-white rounded-[24px] font-black flex justify-between px-8 items-center shadow-2xl">
                <span className="text-sm uppercase tracking-widest">Place Order</span>
                <span className="text-lg">₹{totalAmount}</span>
             </button>
           )}
        </div>
      ) : renderTracking()}
    </div>
  );

  const renderTracking = () => {
    if (!activeOrder) {
      setView('main');
      return null;
    }
    const vehicle = vehicles.find(v => v.id === activeOrder.vehicleId);
    const etaSeconds = vehicle ? calculateETASymbolic(vehicle) : 0;
    const mins = Math.floor(etaSeconds / 60);
    const secs = etaSeconds % 60;

    return (
      <div className="h-full bg-white flex flex-col animate-in fade-in duration-500">
        <header className="p-6 border-b flex items-center justify-between">
          <button onClick={() => setView('main')} className="font-black text-gray-400">←</button>
          <h2 className="text-xl font-[900] uppercase tracking-tighter">ORDER TRACKING</h2>
          <div className="w-8"></div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-10">
          <div className="flex flex-col items-center">
            <div className="relative mb-8">
              <div className={`w-56 h-56 rounded-full border-[12px] flex flex-col items-center justify-center shadow-2xl transition-colors duration-1000 ${etaSeconds < 30 ? 'border-[#D32F2F]' : 'border-[#FBC02D]'}`}>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Arriving in</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-[900] tabular-nums tracking-tighter">{mins}</span>
                  <span className="text-2xl font-black text-gray-300">:</span>
                  <span className="text-4xl font-[900] tabular-nums tracking-tighter text-gray-400">{secs.toString().padStart(2, '0')}</span>
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">minutes</p>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl">
                {activeOrder.status === 'preparing' ? '🔥 CHAI IS BREWING' : activeOrder.status === 'on-the-way' ? '🚲 PILOT IS ON THE WAY' : '⏳ ORDER ACCEPTED'}
              </div>
            </div>

            <MapView vehicles={vehicle ? [vehicle] : []} className="w-full h-48 rounded-[32px] shadow-lg mb-8" />

            <div className="w-full space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-black uppercase tracking-widest">Order Progress</h4>
                <span className="text-[10px] font-black text-[#D32F2F] uppercase">ID: {activeOrder.id}</span>
              </div>
              
              <div className="space-y-6">
                {[
                  { label: 'Order Received', status: 'completed' },
                  { label: 'Preparation', status: activeOrder.status === 'preparing' || activeOrder.status === 'on-the-way' ? 'completed' : 'active' },
                  { label: 'On the Way', status: activeOrder.status === 'on-the-way' ? 'active' : 'pending' },
                  { label: 'Delivered', status: 'pending' }
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${step.status === 'completed' ? 'bg-green-500 text-white' : step.status === 'active' ? 'bg-[#FBC02D] animate-pulse' : 'bg-gray-100 text-gray-300'}`}>
                      {step.status === 'completed' ? '✓' : i + 1}
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-wider ${step.status === 'pending' ? 'text-gray-300' : 'text-gray-800'}`}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t bg-gray-50/50">
          <button 
            onClick={() => {
              updateOrderStatus(activeOrder.id, 'delivered', 'paid');
              alert('Enjoy your Thambi Chai! ☕');
              setView('main');
            }}
            className="w-full py-5 bg-gray-900 text-white rounded-[24px] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl active:scale-95 transition-all"
          >
            CONFIRM DELIVERY ✅
          </button>
        </div>
      </div>
    );
  };

  const renderOrders = () => (
    <div className="h-full bg-white p-6 space-y-6 overflow-y-auto no-scrollbar">
       <h2 className="text-2xl font-[900] tracking-tighter text-gray-900 uppercase">HISTORY</h2>
       <div className="space-y-4">
          {myOrders.map(o => (
            <div key={o.id} className="bg-white p-5 rounded-[28px] border-2 border-gray-100 shadow-sm">
               <div className="flex justify-between items-start mb-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order {o.id}</p>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${o.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{o.status}</span>
               </div>
               <p className="font-black text-gray-800 text-sm">₹{o.totalPrice}</p>
               <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase">{new Date(o.timestamp).toLocaleString()}</p>
            </div>
          ))}
          {myOrders.length === 0 && <p className="text-center py-20 text-gray-300 font-bold uppercase text-xs">No orders yet</p>}
       </div>
    </div>
  );

  const renderProfile = () => (
    <div className="h-full bg-white p-6 space-y-8 overflow-y-auto no-scrollbar pb-32">
       <div className="flex items-center gap-6">
          <div className="w-20 h-20 brand-gradient rounded-[32px] flex items-center justify-center text-4xl shadow-xl text-white">👤</div>
          <div>
             <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{currentUser?.name}</h3>
             <button className="text-[10px] font-black text-[#D32F2F] uppercase tracking-widest mt-1">Update Profile →</button>
          </div>
       </div>

       <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-6 rounded-[32px] text-center border">
             <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Tea Coins</p>
             <p className="text-2xl font-black text-[#D32F2F]">{currentUser?.goldPoints || 0}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-[32px] text-center border">
             <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Rank</p>
             <p className="text-xl font-black text-gray-800">GURU</p>
          </div>
       </div>

       <div className="space-y-3">
          {['Saved Addresses', 'Payment Methods', 'Terms & Conditions'].map(label => (
            <button key={label} className="w-full p-6 bg-white border-2 border-gray-100 rounded-[24px] flex justify-between items-center active:scale-95 transition-all">
               <span className="font-black text-[10px] uppercase text-gray-700 tracking-widest">{label}</span>
               <span className="text-gray-300">→</span>
            </button>
          ))}
          <button onClick={() => setActiveTab('support')} className="w-full p-6 bg-gray-900 text-white rounded-[24px] flex justify-between items-center active:scale-95 transition-all shadow-xl">
             <span className="font-black text-[10px] uppercase tracking-widest">Support Center (Chat)</span>
             <span className="text-yellow-400">💬</span>
          </button>
       </div>
    </div>
  );

  const renderSupport = () => (
    <div className="h-full bg-white flex flex-col animate-in fade-in">
       <header className="p-6 border-b flex items-center gap-4">
          <button onClick={() => setActiveTab('profile')} className="font-black text-gray-400">←</button>
          <h2 className="text-xl font-black uppercase tracking-widest">Support Chat</h2>
       </header>
       <div className="flex-1 p-6 space-y-4 overflow-y-auto no-scrollbar bg-gray-50">
          <div className="bg-[#FBC02D] p-4 rounded-2xl max-w-[80%] shadow-sm">
             <p className="text-[11px] font-black text-gray-900 uppercase">Thambi Bot:</p>
             <p className="text-xs font-bold text-gray-800 mt-1">How can we help you today, {currentUser?.name}?</p>
          </div>
          {messages.filter(m => m.senderId === currentUser?.id || m.receiverId === currentUser?.id).map(m => (
            <div key={m.id} className={`p-4 rounded-2xl max-w-[80%] shadow-sm ${m.senderId === currentUser?.id ? 'bg-gray-900 text-white ml-auto' : 'bg-white border text-gray-800'}`}>
               <p className="text-xs font-bold">{m.text}</p>
            </div>
          ))}
       </div>
       <div className="p-6 bg-white border-t flex gap-4">
          <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type issue..." className="flex-1 bg-gray-100 rounded-xl px-4 py-3 outline-none font-bold text-sm" />
          <button onClick={() => { sendMessage('admin', chatInput); setChatInput(''); }} className="w-12 h-12 bg-[#D32F2F] text-white rounded-xl flex items-center justify-center font-black">↑</button>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E5E7EB]">
      <div className="phone-container">
        <div className="phone-notch"></div>
        <div className="h-full bg-white overflow-hidden flex flex-col relative">
           <div className="flex-1 overflow-hidden h-full">
            {activeTab === 'home' && renderHome()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'support' && renderSupport()}
           </div>
           
           <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-[85%] z-50">
            <nav className="bg-white/95 backdrop-blur-md rounded-[32px] p-2 flex items-center justify-between shadow-2xl border border-gray-100">
               <button onClick={() => {setActiveTab('home'); setView('main');}} className={`flex-1 py-3 rounded-2xl transition-all ${activeTab === 'home' ? 'bg-[#FBC02D] text-gray-900' : 'text-gray-400'}`}><span className="text-xl">🏠</span></button>
               <button onClick={() => setActiveTab('orders')} className={`flex-1 py-3 rounded-2xl transition-all ${activeTab === 'orders' ? 'bg-[#FBC02D] text-gray-900' : 'text-gray-400'}`}><span className="text-xl">📜</span></button>
               <button onClick={() => setActiveTab('profile')} className={`flex-1 py-3 rounded-2xl transition-all ${activeTab === 'profile' ? 'bg-[#FBC02D] text-gray-900' : 'text-gray-400'}`}><span className="text-xl">👤</span></button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerView;
