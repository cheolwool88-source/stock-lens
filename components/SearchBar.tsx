
import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  return (
    <div className="w-full max-w-2xl mx-auto transform transition-all hover:scale-[1.01]">
      <form onSubmit={handleSubmit} className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="종목명 또는 코드를 입력하세요 (예: NVDA, 삼성전자)"
          className="w-full bg-slate-800/50 border border-slate-700 focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 rounded-2xl py-5 px-6 pl-14 text-lg outline-none transition-all placeholder:text-slate-500 text-white shadow-2xl"
        />
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-sky-600 hover:bg-sky-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg active:scale-95"
        >
          분석하기
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
