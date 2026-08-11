import React, { useState } from "react";
import {
  Subtitles,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  Settings,
  Volume2,
  Globe,
  Radio,
} from "lucide-react";
import { TranslationTurn, ConnectionStatus, LanguageCode } from "../types";

interface SubtitleOverlayProps {
  status: ConnectionStatus;
  statusMessage: string;
  onStartTranslation: () => void;
  onStopTranslation: () => void;
  turns: TranslationTurn[];
  targetLang: LanguageCode;
  setTargetLang: (lang: LanguageCode) => void;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  status,
  statusMessage,
  onStartTranslation,
  onStopTranslation,
  turns,
  targetLang,
  setTargetLang,
}) => {
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">("lg");
  const [bgOpacity, setBgOpacity] = useState<number>(90); // 0 to 100
  const [isCompact, setIsCompact] = useState<boolean>(false);

  const isLive = status === "listening" || status === "connected" || status === "speaking";

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "sm":
        return "text-sm";
      case "md":
        return "text-base";
      case "lg":
        return "text-xl font-bold";
      case "xl":
        return "text-2xl font-black";
    }
  };

  const latestTurn = turns.length > 0 ? turns[turns.length - 1] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Subtitles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <span>Meeting Subtitle Overlay</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full uppercase tracking-widest font-mono">
                  Teams / Zoom / Meet
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Floating translucent subtitle widget designed to stay visible during live video meetings.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isLive ? (
              <button
                onClick={onStopTranslation}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all"
              >
                <MicOff className="w-4 h-4 animate-pulse" />
                <span>Stop Subtitles</span>
              </button>
            ) : (
              <button
                onClick={onStartTranslation}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all"
              >
                <Mic className="w-4 h-4" />
                <span>Start Live Subtitles</span>
              </button>
            )}
          </div>
        </div>

        {/* Subtitle Widget Config Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800 text-xs">
          {/* Target Language Toggle */}
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400 font-medium">Subtitle Output:</span>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as LanguageCode)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="hi">🇮🇳 Hindi Subtitles</option>
              <option value="en">🇺🇸 English Subtitles</option>
            </select>
          </div>

          {/* Font Size Adjuster */}
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400 font-medium">Font Size:</span>
            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              {(["sm", "md", "lg", "xl"] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setFontSize(sz)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                    fontSize === sz ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Background Opacity */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-medium">Opacity:</span>
            <input
              type="range"
              min="30"
              max="100"
              value={bgOpacity}
              onChange={(e) => setBgOpacity(Number(e.target.value))}
              className="w-24 accent-indigo-500 cursor-pointer"
            />
            <span className="text-slate-300 font-mono text-[11px]">{bgOpacity}%</span>
          </div>
        </div>
      </div>

      {/* Floating Subtitle Overlay Preview Container */}
      <div
        style={{
          backgroundColor: `rgba(15, 23, 42, ${bgOpacity / 100})`,
        }}
        className="rounded-3xl p-6 md:p-8 text-white border border-slate-700/80 shadow-2xl backdrop-blur-xl transition-all min-h-[320px] flex flex-col justify-between"
      >
        {/* Overlay Widget Controls */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-xs font-mono text-slate-400 ml-2 flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Live Zoom/Teams Overlay Box</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-medium text-slate-400">
            <span>Mode: {isCompact ? "Compact Bar" : "Full Stream"}</span>
            <button
              onClick={() => setIsCompact(!isCompact)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
              title="Toggle Compact View"
            >
              {isCompact ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Live Subtitle Area */}
        <div className="py-8 space-y-6">
          {!latestTurn ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-slate-400 text-sm font-medium">
                {isLive
                  ? "🎙️ Subtitle engine active. Listening to meeting speaker..."
                  : "Click 'Start Live Subtitles' above to launch real-time Hindi ↔ English overlay."}
              </p>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                Place this window over your Zoom or Teams meeting window for instant translated captions.
              </p>
            </div>
          ) : isCompact ? (
            /* Single Compact Subtitle Line */
            <div className="bg-slate-900/90 rounded-2xl p-6 border border-indigo-500/30 text-center shadow-lg space-y-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400">
                {latestTurn.targetLang === "hi" ? "🇮🇳 Hindi Live Subtitle" : "🇺🇸 English Live Subtitle"}
              </span>
              <p className={`${getFontSizeClass()} text-amber-300 leading-snug drop-shadow-md`}>
                "{latestTurn.translatedText}"
              </p>
            </div>
          ) : (
            /* Full Dual Subtitle View */
            <div className="space-y-4">
              <div className="bg-slate-900/70 rounded-2xl p-5 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>Speaker Voice ({latestTurn.sourceLang === "hi" ? "Hindi" : "English"}):</span>
                  <span className="font-mono text-[10px] text-slate-500">{latestTurn.timestamp}</span>
                </div>
                <p className="text-slate-200 font-medium text-base">
                  "{latestTurn.sourceText}"
                </p>
              </div>

              <div className="bg-gradient-to-r from-indigo-950/80 to-slate-900/90 rounded-2xl p-6 border border-indigo-500/40 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-indigo-300 font-bold uppercase tracking-wider">
                  <span className="flex items-center space-x-1.5">
                    <Volume2 className="w-4 h-4 text-indigo-400" />
                    <span>Real-Time AI Subtitle ({latestTurn.targetLang === "hi" ? "Hindi" : "English"})</span>
                  </span>
                  <span className="bg-indigo-500/20 px-2 py-0.5 rounded text-[10px]">Gemini 3.5</span>
                </div>
                <p className={`${getFontSizeClass()} text-yellow-300 leading-snug tracking-wide font-serif`}>
                  "{latestTurn.translatedText}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Latency: ~350ms - 600ms streaming speed</span>
          </div>
          <div>
            <span>Tip: Drag browser tab next to your Zoom/Teams call window for side-by-side captions.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
