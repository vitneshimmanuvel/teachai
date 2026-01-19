
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { TEA_TYPES, SNACK_TYPES, SHIFT_SLOTS } from '../constants';
import StockCan from '../components/StockCan';

const DriverView: React.FC = () => {
  const { 
    vehicles, orders, currentUser, 
    clockIn, clockOut, attendanceLogs, processManualSale,
    notifications, markNotificationRead, shiftBookings, bookShift,
    requestRefill, refillRequests, submitHealthReport, sendMessage
  } = useApp();
  
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeTab, setActiveTab] = useState<'dash' | 'sale' | 'schedule' | 'tools' | 'inbox'>('dash');
  const [manualCart, setManualCart] = useState<Record<string, number>>({});
  const [showPaymentQR, setShowPaymentQR] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'perfect' | 'needs-service' | 'critical'>('perfect');
  const [chatMode, setChatMode] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  
  // Shift Booking State
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const myVehicle = vehicles.find(v => v.driverName === (currentUser?.name || 'Ravi')) || vehicles[0];
  const myOrders = orders.filter(o => o.vehicleId === myVehicle.id);
  const myNotifications = notifications.filter(n => n.userId === currentUser?.id || n.userId === 'all');
  const unreadCount = myNotifications.filter(n => !n.read).length;
  const myBookings = shiftBookings.filter(b => b.driverId === currentUser?.id);
  const myPendingRefills = refillRequests.filter(r => r.vehicleId === myVehicle.id && r.status === 'pending');

  const activeShift = attendanceLogs.find(l => l.driverId === currentUser?.id && !l.clockOut);
  const remainingMinutes = activeShift ? Math.max(0, activeShift.durationMinutes - Math.floor(elapsed / 60)) : 0;

  useEffect(() => {
    setIsClockedIn(!!activeShift);
    if (activeShift) {
      const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - activeShift.clockIn) / 1000)), 1000);
      return () => clearInterval(timer);
    }
  }, [activeShift]);

  const cupsSoldToday = myOrders.filter(o => o.status === 'delivered').reduce((acc, o) => 
    acc + o.items.filter(i => i.type.toLowerCase().includes('tea')).reduce((sum, item) => sum + item.quantity, 0)
  , 0);
  const revenueToday = myOrders.filter(o => o.status === 'delivered').reduce((acc, o) => acc + o.totalPrice, 0);

  const handleBookSlot = (slot: string) => {
    const isAlreadyBooked = myBookings.some(b => b.date === selectedDate && b.slot === slot);
    if (isAlreadyBooked) {
      alert("You already have a booking for this slot!");
      return;
    }
    
    bookShift({
      id: 'BK-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      driverId: currentUser!.id,
      vehicleId: myVehicle.id,
      date: selectedDate,
      slot: slot,
      status: 'pending',
      timestamp: Date.now()
    });
    alert(`Slot Request Sent: ${slot} on ${selectedDate}`);
  };

  const getFuelColor = (pct: number) => {
    if (pct < 20) return '#D32F2F'; // Red
    if (pct < 50) return '#FBC02D'; // Yellow
    return '#10B981'; // Green
  };

  const renderDash = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-[#D32F2F] to-red-800 p-6 rounded-[32px] shadow-xl text-white relative overflow-hidden">
          <p className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-70">Revenue Today</p>
          <h3 className="text-3xl font-black">₹{revenueToday}</h3>
          <span className="absolute -right-4 -bottom-4 text-6xl opacity-10">💰</span>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <p className="text-gray-400 text-[8px] font-black uppercase tracking-widest mb-1">Target Status</p>
          <h3 className="text-2xl font-black text-gray-900">{cupsSoldToday}/{currentUser?.salesTarget || 50}</h3>
          <div className="h-1.5 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-green-500" style={{width: `${Math.min(100, (cupsSoldToday / (currentUser?.salesTarget || 50)) * 100)}%`}}></div>
          </div>
        </div>
      </div>

      {isClockedIn && (
        <div className={`p-6 rounded-[32px] shadow-lg flex justify-between items-center text-white transition-colors duration-500 ${remainingMinutes < 15 ? 'bg-[#D32F2F]' : remainingMinutes < 30 ? 'bg-yellow-600' : 'bg-gray-900'}`}>
           <div>
              <p className="text-[9px] font-black uppercase opacity-60">Shift Clock</p>
              <h4 className="text-xl font-black uppercase">{remainingMinutes}m Remaining</h4>
           </div>
           <div className="text-3xl animate-bounce">⏱️</div>
        </div>
      )}

      <section className="bg-gray-50 p-8 rounded-[40px] border">
        <h3 className="font-black text-[9px] text-gray-400 uppercase tracking-widest mb-6 text-center">Graphical Unit Stock</h3>
        <div className="grid grid-cols-2 gap-8">
           <StockCan label="Tea Base" percentage={myVehicle.stock.tea} color="#FBC02D" size="sm" />
           <StockCan label="Fresh Milk" percentage={myVehicle.stock.milk} color="#E5E7EB" size="sm" />
           <StockCan label="Cup Count" percentage={myVehicle.stock.cups} color="#9CA3AF" size="sm" />
           <StockCan label="Snacks" percentage={myVehicle.stock.snacks} color="#D32F2F" size="sm" />
        </div>
      </section>

      <div className="flex gap-4">
         <button onClick={() => setChatMode(true)} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest">Chat with Admin</button>
         <button onClick={() => setActiveTab('tools')} className="flex-1 py-4 bg-white border border-gray-100 rounded-2xl font-black text-[9px] uppercase tracking-widest">Health & Tools</button>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-32">
       <div className="bg-gray-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 text-6xl">💎</div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-yellow-500 mb-1">Thambi Credits</p>
          <h3 className="text-4xl font-black">{currentUser?.bonusCredits || 0} PTS</h3>
          <p className="text-[8px] font-bold text-gray-400 uppercase mt-4 tracking-tighter">Use points to prioritize slot bookings</p>
       </div>

       <section className="space-y-4">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Book New Slot</h4>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
             {[0, 1, 2, 3, 4, 5].map(offset => {
               const d = new Date();
               d.setDate(d.getDate() + offset);
               const dateStr = d.toISOString().split('T')[0];
               const isActive = selectedDate === dateStr;
               return (
                 <button 
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`flex-shrink-0 w-24 p-4 rounded-[24px] border-2 transition-all ${isActive ? 'bg-[#FBC02D] border-[#FBC02D] text-gray-900 shadow-lg scale-105' : 'bg-white border-gray-100 text-gray-400'}`}
                 >
                    <p className="text-[8px] font-black uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                    <p className="text-lg font-black">{d.getDate()}</p>
                 </button>
               );
             })}
          </div>
       </section>

       <section className="space-y-4">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Available Time Slots</h4>
          <div className="grid gap-4">
             {SHIFT_SLOTS.map(slot => {
               const booking = myBookings.find(b => b.date === selectedDate && b.slot === slot);
               return (
                 <div key={slot} className="bg-white p-6 rounded-[32px] border-2 border-gray-100 flex items-center justify-between shadow-sm">
                    <div>
                       <p className="font-black text-xs uppercase text-gray-800">{slot}</p>
                       <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase">Unit Availability: HIGH</p>
                    </div>
                    {booking ? (
                      <span className={`text-[8px] font-black uppercase px-4 py-2 rounded-full shadow-sm ${
                        booking.status === 'approved' ? 'bg-green-100 text-green-700' : 
                        booking.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {booking.status}
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleBookSlot(slot)}
                        className="bg-[#D32F2F] text-white px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md active:scale-95 transition-all"
                      >
                        BOOK
                      </button>
                    )}
                 </div>
               );
             })}
          </div>
       </section>

       <section className="space-y-4">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Shift Booking History</h4>
          <div className="space-y-3">
             {myBookings.length > 0 ? myBookings.sort((a,b) => b.timestamp - a.timestamp).map(b => (
               <div key={b.id} className="bg-white p-6 rounded-[32px] border-2 border-gray-50 flex justify-between items-center shadow-sm hover:border-[#FBC02D] transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                      b.status === 'approved' ? 'bg-green-100' : 
                      b.status === 'rejected' ? 'bg-red-100' : 
                      'bg-blue-100'
                    }`}>
                      {b.status === 'approved' ? '✅' : b.status === 'rejected' ? '❌' : '⏳'}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-900 uppercase">{b.date}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{b.slot}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-lg ${
                      b.status === 'approved' ? 'text-green-600' : 
                      b.status === 'rejected' ? 'text-red-600' : 
                      'text-blue-600'
                    }`}>
                      {b.status}
                    </span>
                    <p className="text-[7px] font-bold text-gray-300 uppercase mt-1">ID: {b.id}</p>
                  </div>
               </div>
             )) : (
               <div className="bg-gray-50 rounded-[32px] py-16 text-center border-2 border-dashed border-gray-200">
                  <span className="text-4xl opacity-20">📅</span>
                  <p className="text-center text-gray-300 font-black uppercase text-[10px] mt-4">No Previous Bookings Found</p>
               </div>
             )}
          </div>
       </section>
    </div>
  );

  const renderTools = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500 pb-32">
       <h3 className="text-2xl font-black uppercase">Vehicle & Logistics</h3>
       
       <div className="bg-gray-50 p-8 rounded-[40px] border flex flex-col items-center relative overflow-hidden">
          {myVehicle.stock.fuel < 20 && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-[8px] font-black animate-bounce">LOW FUEL</div>
          )}
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Real-time Fuel Monitor</h4>
          <StockCan 
            label="Fuel Level" 
            percentage={myVehicle.stock.fuel} 
            color={getFuelColor(myVehicle.stock.fuel)} 
            size="md" 
          />
          <div className="w-full h-px bg-gray-200 my-8"></div>
          <div className="w-full grid grid-cols-2 gap-4">
             <div className="text-center">
                <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Maintenance</p>
                <p className="text-xs font-black text-gray-800">{myVehicle.lastMaintained}</p>
             </div>
             <div className="text-center border-l">
                <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Vehicle Health</p>
                <p className={`text-xs font-black uppercase ${myVehicle.health === 'perfect' ? 'text-green-600' : 'text-red-500'}`}>{myVehicle.health}</p>
             </div>
          </div>
       </div>

       <div className="bg-white p-8 rounded-[40px] border shadow-sm">
          <h4 className="text-xs font-black uppercase mb-6 text-center">Self Health Diagnostic</h4>
          <div className="grid grid-cols-2 gap-3">
             <button onClick={() => setHealthStatus('perfect')} className={`py-5 rounded-2xl font-black text-[10px] border-2 transition-all ${healthStatus === 'perfect' ? 'bg-gray-900 text-white border-black' : 'bg-gray-50 text-gray-400 border-transparent'}`}>PERFECT ✅</button>
             <button onClick={() => setHealthStatus('needs-service')} className={`py-5 rounded-2xl font-black text-[10px] border-2 transition-all ${healthStatus === 'needs-service' ? 'bg-gray-900 text-white border-black' : 'bg-gray-50 text-gray-400 border-transparent'}`}>SERVICE 🛠️</button>
          </div>
          <button onClick={() => {
              submitHealthReport({id: Math.random().toString(), vehicleId: myVehicle.id, driverId: currentUser!.id, status: healthStatus, notes: 'Self check', timestamp: Date.now()});
              alert('Diagnostic Report Dispatched to HQ');
          }} className="w-full mt-4 bg-[#FBC02D] text-gray-900 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-md active:scale-95">Dispatch Report</button>
       </div>
       
       <div className="space-y-4">
          <h4 className="text-xs font-black uppercase text-center">In-Field Refill Support</h4>
          
          {myPendingRefills.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-blue-800 uppercase">Support Unit Dispatched</p>
              <span className="text-xs animate-spin">⏳</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
             <button onClick={() => {
                 requestRefill(myVehicle.id, ['Tea Base', 'Fresh Milk', 'Cups'], 'stock');
                 alert('Stock Refill Ticket Created');
             }} className="bg-white border-2 border-gray-100 p-8 rounded-[48px] text-center shadow-sm active:scale-95 transition-all">
                <span className="text-4xl">🍵</span>
                <p className="font-black text-[10px] uppercase mt-4 tracking-widest">REFILL STOCK</p>
                <p className="text-[8px] text-gray-400 mt-1">CUPS/TEA/MILK</p>
             </button>
             <button onClick={() => {
                 requestRefill(myVehicle.id, ['Fuel'], 'fuel');
                 alert('Emergency Fuel Unit Requested');
             }} className="bg-white border-2 border-gray-100 p-8 rounded-[48px] text-center shadow-sm active:scale-95 transition-all">
                <span className="text-4xl">⛽</span>
                <p className="font-black text-[10px] uppercase mt-4 tracking-widest text-orange-600">REFILL FUEL</p>
                <p className="text-[8px] text-gray-400 mt-1">FULL TANK REQ</p>
             </button>
          </div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E5E7EB]">
      <div className="phone-container">
        <div className="phone-notch"></div>
        <div className="h-full bg-white overflow-hidden flex flex-col pt-10">
          <header className="px-8 pb-6 border-b flex justify-between items-center bg-white z-20">
             <div>
                <h2 className="text-2xl font-black uppercase leading-none">{currentUser?.name?.split(' ')[0]}</h2>
                <p className="text-[8px] font-black text-gray-400 mt-1 uppercase">Unit: {myVehicle.id}</p>
             </div>
             <button onClick={() => isClockedIn ? clockOut(currentUser!.id) : clockIn(currentUser!.id, currentUser!.name, myVehicle.id, 'Morning', 180)} className={`px-4 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest ${isClockedIn ? 'bg-[#D32F2F] text-white' : 'bg-[#FBC02D] text-gray-900'}`}>
               {isClockedIn ? 'END SHIFT' : 'START'}
             </button>
          </header>

          <div className="flex-1 overflow-y-auto p-6 pb-32 no-scrollbar">
            {activeTab === 'dash' && renderDash()}
            {activeTab === 'schedule' && renderSchedule()}
            {activeTab === 'tools' && renderTools()}
            {activeTab === 'sale' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-black uppercase">Quick Sale</h3>
                <div className="grid gap-3">
                   {[...TEA_TYPES, ...SNACK_TYPES].map(item => (
                     <div key={item.id} className="bg-white p-4 rounded-2xl border flex items-center justify-between">
                        <div><p className="font-black text-xs uppercase">{item.name}</p><p className="text-[#D32F2F] font-black text-xs">₹{item.price}</p></div>
                        <div className="flex items-center gap-3">
                           <button onClick={() => setManualCart(p => ({...p, [item.id]: Math.max(0, (p[item.id] || 0) - 1)}))} className="w-8 h-8 bg-gray-50 rounded-lg shadow-sm font-black">-</button>
                           <span className="font-black text-xs">{manualCart[item.id] || 0}</span>
                           <button onClick={() => setManualCart(p => ({...p, [item.id]: (p[item.id] || 0) + 1}))} className="w-8 h-8 bg-[#FBC02D] rounded-lg shadow-sm font-black">+</button>
                        </div>
                     </div>
                   ))}
                   <button onClick={() => setShowPaymentQR(true)} className="mt-4 bg-[#D32F2F] text-white py-5 rounded-[24px] font-black uppercase text-xs shadow-xl">COLLECT PAY</button>
                </div>
              </div>
            )}
            {activeTab === 'inbox' && (
              <div className="space-y-6">
                 <h3 className="text-2xl font-black uppercase">Inbox</h3>
                 {myNotifications.map(n => (
                   <div key={n.id} onClick={() => markNotificationRead(n.id)} className={`p-6 rounded-[28px] border-2 transition-all ${n.read ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-[#FBC02D] shadow-lg'}`}>
                      <h4 className="font-black text-xs uppercase">{n.title}</h4>
                      <p className="text-[10px] font-bold text-gray-500 mt-1">{n.message}</p>
                   </div>
                 ))}
              </div>
            )}
          </div>

          {chatMode && (
            <div className="absolute inset-0 bg-white z-[100] flex flex-col pt-10">
               <header className="p-6 border-b flex justify-between items-center">
                  <h3 className="font-black uppercase">Admin Chat</h3>
                  <button onClick={() => setChatMode(false)} className="text-[#D32F2F] font-black">CLOSE</button>
               </header>
               <div className="flex-1 p-6 bg-gray-50 overflow-y-auto space-y-4">
                  <div className="bg-white p-4 rounded-2xl max-w-[80%] shadow-sm border">
                     <p className="text-[11px] font-black uppercase text-[#D32F2F]">Admin Hub</p>
                     <p className="text-xs font-bold mt-1">Status: Online. Send your updates.</p>
                  </div>
               </div>
               <div className="p-6 bg-white border-t flex gap-4">
                  <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Type msg..." className="flex-1 bg-gray-100 px-4 rounded-xl font-bold" />
                  <button onClick={() => {sendMessage('admin', chatMsg); setChatMsg('');}} className="w-12 h-12 bg-gray-900 text-white rounded-xl font-black">↑</button>
               </div>
            </div>
          )}

          {showPaymentQR && (
            <div className="absolute inset-0 z-[100] bg-black/80 flex items-center justify-center p-8 backdrop-blur-md">
               <div className="bg-white w-full max-w-sm rounded-[48px] p-10 flex flex-col items-center gap-8">
                  <h4 className="text-xl font-black uppercase">Collect ₹{Object.entries(manualCart).reduce((acc, [id, qty]) => acc + (qty as number) * ([...TEA_TYPES, ...SNACK_TYPES].find(t => t.id === id)?.price || 0), 0)}</h4>
                  <div className="w-56 h-56 bg-black rounded-[40px] p-6 flex items-center justify-center">
                    <div className="text-white text-4xl">₹</div>
                  </div>
                  <button onClick={() => {processManualSale(myVehicle.id, Object.entries(manualCart).map(([id, qty]) => ({type: id, quantity: qty as number, price: 10}))); setManualCart({}); setShowPaymentQR(false);}} className="w-full bg-green-500 text-white py-5 rounded-[24px] font-black uppercase text-xs">PAYMENT DONE ✅</button>
                  <button onClick={() => setShowPaymentQR(false)} className="text-gray-400 font-black text-[10px] uppercase">Cancel</button>
               </div>
            </div>
          )}

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] z-50">
            <nav className="bg-white/95 backdrop-blur-md rounded-[32px] p-2 flex items-center justify-between shadow-2xl border border-gray-100">
               <button onClick={() => setActiveTab('dash')} className={`flex-1 py-3 rounded-2xl transition-all ${activeTab === 'dash' ? 'bg-[#FBC02D]' : 'text-gray-400'}`}><span className="text-xl">📊</span></button>
               <button onClick={() => setActiveTab('schedule')} className={`flex-1 py-3 rounded-2xl transition-all ${activeTab === 'schedule' ? 'bg-[#FBC02D]' : 'text-gray-400'}`}><span className="text-xl">📅</span></button>
               <button onClick={() => setActiveTab('sale')} className={`flex-1 py-3 rounded-2xl transition-all ${activeTab === 'sale' ? 'bg-[#FBC02D]' : 'text-gray-400'}`}><span className="text-xl">💰</span></button>
               <button onClick={() => setActiveTab('tools')} className={`flex-1 py-3 rounded-2xl transition-all ${activeTab === 'tools' ? 'bg-[#FBC02D]' : 'text-gray-400'}`}><span className="text-xl">⚙️</span></button>
               <button onClick={() => setActiveTab('inbox')} className={`flex-1 py-3 rounded-2xl transition-all relative ${activeTab === 'inbox' ? 'bg-[#FBC02D]' : 'text-gray-400'}`}>
                 <span className="text-xl">📬</span>
                 {unreadCount > 0 && <span className="absolute top-2 right-4 w-2 h-2 bg-[#D32F2F] rounded-full border border-white"></span>}
               </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverView;
