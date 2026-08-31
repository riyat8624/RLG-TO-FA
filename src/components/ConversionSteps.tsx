import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  Languages,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import { ConversionStep, VoiceLanguage } from '../types';
import { SpeechTutor } from '../utils/speechTutor';

interface ConversionStepsProps {
  steps: ConversionStep[];
  activeStepIndex: number;
  onStepChange: (index: number) => void;
  voiceLang: VoiceLanguage;
  onVoiceLangChange: (lang: VoiceLanguage) => void;
}

export const ConversionSteps: React.FC<ConversionStepsProps> = ({
  steps,
  activeStepIndex,
  onStepChange,
  voiceLang,
  onVoiceLangChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);

  const activeIndexRef = useRef(activeStepIndex);
  activeIndexRef.current = activeStepIndex;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const tutor = SpeechTutor.getInstance();

  // Stop speech when component unmounts or steps change
  useEffect(() => {
    return () => {
      tutor.stop();
    };
  }, []);

  // Update speech rate
  useEffect(() => {
    tutor.setRate(speechRate);
  }, [speechRate]);

  // Update tutor language
  useEffect(() => {
    tutor.setLanguage(voiceLang);
  }, [voiceLang]);

  const speakCurrentStep = (stepIndex: number, autoAdvance = true) => {
    if (stepIndex < 0 || stepIndex >= steps.length) {
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }

    const currentStep = steps[stepIndex];
    const speechText =
      voiceLang === 'hi'
        ? `${currentStep.titleHi}। ${currentStep.descriptionHi} ${currentStep.nfaActionHi || ''}`
        : `${currentStep.title}. ${currentStep.descriptionEn} ${currentStep.nfaAction || ''}`;

    if (isMuted) {
      // Simulate speech duration if muted
      const delay = Math.max(2500, speechText.length * 50);
      const timer = setTimeout(() => {
        if (isPlayingRef.current && !isPausedRef.current && autoAdvance) {
          if (stepIndex + 1 < steps.length) {
            onStepChange(stepIndex + 1);
            speakCurrentStep(stepIndex + 1, true);
          } else {
            setIsPlaying(false);
            setIsPaused(false);
          }
        }
      }, delay);
      return () => clearTimeout(timer);
    }

    tutor.speak(speechText, {
      language: voiceLang,
      rate: speechRate,
      onStart: () => {
        setIsPlaying(true);
        setIsPaused(false);
      },
      onEnd: () => {
        if (isPlayingRef.current && !isPausedRef.current && autoAdvance) {
          if (stepIndex + 1 < steps.length) {
            onStepChange(stepIndex + 1);
            // Small pause between steps for natural pedagogical flow
            setTimeout(() => {
              if (isPlayingRef.current && !isPausedRef.current) {
                speakCurrentStep(stepIndex + 1, true);
              }
            }, 600);
          } else {
            setIsPlaying(false);
            setIsPaused(false);
          }
        }
      },
      onError: () => {
        if (isPlayingRef.current && !isPausedRef.current && autoAdvance) {
          if (stepIndex + 1 < steps.length) {
            onStepChange(stepIndex + 1);
            setTimeout(() => {
              if (isPlayingRef.current && !isPausedRef.current) {
                speakCurrentStep(stepIndex + 1, true);
              }
            }, 600);
          } else {
            setIsPlaying(false);
            setIsPaused(false);
          }
        }
      },
    });
  };

  const handlePlay = () => {
    tutor.stop();
    setIsPlaying(true);
    setIsPaused(false);
    // If we're at the very end, restart from step 0
    const startIdx = activeStepIndex >= steps.length - 1 ? 0 : activeStepIndex;
    onStepChange(startIdx);
    speakCurrentStep(startIdx, true);
  };

  const handlePause = () => {
    setIsPaused(true);
    tutor.pause();
  };

  const handleResume = () => {
    setIsPaused(false);
    tutor.resume();
    // If browser synthesis cannot resume properly, restart current step
    const status = tutor.getStatus();
    if (!status.isSpeaking) {
      speakCurrentStep(activeStepIndex, true);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    tutor.stop();
  };

  const handleNextStep = () => {
    tutor.stop();
    if (activeStepIndex < steps.length - 1) {
      const nextIdx = activeStepIndex + 1;
      onStepChange(nextIdx);
      if (isPlaying) {
        speakCurrentStep(nextIdx, true);
      }
    }
  };

  const handlePrevStep = () => {
    tutor.stop();
    if (activeStepIndex > 0) {
      const prevIdx = activeStepIndex - 1;
      onStepChange(prevIdx);
      if (isPlaying) {
        speakCurrentStep(prevIdx, true);
      }
    }
  };

  const activeStep = steps[activeStepIndex] || steps[0];

  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <section id="conversion-steps" className="w-full bg-[#13141f] border border-[#222538] rounded-xl p-4 sm:p-5 shadow-lg">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#222538] mb-4">
        <div>
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span>Conversion Steps & Voice Tutor</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Step-by-step mathematical conversion with browser speech narration
          </p>
        </div>

        {/* Voice Tutor Control Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          {/* Audio Config Group */}
          <div className="flex items-center gap-1 bg-[#0d0e17] p-1 rounded-lg border border-[#222538] shadow-inner">
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-[#1a1c2d] px-2 py-0.5 rounded border border-[#2d304a] text-[11px]">
              <Languages className="w-3 h-3 text-indigo-400" />
              <select
                id="voice-language-select"
                value={voiceLang}
                onChange={(e) => onVoiceLangChange(e.target.value as VoiceLanguage)}
                className="bg-transparent text-[11px] font-semibold text-slate-200 focus:outline-none cursor-pointer"
                title="Select language"
              >
                <option value="en" className="bg-[#12131f] text-white">English 🇬🇧</option>
                <option value="hi" className="bg-[#12131f] text-white">Hindi 🇮🇳</option>
              </select>
            </div>

            {/* Speed Selector */}
            <select
              id="speech-speed-select"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="bg-[#1a1c2d] border border-[#2d304a] text-slate-300 text-[11px] rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
              title="Speech Speed"
            >
              <option value="0.8">0.8x</option>
              <option value="1.0">1.0x</option>
              <option value="1.2">1.2x</option>
            </select>

            {/* Mute Toggle */}
            <button
              id="mute-speech-btn"
              onClick={() => {
                if (!isMuted) tutor.stop();
                setIsMuted(!isMuted);
              }}
              className={`p-1 rounded text-xs border transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-rose-950/40 text-rose-300 border-rose-800/50'
                  : 'bg-[#1a1c2d] text-slate-300 border-[#2d304a] hover:text-white'
              }`}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Stepping & Narration Group */}
          <div className="flex items-center gap-1 bg-[#0d0e17] p-1 rounded-lg border border-[#222538] shadow-inner">
            {/* Step Back */}
            <button
              id="step-prev-btn"
              onClick={handlePrevStep}
              disabled={activeStepIndex === 0}
              className="p-1 rounded bg-[#1a1c2d] hover:bg-[#262840] disabled:opacity-40 text-slate-300 border border-[#2d304a] cursor-pointer"
              title="Previous Step"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            {/* Play / Pause / Resume / Stop Buttons */}
            {!isPlaying ? (
              <button
                id="play-explanation-btn"
                onClick={handlePlay}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Narrate</span>
              </button>
            ) : isPaused ? (
              <button
                id="resume-explanation-btn"
                onClick={handleResume}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                id="pause-explanation-btn"
                onClick={handlePause}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Pause className="w-3 h-3 fill-white" />
                <span>Pause</span>
              </button>
            )}

            {isPlaying && (
              <button
                id="stop-explanation-btn"
                onClick={handleStop}
                className="p-1 rounded bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/50 cursor-pointer"
                title="Stop Explanation"
              >
                <Square className="w-3 h-3 fill-rose-300" />
              </button>
            )}

            {/* Step Forward */}
            <button
              id="step-next-btn"
              onClick={handleNextStep}
              disabled={activeStepIndex === steps.length - 1}
              className="p-1 rounded bg-[#1a1c2d] hover:bg-[#262840] disabled:opacity-40 text-slate-300 border border-[#2d304a] cursor-pointer"
              title="Next Step"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Tutor Highlight Box */}
      {activeStep && (
        <div className="mb-4 p-3.5 bg-[#0d0e17] border border-indigo-500/40 rounded-xl shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
              Step {activeStep.stepNumber} / {steps.length}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {voiceLang === 'hi' ? 'शिक्षक व्याख्या (Tutor Voice)' : 'Voice Tutor Active'}
            </span>
          </div>

          <h3 className="text-sm font-bold text-white mb-1">
            {voiceLang === 'hi' ? activeStep.titleHi : activeStep.title}
          </h3>

          {/* Rule Transformation Preview if applicable */}
          {activeStep.grammarRule && (
            <div className="flex flex-wrap items-center gap-2 my-2 p-2 bg-[#151726] rounded-lg border border-[#26283d] font-mono text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-sans">Rule:</span>
              <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-200 font-bold border border-indigo-800">
                {activeStep.grammarRule}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-200 font-bold border border-emerald-800">
                {voiceLang === 'hi' ? activeStep.nfaActionHi : activeStep.nfaAction}
              </span>
            </div>
          )}

          {/* Speech Subtitles / Text explanation */}
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {voiceLang === 'hi' ? activeStep.descriptionHi : activeStep.descriptionEn}
          </p>
        </div>
      )}

      {/* Steps Cards List */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {steps.map((step, idx) => {
          const isActive = idx === activeStepIndex;
          return (
            <div
              key={step.id}
              id={`conversion-step-card-${idx}`}
              onClick={() => {
                onStepChange(idx);
                if (isPlaying) {
                  speakCurrentStep(idx, false);
                }
              }}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-sm shadow-indigo-900/30'
                  : 'bg-[#0d0e17] border-[#222538] hover:bg-[#151726] hover:border-indigo-500/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[#1a1c2d] text-slate-400'
                    }`}
                  >
                    {step.stepNumber}
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        isActive ? 'text-indigo-200' : 'text-slate-200'
                      }`}
                    >
                      {voiceLang === 'hi' ? step.titleHi : step.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {voiceLang === 'hi' ? step.descriptionHi : step.descriptionEn}
                    </p>
                  </div>
                </div>

                {step.grammarRule && (
                  <span className="hidden sm:inline-block font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#151726] text-indigo-300 border border-[#25283d] shrink-0">
                    {step.grammarRule}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
