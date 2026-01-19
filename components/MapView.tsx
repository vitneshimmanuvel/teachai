
import React from 'react';
import { Vehicle } from '../types';

interface MapViewProps {
  vehicles: Vehicle[];
  onVehicleClick?: (v: Vehicle) => void;
  className?: string;
}

const MapView: React.FC<MapViewProps> = ({ vehicles, onVehicleClick, className = "h-64" }) => {
  return (
    <div className={`relative bg-blue-50 rounded-2xl overflow-hidden border-2 border-gray-100 ${className}`}>
      {/* Mock Map Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1000')] opacity-30 bg-cover"></div>
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-10 pointer-events-none">
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className="border border-gray-400"></div>
        ))}
      </div>

      {/* Vehicle Markers */}
      {vehicles.map((v) => (
        <button
          key={v.id}
          onClick={() => onVehicleClick?.(v)}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out hover:scale-110 z-10 p-2 rounded-full border-2 ${
            v.status === 'available' ? 'bg-[#FBC02D] border-white' : 'bg-gray-400 border-white opacity-60'
          } shadow-xl`}
          style={{
            top: `${(v.location.lat - 13.07) * 5000 % 100}%`,
            left: `${(v.location.lng - 80.25) * 5000 % 100}%`,
          }}
        >
          <div className="flex flex-col items-center">
             <span className="text-lg">🚲</span>
             <div className="mt-1 px-2 py-0.5 bg-white rounded text-[10px] font-bold text-gray-800 shadow truncate max-w-[80px]">
               {v.driverName}
             </div>
          </div>
        </button>
      ))}

      {/* User Marker (Center) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
         <div className="relative">
           <div className="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
           <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap">
             YOU ARE HERE
           </div>
         </div>
      </div>
    </div>
  );
};

export default MapView;
