
import React, { useState } from 'react';
import { analyzeStockMBTI } from '../services/geminiService';
import { MBTIType, MBTIProfile } from '../types';
import { MBTI_PROFILES } from '../constants';

interface MBTIModalProps {
  onClose: () => void;
  onResult: (profile: MBTIProfile) => void;
}

const QUESTIONS = [
  { id: 1, text: "주가가 10% 급락했을 때 당신의 행동은?", options: ["즉시 손절", "추가 매수(물타기)", "관망하며 분석", "잊고 지냄"] },
  { id: 2, text: "선호하는 수익률과 위험 수준은?", options: ["하이 리스크 하이 리턴", "적정 수익과 중간 위험", "원금 보존이 최우선", "시장을 이기는 정도"] },
  { id: 3, text: "투자 종목을 결정할 때 가장 중요한 것은?", options: ["뉴스나 소문", "차트 기술적 분석", "재무제표 및 가치", "전문가의 추천"] },
];

const MBTIModal: React.FC<MBTIModalProps> = ({ onClose, onResult }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleOption = (option: string) => {
    const newAnswers = [...answers, option];
    if (step < QUESTIONS.length - 1) {
      setAnswers(newAnswers);
      setStep(step + 1);
    } else {
      performAnalysis(newAnswers);
    }
  };

  const performAnalysis = async (finalAnswers: string[]) => {
    setIsAnalyzing(true);
    const result = await analyzeStockMBTI(finalAnswers);
    const profile = MBTI_PROFILES[result.type as string] || MBTI_PROFILES['Owl'];
    onResult(profile);
    setIsAnalyzing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold gradient-text">주식 MBTI 테스트</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!isAnalyzing ? (
            <div className="space-y-6">
              <div className="flex gap-2 mb-4">
                {QUESTIONS.map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-sky-500' : 'bg-slate-700'}`}></div>
                ))}
              </div>
              <div>
                <span className="text-sky-400 text-sm font-bold uppercase">질문 {step + 1}</span>
                <p className="text-xl font-medium text-slate-200 mt-2">{QUESTIONS[step].text}</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {QUESTIONS[step].options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOption(opt)}
                    className="p-4 rounded-xl border border-slate-700 hover:border-sky-500/50 hover:bg-sky-500/5 text-left text-slate-300 hover:text-white transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-bold mb-2">당신의 투자 DNA를 분석 중...</h3>
              <p className="text-slate-500">잠시만 기다려 주세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MBTIModal;
