import React, { useState } from "react";
import {
  Cpu,
  Layers,
  Zap,
  DollarSign,
  ShieldCheck,
  Terminal,
  CheckCircle2,
  Server,
  Cloud,
  Code2,
  Lock,
} from "lucide-react";

export const ArchitectureView: React.FC = () => {
  const [meetingHoursPerMonth, setMeetingHoursPerMonth] = useState<number>(20);

  // Pricing calculation based on Gemini Live API standard rates
  const totalMinutes = meetingHoursPerMonth * 60;
  const audioInputCostPerMin = 0.003; // $0.003 / min audio input
  const audioOutputCostPerMin = 0.024; // $0.024 / min audio output
  const containerServerCost = 5.00; // Cloud Run light instance

  const totalAudioInputCost = totalMinutes * audioInputCostPerMin;
  const totalAudioOutputCost = totalMinutes * audioOutputCostPerMin;
  const totalEstimatedMonthlyCost = totalAudioInputCost + totalAudioOutputCost + containerServerCost;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>Complete System Architecture & Cost Analysis</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          Bilingual Live Voice Translation Pipeline
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          High-performance, low-latency streaming pipeline connecting browser Web Audio, Node.js WebSocket gateway, and Google Gemini Live AI models for continuous English ↔ Hindi meeting translation.
        </p>
      </div>

      {/* Architecture Flow Diagram Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <span>System Pipeline Flow Architecture</span>
        </h3>

        <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 font-mono text-xs overflow-x-auto border border-slate-800">
          <pre className="leading-relaxed">
{`┌─────────────────────────────────────────────────────────────────────────────────┐
│                          1. INPUT AUDIO CAPTURE LAYER                           │
│  [ Microphone ]   OR   [ Zoom / Teams / Meet Tab Audio (getDisplayMedia) ]      │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │  (16kHz Int16 Raw PCM Chunks via Web Audio API)
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    2. BACKEND WEBSOCKET GATEWAY (server.ts)                     │
│  Express + Node.js ws Server (Port 3000)                                       │
│  • Bi-directional audio buffer streaming                                        │
│  • Session context & reconnect management                                       │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │  (WebSocket /ws/translate)
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       3. GEMINI LIVE MULTIMODAL MODEL                           │
│  Google Gemini 3.5 Live Translate Preview (gemini-3.5-live-translate-preview)   │
│  • Real-time speech recognition (ASR)                                           │
│  • Bidirectional English ↔ Hindi neural translation                             │
│  • Direct 24kHz PCM speech synthesis (TTS)                                      │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │  (24kHz PCM Output + Live Subtitle Transcripts)
                                         ▼
┌────────────────────────────────────────┴────────────────────────────────────────┐
│                               4. OUTPUT LAYER                                   │
│  ┌─────────────────────────────────────┐     ┌────────────────────────────────┐ │
│  │ A. Real-Time Text Subtitles UI     │     │ B. Synthetic Translated Voice  │ │
│  │    Floating Overlay / Transcripts   │     │    Gapless PCM Queue Player    │ │
│  └─────────────────────────────────────┘     └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </div>

      {/* Latency Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span>Sub-Second Latency Optimization Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <p className="font-bold text-slate-900">1. Audio Chunking</p>
            <p className="text-slate-500 mt-1">2048 samples @ 16kHz</p>
            <p className="text-indigo-600 font-bold mt-2">~128 ms</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <p className="font-bold text-slate-900">2. WebSocket Network</p>
            <p className="text-slate-500 mt-1">Server proxy relay</p>
            <p className="text-indigo-600 font-bold mt-2">~40 ms</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <p className="font-bold text-slate-900">3. Gemini Live AI</p>
            <p className="text-slate-500 mt-1">Streaming translation</p>
            <p className="text-indigo-600 font-bold mt-2">~200 ms</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <p className="font-bold text-slate-900">4. Playback Buffer</p>
            <p className="text-slate-500 mt-1">AudioContext queue</p>
            <p className="text-indigo-600 font-bold mt-2">~80 ms</p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 text-xs font-medium flex items-center justify-between">
          <span>Total End-to-End Perceived Latency:</span>
          <span className="text-sm font-extrabold text-emerald-700 font-mono">
            ~448 ms (Natural Conversational Speed)
          </span>
        </div>
      </div>

      {/* Pricing & Cost Calculator */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>Estimated Running Cost Calculator</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">Gemini Live API Standard Tier</span>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="text-xs font-bold text-slate-800">
                Monthly Meeting Usage (Hours/Month):
              </label>
              <p className="text-xs text-slate-500">
                Number of live meeting hours translated per month
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={meetingHoursPerMonth}
                onChange={(e) => setMeetingHoursPerMonth(Number(e.target.value))}
                className="w-36 accent-indigo-600 cursor-pointer"
              />
              <span className="text-sm font-bold text-indigo-700 font-mono bg-white px-3 py-1 rounded-xl border border-slate-200">
                {meetingHoursPerMonth} hrs ({totalMinutes} mins)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100">
              <span className="text-slate-500 font-medium">Audio Input Cost ($0.003/min)</span>
              <p className="text-lg font-bold text-indigo-900 mt-1">${totalAudioInputCost.toFixed(2)}</p>
            </div>

            <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100">
              <span className="text-slate-500 font-medium">Audio Output Cost ($0.024/min)</span>
              <p className="text-lg font-bold text-indigo-900 mt-1">${totalAudioOutputCost.toFixed(2)}</p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <span className="text-emerald-800 font-bold">Total Est. Monthly Cost</span>
              <p className="text-xl font-extrabold text-emerald-700 mt-1">
                ${totalEstimatedMonthlyCost.toFixed(2)} / mo
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Deployment Instructions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <span>Security & Deployment Best Practices</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>API Key Security</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              The <code>GEMINI_API_KEY</code> is stored strictly in server environment variables and never exposed to client bundles or browser code. All WebSocket connections pass through Express server validation.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
              <Cloud className="w-4 h-4 text-indigo-600" />
              <span>Cloud Run Deployment</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Build using <code>npm run build</code> and deploy to Google Cloud Run container service. Express custom server binds to <code>0.0.0.0:3000</code> and handles WebSocket upgrade headers automatically.
            </p>
          </div>
        </div>

        {/* Local Run Terminal Commands */}
        <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400 font-bold flex items-center space-x-1.5">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Local Development Commands</span>
            </span>
            <span className="text-slate-500">npm / tsx</span>
          </div>
          <p className="text-slate-300"># Start server in dev mode with WebSocket support</p>
          <p className="text-indigo-400 font-bold">npm run dev</p>
          <p className="text-slate-300 pt-2"># Build CommonJS server bundle & Vite frontend for production</p>
          <p className="text-indigo-400 font-bold">npm run build && npm start</p>
        </div>
      </div>
    </div>
  );
};
