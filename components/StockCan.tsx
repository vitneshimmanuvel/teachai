
import React from 'react';

interface StockCanProps {
  label: string;
  percentage: number;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

const StockCan: React.FC<StockCanProps> = ({ label, percentage, color, size = 'md' }) => {
  const hMap = { sm: 'h-24 w-16', md: 'h-32 w-20', lg: 'h-48 w-32' };
  
  return (
    <div className="flex flex-col items-center group">
      <div className={`relative ${hMap[size]} bg-gray-100 rounded-[14px] overflow-hidden border border-gray-100 shadow-inner ring-4 ring-white`}>
        {/* Lid accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 z-10"></div>
        
        {/* Liquid */}
        <div 
          className="liquid transition-all duration-1000"
          style={{ height: `${percentage}%`, backgroundColor: color }}
        >
          <div className="absolute top-0 left-0 w-[200%] h-4 bg-white/20 rounded-full -translate-y-2 animate-[wave_3s_linear_infinite]"></div>
        </div>
        
        {/* Value */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <span className={`font-[900] tracking-tighter ${size === 'lg' ? 'text-2xl' : 'text-[11px]'} ${percentage > 50 ? 'text-white' : 'text-gray-400'}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      <p className="mt-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-center group-hover:text-gray-900 transition-colors">{label}</p>
      <style>{`
        @keyframes wave {
          0% { transform: translate(-50%, -8px); }
          100% { transform: translate(0%, -8px); }
        }
      `}</style>
    </div>
  );
};

export default StockCan;
