
export interface StockInfo {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
}

export interface FinancialMetric {
  name: string;
  values: (number | string | null)[]; // 연도별/분기별 값들
}

export interface CorporatePerformance {
  headers: string[]; // 연도 또는 분기 (예: 2021.12, 2022.12 ...)
  metrics: FinancialMetric[];
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  summary?: string;
}

export interface InvestorFlow {
  date: string;
  retail: number;
  institution: number;
  foreign: number;
}

export type ViewType = 'main' | 'dashboard';
export type DashboardSection = 'chart' | 'financial' | 'news' | 'investor';

export type MBTIType = 'Shark' | 'Turtle' | 'Fox' | 'Owl' | null;

export interface MBTIProfile {
  type: MBTIType;
  name: string;
  description: string;
  advice: string;
}
