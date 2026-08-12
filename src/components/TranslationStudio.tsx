import React, { useState } from "react";
import {
  Mic,
  MicOff,
  ArrowRightLeft,
  Volume2,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Send,
  Globe,
  Zap,
} from "lucide-react";
import { LanguageCode, TranslationTurn, ConnectionStatus } from "../types";
import { AudioVisualizer } from "./AudioVisualizer";

interface TranslationStudioProps {
  sourceLang: LanguageCode;
  setSourceLang: (lang: LanguageCode) => void;
  targetLang: LanguageCode;
  setTargetLang: (lang: LanguageCode) => void;
  status: ConnectionStatus;
  statusMessage: string;
  onStartTranslation: () => void;
  onStopTranslation: () => void;
  turns: TranslationTurn[];
  onClearTurns: () => void;
  inputVolume: number;
  outputVolume: number;
  onSynthesizeTTS: (text: string, lang: LanguageCode) => void;
  onSendTextPhrase: (text: string) => void;
}

export const TranslationStudio: React.FC<TranslationStudioProps> = ({
  sourceLang,
  setSourceLang,
  targetLang,
  setTargetLang,
  status,
  statusMessage,
  onStartTranslation,
  onStopTranslation,
  turns,
  onClearTurns,
  inputVolume,
  outputVolume,
  onSynthesizeTTS,
  onSendTextPhrase,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customTextInput, setCustomTextInput] = useState("");
  const [isTranslatingText, setIsTranslatingText] = useState(false);

  const isLive = status === "listening" || status === "connected" || status === "speaking";

  const handleSwapLanguages = () => {
    if (sourceLang === "auto") {
      setSourceLang("hi");
      setTargetLang("en");
    } else {
      const prevSource = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(prevSource);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickPhraseSelect = (phrase: string) => {
    setCustomTextInput(phrase);
  };

  const handleManualTranslateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTextInput.trim() || isTranslatingText) return;
    setIsTranslatingText(true);
    await onSendTextPhrase(customTextInput.trim());
    setIsTranslatingText(false);
    setCustomTextInput("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Bidirectional Isolated Channels Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-indigo-500/20 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-bold tracking-wide uppercase text-indigo-200">
              Isolated Two-Way Bidirectional Translation Flow
            </h2>
          </div>
          <div className="flex items-center space-x-2 text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
            <Check className="w-3.5 h-3.5" />
            <span>Echo & Self-Feedback Loop Suppression Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Direction 1: English -> Spanish */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
              <span>Channel 1: You → Remote Listener</span>
              <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-200">Outbound</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              You speak <strong className="text-white">English</strong> ➔ Translated to <strong className="text-amber-300">Spanish</strong> output for remote listener.
            </p>
          </div>

          {/* Direction 2: Spanish -> English */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
              <span>Channel 2: Remote Speaker → You</span>
              <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-200">Inbound</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              They speak <strong className="text-amber-300">Spanish</strong> ➔ Translated to <strong className="text-white">English</strong> audio in your speaker.
            </p>
          </div>
        </div>
      </div>

      {/* Top Banner Control Panel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Language Selector Controls */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-center">
            {/* Source Language */}
            <div className="flex flex-col space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Speaker Language
              </label>
              <div className="relative">
                <select
                  id="source-lang-select"
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value as LanguageCode)}
                  className="appearance-none bg-slate-100/80 border border-slate-300/80 text-slate-800 text-sm font-semibold rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="auto">🌐 Auto-Detect Language</option>
                  <option value="en">🇺🇸 English (US)</option>
                  <option value="en-GB">🇬🇧 English (UK)</option>
                  <option value="hi">🇮🇳 Hindi (हिंदी)</option>
                  <option value="es">🇪🇸 Spanish (Español)</option>
                  <option value="de">🇩🇪 German (Deutsch)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                  <Globe className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex items-end pb-0.5">
              <button
                id="swap-languages-btn"
                onClick={handleSwapLanguages}
                title="Swap Languages"
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200 hover:scale-105 active:scale-95"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Target Language */}
            <div className="flex flex-col space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Translate To
              </label>
              <div className="relative">
                <select
                  id="target-lang-select"
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value as LanguageCode)}
                  className="appearance-none bg-slate-100/80 border border-slate-300/80 text-slate-800 text-sm font-semibold rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="hi">🇮🇳 Hindi (हिंदी)</option>
                  <option value="en">🇺🇸 English (US)</option>
                  <option value="en-GB">🇬🇧 English (UK)</option>
                  <option value="es">🇪🇸 Spanish (Español)</option>
                  <option value="de">🇩🇪 German (Deutsch)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                  <Globe className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Start/Stop Live Microphone Button */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-center">
            {isLive ? (
              <button
                id="stop-translation-btn"
                onClick={onStopTranslation}
                className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
              >
                <MicOff className="w-5 h-5 animate-pulse" />
                <span>Stop Live Translation</span>
              </button>
            ) : (
              <button
                id="start-translation-btn"
                onClick={onStartTranslation}
                className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg shadow-indigo-600/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
              >
                <Mic className="w-5 h-5" />
                <span>Start Live Voice Translate</span>
              </button>
            )}
          </div>
        </div>

        {/* Audio Visualizer Bar */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full md:w-1/3">
            <span className="text-xs font-semibold text-slate-600 flex items-center space-x-1.5 whitespace-nowrap">
              <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
              <span>Mic Stream:</span>
            </span>
            <AudioVisualizer
              volumeLevel={inputVolume}
              isListening={isLive}
              color="#4f46e5"
              height={32}
            />
          </div>

          <div className="text-center md:text-left">
            <p className="text-xs font-medium text-slate-600">
              {statusMessage || "Click Start Live Voice Translate to stream microphone audio directly to Gemini Live."}
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Target: {targetLang === "hi" ? "Hindi Voice" : "English Voice"}</span>
          </div>
        </div>
      </div>

      {/* Manual Phrase Input & Quick Demo Shortcuts */}
      <div className="bg-gradient-to-r from-indigo-50/70 via-white to-slate-50 p-5 rounded-2xl border border-indigo-100/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Quick Conversation Test & Phrase Input</span>
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            Test English ↔ Hindi without microphone
          </span>
        </div>

        <form onSubmit={handleManualTranslateSubmit} className="flex gap-2">
          <input
            id="custom-phrase-input"
            type="text"
            value={customTextInput}
            onChange={(e) => setCustomTextInput(e.target.value)}
            placeholder="Type or select a meeting phrase (e.g. Hi, can you explain the issue with the Salesforce integration?)"
            className="flex-1 bg-white border border-slate-300 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <button
            id="send-phrase-btn"
            type="submit"
            disabled={!customTextInput.trim() || isTranslatingText}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Translate</span>
          </button>
        </form>

        {/* Quick Phrase Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => handleQuickPhraseSelect("Hi, can you explain the issue with the Salesforce integration?")}
            className="text-xs bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-3 py-1 rounded-lg border border-slate-200 hover:border-indigo-200 transition-all text-left"
          >
            🇺🇸 "Hi, can you explain the issue with the Salesforce integration?"
          </button>
          <button
            onClick={() => handleQuickPhraseSelect("क्या आप मुझे यह process समझा सकते हैं?")}
            className="text-xs bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-3 py-1 rounded-lg border border-slate-200 hover:border-indigo-200 transition-all text-left"
          >
            🇮🇳 "क्या आप मुझे यह process समझा सकते हैं?"
          </button>
          <button
            onClick={() => handleQuickPhraseSelect("Welcome everyone to today's project sprint review.")}
            className="text-xs bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-3 py-1 rounded-lg border border-slate-200 hover:border-indigo-200 transition-all text-left"
          >
            🇺🇸 "Welcome everyone to today's sprint review."
          </button>
          <button
            onClick={() => handleQuickPhraseSelect("हाँ, मैं अभी database migration check करता हूँ।")}
            className="text-xs bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-3 py-1 rounded-lg border border-slate-200 hover:border-indigo-200 transition-all text-left"
          >
            🇮🇳 "हाँ, मैं अभी database migration check करता हूँ।"
          </button>
        </div>
      </div>

      {/* Real-time Subtitle Stream & History Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Stream Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Live Stream & Conversation History
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">
              {turns.length} {turns.length === 1 ? "turn" : "turns"} recorded
            </span>
            {turns.length > 0 && (
              <button
                onClick={onClearTurns}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-200/60 transition-all"
                title="Clear History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Translation Timeline Stream */}
        <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
          {turns.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Mic className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                No translation stream recorded yet
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click <strong>Start Live Voice Translate</strong> above or choose a test phrase to see real-time English ↔ Hindi translations appear here.
              </p>
            </div>
          ) : (
            turns.map((turn) => {
              const isHindiTarget = turn.targetLang === "hi";
              return (
                <div
                  key={turn.id}
                  className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 hover:border-indigo-200 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                        <span>{turn.sourceLang === "hi" ? "🇮🇳 Hindi Speaker" : "🇺🇸 English Speaker"}</span>
                      </span>
                      <span className="text-slate-300">→</span>
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {isHindiTarget ? "🇮🇳 Hindi Translation" : "🇺🇸 English Translation"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {turn.timestamp}
                      </span>
                      <button
                        onClick={() => handleCopy(turn.translatedText, turn.id)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded transition-all"
                        title="Copy Translation"
                      >
                        {copiedId === turn.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => onSynthesizeTTS(turn.translatedText, turn.targetLang)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-all"
                        title="Play Synthetic Voice"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Speech Input & Output Comparison Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Source Speech Text */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Original Speech
                      </span>
                      <p className="text-sm text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-xl border border-slate-200/60">
                        {turn.sourceText || "Listening to speech audio..."}
                      </p>
                    </div>

                    {/* Translated Output Text */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">
                        Real-time AI Translation
                      </span>
                      <p className="text-sm text-indigo-950 font-semibold leading-relaxed bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/80">
                        {turn.translatedText}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
