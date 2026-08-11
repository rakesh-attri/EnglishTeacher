/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { TranslationStudio } from "./components/TranslationStudio";
import { SubtitleOverlay } from "./components/SubtitleOverlay";
import { SystemAudioGuide } from "./components/SystemAudioGuide";
import { VirtualDeviceSetup } from "./components/VirtualDeviceSetup";
import { ArchitectureView } from "./components/ArchitectureView";
import {
  ActiveTab,
  LanguageCode,
  TranslationTurn,
  ConnectionStatus,
} from "./types";
import { PCMStreamRecorder, PCMAudioQueuePlayer, mergeBase64PCMChunks } from "./utils/pcmAudio";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("studio");
  const [sourceLang, setSourceLang] = useState<LanguageCode>("auto");
  const [targetLang, setTargetLang] = useState<LanguageCode>("hi");
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [statusMessage, setStatusMessage] = useState<string>(
    "Ready to translate live speech"
  );
  const [turns, setTurns] = useState<TranslationTurn[]>([]);
  const [inputVolume, setInputVolume] = useState<number>(0);
  const [outputVolume, setOutputVolume] = useState<number>(0);

  // Vercel / Serverless Fallback States
  const [isServerlessMode, setIsServerlessMode] = useState<boolean>(false);
  const [customWsUrl, setCustomWsUrl] = useState<string>(() => {
    return localStorage.getItem("voxflow_custom_ws_url") || "";
  });
  const [showDeploymentNotice, setShowDeploymentNotice] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<PCMStreamRecorder | null>(null);
  const playerRef = useRef<PCMAudioQueuePlayer | null>(null);
  const activeTurnIdRef = useRef<string | null>(null);
  const audioChunksRef = useRef<string[]>([]);
  const isProcessingRestAudioRef = useRef<boolean>(false);

  // Initialize Audio Player
  const getAudioPlayer = useCallback(() => {
    if (!playerRef.current) {
      playerRef.current = new PCMAudioQueuePlayer(24000);
    }
    return playerRef.current;
  }, []);

  // Save Custom WS URL
  const handleSaveCustomWsUrl = (url: string) => {
    setCustomWsUrl(url);
    localStorage.setItem("voxflow_custom_ws_url", url);
  };

  // Stop Translation Session
  const stopTranslationSession = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    if (playerRef.current) {
      playerRef.current.stopAll();
    }
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "stop" }));
      }
      wsRef.current.close();
      wsRef.current = null;
    }
    audioChunksRef.current = [];
    isProcessingRestAudioRef.current = false;
    setStatus("stopped");
    setStatusMessage("Live voice translation stopped.");
    setInputVolume(0);
  }, []);

  // Process Serverless REST Audio Chunk
  const sendRestAudioChunk = useCallback(async (base64Audio: string) => {
    if (isProcessingRestAudioRef.current || !base64Audio) return;
    isProcessingRestAudioRef.current = true;
    try {
      setStatusMessage("⚡ Serverless Mode: Translating voice clip...");
      const res = await fetch("/api/translate/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio: base64Audio,
          sourceLang,
          targetLang,
        }),
      });

      const data = await res.json();
      if (res.ok && data.translatedText) {
        const turnId = "turn-rest-" + Date.now();
        const newTurn: TranslationTurn = {
          id: turnId,
          timestamp: new Date().toLocaleTimeString(),
          speaker: "user",
          sourceLang: sourceLang,
          targetLang,
          sourceText: data.sourceText || "Spoken input clip",
          translatedText: data.translatedText,
        };

        setTurns((prev) => [newTurn, ...prev]);
        setStatus("speaking");
        setStatusMessage(`🎙️ Translated: "${data.translatedText}"`);

        if (data.audio) {
          const player = getAudioPlayer();
          player.playChunk(data.audio);
        }

        setTimeout(() => {
          setStatus("listening");
          setStatusMessage("🎙️ Serverless Voice Mode active. Speak into mic...");
        }, 2000);
      } else {
        setStatus("listening");
        setStatusMessage("🎙️ Serverless Voice Mode active. Speak into mic...");
      }
    } catch (e) {
      console.error("REST Audio translation error:", e);
      setStatus("listening");
      setStatusMessage("🎙️ Serverless Voice Mode active. Speak into mic...");
    } finally {
      isProcessingRestAudioRef.current = false;
    }
  }, [sourceLang, targetLang, getAudioPlayer]);

  // Start Live Voice Translation Session
  const startTranslationSession = useCallback(
    async (customMediaStream?: MediaStream) => {
      stopTranslationSession();

      setStatus("connecting");
      setStatusMessage("Opening WebSocket connection...");

      const protocol = location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = customWsUrl.trim() || `${protocol}//${location.host}/ws/translate`;

      try {
        let wsConnected = false;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          wsConnected = true;
          setIsServerlessMode(false);
          setShowDeploymentNotice(false);
          setStatusMessage("WebSocket connected. Starting Gemini Live session...");
          ws.send(
            JSON.stringify({
              type: "start",
              sourceLang,
              targetLang,
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);

            if (msg.type === "status") {
              if (msg.status === "connected") {
                setStatus("listening");
                setStatusMessage("🎙️ Live translating! Speak into your microphone or meeting call.");
              } else {
                setStatusMessage(msg.message || "Connecting...");
              }
            } else if (msg.type === "audio") {
              setStatus("speaking");
              const player = getAudioPlayer();
              player.playChunk(msg.data);

              setTimeout(() => {
                setStatus("listening");
              }, 1200);
            } else if (msg.type === "source_text") {
              const now = new Date().toLocaleTimeString();
              setTurns((prev) => {
                const existingIdx = prev.findIndex((t) => t.id === activeTurnIdRef.current);
                if (existingIdx !== -1) {
                  const updated = [...prev];
                  updated[existingIdx] = {
                    ...updated[existingIdx],
                    sourceText: msg.text,
                  };
                  return updated;
                } else {
                  const newId = "turn-" + Date.now();
                  activeTurnIdRef.current = newId;
                  return [
                    ...prev,
                    {
                      id: newId,
                      timestamp: now,
                      speaker: "user",
                      sourceLang: (msg.sourceLang as LanguageCode) || sourceLang,
                      targetLang,
                      sourceText: msg.text,
                      translatedText: "Translating...",
                    },
                  ];
                }
              });
            } else if (msg.type === "translation_text") {
              const now = new Date().toLocaleTimeString();
              setTurns((prev) => {
                const existingIdx = prev.findIndex((t) => t.id === activeTurnIdRef.current);
                if (existingIdx !== -1) {
                  const updated = [...prev];
                  updated[existingIdx] = {
                    ...updated[existingIdx],
                    translatedText: msg.text,
                  };
                  return updated;
                } else {
                  const newId = "turn-" + Date.now();
                  activeTurnIdRef.current = newId;
                  return [
                    ...prev,
                    {
                      id: newId,
                      timestamp: now,
                      speaker: "user",
                      sourceLang,
                      targetLang,
                      sourceText: "Spoken input...",
                      translatedText: msg.text,
                    },
                  ];
                }
              });
            } else if (msg.type === "interrupted") {
              if (playerRef.current) {
                playerRef.current.stopAll();
              }
            } else if (msg.type === "error") {
              setStatus("error");
              setStatusMessage("Error: " + (msg.message || "Translation stream error"));
            }
          } catch (e) {
            console.error("Error parsing WS message:", e);
          }
        };

        const handleWsFailure = () => {
          if (!wsConnected) {
            console.warn("WebSocket connection failed/closed. Switching to Serverless REST Voice Mode.");
            setIsServerlessMode(true);
            setShowDeploymentNotice(true);
            setStatus("listening");
            setStatusMessage("🎙️ Serverless REST Voice Mode active. Speak into mic!");
          }
        };

        ws.onerror = (err) => {
          console.error("WebSocket error:", err);
          handleWsFailure();
        };

        ws.onclose = () => {
          if (status !== "stopped") {
            handleWsFailure();
          }
        };

        // Start PCM Stream Recorder
        let pcmAccumulator: string[] = [];
        let chunkTimer: any = null;

        const recorder = new PCMStreamRecorder((base64PCM, vol) => {
          setInputVolume(vol);

          if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                type: "audio_chunk",
                data: base64PCM,
              })
            );
          } else {
            // REST Fallback accumulation: collect audio chunks every 2.5 seconds
            pcmAccumulator.push(base64PCM);
            if (!chunkTimer) {
              chunkTimer = setTimeout(() => {
                if (pcmAccumulator.length > 0) {
                  const combinedPCM = mergeBase64PCMChunks(pcmAccumulator);
                  pcmAccumulator = [];
                  if (combinedPCM) {
                    sendRestAudioChunk(combinedPCM);
                  }
                }
                chunkTimer = null;
              }, 2500);
            }
          }
        });

        recorderRef.current = recorder;
        await recorder.start(customMediaStream);
      } catch (err: any) {
        console.error("Failed to start translation session:", err);
        setIsServerlessMode(true);
        setShowDeploymentNotice(true);
        setStatus("listening");
        setStatusMessage("🎙️ Serverless REST Voice Mode active. Speak into mic!");
      }
    },
    [sourceLang, targetLang, customWsUrl, getAudioPlayer, stopTranslationSession, sendRestAudioChunk, status]
  );

  // Handle configuration changes during live translation
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "config",
          sourceLang,
          targetLang,
        })
      );
      // Reset active turn reference for new language pair
      activeTurnIdRef.current = null;
    }
  }, [sourceLang, targetLang]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopTranslationSession();
      if (playerRef.current) {
        playerRef.current.close();
      }
    };
  }, [stopTranslationSession]);

  // Manual Text Phrase Translation Fallback (REST API)
  const handleSendTextPhrase = async (text: string) => {
    try {
      setStatusMessage("Translating text phrase...");
      const res = await fetch("/api/translate/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          sourceLang,
          targetLang,
        }),
      });

      const data = await res.json();
      if (res.ok && data.translatedText) {
        const turnId = "turn-phrase-" + Date.now();
        const newTurn: TranslationTurn = {
          id: turnId,
          timestamp: new Date().toLocaleTimeString(),
          speaker: "user",
          sourceLang: (data.detectedSourceLang as LanguageCode) || sourceLang,
          targetLang,
          sourceText: text,
          translatedText: data.translatedText,
        };

        setTurns((prev) => [newTurn, ...prev]);
        setStatusMessage("Phrase translated successfully.");

        // Automatically synthesize audio for translated phrase
        handleSynthesizeTTS(data.translatedText, targetLang);
      } else {
        setStatusMessage("Text translation failed: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error("Text phrase error:", err);
      setStatusMessage("Failed to reach translation server.");
    }
  };

  // Synthesize Text-to-Speech Voice (REST API)
  const handleSynthesizeTTS = async (text: string, lang: LanguageCode) => {
    try {
      const res = await fetch("/api/translate/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          language: lang,
        }),
      });

      const data = await res.json();
      if (res.ok && data.audio) {
        const player = getAudioPlayer();
        player.playChunk(data.audio);
      }
    } catch (err) {
      console.error("TTS synthesis error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased flex flex-col">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        status={status}
        statusMessage={statusMessage}
      />

      {/* Vercel Serverless / WebSocket Fallback Banner */}
      {(showDeploymentNotice || isServerlessMode) && (
        <div className="bg-amber-500/10 border-b border-amber-300/60 px-4 py-3 text-xs text-amber-900">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-start space-x-2">
              <span className="text-base shrink-0">⚡</span>
              <div>
                <p className="font-bold">
                  Vercel Serverless Mode Active (WebSocket Closed)
                </p>
                <p className="text-[11px] text-amber-800/90 leading-relaxed">
                  Vercel hosting does not support persistent WebSockets. The app has automatically switched to <strong>Serverless REST Voice Translation Mode</strong> (works 100% on Vercel!). Alternatively, enter a custom WebSocket backend URL below if hosted on Render/Cloud Run.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto shrink-0">
              <input
                type="text"
                placeholder="wss://your-render-app.onrender.com/ws/translate"
                value={customWsUrl}
                onChange={(e) => handleSaveCustomWsUrl(e.target.value)}
                className="bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-xs w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
              <button
                onClick={() => setShowDeploymentNotice(false)}
                className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded-lg text-xs transition-all shrink-0"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab Content View */}
      <main className="flex-1">
        {activeTab === "studio" && (
          <TranslationStudio
            sourceLang={sourceLang}
            setSourceLang={setSourceLang}
            targetLang={targetLang}
            setTargetLang={setTargetLang}
            status={status}
            statusMessage={statusMessage}
            onStartTranslation={() => startTranslationSession()}
            onStopTranslation={stopTranslationSession}
            turns={turns}
            onClearTurns={() => setTurns([])}
            inputVolume={inputVolume}
            outputVolume={outputVolume}
            onSynthesizeTTS={handleSynthesizeTTS}
            onSendTextPhrase={handleSendTextPhrase}
          />
        )}

        {activeTab === "subtitles" && (
          <SubtitleOverlay
            status={status}
            statusMessage={statusMessage}
            onStartTranslation={() => startTranslationSession()}
            onStopTranslation={stopTranslationSession}
            turns={turns}
            targetLang={targetLang}
            setTargetLang={setTargetLang}
          />
        )}

        {activeTab === "system_audio" && (
          <SystemAudioGuide
            status={status}
            onStartTabAudioCapture={(stream) => startTranslationSession(stream)}
            onStopTabAudioCapture={stopTranslationSession}
          />
        )}

        {activeTab === "virtual_device" && <VirtualDeviceSetup />}

        {activeTab === "architecture" && <ArchitectureView />}
      </main>

      {/* Persistent Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Bilingual Voice Live — English ↔ Hindi Real-time AI Voice Translator
          </span>
          <span className="font-mono text-slate-400">
            Powered by Google Gemini 3.5 Live API & Express WebSockets
          </span>
        </div>
      </footer>
    </div>
  );
}
