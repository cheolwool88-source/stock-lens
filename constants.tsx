
import { StockInfo, NewsItem, InvestorFlow, MBTIProfile, CorporatePerformance } from './types';

export const TRENDING_STOCKS: StockInfo[] = [
  { symbol: '005930', name: '삼성전자', price: 72400, change: 800, changePercent: 1.12, sector: '반도체 및 전자제품' },
  { symbol: '000660', name: 'SK하이닉스', price: 186500, change: 3200, changePercent: 1.75, sector: '반도체' },
  { symbol: '373220', name: 'LG에너지솔루션', price: 395000, change: -4500, changePercent: -1.13, sector: '이차전지' },
  { symbol: '005380', name: '현대차', price: 242500, change: 1500, changePercent: 0.62, sector: '자동차 제조' },
  { symbol: '068270', name: '셀트리온', price: 198200, change: 2100, changePercent: 1.07, sector: '제약·바이오' },
  { symbol: '035420', name: 'NAVER', price: 182300, change: -1200, changePercent: -0.65, sector: 'IT 서비스' },
  { symbol: '035720', name: '카카오', price: 45600, change: 400, changePercent: 0.88, sector: 'IT 서비스' },
  { symbol: '105560', name: 'KB금융', price: 78900, change: 1500, changePercent: 1.94, sector: '금융' },
  { symbol: '000270', name: '기아', price: 118200, change: 2300, changePercent: 1.98, sector: '자동차 제조' },
  { symbol: '083660', name: '한라캐스트', price: 1910, change: 60, changePercent: 3.24, sector: '자동차 부품' },
];

export const MOCK_ANNUAL_PERFORMANCE: CorporatePerformance = {
  headers: ['2023.12', '2024.12', '2025.12', '2026.12(예상)'],
  metrics: [
    { name: '매출액', values: [2796048, 3022314, 2589355, 3084562] },
    { name: '영업이익', values: [516339, 433766, 65670, 452310] },
    { name: '당기순이익', values: [399074, 556541, 154871, 381200] },
    { name: '영업이익률', values: [18.47, 14.35, 2.54, 14.66] },
    { name: '순이익률', values: [14.27, 18.41, 5.98, 12.36] },
    { name: 'ROE(자기자본이익률)', values: [13.92, 17.07, 4.15, 12.50] },
    { name: '부채비율', values: [39.92, 26.41, 24.50, 23.10] },
    { name: '당좌비율', values: [196.75, 212.10, 225.40, 230.00] },
    { name: '유보율', values: [33143, 36941, 39120, 41200] },
    { name: 'EPS(주당순이익)', values: [5777, 8057, 2131, 5500] },
    { name: 'PER(주가수익비율)', values: [13.55, 6.86, 36.83, 13.10] },
    { name: 'PBR(주가순자산비율)', values: [1.80, 1.08, 1.45, 1.35] },
    { name: '주당배당금(원)', values: [1444, 1444, 1444, 1500] },
  ]
};

export const MOCK_QUARTERLY_PERFORMANCE: CorporatePerformance = {
  headers: ['2025.09', '2025.12', '2026.03', '2026.06(예상)'],
  metrics: [
    { name: '매출액', values: [674047, 677799, 719156, 735400] },
    { name: '영업이익', values: [24335, 28247, 66060, 82100] },
    { name: '당기순이익', values: [58441, 63448, 67547, 71000] },
    { name: '영업이익률', values: [3.61, 4.17, 9.19, 11.16] },
    { name: '순이익률', values: [8.67, 9.36, 9.39, 9.65] },
    { name: 'ROE(%)', values: [4.15, 5.20, 7.80, 9.50] },
    { name: '부채비율', values: [25.10, 24.50, 24.20, 24.00] },
    { name: '유보율', values: [38500, 39120, 40150, 41200] },
    { name: 'EPS(원)', values: [804, 874, 931, 980] },
    { name: 'PER(배)', values: [36.83, 35.10, 28.50, 24.20] },
    { name: 'PBR(배)', values: [1.45, 1.40, 1.42, 1.38] },
  ]
};

export const MOCK_NEWS: NewsItem[] = [
  { id: '1', title: '엔비디아, 데이터 센터 매출 부문에서 또 한번 역대 최고 기록 경신', source: '로이터', date: '2시간 전', sentiment: 'positive', score: 0.85 },
  { id: '2', title: '글로벌 반도체 수요, 무역 갈등 속 여전한 변동성 지속', source: '블룸버그', date: '5시간 전', sentiment: 'neutral', score: 0.5 },
  { id: '3', title: '주요 빅테크 경영진의 내부자 매도 활동 포착, 시장 주의 요망', source: 'CNBC', date: '1일 전', sentiment: 'negative', score: 0.3 },
];

export const MOCK_FLOW: InvestorFlow[] = [
  { date: '26.02.21', retail: -80, institution: 110, foreign: 55 },
  { date: '26.02.20', retail: 10, institution: -15, foreign: 40 },
  { date: '26.02.19', retail: 45, institution: 20, foreign: -10 },
  { date: '26.02.18', retail: -30, institution: 60, foreign: 15 },
  { date: '26.02.17', retail: 120, institution: -45, foreign: 80 },
  { date: '26.02.14', retail: -55, institution: 40, foreign: 20 },
  { date: '26.02.13', retail: 30, institution: -20, foreign: -15 },
  { date: '26.02.12', retail: 90, institution: -110, foreign: 25 },
  { date: '26.02.11', retail: -10, institution: 5, foreign: 12 },
  { date: '26.02.10', retail: 40, institution: -25, foreign: -10 },
];

export const MBTI_PROFILES: Record<string, MBTIProfile> = {
  'Shark': {
    type: 'Shark',
    name: '공격적 상어 (Aggressive Shark)',
    description: '높은 변동성을 즐기며 시장의 기회를 선점하는 공격적인 투자자입니다.',
    advice: '상승장에서는 끝까지 추격하여 수익을 극대화하세요!'
  },
  'Turtle': {
    type: 'Turtle',
    name: '신중한 거북이 (Steady Turtle)',
    description: '장기적인 안목으로 안정적인 우량주와 배당주를 선호하는 투자자입니다.',
    advice: '시장의 소음에 흔들리지 말고 본인의 원칙을 지키세요.'
  },
  'Fox': {
    type: 'Fox',
    name: '영리한 여우 (Clever Fox)',
    description: '차트와 뉴스를 민첩하게 분석하여 스윙 매매를 즐기는 투자자입니다.',
    advice: '익절은 언제나 옳습니다. 목표 수익률에 도달하면 과감히 매도하세요.'
  },
  'Owl': {
    type: 'Owl',
    name: '지혜로운 부엉이 (Wise Owl)',
    description: '기업의 본질 가치와 재무제표를 깊게 파고드는 가치 투자자입니다.',
    advice: '저평가된 구간을 인내심 있게 기다리는 것이 핵심입니다.'
  }
};
