
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { SHIFT_SLOTS } from '../constants';
import MapView from '../components/MapView';
import StockCan from '../components/StockCan';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminView: React.FC = () => {
  const { 
    vehicles, orders, attendanceLogs, 
    refillRequests, completeRefill, shiftBookings, updateShiftStatus, sendNotification, addInboundStock
  } = useApp();
  const [activeTab, setActiveTab] = useState<'fleet' | 'stock' | 'ops' | 'logistics'>('fleet');
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const pendingShifts = shiftBookings.filter(b => b.status === 'pending');
  const activeLogs = attendanceLogs.filter(l => !l.clockOut);

  const renderOps = () => (
    <div className="grid grid-cols-12 gap-8 animate-in fade-in">
       <div className="col-span-12 space-y-8">
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
             <h3 className="text-xl font-black uppercase mb-8">Active Shift Timers</h3>
             <div className="grid grid-cols-3 gap-6">
                {activeLogs.map(log => {
                   const elapsedMin = Math.floor((currentTime - log.clockIn) / 60000);
                   const remainMin = Math.max(0, log.durationMinutes - elapsedMin);
                   const statusColor = remainMin < 15 ? 'text-red-500' : remainMin < 30 ? 'text-yellow-600' : 'text-green-600';

                   return (
                     <div key={log.id} className="bg-gray-50 p-6 rounded-[32px] border flex flex-col justify-between">
                        <div>
                           <p className="font-black text-gray-900 uppercase">{log.driverName}</p>
                           <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Truck: {log.vehicleId} • {log.shift}</p>
                        </div>
                        <div className="mt-6 flex items-center justify-between">
                           <div className="flex flex-col">
                              <span className="text-[9px] font-black uppercase text-gray-400">Time Left</span>
                              <span className={`text-2xl font-black tabular-nums ${statusColor}`}>{remainMin}m</span>
                           </div>
                           <button onClick={() => sendNotification(log.driverId, 'Return to HQ', 'Your shift is ending. Please head to Admin Office.', 'warning')} className="p-4 bg-gray-900 text-white rounded-2xl text-[8px] font-black uppercase">Alert</button>
                        </div>
                     </div>
                   );
                })}
                {activeLogs.length === 0 && <p className="col-span-3 text-center py-20 opacity-20 font-black uppercase">No active shifts</p>}
             </div>
          </div>

          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
             <h3 className="text-xl font-black uppercase mb-8">Shift Approval Queue</h3>
             <div className="grid grid-cols-4 gap-6">
                {pendingShifts.map(b => (
                  <div key={b.id} className="bg-white p-6 rounded-[32px] border border-gray-100">
                     <p className="font-black text-gray-800 uppercase">{b.driverId}</p>
                     <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">{b.slot} • {b.date}</p>
                     <div className="flex gap-2 mt-6">
                        <button onClick={() => updateShiftStatus(b.id, 'approved')} className="flex-1 py-2 bg-[#FBC02D] rounded-xl text-[8px] font-black uppercase">Approve</button>
                        <button onClick={() => updateShiftStatus(b.id, 'rejected')} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-[8px] font-black uppercase">Deny</button>
                     </div>
                  </div>
                ))}
                {pendingShifts.length === 0 && <p className="col-span-4 text-center py-20 opacity-20 font-black uppercase">All caught up!</p>}
             </div>
          </div>

          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
             <h3 className="text-xl font-black uppercase mb-8">Clock-in History</h3>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="border-b">
                         <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Driver</th>
                         <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Unit</th>
                         <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Shift</th>
                         <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Time</th>
                         <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Duration</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y">
                      {attendanceLogs.sort((a,b) => b.clockIn - a.clockIn).map(log => (
                        <tr key={log.id} className="group hover:bg-gray-50 transition-colors">
                           <td className="py-4 font-black text-xs uppercase text-gray-800">{log.driverName}</td>
                           <td className="py-4 font-black text-[10px] uppercase text-gray-400">{log.vehicleId}</td>
                           <td className="py-4 font-black text-[10px] uppercase text-gray-400">{log.shift}</td>
                           <td className="py-4 font-black text-[10px] uppercase text-gray-400">{new Date(log.clockIn).toLocaleString()}</td>
                           <td className="py-4 font-black text-[10px] uppercase text-gray-400">{log.durationMinutes} MIN</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-80 bg-white border-r flex flex-col p-8 space-y-12">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 brand-gradient rounded-2xl flex items-center justify-center text-2xl shadow-lg">☕</div>
            <h1 className="font-black text-xl tracking-tighter uppercase leading-none">THAMBI<br/><span className="text-[#D32F2F]">ADMIN</span></h1>
         </div>
         <nav className="flex-1 space-y-3">
            {[
              { id: 'fleet', label: 'Fleet Map', icon: '📍' },
              { id: 'stock', label: 'Warehouse', icon: '🥫' },
              { id: 'ops', label: 'Workforce', icon: '👤' },
              { id: 'logistics', label: 'Refills', icon: '📝' }
            ].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-5 px-6 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === item.id ? 'bg-[#FBC02D] text-gray-900 shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}>
                <span className="text-2xl">{item.icon}</span>{item.label}
              </button>
            ))}
         </nav>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto h-screen no-scrollbar">
        {activeTab === 'fleet' && <MapView vehicles={vehicles} className="h-full rounded-[40px] shadow-2xl" />}
        {activeTab === 'ops' && renderOps()}
        {activeTab === 'stock' && (
          <div className="grid grid-cols-3 gap-8">
             {vehicles.map(v => (
               <div key={v.id} className="bg-white p-8 rounded-[40px] border shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                     <h4 className="font-black uppercase">{v.name}</h4>
                     <button 
                        onClick={() => addInboundStock(v.id, 'fuel', 20)}
                        className="p-3 bg-orange-100 text-orange-600 rounded-xl text-[8px] font-black uppercase hover:bg-orange-200"
                     >
                        Inbound Fuel
                     </button>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                     <StockCan label="Tea" percentage={v.stock.tea} color="#FBC02D" size="sm" />
                     <StockCan label="Milk" percentage={v.stock.milk} color="#E5E7EB" size="sm" />
                     <StockCan label="Sugar" percentage={v.stock.sugar} color="#D32F2F" size="sm" />
                     <StockCan label="Cups" percentage={v.stock.cups} color="#9CA3AF" size="sm" />
                  </div>
                  <div className="mt-8 pt-8 border-t grid grid-cols-2 gap-4">
                     <button onClick={() => addInboundStock(v.id, 'tea', 10)} className="py-2 bg-gray-50 border rounded-xl text-[8px] font-black uppercase">Add Tea</button>
                     <button onClick={() => addInboundStock(v.id, 'milk', 10)} className="py-2 bg-gray-50 border rounded-xl text-[8px] font-black uppercase">Add Milk</button>
                  </div>
               </div>
             ))}
          </div>
        )}
        {activeTab === 'logistics' && (
          <div className="grid grid-cols-3 gap-6">
             {refillRequests.map(r => (
               <div key={r.id} className={`p-6 rounded-[32px] border ${r.status === 'completed' ? 'opacity-40 bg-gray-50' : 'bg-white border-[#FBC02D] shadow-lg'}`}>
                  <p className="font-black uppercase text-xs">Request {r.id}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">Unit: {r.vehicleId} • {r.type}</p>
                  <div className="mt-4 flex flex-wrap gap-1">
                     {r.items.map(i => <span key={i} className="text-[7px] font-black uppercase bg-gray-100 px-2 py-0.5 rounded">{i}</span>)}
                  </div>
                  {r.status === 'pending' && <button onClick={() => completeRefill(r.id)} className="mt-6 w-full py-3 bg-gray-900 text-white rounded-xl font-black text-[9px] uppercase">Mark Filled</button>}
               </div>
             ))}
             {refillRequests.length === 0 && <p className="col-span-3 text-center py-20 opacity-20 font-black uppercase">No active requests</p>}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminView;
