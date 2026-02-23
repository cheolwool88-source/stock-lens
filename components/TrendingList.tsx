
import React from 'react';
import { StockInfo } from '../types';

interface TrendingListProps {
  stocks: StockInfo[];
  onSelect: (stock: StockInfo) => void;
}

const TrendingList: React.FC<TrendingListProps> = ({ stocks, onSelect }) => {
  return (
    <div className="w-full mt-4">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          실시간 인기 검색 TOP 10
        </h3>
        {stocks.length > 3 && (
          <span className="text-[10px] text-slate-500 font-medium">스크롤하여 더보기</span>
        )}
      </div>

      <div className="glass rounded-2xl border border-slate-800/50 overflow-hidden shadow-xl">
        <div className="grid grid-cols-1 max-h-[260px] overflow-y-auto custom-scrollbar">
          {stocks.map((stock, idx) => (
            <button
              key={stock.symbol}
              onClick={() => onSelect(stock)}
              className={`group relative flex items-center justify-between p-4 transition-all hover:bg-slate-800/50 border-b border-slate-800/50 last:border-0 ${idx % 2 === 0 ? 'bg-slate-900/10' : ''}`}
            >
              <div className="flex items-center gap-4 text-left flex-1">
                <div className="w-8 h-8 flex-shrink-0 bg-sky-400/10 rounded-lg flex items-center justify-center font-black text-xs text-sky-400 border border-sky-400/20 group-hover:bg-sky-400 group-hover:text-white transition-all">
                  {idx + 1}
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-slate-200 group-hover:text-sky-400 transition-colors truncate">{stock.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{stock.symbol}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="font-mono font-bold text-sm text-slate-100">{stock.price.toLocaleString()}</div>
                  <div className={`text-[10px] flex items-center justify-end gap-1 ${stock.change >= 0 ? 'text-rose-500' : 'text-blue-500'}`}>
                    {stock.change >= 0 ? '▲' : '▼'}{Math.abs(stock.changePercent)}%
                  </div>
                </div>
              </div>
            </button>
          ))}
          
          {stocks.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm italic">
              데이터를 불러오는 중입니다...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendingList;
