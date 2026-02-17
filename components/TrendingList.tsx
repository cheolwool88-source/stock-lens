
import React from 'react';
import { StockInfo } from '../types';

interface TrendingListProps {
  stocks: StockInfo[];
  onSelect: (stock: StockInfo) => void;
}

const TrendingList: React.FC<TrendingListProps> = ({ stocks, onSelect }) => {
  return (
    <div className="w-full mt-12 overflow-hidden">
      <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-4 px-2 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
        실시간 인기 검색 TOP 5
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {stocks.map((stock, idx) => (
          <button
            key={stock.symbol}
            onClick={() => onSelect(stock)}
            className="flex-shrink-0 glass p-5 rounded-2xl w-48 text-left transition-all hover:-translate-y-1 hover:border-sky-500/30 group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded">#{idx + 1}</span>
              <span className={`text-xs font-medium ${stock.change >= 0 ? 'text-rose-400' : 'text-blue-400'}`}>
                {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent)}%
              </span>
            </div>
            <div className="text-lg font-bold text-slate-100 group-hover:text-sky-300 transition-colors truncate">{stock.name}</div>
            <div className="text-xs text-slate-500 font-mono mb-2">{stock.symbol}</div>
            <div className="mt-1 text-lg font-mono font-semibold text-slate-200">
              {stock.price.toLocaleString()}<span className="text-xs ml-1 font-sans text-slate-500">원</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TrendingList;
