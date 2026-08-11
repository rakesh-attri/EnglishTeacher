import React, { useState } from "react";
import {
  Monitor,
  Video,
  Play,
  Square,
  CheckCircle,
  HelpCircle,
  Layers,
  Radio,
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

  const handleCaptureTabAudio = async () => {
    setCaptureError(null);
    try {
      // Prompt user to select browser tab or screen with audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      const audioTracks = displayStream.getAudioTracks();
      if (audioTracks.length === 0) {
        setCaptureError(
          "No audio track selected! When choosing the browser tab (e.g., Google Meet or Zoom Web), make sure to check 'Share tab audio' in the share popup."
        );
        displayStream.getTracks().forEach((t) => t.stop());
        return;
      }

      setIsCapturingTab(true);
      const track = audioTracks[0];
      setCapturedTabTitle(track.label || "Captured Browser Audio Stream");

      // Stop handling when user clicks browser native stop sharing
      track.onended = () => {
        setIsCapturingTab(false);
        setCapturedTabTitle(null);
        onStopTabAudioCapture();
      };

      // Pass stream to parent translator pipeline
      onStartTabAudioCapture(displayStream);
    } catch (err: any) {
      console.error("Tab audio capture error:", err);
      if (err.name !== "NotAllowedError") {
        setCaptureError(err.message || "Failed to capture meeting audio.");
      }
    }
  };

  const handleStopCapture = () => {
    setIsCapturingTab(false);
    setCapturedTabTitle(null);
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
              <span>Phase 3 — Direct Meeting Audio Capture</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Capture Zoom, Teams & Google Meet Audio
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Capture meeting audio directly from browser-based Google Meet, Zoom Web, or Teams Web calls without installing third-party audio drivers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {isCapturingTab ? (
              <button
                onClick={handleStopCapture}
                className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition-all w-full sm:w-auto justify-center"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop Meeting Capture</span>
              </button>
            ) : (
              <button
                onClick={handleCaptureTabAudio}
                className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all w-full sm:w-auto justify-center"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Capture Meeting Tab Audio</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Active Stream Indicator */}
        {isCapturingTab && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  Active Audio Stream Captured
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
        )}

        {/* Error Callout */}
        {captureError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-4 rounded-2xl space-y-1">
            <p className="font-bold flex items-center space-x-1">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Audio Share Check Required</span>
            </p>
            <p>{captureError}</p>
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
            Click <strong>Capture Meeting Tab Audio</strong> above. Select the meeting tab and ensure the <strong>"Share tab audio"</strong> checkbox at the bottom is checked.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
            3
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Real-Time Subtitles & Audio
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The app captures incoming participant voices, translates English ↔ Hindi in under ~500ms, and displays real-time captions.
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
                <td className="p-3">Virtual Audio Device / Stereo Mix</td>
                <td className="p-3 text-slate-600 font-bold">No (Host only)</td>
                <td className="p-3">
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-bold">
                    Virtual Cable Needed
                  </span>
                </td>
                <td className="p-3">Use VB-Cable (Windows) or BlackHole (macOS)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
