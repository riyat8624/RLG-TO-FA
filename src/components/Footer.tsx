import React from 'react';
import { ArrowUp, Cpu } from 'lucide-react';

interface FooterProps {
  onBackToIntro: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onBackToIntro }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#0a0b12] border-t border-[#222538] py-6 px-4 sm:px-6 lg:px-8 mt-10 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-slate-200 text-xs">RLG → NFA Converter</span>
            <span className="block text-[10px] text-slate-500">
              Right-Linear Grammar to Finite Automaton
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <button
            id="footer-back-intro-btn"
            onClick={onBackToIntro}
            className="hover:text-indigo-300 transition-colors cursor-pointer"
          >
            Intro Screen
          </button>
          <span className="text-slate-700">•</span>
          <button
            id="footer-scroll-top-btn"
            onClick={scrollToTop}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>
      </div>
    </footer>
  );
};

