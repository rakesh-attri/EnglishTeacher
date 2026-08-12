import React, { useState, useRef, useEffect } from "react";
import {
  Monitor,
  Video,
  Play,
  Square,
  CheckCircle,
  HelpCircle,
  Layers,
  Radio,
  Mic,
  Volume2,
  AlertTriangle,
  ArrowRightLeft,
  Sparkles,
  Info,
  ExternalLink,
} from "lucide-react";
import { ConnectionStatus } from "../types";

interface SystemAudioGuideProps {
  status: ConnectionStatus;
  onStartTabAudioCapture: (stream: MediaStream) => void;
  onStopTabAudioCapture: () => void;
}

export const SystemAudioGuide: React.FC<SystemAudioGuideProps> = ({
  status,
  onStartTabAudioCapture,
  onStopTabAudioCapture,
}) => {
  const [isCapturingTab, setIsCapturingTab] = useState(false);
  const [capturedTabTitle, setCapturedTabTitle] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [includeMic, setIncludeMic] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isInIframe, setIsInIframe] = useState(false);

  const activeStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      setIsInIframe(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopLocalStreams();
    };
  }, []);

  const stopLocalStreams = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((t) => t.stop());
      activeStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  const handleCaptureTabAudio = async () => {
    setCaptureError(null);
    try {
      // 1. Prompt user to select browser tab or screen with audio
      // IMPORTANT: echoCancellation: false is required so browser audio processing engine
      // does not mute/cancel out the tab audio!
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        } as any,
      });

      const tabAudioTracks = displayStream.getAudioTracks();
      if (tabAudioTracks.length === 0) {
        setCaptureError(
          "⚠️ No audio track was detected! When the browser popup appears, make sure to select the 'Chrome Tab' or 'Edge Tab' option (e.g. Google Meet, Zoom Web, or Teams Web) AND check the 'Share tab audio' toggle checkbox at the bottom left."
        );
        displayStream.getTracks().forEach((t) => t.stop());
        return;
      }

      let finalStream = displayStream;

      // 2. Optionally mix local microphone audio for 2-way meeting translation
      if (includeMic) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          micStreamRef.current = micStream;

          // Merge Tab Audio + Mic Audio into a single AudioContext Destination Stream
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          audioContextRef.current = audioCtx;
          const dest = audioCtx.createMediaStreamDestination();

          const tabSource = audioCtx.createMediaStreamSource(new MediaStream([tabAudioTracks[0]]));
          const micSource = audioCtx.createMediaStreamSource(micStream);

          tabSource.connect(dest);
          micSource.connect(dest);

          finalStream = dest.stream;
        } catch (micErr) {
          console.warn("Could not capture microphone for mixing:", micErr);
          // Fall back to tab audio only if mic access is denied
        }
      }

      activeStreamRef.current = finalStream;
      setIsCapturingTab(true);

      const track = tabAudioTracks[0];
      setCapturedTabTitle(track.label || "Captured Browser Audio Stream");

      // Monitor live audio level
      try {
        const monitorCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const monitorSource = monitorCtx.createMediaStreamSource(new MediaStream([track]));
        const analyser = monitorCtx.createAnalyser();
        analyser.fftSize = 256;
        monitorSource.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      } catch (monErr) {
        console.warn("Audio level monitor setup failed:", monErr);
      }

      // Stop handling when user clicks browser native 'Stop sharing' bar
      track.onended = () => {
        handleStopCapture();
      };

      // Pass stream to parent translator pipeline
      onStartTabAudioCapture(finalStream);
    } catch (err: any) {
      console.error("Tab audio capture error:", err);
      const errStr = (err.message || "").toLowerCase();
      if (
        err.name === "SecurityError" ||
        errStr.includes("disallowed by permissions policy") ||
        errStr.includes("display-capture")
      ) {
        setCaptureError("PERMISSIONS_POLICY");
      } else if (err.name !== "NotAllowedError") {
        setCaptureError(
          err.message || "Failed to capture meeting audio. Please try again."
        );
      }
    }
  };

  const handleStopCapture = () => {
    setIsCapturingTab(false);
    setCapturedTabTitle(null);
    setAudioLevel(0);
    stopLocalStreams();
    onStopTabAudioCapture();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
              <Monitor className="w-3.5 h-3.5" />
              <span>Direct Meeting Audio Capture</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Capture Zoom, Teams & Google Meet Audio
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Capture and translate live audio from Google Meet, Zoom Web, or Microsoft Teams browser calls without installing third-party audio cables or plugins.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {isCapturingTab ? (
              <button
                onClick={handleStopCapture}
                className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition-all w-full sm:w-auto justify-center cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop Meeting Capture</span>
              </button>
            ) : (
              <button
                onClick={handleCaptureTabAudio}
                className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all w-full sm:w-auto justify-center cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Capture Meeting Tab Audio</span>
              </button>
            )}
          </div>
        </div>

        {/* Options Row */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all">
            <input
              type="checkbox"
              checked={includeMic}
              onChange={(e) => setIncludeMic(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 bg-white border-slate-300 w-4 h-4"
            />
            <Mic className="w-4 h-4 text-indigo-600" />
            <span>Include My Microphone (Two-Way Meeting Translation)</span>
          </label>

          <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Supports Google Meet, Zoom Web & Teams Web in Chrome/Edge</span>
          </div>
        </div>

        {/* Iframe Notice Banner if embedded in preview frame */}
        {isInIframe && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900">
                  Running in Preview Frame: Open in New Tab for Meeting Capture
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Browser security rules restrict tab audio capture inside iframe previews. Opening the app in a standalone tab enables Chrome/Edge's native tab audio capture dialog.
                </p>
              </div>
            </div>
            <button
              onClick={() => window.open(window.location.href, "_blank", "noopener,noreferrer")}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open App in New Tab</span>
            </button>
          </div>
        )}

        {/* Live Active Stream Indicator with Audio Meter */}
        {isCapturingTab && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">
                    Active Meeting Stream Connected
                  </p>
                  <p className="text-xs text-emerald-700 font-medium">
                    {capturedTabTitle || "Tab audio active and streaming to Gemini Live Pipeline"}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg">
                Live Translating
              </span>
            </div>

            {/* Audio Level Meter */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                <span className="flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> Meeting Audio Signal Level:
                </span>
                <span>{audioLevel}%</span>
              </div>
              <div className="w-full bg-emerald-200/60 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-75 rounded-full"
                  style={{ width: `${Math.max(4, audioLevel)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Error Callout with Checklist or Permissions Policy */}
        {captureError && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs p-5 rounded-2xl space-y-3 shadow-sm">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm text-amber-950">
                  {captureError === "PERMISSIONS_POLICY"
                    ? "Open in New Tab to Enable Tab Share"
                    : "Audio Share Check Required"}
                </p>
                <p className="leading-relaxed text-amber-900">
                  {captureError === "PERMISSIONS_POLICY"
                    ? "Browsers restrict display-capture inside embedded iframe windows. Click the button below to open the application in a standalone browser tab where Chrome & Edge allow selecting your Google Meet, Zoom, or Teams tab audio."
                    : captureError}
                </p>
              </div>
            </div>

            {captureError === "PERMISSIONS_POLICY" ? (
              <div className="pt-2">
                <button
                  onClick={() => window.open(window.location.href, "_blank", "noopener,noreferrer")}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Launch in New Tab & Capture Meeting Audio</span>
                </button>
              </div>
            ) : (
              <div className="bg-white/80 p-3.5 rounded-xl border border-amber-200/80 text-amber-950 text-xs space-y-2">
                <p className="font-bold text-indigo-900">How to capture meeting audio correctly in 3 seconds:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 font-medium">
                  <li>Click <strong>Capture Meeting Tab Audio</strong> above.</li>
                  <li>In the browser popup, click the <strong>"Chrome Tab"</strong> or <strong>"Edge Tab"</strong> header tab.</li>
                  <li>Select your Google Meet, Zoom, or Teams tab.</li>
                  <li>Ensure the checkbox <strong>"Share tab audio"</strong> at the bottom left of the share dialog is <strong>Checked (ON)</strong>.</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3 Step How-To Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
            1
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Open Meeting in Browser Tab
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Join your Google Meet call, Zoom Web Client, or Microsoft Teams Web meeting in Google Chrome or Microsoft Edge.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
            2
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Select 'Share Tab Audio'
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Click <strong>Capture Meeting Tab Audio</strong> above. Select the meeting tab and ensure the <strong>"Share tab audio"</strong> checkbox at the bottom left is checked.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
            3
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Real-Time Two-Way Subtitles & Audio
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The app captures incoming participant voices, translates English ↔ Hindi in under ~500ms, and streams translated speech.
          </p>
        </div>
      </div>

      {/* Platform Compatibility Matrix */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <span>Meeting Platform Integration Matrix</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 uppercase font-bold">
                <th className="p-3 rounded-l-xl">Platform</th>
                <th className="p-3">Method</th>
                <th className="p-3">Participant App Install Required?</th>
                <th className="p-3">Browser Capture Support</th>
                <th className="p-3 rounded-r-xl">Recommended Setup</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              <tr>
                <td className="p-3 font-bold text-slate-900 flex items-center space-x-2">
                  <Video className="w-4 h-4 text-emerald-600" />
                  <span>Google Meet</span>
                </td>
                <td className="p-3">Browser Tab Audio API</td>
                <td className="p-3 text-emerald-600 font-bold">No (Zero install)</td>
                <td className="p-3">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                    Native 100%
                  </span>
                </td>
                <td className="p-3">Capture Google Meet tab directly in Chrome</td>
              </tr>

              <tr>
                <td className="p-3 font-bold text-slate-900 flex items-center space-x-2">
                  <Video className="w-4 h-4 text-blue-600" />
                  <span>Zoom Web Client</span>
                </td>
                <td className="p-3">Browser Tab Audio API</td>
                <td className="p-3 text-emerald-600 font-bold">No (Zero install)</td>
                <td className="p-3">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                    Native 100%
                  </span>
                </td>
                <td className="p-3">Join via Zoom Web link & share tab audio</td>
              </tr>

              <tr>
                <td className="p-3 font-bold text-slate-900 flex items-center space-x-2">
                  <Video className="w-4 h-4 text-indigo-600" />
                  <span>Microsoft Teams Web</span>
                </td>
                <td className="p-3">Browser Tab Audio API</td>
                <td className="p-3 text-emerald-600 font-bold">No (Zero install)</td>
                <td className="p-3">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                    Native 100%
                  </span>
                </td>
                <td className="p-3">Join via Teams Web & share browser tab audio</td>
              </tr>

              <tr>
                <td className="p-3 font-bold text-slate-900 flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-purple-600" />
                  <span>Teams / Zoom Desktop App</span>
                </td>
                <td className="p-3">Virtual Audio Device / System Share</td>
                <td className="p-3 text-slate-600 font-bold">No (Host only)</td>
                <td className="p-3">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                    Entire Screen Audio
                  </span>
                </td>
                <td className="p-3">Select "Entire Screen" + check "Share system audio" or use Web app</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
