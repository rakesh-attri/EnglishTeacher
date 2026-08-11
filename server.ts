import express from "express";
import http from "http";
import path from "path";
import { WebSocket, WebSocketServer } from "ws";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));
const PORT = 3000;

// Shared Gemini AI instance
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

const LANG_MAP: Record<string, { name: string; flag: string; voice: string }> = {
  en: { name: "English (US)", flag: "🇺🇸", voice: "Puck" },
  "en-GB": { name: "English (UK)", flag: "🇬🇧", voice: "Aoede" },
  hi: { name: "Hindi (हिंदी)", flag: "🇮🇳", voice: "Kore" },
  es: { name: "Spanish (Español)", flag: "🇪🇸", voice: "Fenrir" },
  de: { name: "German (Deutsch)", flag: "🇩🇪", voice: "Charon" },
};

// Config route
app.get("/api/config", (req, res) => {
  res.json({
    liveModel: "gemini-3.5-live-translate-preview",
    fallbackLiveModel: "gemini-3.1-flash-live-preview",
    textModel: "gemini-3.6-flash",
    ttsModel: "gemini-3.1-flash-tts-preview",
    supportedLanguages: Object.entries(LANG_MAP).map(([code, info]) => ({
      code,
      name: info.name,
      flag: info.flag,
    })),
  });
});

// Teams App Manifest Zip download route
app.get("/VoxFlowLive-TeamsApp.zip", (req, res) => {
  const zipPath = path.join(process.cwd(), "public", "VoxFlowLive-TeamsApp.zip");
  res.download(zipPath, "VoxFlowLive-TeamsApp.zip");
});
app.get("/api/download-teams-app", (req, res) => {
  const zipPath = path.join(process.cwd(), "public", "VoxFlowLive-TeamsApp.zip");
  res.download(zipPath, "VoxFlowLive-TeamsApp.zip");
});

// Text translation API (REST fallback for quick phrase translation)
app.post("/api/translate/text", async (req, res) => {
  try {
    const { text, sourceLang, targetLang, context } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const sourceLabel = LANG_MAP[sourceLang]?.name || "Auto-detected language";
    const targetLabel = LANG_MAP[targetLang]?.name || "English";

    const prompt = `Translate the following speech transcript from ${sourceLabel} to natural, conversational ${targetLabel}.
Maintain the speaker's context, tone, and intent. If technical terms like 'Salesforce', 'API', 'Zoom', 'process' are present, handle them naturally in colloquial language.

Input text: "${text}"

Return JSON matching:
{
  "translatedText": "the translated string",
  "detectedSourceLang": "${sourceLang || "auto"}",
  "phoneticPronunciation": "Phonetic or Romanized guide if relevant"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText);
    res.json(result);
  } catch (error: any) {
    console.error("Text translation error:", error);
    res.status(500).json({ error: error.message || "Translation failed" });
  }
});

// Text-to-Speech API using Gemini TTS
app.post("/api/translate/tts", async (req, res) => {
  try {
    const { text, voice, language } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const targetLangInfo = LANG_MAP[language] || LANG_MAP["en"];
    const selectedVoice = voice || targetLangInfo.voice;
    const prompt = `Speak cleanly in ${targetLangInfo.name}: ${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: "Failed to generate audio output" });
    }

    res.json({ audio: base64Audio, mimeType: "audio/pcm;rate=24000" });
  } catch (error: any) {
    console.error("TTS error:", error);
    res.status(500).json({ error: error.message || "TTS generation failed" });
  }
});

