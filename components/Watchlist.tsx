
import React from 'react';
import { StockInfo } from '../types';

interface WatchlistProps {
  stocks: StockInfo[];
  onSelect: (stock: StockInfo) => void;
  onRemove: (stock: StockInfo) => void;
}

const Watchlist: React.FC<WatchlistProps> = ({ stocks, onSelect, onRemove }) => {
  return (
    <div className="w-full mt-4">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          나의 관심종목 ({stocks.length})
        </h3>
        {stocks.length >= 3 && (
          <span className="text-[10px] text-slate-500 font-medium">스크롤하여 더보기</span>
        )}
      </div>
      
      {stocks.length === 0 ? (
        <div className="glass p-8 rounded-2xl border-dashed border-2 border-slate-800 flex flex-col items-center justify-center text-center">
          <p className="text-slate-500 text-sm italic">아직 관심종목이 없습니다.<br/>종목 분석 중 별표를 눌러 추가해보세요.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-slate-800/50 overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 max-h-[260px] overflow-y-auto custom-scrollbar">
            {stocks.map((stock, idx) => (
              <div
                key={stock.symbol}
                className={`group relative flex items-center justify-between p-4 transition-all hover:bg-slate-800/50 border-b border-slate-800/50 last:border-0 ${idx % 2 === 0 ? 'bg-slate-900/10' : ''}`}
              >
                <button 
                  onClick={() => onSelect(stock)}
                  className="flex-1 flex items-center gap-4 text-left"
                >
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-slate-400 group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors">
                    {stock.name[0]}
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-bold text-slate-200 group-hover:text-amber-400 transition-colors truncate">{stock.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{stock.symbol}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="font-mono font-bold text-sm text-slate-100">{stock.price.toLocaleString()}</div>
                    <div className={`text-[10px] flex items-center justify-end gap-1 ${stock.change >= 0 ? 'text-rose-500' : 'text-blue-500'}`}>
                      {stock.change >= 0 ? '▲' : '▼'}{Math.abs(stock.changePercent)}%
                    </div>
                  </div>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemove(stock); }}
                  className="ml-4 p-2 text-slate-600 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-500/5"
                  title="제거"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Watchlist;