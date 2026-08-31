import { VoiceLanguage } from '../types';

export class SpeechTutor {
  private static instance: SpeechTutor | null = null;
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private isPaused = false;
  private rate = 1.0;
  private language: VoiceLanguage = 'en';

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public static getInstance(): SpeechTutor {
    if (!SpeechTutor.instance) {
      SpeechTutor.instance = new SpeechTutor();
    }
    return SpeechTutor.instance;
  }

  public setLanguage(lang: VoiceLanguage) {
    this.language = lang;
  }

  public getLanguage(): VoiceLanguage {
    return this.language;
  }

  public setRate(rate: number) {
    this.rate = rate;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  private findBestVoice(lang: VoiceLanguage): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (voices.length === 0) return null;

    if (lang === 'hi') {
      // Find Hindi voice
      const hindiVoice = voices.find(v => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('lekha') || v.name.toLowerCase().includes('neerja'));
      if (hindiVoice) return hindiVoice;
      // Fallback to Indian English if Hindi is not installed
      const indianVoice = voices.find(v => v.lang.includes('en-IN') || v.name.toLowerCase().includes('india'));
      if (indianVoice) return indianVoice;
    } else {
      // Find British or US English voice
      const gbVoice = voices.find(v => v.lang === 'en-GB' || v.name.toLowerCase().includes('george') || v.name.toLowerCase().includes('hazel') || v.name.toLowerCase().includes('uk'));
      if (gbVoice) return gbVoice;
      const enVoice = voices.find(v => v.lang.startsWith('en'));
      if (enVoice) return enVoice;
    }

    return voices[0] || null;
  }

  /**
   * Speak a text string and fire callback on completion
   */
  public speak(
    text: string,
    options?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (e: any) => void;
      language?: VoiceLanguage;
      rate?: number;
    }
  ): void {
    if (!this.synth) {
      // Web Speech API not supported in this environment
      console.warn('Web Speech API is not supported in this browser.');
      options?.onEnd?.();
      return;
    }

    // Always stop previous speech before new speech
    this.stop();

    const langToUse = options?.language || this.language;
    const rateToUse = options?.rate || this.rate;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rateToUse;
    utterance.pitch = 1.0;
    utterance.lang = langToUse === 'hi' ? 'hi-IN' : 'en-US';

    const voice = this.findBestVoice(langToUse);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      options?.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      options?.onError?.(e);
      // Even if speech has an error, advance so workflow doesn't get stuck
      options?.onEnd?.();
    };

    this.currentUtterance = utterance;
    try {
      this.synth.speak(utterance);
    } catch (err) {
      console.error('Speech error:', err);
      options?.onEnd?.();
    }
  }

  public pause(): void {
    if (this.synth && this.isSpeaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
    }
  }

  public resume(): void {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
    }
  }

  public stop(): void {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        // ignore cancel error
      }
    }
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentUtterance = null;
  }

  public getStatus(): { isSpeaking: boolean; isPaused: boolean; isSupported: boolean } {
    return {
      isSpeaking: this.isSpeaking,
      isPaused: this.isPaused,
      isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
    };
  }
}
