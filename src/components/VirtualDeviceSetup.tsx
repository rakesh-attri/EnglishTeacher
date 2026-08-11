import React, { useState } from "react";
import {
  Mic,
  Volume2,
  Cpu,
  ArrowRight,
  Download,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Radio,
} from "lucide-react";

export const VirtualDeviceSetup: React.FC = () => {
  const [activeOs, setActiveOs] = useState<"windows" | "mac">("windows");
  const [testAudioPlaying, setTestAudioPlaying] = useState(false);

  const handlePlayTestTone = () => {
    setTestAudioPlaying(true);
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, audioCtx.currentTime); // 440Hz pitch test tone
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    setTimeout(() => {
      osc.stop();
      audioCtx.close();
      setTestAudioPlaying(false);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Microsoft Teams Custom App Package Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4 border border-indigo-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-xs font-bold">
              <Download className="w-3.5 h-3.5 text-indigo-300" />
              <span>Microsoft Teams Native App Manifest</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight">
              Add VoxFlow Live to Microsoft Teams ("Added by your org")
            </h3>
            <p className="text-xs text-indigo-200 max-w-2xl leading-relaxed">
              Download the pre-configured Microsoft Teams App Package (contains <code>manifest.json</code>, <code>color.png</code>, and <code>outline.png</code>). Upload it to Teams Developer Portal or Teams Admin to make it available under <strong>Apps → Added by your org</strong> or inside meeting side-panels!
            </p>
          </div>

          <a
            href="/VoxFlowLive-TeamsApp.zip"
            download="VoxFlowLive-TeamsApp.zip"
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-white text-indigo-950 hover:bg-indigo-50 font-extrabold text-xs shadow-lg transition-all shrink-0 active:scale-95"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Download Teams App Package (.zip)</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs text-indigo-100">
          <div className="bg-white/10 p-3 rounded-xl border border-white/10 space-y-1">
            <p className="font-bold text-white">1. Download ZIP</p>
            <p className="text-[11px] text-indigo-200">Get the <code>VoxFlowLive-TeamsApp.zip</code> package containing manifest and high-res icons.</p>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10 space-y-1">
            <p className="font-bold text-white">2. Open Teams Apps</p>
            <p className="text-[11px] text-indigo-200">Go to Teams → <strong>Apps</strong> → <strong>Developer Portal</strong> (or "Manage your apps" → "Submit an app").</p>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10 space-y-1">
            <p className="font-bold text-white">3. Upload & Publish</p>
            <p className="text-[11px] text-indigo-200">Upload the ZIP to publish it for your organization or side-panel in meeting calls!</p>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold">
          <Radio className="w-3.5 h-3.5 text-indigo-400" />
          <span>Phase 4 — Virtual Audio Routing Architecture</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          How to Inject Translated Audio Back into Zoom / Teams Meetings
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          To allow other participants in a Zoom or Teams meeting to hear translated Hindi/English speech directly without installing any software on their side, route the translated voice into a <strong>Virtual Microphone Device</strong>.
        </p>
      </div>

      {/* Routing Architecture Visualizer Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-indigo-600" />
          <span>Bi-directional Audio Loop Architecture</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center">
          {/* Step 1 */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs mx-auto">
              1
            </div>
            <p className="text-xs font-bold text-slate-900">Zoom / Teams Call</p>
            <p className="text-[11px] text-slate-500">Speaker talks in English</p>
          </div>

          <ArrowRight className="w-5 h-5 text-indigo-500 mx-auto hidden md:block" />

          {/* Step 2 */}
          <div className="bg-indigo-50/80 p-4 rounded-2xl border border-indigo-200 space-y-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs mx-auto">
              2
            </div>
            <p className="text-xs font-bold text-indigo-950">Gemini Live Pipeline</p>
            <p className="text-[11px] text-indigo-700 font-medium">Translates EN → HI speech</p>
          </div>

          <ArrowRight className="w-5 h-5 text-indigo-500 mx-auto hidden md:block" />

          {/* Step 3 */}
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs mx-auto">
              3
            </div>
            <p className="text-xs font-bold text-amber-950">Virtual Cable Device</p>
            <p className="text-[11px] text-amber-800">CABLE Input (Speaker)</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Volume2 className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-xs font-bold text-slate-900">Test Local Virtual Cable Audio Signal</p>
              <p className="text-xs text-slate-500">Play 440Hz test audio tone to verify audio output routing</p>
            </div>
          </div>

          <button
            onClick={handlePlayTestTone}
            disabled={testAudioPlaying}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm whitespace-nowrap"
          >
            {testAudioPlaying ? "Playing 2s Test Tone..." : "Play Test Tone"}
          </button>
        </div>
      </div>

      {/* OS Selector Setup Guides */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-900">
            Setup Instructions by Operating System
          </h3>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveOs("windows")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeOs === "windows" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🪟 Windows (VB-Cable)
            </button>
            <button
              onClick={() => setActiveOs("mac")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeOs === "mac" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🍎 macOS (BlackHole)
            </button>
          </div>
        </div>

        {activeOs === "windows" ? (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <Download className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-sm">Step 1: Download VB-AUDIO Virtual Cable (Free)</p>
                <p className="text-slate-600">
                  Download VB-Cable Virtual Audio Device driver from <code>vb-audio.com</code>. Run installer as Administrator and restart your PC.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <Sliders className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-sm">Step 2: Set Browser Audio Output to CABLE Input</p>
                <p className="text-slate-600">
                  In Windows Sound Settings → App volume and device preferences, set this AI Voice Translator app's output device to <strong>CABLE Input (VB-Audio Virtual Cable)</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <Mic className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-sm">Step 3: Select CABLE Output as Zoom/Teams Microphone</p>
                <p className="text-slate-600">
                  In Zoom or Microsoft Teams audio settings, select <strong>CABLE Output (VB-Audio Virtual Cable)</strong> as your Microphone input. All meeting participants will now hear translated Hindi speech clearly!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <Download className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-sm">Step 1: Install BlackHole 2ch via Homebrew</p>
                <p className="text-slate-600">
                  Run <code>brew install blackhole-2ch</code> in Terminal to install the open-source Virtual Audio Loopback driver for macOS.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <Cpu className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-sm">Step 2: Create Multi-Output Device in Audio MIDI Setup</p>
                <p className="text-slate-600">
                  Open Audio MIDI Setup on macOS, create a Multi-Output Device combining your Headphones and BlackHole 2ch so you can hear local audio and route output simultaneously.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <Mic className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-sm">Step 3: Set Zoom/Teams Microphone to BlackHole 2ch</p>
                <p className="text-slate-600">
                  In Zoom / Teams audio preferences, select <strong>BlackHole 2ch</strong> as your Microphone input.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Technical Restrictions & Practical Workarounds Callout */}
      <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200/80 space-y-3 text-xs text-amber-950">
        <h4 className="text-sm font-bold text-amber-900 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Platform Technical Restrictions & Solutions</span>
        </h4>
        <ul className="list-disc pl-5 space-y-1 text-amber-900/90 font-medium">
          <li>
            <strong>Zoom/Teams Echo Cancellation Filtering:</strong> Zoom and Teams feature aggressive noise cancellation that might treat synthetic voice playback as background noise if volume is too low. <em>Workaround: Set Zoom Audio profile to "Original Sound for Musicians" or disable background noise suppression.</em>
          </li>
          <li>
            <strong>Participant Permissions:</strong> Zoom/Teams meetings do not allow external web apps to automatically inject audio without acting as a virtual microphone or bot user. <em>Workaround: Virtual Cable routing acts as a native system microphone device requiring zero special meeting admin permissions!</em>
          </li>
        </ul>
      </div>
    </div>
  );
};
