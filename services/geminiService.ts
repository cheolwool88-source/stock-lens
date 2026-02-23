
import { GoogleGenAI, Type } from "@google/genai";
import { TRENDING_STOCKS, MOCK_NEWS } from "../constants";
import { StockInfo, NewsItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

/**
 * 에러가 할당량 초과인지 확인하는 유틸리티
 */
const isQuotaError = (error: any): boolean => {
  const msg = error?.message?.toLowerCase() || "";
  return msg.includes("quota") || msg.includes("429") || msg.includes("exhausted");
};

/**
 * 네이버 금융(finance.naver.com)의 현재 인기 검색 종목 TOP 10을 가져옵니다.
 */
export const fetchTrendingStocks = async (): Promise<StockInfo[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `네이버 금융(finance.naver.com)에서 현재 한국 시장의 "인기 검색 종목" TOP 10을 찾아주세요.
      각 종목에 대해 이름, 공식 6자리 종목 코드, 현재가, 전일대비 변동 금액, 전일대비 변동률, 그리고 업종(섹터) 정보를 제공하세요.
      반드시 10개의 객체를 포함한 JSON 배열 형식으로만 반환하세요.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              symbol: { type: Type.STRING },
              name: { type: Type.STRING },
              price: { type: Type.NUMBER },
              change: { type: Type.NUMBER },
              changePercent: { type: Type.NUMBER },
              sector: { type: Type.STRING }
            },
            required: ['symbol', 'name', 'price', 'change', 'changePercent', 'sector']
          }
        }
      }
    });
    
    const parsed = JSON.parse(response.text);
    return Array.isArray(parsed) ? parsed.slice(0, 10) : TRENDING_STOCKS;
  } catch (error) {
    console.error("인기 종목 가져오기 에러:", error);
    return TRENDING_STOCKS; 
  }
};

export const searchStockInfo = async (query: string): Promise<StockInfo | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `"${query}" 주식의 실시간 정보를 검색하세요.
      현재가, 전일대비 변동 금액, 전일대비 변동률, 업종/산업군, 그리고 공식 심볼(종목코드)을 포함해야 합니다.
      지정된 JSON 형식으로 데이터를 반환하세요.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            symbol: { type: Type.STRING },
            name: { type: Type.STRING },
            price: { type: Type.NUMBER },
            change: { type: Type.NUMBER },
            changePercent: { type: Type.NUMBER },
            sector: { type: Type.STRING }
          },
          required: ['symbol', 'name', 'price', 'change', 'changePercent', 'sector']
        }
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("주식 검색 에러:", error);
    
    const upperQuery = query.toUpperCase();
    const localMatch = TRENDING_STOCKS.find(s => 
      s.symbol.includes(upperQuery) || s.name.includes(query)
    );
    
    if (localMatch) return localMatch;
    if (isQuotaError(error)) return TRENDING_STOCKS[0];
    
    return null;
  }
};

export const fetchStockNews = async (stockName: string): Promise<NewsItem[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `최근 30일 동안의 "${stockName}" 관련 뉴스 기사를 검색하세요.
      각 뉴스 항목에 대해 제목, 매체명, 정확한 날짜(YYYY-MM-DD), 그리고 초기 감성 분석(positive, negative, 또는 neutral)을 제공하세요.
      최대 15개까지 관련성이 높은 기사들을 나열하세요.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              source: { type: Type.STRING },
              date: { type: Type.STRING, description: '형식: YYYY-MM-DD' },
              sentiment: { type: Type.STRING, enum: ['positive', 'negative', 'neutral'] },
              score: { type: Type.NUMBER, description: '0에서 1 사이' }
            },
            required: ['title', 'source', 'date', 'sentiment']
          }
        }
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("뉴스 가져오기 에러:", error);
    return MOCK_NEWS;
  }
};

export const summarizeNews = async (headline: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `당신은 금융 분석 전문가입니다. 다음 뉴스 제목을 분석하여 투자자에게 도움이 될 3줄 핵심 요약과 투자 영향 점수(0-100)를 제공하세요. 모든 텍스트는 반드시 한국어로 작성해야 합니다.
      뉴스 제목: "${headline}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.ARRAY, items: { type: Type.STRING }, description: '한국어로 작성된 3줄 핵심 요약' },
            sentimentScore: { type: Type.NUMBER, description: '0(심각한 악재) ~ 100(강력한 호재)' },
            impact: { type: Type.STRING, description: '한국어로 작성된 시장 영향도 및 전망' }
          },
          required: ['summary', 'sentimentScore', 'impact']
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("뉴스 요약 에러:", error);
    return {
      summary: ["현재 API 호출량이 많아 요약 서비스를 일시적으로 사용할 수 없습니다.", "나중에 다시 시도해 주세요.", "기본적인 시장 지표를 참고하시기 바랍니다."],
      sentimentScore: 50,
      impact: "서비스 일시 지연 중입니다."
    };
  }
};

export const analyzeStockMBTI = async (answers: string[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `투자 성향 답변들을 분석하여 이 사용자가 'Shark'(공격), 'Turtle'(방어), 'Fox'(기술적/민첩), 'Owl'(가치/분석) 중 어떤 유형인지 결정하세요. 분석 결과는 JSON으로 반환하세요.
      답변들: ${answers.join(", ")}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, description: 'Shark, Turtle, Fox, Owl 중 하나' },
            reason: { type: Type.STRING, description: '선정 이유 (한국어)' }
          },
          required: ['type', 'reason']
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("MBTI 분석 에러:", error);
    return { type: 'Owl', reason: '데이터 기반의 표준 가치 투자 성향으로 분석되었습니다.' };
  }
};

export const getQuickAdvice = async (stockName: string, mbti: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `투자자 성향이 ${mbti}인 사람에게 ${stockName} 주식에 대해 매우 짧고 명확한 한 줄 투자 조언을 한국어로 해주세요.`,
    });
    return response.text;
  } catch (error) {
    return "현재 시장 변동성을 주의 깊게 관찰하며 본인의 원칙에 따라 신중하게 결정하세요.";
  }
};
