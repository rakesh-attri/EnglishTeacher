export type LanguageCode = "en" | "hi" | "auto";

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  flag: string;
  nativeName: string;
}

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "listening"
  | "speaking"
  | "stopped"
  | "error";

export interface TranslationTurn {
  id: string;
  timestamp: string;
  speaker: "user" | "partner" | "system";
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  sourceText: string;
  translatedText: string;
  audioGenerated?: boolean;
  audioBase64?: string;
  latencyMs?: number;
}

export type ActiveTab =
  | "studio"
  | "subtitles"
  | "system_audio"
  | "virtual_device"
  | "architecture";

export interface AudioStats {
  inputLevel: number;
  outputLevel: number;
  sampleRate: number;
  packetsSent: number;
  packetsReceived: number;
  estimatedLatencyMs: number;
}
