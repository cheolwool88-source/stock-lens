
import React, { useState, useEffect, useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, Legend, 
  ComposedChart, Line, Cell
} from 'recharts';
import { StockInfo, DashboardSection, MBTIType, NewsItem, CorporatePerformance } from '../types';
import { MOCK_ANNUAL_PERFORMANCE, MOCK_QUARTERLY_PERFORMANCE, MOCK_FLOW } from '../constants';
import { summarizeNews, getQuickAdvice, fetchStockNews } from '../services/geminiService';

interface AnalysisDashboardProps {
  stock: StockInfo;
  mbti: MBTIType;
  onBack: () => void;
}

/**
 * 네이버 금융 스타일의 전문 캔들스틱 커스텀 셰이프
 */
const Candlestick = (props: any) => {
  const { x, width, yAxis, payload } = props;
  if (!yAxis || !payload) return null;

  const { open, close, high, low } = payload;
  const isUp = close >= open;
  // 한국 시장 표준: 상승(빨강), 하락(파랑)
  const candleColor = isUp ? '#f43f5e' : '#3b82f6';

  const yHigh = yAxis.scale(high);
  const yLow = yAxis.scale(low);
  const yOpen = yAxis.scale(open);
  const yClose = yAxis.scale(close);

  const bodyTop = Math.min(yOpen, yClose);
  const bodyBottom = Math.max(yOpen, yClose);
  const bodyHeight = Math.max(Math.abs(yOpen - yClose), 1.5);

  const centerX = x + width / 2;

  return (
    <g>
      {/* 고가-저가 연결선 (심지) */}
      <line 
        x1={centerX} 
        y1={yHigh} 
        x2={centerX} 
        y2={yLow} 
        stroke={candleColor} 
        strokeWidth={1} 
      />
      {/* 시가-종가 몸통 */}
      <rect 
        x={x} 
        y={bodyTop} 
        width={width} 
        height={bodyHeight} 
        fill={isUp ? candleColor : '#0f172a'} 
        stroke={candleColor} 
        strokeWidth={1} 
      />
    </g>
  );
};

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ stock, mbti, onBack }) => {
  const [activeSection, setActiveSection] = useState<DashboardSection>('chart');
  const [selectedNews, setSelectedNews] = useState<any | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');
  const [hoveredData, setHoveredData] = useState<any | null>(null);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [financialTab, setFinancialTab] = useState<'annual' | 'quarterly'>('annual');

  useEffect(() => {
    if (mbti) {
      getQuickAdvice(stock.name, mbti).then(setAiAdvice);
    }
    setIsLoadingNews(true);
    fetchStockNews(stock.name).then(items => {
      setNewsItems(items);
      setIsLoadingNews(false);
    });
  }, [stock, mbti]);

  const handleNewsClick = async (news: any) => {
    setIsSummarizing(true);
    const summary = await summarizeNews(news.title);
    setSelectedNews({ ...news, ...summary });
    setIsSummarizing(false);
  };

  const chartData = useMemo(() => {
    const pointsMap = { '1D': 40, '1W': 60, '1M': 100, '3M': 150, '1Y': 240 };
    const points = pointsMap[timeframe];
    const data: any[] = [];
    let prevClose = stock.price * 0.95;
    
    for (let i = 0; i < points; i++) {
      const open = prevClose + (Math.random() - 0.5) * (stock.price * 0.012);
      const volatility = stock.price * 0.02;
      const change = (Math.random() - 0.47) * volatility;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * (volatility * 0.3);
      const low = Math.min(open, close) - Math.random() * (volatility * 0.3);
      
      const item: any = {
        time: timeframe === '1D' ? `${Math.floor(i/4) + 9}:${(i%4)*15}` : `24.${Math.floor(i/20)+1}.${(i%20)+1}`,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        isUp: close >= open,
        volume: Math.floor(Math.random() * 200000) + 50000,
      };
      
      const calculateMA = (period: number) => {
        if (i >= period - 1) {
          const slice = data.slice(i - (period - 1)).concat(item);
          const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
          return parseFloat((sum / period).toFixed(2));
        }
        return null;
      };

      item.ma5 = calculateMA(5);
      item.ma10 = calculateMA(10);
      item.ma20 = calculateMA(20);
      item.ma60 = calculateMA(60);
      
      data.push(item);
      prevClose = close;
    }
    return data;
  }, [stock.price, timeframe]);

  const onMouseMove = (e: any) => {
    if (e.activePayload) {
      setHoveredData(e.activePayload[0].payload);
    }
  };

  const displayData = hoveredData || chartData[chartData.length - 1];

  const currentPerformance: CorporatePerformance = financialTab === 'annual' 
    ? MOCK_ANNUAL_PERFORMANCE 
    : MOCK_QUARTERLY_PERFORMANCE;

  return (
    <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 상단 종목 기본 정보 */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          목록으로
        </button>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <h2 className="text-3xl font-bold">{stock.name} <span className="text-slate-500 text-xl font-normal">{stock.symbol}</span></h2>
            <div className="flex justify-end gap-3 mt-1">
              <span className={`text-2xl font-mono font-bold ${stock.change >= 0 ? 'text-rose-500' : 'text-blue-500'}`}>
                {stock.symbol.match(/[A-Z]/) ? '$' : ''}{stock.price.toLocaleString()}
              </span>
              <span className={`text-lg font-medium ${stock.change >= 0 ? 'text-rose-500' : 'text-blue-500'}`}>
                {stock.change >= 0 ? '▲' : '▼'}{Math.abs(stock.change).toLocaleString()} ({stock.changePercent}%)
              </span>
            </div>
          </div>
          <div className="h-12 w-px bg-slate-800"></div>
          <div className="text-sm bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
            <span className="text-slate-500 block mb-0.5">업종</span>
            <span className="font-semibold">{stock.sector}</span>
          </div>
        </div>
      </div>

      {/* MBTI 조언 배너 */}
      <div className="glass p-4 rounded-2xl mb-6 border-l-4 border-l-sky-500 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-sky-500/20 text-sky-400 text-xs font-bold px-2 py-1 rounded">성향별 분석</span>
          <p className="text-slate-200 font-medium italic">"{aiAdvice || '투자 전략 분석 중...'}"</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          AI 인사이트
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { id: 'chart', icon: '📈', label: '전문 차트', color: 'sky' },
          { id: 'financial', icon: '📊', label: '재무 분석', color: 'emerald' },
          { id: 'news', icon: '📰', label: '최근 뉴스', color: 'amber' },
          { id: 'investor', icon: '👥', label: '수급 현황', color: 'indigo' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as DashboardSection)}
            className={`flex flex-col items-center justify-center py-4 rounded-2xl transition-all border ${
              activeSection === item.id 
                ? `bg-${item.color}-600/10 border-${item.color}-500 shadow-lg shadow-${item.color}-500/5` 
                : 'glass border-transparent hover:bg-slate-800'
            }`}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className={`text-sm font-bold ${activeSection === item.id ? `text-${item.color}-400` : 'text-slate-400'}`}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* 상세 대시보드 */}
      <div className="glass rounded-3xl p-6 min-h-[650px] border border-slate-800/50">
        {activeSection === 'chart' && (
          <div className="flex flex-col h-[650px] w-full">
            {/* 차트 상단 컨트롤 및 데이터 표시줄 */}
            <div className="flex flex-col mb-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                  {(['1D', '1W', '1M', '3M', '1Y'] as const).map(t => (
                    <button 
                      key={t} 
                      onClick={() => setTimeframe(t)}
                      className={`px-4 py-1.5 rounded-lg font-bold text-[11px] transition-all ${t === timeframe ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {t === '1D' ? '1일' : t === '1W' ? '1주' : t === '1M' ? '1개월' : t === '3M' ? '3개월' : '1년'}
                    </button>
                  ))}
                </div>
                {/* 이동평균선 레이블 */}
                <div className="flex gap-4 text-[10px] font-bold">
                  <div className="flex gap-1.5 items-center"><span className="w-2.5 h-0.5 bg-orange-400"></span><span className="text-slate-400">5일선</span> <span className="text-orange-400 font-mono">{displayData.ma5?.toLocaleString() || '-'}</span></div>
                  <div className="flex gap-1.5 items-center"><span className="w-2.5 h-0.5 bg-yellow-400"></span><span className="text-slate-400">10일선</span> <span className="text-yellow-400 font-mono">{displayData.ma10?.toLocaleString() || '-'}</span></div>
                  <div className="flex gap-1.5 items-center"><span className="w-2.5 h-0.5 bg-purple-400"></span><span className="text-slate-400">20일선</span> <span className="text-purple-400 font-mono">{displayData.ma20?.toLocaleString() || '-'}</span></div>
                  <div className="flex gap-1.5 items-center"><span className="w-2.5 h-0.5 bg-emerald-400"></span><span className="text-slate-400">60일선</span> <span className="text-emerald-400 font-mono">{displayData.ma60?.toLocaleString() || '-'}</span></div>
                </div>
              </div>

              {/* OHLC 데이터 바 */}
              <div className="flex items-center gap-6 text-[13px] font-mono py-2 border-t border-slate-800/30">
                <div className="flex gap-2"><span className="text-slate-500 font-sans">날짜:</span><span className="text-slate-200">{displayData.time}</span></div>
                <div className="flex gap-2"><span className="text-slate-500 font-sans">시가:</span><span className="text-slate-200">{displayData.open.toLocaleString()}</span></div>
                <div className="flex gap-2"><span className="text-slate-500 font-sans">고가:</span><span className="text-rose-500 font-bold">{displayData.high.toLocaleString()}</span></div>
                <div className="flex gap-2"><span className="text-slate-500 font-sans">저가:</span><span className="text-blue-500 font-bold">{displayData.low.toLocaleString()}</span></div>
                <div className="flex gap-2"><span className="text-slate-500 font-sans">종가:</span><span className={`font-bold ${displayData.isUp ? 'text-rose-500' : 'text-blue-500'}`}>{displayData.close.toLocaleString()}</span></div>
                <div className="flex gap-2"><span className="text-slate-500 font-sans">거래량:</span><span className="text-amber-400 font-bold">{displayData.volume.toLocaleString()}</span></div>
              </div>
            </div>

            {/* 차트 영역 */}
            <div className="flex-1 flex flex-col gap-0 overflow-hidden">
              <div className="flex-[4] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart 
                    data={chartData} 
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    onMouseMove={onMouseMove}
                    onMouseLeave={() => setHoveredData(null)}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis orientation="right" domain={['auto', 'auto']} stroke="#475569" fontSize={11} tickFormatter={(val) => val.toLocaleString()} axisLine={false} tickLine={false} />
                    <Tooltip content={<></>} cursor={{ stroke: '#64748b', strokeWidth: 1, strokeDasharray: '3 3' }} />
                    <Bar dataKey="close" shape={<Candlestick />} isAnimationActive={false} />
                    {/* 이동평균선 (MA) */}
                    <Line type="monotone" dataKey="ma5" stroke="#fb923c" strokeWidth={1} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="ma10" stroke="#facc15" strokeWidth={1} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="ma20" stroke="#d946ef" strokeWidth={1} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="ma60" stroke="#10b981" strokeWidth={1} dot={false} isAnimationActive={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex-1 border-t border-slate-800 pt-4 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 30, left: 0, bottom: 10 }}>
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis hide domain={[0, 'auto']} />
                    <Bar dataKey="volume">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-vol-${index}`} fill={entry.isUp ? '#f43f5e' : '#3b82f6'} fillOpacity={0.6} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center text-[10px] text-slate-500 font-bold border-t border-slate-800 pt-4 uppercase tracking-widest">
                <div className="flex gap-4">
                  <span>정보 제공: 실시간 금융 분석 엔진</span>
                  <span className="text-emerald-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    데이터 연결됨
                  </span>
                </div>
                <span>스탁렌즈 프로 분석 v2.0</span>
            </div>
          </div>
        )}

        {/* 재무분석 */}
        {activeSection === 'financial' && (
          <div className="flex flex-col h-full py-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-emerald-400">📊</span> 기업실적분석
                <span className="text-sm font-normal text-slate-500 ml-2">단위: 억원 / %, 배</span>
              </h3>
              <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                <button onClick={() => setFinancialTab('annual')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${financialTab === 'annual' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>연간</button>
                <button onClick={() => setFinancialTab('quarterly')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${financialTab === 'quarterly' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>분기</button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/30">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/50">
                    <th className="p-4 font-bold text-slate-400 border-r border-slate-800 min-w-[140px]">주요재무항목</th>
                    {currentPerformance.headers.map((h, i) => (
                      <th key={h} className={`p-4 font-bold text-center border-r border-slate-800 last:border-r-0 ${i === currentPerformance.headers.length - 1 ? 'text-emerald-400' : 'text-slate-200'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {currentPerformance.metrics.map((metric) => (
                    <tr key={metric.name} className="hover:bg-slate-800/20 transition-colors">
                      <td className={`p-4 font-medium border-r border-slate-800 bg-slate-800/10 ${metric.name.includes('영업이익') ? 'text-emerald-400' : 'text-slate-300'}`}>{metric.name}</td>
                      {metric.values.map((val, i) => (
                        <td key={i} className={`p-4 text-center font-mono border-r border-slate-800 last:border-r-0 ${i === metric.values.length - 1 ? 'bg-emerald-400/5 font-bold text-emerald-300' : 'text-slate-400'}`}>{typeof val === 'number' ? val.toLocaleString() : (val || '-')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass p-6 rounded-2xl border border-emerald-500/20">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">수익성 분석</h4>
                <div className="flex justify-between items-end">
                  <div><span className="text-3xl font-black text-emerald-400">14.6%</span><p className="text-xs text-slate-500 mt-1">예상 영업이익률</p></div>
                  <div className="text-right"><span className="text-emerald-500 text-xs font-bold">▲ 12.1%</span><p className="text-[10px] text-slate-600 italic">전년 대비</p></div>
                </div>
              </div>
              <div className="glass p-6 rounded-2xl border border-sky-500/20">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">가치 평가</h4>
                <div className="flex justify-between items-end">
                  <div><span className="text-3xl font-black text-sky-400">13.1배</span><p className="text-xs text-slate-500 mt-1">업종 평균 대비 저평가</p></div>
                  <div className="w-12 h-12 bg-sky-500/10 rounded-full flex items-center justify-center text-sky-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></div>
                </div>
              </div>
              <div className="glass p-6 rounded-2xl border border-amber-500/20">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">성장 지표</h4>
                <div className="flex justify-between items-end">
                  <div><span className="text-3xl font-black text-amber-400">우수</span><p className="text-xs text-slate-500 mt-1">매출액 증가율 19%</p></div>
                  <div className="flex gap-1">{[1,2,3,4,5].map(v => (<div key={v} className={`w-1.5 h-6 rounded-full ${v <= 4 ? 'bg-amber-500' : 'bg-slate-800'}`}></div>))}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 뉴스분석 */}
        {activeSection === 'news' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full py-4">
            <div className="space-y-6 overflow-y-auto max-h-[600px] pr-4 custom-scrollbar">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 sticky top-0 bg-slate-950/80 backdrop-blur py-2 z-10"><span className="text-amber-400">📰</span> 최근 1개월 주요 뉴스</h3>
              {isLoadingNews ? (
                <div className="flex flex-col items-center justify-center py-20"><div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4"></div><p className="text-slate-500 text-sm animate-pulse">최신 뉴스를 불러오고 있습니다...</p></div>
              ) : newsItems.length > 0 ? (
                <div className="space-y-4">
                  {newsItems.map((item) => (
                    <button key={item.id || item.title} onClick={() => handleNewsClick(item)} className="w-full text-left p-4 rounded-2xl border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/30 transition-all flex justify-between items-center group">
                      <div className="flex-1">
                        <div className="flex gap-2 items-center mb-1.5">
                          <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full font-bold ${item.sentiment === 'positive' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : item.sentiment === 'negative' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-slate-500/10 text-slate-400'}`}>{item.sentiment === 'positive' ? '호재' : item.sentiment === 'negative' ? '악재' : '중립'}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{item.source} • {item.date}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-200 group-hover:text-amber-300 transition-colors leading-tight line-clamp-2">{item.title}</h4>
                      </div>
                    </button>
                  ))}
                </div>
              ) : <p className="text-center py-20 text-slate-500">관련 뉴스가 존재하지 않습니다.</p>}
            </div>
            <div className="sticky top-4 h-fit">
              <div className={`p-8 rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/20 flex flex-col items-center justify-center text-center ${isSummarizing ? 'animate-pulse' : ''}`}>
                {!selectedNews ? (
                  <div className="max-w-xs py-10"><div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><span className="text-3xl">✨</span></div><h4 className="text-lg font-bold text-slate-300 mb-2">AI 뉴스 요약 엔진</h4><p className="text-slate-500 text-sm">리스트에서 뉴스를 선택하면 핵심 내용을 3줄로 정리하고 영향력을 분석합니다.</p></div>
                ) : (
                  <div className="w-full text-left animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex justify-between items-start mb-8">
                      <div><h4 className="font-black text-amber-400 text-2xl mb-1 tracking-tight">AI 브리핑</h4><p className="text-slate-500 text-xs font-bold uppercase tracking-wider">자연어 분석 결과</p></div>
                      <div className="text-right"><div className="text-[10px] text-slate-500 uppercase font-black mb-1">시장 심리 점수</div><div className={`text-4xl font-mono font-black ${selectedNews.sentimentScore > 60 ? 'text-rose-500' : selectedNews.sentimentScore < 40 ? 'text-blue-500' : 'text-slate-400'}`}>{selectedNews.sentimentScore}</div></div>
                    </div>
                    <div className="space-y-4 mb-8">
                      {selectedNews.summary?.map((line: string, i: number) => (
                        <div key={i} className="flex gap-4 items-start bg-slate-800/30 p-4 rounded-2xl border border-slate-800/50"><span className="text-amber-500 font-black text-lg">{i+1}</span><p className="text-slate-200 leading-relaxed font-medium text-sm">{line}</p></div>
                      ))}
                    </div>
                    <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center gap-4"><div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg></div><div><span className="text-slate-500 text-[10px] font-bold uppercase block">전문가 인사이트</span><p className="text-amber-300 text-sm font-bold">{selectedNews.impact}</p></div></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 수급현황 */}
        {activeSection === 'investor' && (
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-bold mb-8 flex items-center gap-2"><span className="text-indigo-400">👥</span> 주체별 순매매 동향</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_FLOW} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="date" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#475569" fontSize={12} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: '#334155', opacity: 0.4 }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }} />
                      <Legend verticalAlign="top" height={36}/>
                      <Bar dataKey="retail" name="개인" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="institution" name="기관" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="foreign" name="외국인" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                    <h4 className="text-sm font-black text-slate-500 mb-4 uppercase tracking-widest border-l-2 border-indigo-500 pl-3">수급 강도 히트맵 (최근 5일)</h4>
                    <div className="grid grid-cols-5 gap-3">{[10, -5, 20, 15, -2].map((val, i) => (<div key={i} className={`h-20 rounded-2xl flex flex-col items-center justify-center border transition-all hover:scale-105 ${val > 10 ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-lg shadow-rose-500/5' : val > 0 ? 'bg-rose-500/5 border-rose-500/10 text-rose-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/5'}`}><span className="text-[10px] font-black opacity-50 mb-1">D-{5-i}</span><span className="font-mono font-black text-lg">{val > 0 ? '+' : ''}{val}%</span></div>))}</div>
                </div>
                <div className="glass p-6 rounded-3xl border border-slate-800">
                  <h4 className="text-sm font-black text-slate-400 mb-6 uppercase tracking-widest flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>증권사 목표가 합의</h4>
                  <div className="space-y-4">
                    {[
                      { firm: '미래에셋증권', target: stock.price * 1.25, opinion: '강력 매수' },
                      { firm: 'NH투자증권', target: stock.price * 1.15, opinion: '매수' },
                      { firm: 'JP 모건', target: stock.price * 1.05, opinion: '중립' }
                    ].map((row) => (
                      <div key={row.firm} className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                        <span className="text-slate-300 font-bold text-sm">{row.firm}</span>
                        <div className="flex items-center gap-6">
                          <span className="font-mono font-black text-sky-400">{stock.symbol.match(/[A-Z]/) ? '$' : ''}{Math.round(row.target).toLocaleString()}</span>
                          <span className={`font-black px-2.5 py-1 rounded-lg text-[10px] border ${row.opinion.includes('매수') ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-slate-700/50 text-slate-400 border-slate-600'}`}>{row.opinion}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisDashboard;