// Audio REST Translation API (Fallback for Vercel & serverless environments without persistent WebSockets)
app.post("/api/translate/audio", async (req, res) => {
  try {
    const { audio, mimeType, sourceLang, targetLang } = req.body;
    if (!audio) {
      return res.status(400).json({ error: "Audio data is required" });
    }

    const targetLangInfo = LANG_MAP[targetLang] || LANG_MAP["hi"];
    const targetLangName = targetLangInfo.name;

    const prompt = `You are a real-time speech interpreter. Listen to this input audio clip carefully. Translate what was spoken directly into ${targetLangName}. 
Return JSON matching strictly:
{
  "sourceText": "transcription of what was spoken",
  "translatedText": "the translated speech in ${targetLangName}"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          inlineData: {
            data: audio,
            mimeType: mimeType || "audio/pcm;rate=16000",
          },
        },
        { text: prompt },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text || "{}";
    let result = { sourceText: "", translatedText: "" };
    try {
      result = JSON.parse(jsonText);
    } catch {
      result.translatedText = response.text || "";
    }

    // Synthesize TTS audio for output
    let base64TTS = null;
    if (result.translatedText) {
      try {
        const ttsPrompt = `Speak cleanly in ${targetLangName}: ${result.translatedText}`;
        const ttsResponse = await ai.models.generateContent({
          model: "gemini-3.1-flash-tts-preview",
          contents: [{ parts: [{ text: ttsPrompt }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: targetLangInfo.voice },
              },
            },
          },
        });
        base64TTS = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
      } catch (e) {
        console.warn("TTS fallback generation warning:", e);
      }
    }

    res.json({
      sourceText: result.sourceText || "Spoken audio input",
      translatedText: result.translatedText,
      audio: base64TTS,
    });
  } catch (error: any) {
    console.error("Audio REST translation error:", error);
    res.status(500).json({ error: error.message || "Audio translation failed" });
  }
});

// Create HTTP server
const server = http.createServer(app);

// WebSocket Server for low-latency live audio translation pipeline
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  const pathname = request.url;
  if (pathname === "/ws/translate") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on("connection", (clientWs: WebSocket) => {
  console.log("Client connected to /ws/translate");

  let liveSession: any = null;
  let targetLang = "hi"; // default target
  let sourceLang = "auto";
  let isConnectedToGemini = false;

  const initGeminiLiveSession = async (configOptions: { sourceLang?: string; targetLang?: string }) => {
    targetLang = configOptions.targetLang || targetLang;
    sourceLang = configOptions.sourceLang || sourceLang;

    const targetLangInfo = LANG_MAP[targetLang] || LANG_MAP["hi"];
    const targetLangName = targetLangInfo.name;
    const voiceName = targetLangInfo.voice;

    const systemInstruction = `You are a real-time speech-to-speech interpreter for live video calls and meetings between multilingual participants.
Your primary task:
- Listen to input audio in any spoken language (e.g. English, Hindi, Spanish, German).
- Detect the spoken language.
- Immediately translate the speaker's intent into ${targetLangName}.
- Speak the translation out loud clearly in natural, fluent ${targetLangName}.
- Keep latency as low as possible. Speak concisely without adding conversational commentary like "Here is the translation:".
- Preserve technical terms like 'Salesforce', 'Teams', 'Zoom', 'database', 'process' smoothly.`;

    try {
      clientWs.send(
        JSON.stringify({
          type: "status",
          status: "connecting_gemini",
          message: `Connecting to Gemini Live API for ${targetLangName} translation...`,
        })
      );

      // Attempt primary Live Translation model
      liveSession = await ai.live.connect({
        model: "gemini-3.5-live-translate-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          translationConfig: {
            targetLanguageCode: targetLang,
            echoTargetLanguage: false,
          },
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction,
        },
        callbacks: {
          onmessage: (message: any) => {
            try {
              // Extract Audio Output from model turn
              const parts = message.serverContent?.modelTurn?.parts || [];
              for (const part of parts) {
                if (part.inlineData?.data) {
                  clientWs.send(
                    JSON.stringify({
                      type: "audio",
                      data: part.inlineData.data,
                      mimeType: part.inlineData.mimeType || "audio/pcm;rate=24000",
                    })
                  );
                }
              }

              // Handle Input Transcription (Source speaker text)
              if (message.serverContent?.turnComplete === false) {
                // Streaming
              }

              const inputTranscription = message.serverContent?.modelTurn?.parts?.find(
                (p: any) => p.text
              )?.text;

              if (message.serverContent?.interrupted) {
                clientWs.send(JSON.stringify({ type: "interrupted" }));
              }

              // Audio transcription notifications if available
              if (message.outputTranscription?.text) {
                clientWs.send(
                  JSON.stringify({
                    type: "translation_text",
                    text: message.outputTranscription.text,
                    targetLang,
                  })
                );
              }

              if (message.inputTranscription?.text) {
                clientWs.send(
                  JSON.stringify({
                    type: "source_text",
                    text: message.inputTranscription.text,
                    sourceLang,
                  })
                );
              }
            } catch (err) {
              console.error("Error parsing Gemini live message:", err);
            }
          },
          onerror: (err: any) => {
            console.error("Gemini Live Session Error:", err);
            clientWs.send(
              JSON.stringify({
                type: "error",
                message: err?.message || "Gemini Live stream error",
              })
            );
          },
          onclose: () => {
            console.log("Gemini Live Session closed");
            isConnectedToGemini = false;
            clientWs.send(
              JSON.stringify({
                type: "status",
                status: "disconnected_gemini",
                message: "Gemini session ended",
              })
            );
          },
        },
      });

      isConnectedToGemini = true;
      clientWs.send(
        JSON.stringify({
          type: "status",
          status: "connected",
          message: "Real-time AI voice translator connected and ready",
          targetLang,
          sourceLang,
        })
      );
    } catch (primaryErr: any) {
      console.warn("Primary live-translate model unavailable, falling back to gemini-3.1-flash-live-preview:", primaryErr?.message);
      
      try {
        // Fallback to standard live preview model
        liveSession = await ai.live.connect({
          model: "gemini-3.1-flash-live-preview",
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName } },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction,
          },
          callbacks: {
            onmessage: (message: any) => {
              const parts = message.serverContent?.modelTurn?.parts || [];
              for (const part of parts) {
                if (part.inlineData?.data) {
                  clientWs.send(
                    JSON.stringify({
                      type: "audio",
                      data: part.inlineData.data,
                    })
                  );
                }
              }
              if (message.serverContent?.interrupted) {
                clientWs.send(JSON.stringify({ type: "interrupted" }));
              }
            },
            onerror: (err: any) => {
              console.error("Fallback Live Error:", err);
              clientWs.send(JSON.stringify({ type: "error", message: err?.message || "Live API error" }));
            },
            onclose: () => {
              isConnectedToGemini = false;
            },
          },
        });
        isConnectedToGemini = true;
        clientWs.send(
          JSON.stringify({
            type: "status",
            status: "connected",
            message: "Connected via Gemini Live Preview stream",
            targetLang,
            sourceLang,
          })
        );
      } catch (fallbackErr: any) {
        console.error("Fallback Gemini Live connection failed:", fallbackErr);
        clientWs.send(
          JSON.stringify({
            type: "error",
            message: "Failed to establish Live session: " + (fallbackErr?.message || primaryErr?.message),
          })
        );
      }
    }
  };

  clientWs.on("message", async (rawMessage: Buffer) => {
    try {
      const parsed = JSON.parse(rawMessage.toString());

      if (parsed.type === "start") {
        await initGeminiLiveSession({
          sourceLang: parsed.sourceLang || "auto",
          targetLang: parsed.targetLang || "hi",
        });
      } else if (parsed.type === "config") {
        if (parsed.targetLang || parsed.sourceLang) {
          if (liveSession && typeof liveSession.close === "function") {
            try {
              liveSession.close();
            } catch (e) {}
          }
          await initGeminiLiveSession({
            sourceLang: parsed.sourceLang || sourceLang,
            targetLang: parsed.targetLang || targetLang,
          });
        }
      } else if (parsed.type === "audio_chunk") {
        // Relay 16kHz PCM audio chunk to Gemini Live API
        if (liveSession && parsed.data) {
          try {
            liveSession.sendRealtimeInput({
              audio: {
                data: parsed.data,
                mimeType: "audio/pcm;rate=16000",
              },
            });
          } catch (sendErr) {
            console.error("Error sending audio chunk to Gemini:", sendErr);
          }
        }
      } else if (parsed.type === "stop") {
        if (liveSession && typeof liveSession.close === "function") {
          try {
            liveSession.close();
          } catch (e) {}
          liveSession = null;
        }
        clientWs.send(
          JSON.stringify({
            type: "status",
            status: "stopped",
            message: "Translation session stopped",
          })
        );
      }
    } catch (e) {
      console.error("Malformed WS message from client:", e);
    }
  });

  clientWs.on("close", () => {
    console.log("Client disconnected from /ws/translate");
    if (liveSession && typeof liveSession.close === "function") {
      try {
        liveSession.close();
      } catch (e) {}
    }
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.VERCEL !== "1") {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
  });
}

export default app;
