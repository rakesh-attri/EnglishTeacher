import React from "react";
import {
  Mic,
  Subtitles,
  Monitor,
  Cpu,
  Radio,
  Volume2,
  Sparkles,
  Zap,
} from "lucide-react";
import { ActiveTab, ConnectionStatus } from "../types";

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  status: ConnectionStatus;
  statusMessage: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  status,
  statusMessage,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case "listening":
      case "connected":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-pulse">
            <span className="w-2 h-2 mr-1.5 rounded-full bg-emerald-500 animate-ping" />
            Live Translating
          </span>
        );
      case "speaking":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Volume2 className="w-3.5 h-3.5 mr-1 animate-bounce" />
            Playing Translated Voice
          </span>
        );
      case "connecting":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Zap className="w-3.5 h-3.5 mr-1 animate-spin" />
            Connecting Gemini Live...
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            Connection Alert
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Ready
          </span>
        );
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Status */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/10">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Bilingual Voice Live
                </h1>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Multilingual AI
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Gemini 3.5 Live Speech Translation Pipeline
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              id="nav-tab-studio"
              onClick={() => setActiveTab("studio")}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "studio"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Translator Studio</span>
            </button>

            <button
              id="nav-tab-subtitles"
              onClick={() => setActiveTab("subtitles")}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "subtitles"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Subtitles className="w-3.5 h-3.5" />
              <span>Meeting Subtitles</span>
            </button>

            <button
              id="nav-tab-system-audio"
              onClick={() => setActiveTab("system_audio")}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "system_audio"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Tab / Meeting Capture</span>
            </button>

            <button
              id="nav-tab-virtual-device"
              onClick={() => setActiveTab("virtual_device")}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "virtual_device"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Virtual Mic Router</span>
            </button>

            <button
              id="nav-tab-architecture"
              onClick={() => setActiveTab("architecture")}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "architecture"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Architecture & Cost</span>
            </button>
          </nav>

          {/* Right Status Badge */}
          <div className="flex items-center space-x-3">
            {getStatusBadge()}
          </div>
        </div>

        {/* Mobile Tab Selector */}
        <div className="md:hidden flex items-center overflow-x-auto space-x-1 pb-2 scrollbar-none border-t border-slate-100 pt-2">
          <button
            onClick={() => setActiveTab("studio")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === "studio"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            <Mic className="w-3 h-3" />
            <span>Studio</span>
          </button>

          <button
            onClick={() => setActiveTab("subtitles")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === "subtitles"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            <Subtitles className="w-3 h-3" />
            <span>Subtitles</span>
          </button>

          <button
            onClick={() => setActiveTab("system_audio")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === "system_audio"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>Meeting Audio</span>
          </button>

          <button
            onClick={() => setActiveTab("virtual_device")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === "virtual_device"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Virtual Mic</span>
          </button>

          <button
            onClick={() => setActiveTab("architecture")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === "architecture"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            <Cpu className="w-3 h-3" />
            <span>Architecture</span>
          </button>
        </div>
      </div>
    </header>
  );
};
