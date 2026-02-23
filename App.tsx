
import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import TrendingList from './components/TrendingList';
import Watchlist from './components/Watchlist';
import AnalysisDashboard from './components/AnalysisDashboard';
import MBTIModal from './components/MBTIModal';
import { StockInfo, ViewType, MBTIProfile } from './types';
import { searchStockInfo, fetchTrendingStocks } from './services/geminiService';
import { TRENDING_STOCKS } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('main');
  const [selectedStock, setSelectedStock] = useState<StockInfo | null>(null);
  const [trendingStocks, setTrendingStocks] = useState<StockInfo[]>(TRENDING_STOCKS);
  const [watchlist, setWatchlist] = useState<StockInfo[]>([]);
  const [mbti, setMbti] = useState<MBTIProfile | null>(null);
  const [isMbtiModalOpen, setIsMbtiModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // 앱 시작 시 실시간 인기 종목 로드
    fetchTrendingStocks().then(setTrendingStocks);
    
    // 로컬 스토리지에서 관심종목 로드
    const savedWatchlist = localStorage.getItem('stock-lens-watchlist');
    if (savedWatchlist) {
      try {
        setWatchlist(JSON.parse(savedWatchlist));
      } catch (e) {
        console.error("관심종목 로드 에러", e);
      }
    }
  }, []);

  useEffect(() => {
    // 관심종목 변경 시 로컬 스토리지 저장
    localStorage.setItem('stock-lens-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const stockData = await searchStockInfo(query);
      if (stockData) {
        setSelectedStock(stockData);
        setView('dashboard');
        
        // 관심종목 가격 동기화 (검색된 최신 가격으로 업데이트)
        setWatchlist(prev => prev.map(s => s.symbol === stockData.symbol ? stockData : s));
      } else {
        alert("종목 정보를 찾을 수 없습니다. 정확한 종목명이나 티커를 입력해주세요.");
      }
    } catch (err) {
      console.error("주식 검색 처리 에러:", err);
      alert("현재 분석 엔진의 호출량이 너무 많습니다. 잠시 후 다시 이용해주세요.");
    } finally {
      setIsSearching(false);
    }
  };

  const toggleWatchlist = (stock: StockInfo) => {
    setWatchlist(prev => {
      const exists = prev.find(s => s.symbol === stock.symbol);
      if (exists) {
        return prev.filter(s => s.symbol !== stock.symbol);
      }
      return [...prev, stock];
    });
  };

  const handleMbtiResult = (profile: MBTIProfile) => {
    setMbti(profile);
    setIsMbtiModalOpen(false);
  };

  const isWatchlisted = selectedStock ? !!watchlist.find(s => s.symbol === selectedStock.symbol) : false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-sky-500/30">
      {/* 배경 장식 */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-sky-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full"></div>
      </div>

      {/* 헤더 / 네비게이션 */}
      <header className="border-b border-slate-900 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setView('main')}
          >
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-sky-600/20">L</div>
            <h1 className="text-xl font-bold tracking-tight">스탁렌즈 <span className="text-slate-500 font-medium">Stock-Lens</span></h1>
          </div>
          <div className="flex items-center gap-4">
            {mbti ? (
              <button 
                onClick={() => setIsMbtiModalOpen(true)}
                className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 px-4 py-1.5 rounded-full transition-all group"
              >
                <span className="text-xs font-bold text-sky-400">투자 성향:</span>
                <span className="text-sm font-medium">{mbti.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            ) : (
              <button 
                onClick={() => setIsMbtiModalOpen(true)}
                className="text-sm font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-2 transition-colors"
              >
                투자 MBTI 테스트하기
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {view === 'main' ? (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-700">
            <div className="text-center mb-16 max-w-2xl">
              <h2 className="text-5xl font-black mb-6 leading-tight">
                복잡한 시장과 통계를 한눈에,<br/>
                <span className="gradient-text">결정은 더 빠르게.</span>
              </h2>
              <p className="text-slate-400 text-lg">
                인공지능 기반의 스마트 종목 분석 시스템 스탁렌즈입니다.<br/>
                네이버 금융의 실시간 트렌드와 조화를 이루는 전문 인사이트를 제공합니다.
              </p>
            </div>

            {isSearching ? (
              <div className="w-full max-w-2xl text-center py-20">
                <div className="inline-block w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sky-400 font-bold text-xl animate-pulse">실시간 시장 데이터를 분석 중입니다...</p>
                <p className="text-slate-500 text-sm mt-2">금융 분석 엔진이 최신 정보를 수집하고 정교하게 처리하고 있습니다.</p>
              </div>
            ) : (
              <div className="w-full max-w-4xl space-y-12">
                <SearchBar onSearch={handleSearch} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <TrendingList stocks={trendingStocks} onSelect={(stock) => handleSearch(stock.name)} />
                  <Watchlist stocks={watchlist} onSelect={(stock) => handleSearch(stock.name)} onRemove={toggleWatchlist} />
                </div>
              </div>
            )}
            
            <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
              <div className="glass p-8 rounded-3xl group hover:border-sky-500/30 transition-all">
                <div className="text-3xl mb-4">🚀</div>
                <h4 className="text-xl font-bold mb-3">초고속 엔진</h4>
                <p className="text-slate-500 text-sm">실시간 시세와 수급 현황을 즉각적으로 처리하여 가장 최신의 정보를 전달합니다.</p>
              </div>
              <div className="glass p-8 rounded-3xl group hover:border-emerald-500/30 transition-all">
                <div className="text-3xl mb-4">🧠</div>
                <h4 className="text-xl font-bold mb-3">AI 뉴스 브리핑</h4>
                <p className="text-slate-500 text-sm">수많은 뉴스 중 핵심만 골라 3줄로 요약해 드립니다. 정보 과잉의 시대, 스탁렌즈가 길을 제시합니다.</p>
              </div>
              <div className="glass p-8 rounded-3xl group hover:border-amber-500/30 transition-all">
                <div className="text-3xl mb-4">🛡️</div>
                <h4 className="text-xl font-bold mb-3">정밀 기술 분석</h4>
                <p className="text-slate-500 text-sm">이동평균선 교차, 과매도 구간 진입 등 중요한 시그널을 놓치지 않게 분석합니다.</p>
              </div>
            </div>
          </div>
        ) : (
          selectedStock && (
            <AnalysisDashboard 
              stock={selectedStock} 
              mbti={mbti?.type || null} 
              isWatchlisted={isWatchlisted}
              onToggleWatchlist={() => toggleWatchlist(selectedStock)}
              onBack={() => setView('main')} 
            />
          )
        )}
      </main>

      <footer className="py-12 border-t border-slate-900 text-center text-slate-600 text-sm">
        <p>© 2026 스탁렌즈(Stock-Lens). 모든 권리 보유. 본 정보는 투자 참고용이며 결과에 대한 책임은 사용자에게 있습니다.</p>
        <p className="mt-2 font-medium">"성공적인 투자는 정확한 데이터에서 시작되고, 훌륭한 앱은 그 데이터를 어떻게 요약하느냐로 가치를 증명합니다."</p>
      </footer>

      {isMbtiModalOpen && (
        <MBTIModal 
          onClose={() => setIsMbtiModalOpen(false)} 
          onResult={handleMbtiResult} 
        />
      )}
    </div>
  );
};

export default App;
