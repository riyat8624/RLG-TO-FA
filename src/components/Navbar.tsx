import React, { useState, useEffect } from 'react';
import { Cpu, ArrowLeft, Menu, X, Sparkles, ChevronRight } from 'lucide-react';
import { VoiceLanguage } from '../types';

interface NavbarProps {
  onBackToIntro: () => void;
  voiceLang: VoiceLanguage;
  onVoiceLangChange: (lang: VoiceLanguage) => void;
  onQuickLoadExample: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onBackToIntro,
  voiceLang,
  onVoiceLangChange,
  onQuickLoadExample,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('grammar-input');

  const navLinks = [
    { name: 'Input', id: 'grammar-input' },
    { name: 'Visualizer', id: 'nfa-visualizer' },
    { name: 'Voice Tutor', id: 'conversion-steps' },
    { name: 'Matrix', id: 'transition-table' },
    { name: 'Tester', id: 'string-tester' },
    { name: 'Examples', id: 'examples-section' },
    { name: 'Docs', id: 'theory-section' },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 64;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Optional scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 100;
      for (let i = navLinks.length - 1; i >= 0; i--) {
        const el = document.getElementById(navLinks[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(navLinks[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header id="app-navbar" className="sticky top-0 z-50 w-full bg-[#0a0b12]/90 backdrop-blur-md border-b border-[#1f2133] shadow-md transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2">
          {/* Left: Brand Identity & Intro Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              id="nav-back-intro-btn"
              onClick={onBackToIntro}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-indigo-300 hover:bg-[#151726] border border-transparent hover:border-[#2b2e46] transition-all cursor-pointer"
              title="Return to Welcome Screen"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Intro</span>
            </button>

            <div className="h-4 w-px bg-[#1f2133] hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-xs">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white">
                  AutomataLab
                </span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  RLG→NFA
                </span>
              </div>
            </div>
          </div>

          {/* Center: Clean Segmented Navigation Bar */}
          <nav className="hidden lg:flex items-center bg-[#12131f] border border-[#222438] rounded-xl p-1 shadow-inner gap-0.5">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  onClick={() => scrollToSection(link.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1c2d]'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </nav>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Load Example CTA matching DronyX button */}
            <button
              id="nav-quick-example-btn"
              onClick={onQuickLoadExample}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#18192a] hover:bg-indigo-600 hover:text-white text-indigo-300 text-xs font-semibold border border-indigo-900/60 hover:border-indigo-500 transition-all cursor-pointer shadow-xs group"
              title="Load standard example grammar"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:text-white" />
              <span className="hidden sm:inline">Quick Example</span>
              <span className="sm:hidden">Example</span>
            </button>

            {/* Language Segmented Control */}
            <div className="flex items-center bg-[#12131f] border border-[#222438] rounded-lg p-0.5 shadow-inner" title="Voice narration language">
              <button
                id="voice-lang-en-btn"
                onClick={() => onVoiceLangChange('en')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  voiceLang === 'en'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                id="voice-lang-hi-btn"
                onClick={() => onVoiceLangChange('hi')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  voiceLang === 'hi'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                HI
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white bg-[#141524] border border-[#23253a] hover:bg-[#1f2136] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0b12] border-b border-[#1f2133] px-4 py-3 shadow-xl space-y-1">
          <div className="grid grid-cols-2 gap-1.5 pb-2">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-[#141524] text-slate-300 hover:text-white hover:bg-[#1e2034]'
                  }`}
                >
                  <span>{link.name}</span>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#1f2133] flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onQuickLoadExample();
              }}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold py-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Preset Example</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onBackToIntro();
              }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 font-medium py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Intro</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
