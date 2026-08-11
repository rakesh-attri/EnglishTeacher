# 🎙️ VoxFlow Live — Bilingual AI Meeting Voice Translator (English ↔ Hindi)

**VoxFlow Live** is a low-latency, real-time AI voice translation pipeline built for live meetings on **Microsoft Teams, Google Meet, and Zoom**. It streams live speech over WebSockets, performs bidirectional translation between **English and Hindi** using Google Gemini Multimodal Live API, and outputs synchronized live subtitles with synthetic voice playback in **sub-second perceived latency (~450ms)**.

---

## 🌟 Key Features

- **⚡ Sub-Second Streaming Pipeline**: Web Audio API raw PCM (`16kHz` input / `24kHz` output) over WebSockets for continuous streaming without audio clipping.
- **🌐 Zero-Install Browser Audio Capture**: Capture Google Meet, Zoom Web Client, or Teams Web call audio directly using `getDisplayMedia` tab audio sharing.
- **🎛️ Virtual Microphone Audio Loopback**: Inject translated Hindi/English speech back into Zoom or Teams desktop meetings so all participants hear the translation.
- **💬 Dual-Layer Meeting Subtitles**: Translucent, floating meeting subtitle widget with customizable font sizes, themes, and translucent opacity sliders.
- **🔒 Enterprise Security**: API keys are securely stored server-side in Node.js/Express environment variables and never exposed to client bundles.

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Gemini API Key**: Get a free API key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/rakesh-attri/EnglishTeacher.git
cd EnglishTeacher
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root directory (refer to `.env.example`):
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser (Google Chrome or Microsoft Edge recommended for full Web Audio API support).

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 💻 How to Use in Systems & Live Meetings (Windows & macOS)

### Method A: Zero-Install Browser Tab Audio Share (Recommended)
Works on **Windows, macOS, Linux, and ChromeOS** without installing any audio drivers.

1. Open **Google Meet**, **Zoom Web Client**, or **Microsoft Teams Web** in a Google Chrome tab.
2. In **VoxFlow Live**, go to the **Tab / Meeting Capture** tab.
3. Click **Capture Meeting Tab Audio**.
4. In the browser share dialog:
   - Select the meeting browser tab.
   - **CRITICAL**: Ensure the **"Share tab audio"** checkbox at the bottom is checked.
5. Live captions and translated voice will immediately stream as participants speak!

---

### Method B: Virtual Microphone Loopback for Zoom & Teams Desktop Apps
Route translated audio directly into Zoom/Teams so **all meeting participants hear the translated voice**.

#### 🪟 Windows Setup (VB-Audio Virtual Cable)
1. **Download Driver**: Download and install free **VB-CABLE Virtual Audio Device** from `vb-audio.com`. Run installer as Administrator and restart your PC.
2. **Set Browser Output**: In Windows **Sound Settings → App volume and device preferences**, set the browser running VoxFlow Live's output device to **CABLE Input (VB-Audio Virtual Cable)**.
3. **Set Meeting Microphone**: In Zoom or Teams Audio Preferences, select **CABLE Output (VB-Audio Virtual Cable)** as your Microphone input.

#### 🍎 macOS Setup (BlackHole 2ch)
1. **Install BlackHole**: Run the following command in Terminal via Homebrew:
   ```bash
   brew install blackhole-2ch
   ```
2. **Create Multi-Output Device**:
   - Open **Audio MIDI Setup** on macOS.
   - Click **+** → **Create Multi-Output Device**.
   - Check both your **Headphones** and **BlackHole 2ch** (this lets you hear local audio while routing signal simultaneously).
3. **Set Meeting Microphone**: In Zoom / Teams preferences, set your Microphone to **BlackHole 2ch**.

---

## 🤖 LLMs & Model Support Guide

### Currently Used Model
VoxFlow Live uses Google's **Gemini Multimodal Live API**:
- **Primary**: `gemini-3.5-live-translate-preview`
- **Fallback**: `gemini-3.1-flash-live-preview`

### 🎁 Are Free Models Available?
**Yes!** Google Gemini offers a generous **Free Tier** via Google AI Studio:
- **Free Quota**: 15 Requests Per Minute (RPM), 1,000,000 Tokens Per Minute (TPM), and 1,500 Requests Per Day for free.
- Simply generate a free API key at [aistudio.google.com](https://aistudio.google.com/) and place it in your `.env` file as `GEMINI_API_KEY`.

---

### 🔄 Can We Use Other LLMs & Models?

**Yes, absolutely!** You can connect other AI providers depending on your architecture requirements:

#### 1. Multimodal Real-Time Streaming Models (Single WebSocket Connection)
These models handle Speech-to-Speech directly over WebSockets with minimal latency:

| Provider | Model Name | Latency | Free Tier Available? |
| :--- | :--- | :--- | :--- |
| **Google Gemini (Current)** | `gemini-3.5-live-translate-preview` | ~200ms | **Yes** (100% Free via AI Studio) |
| **OpenAI** | `gpt-4o-realtime-preview` | ~300ms | No (Paid Usage Based) |

#### 2. Cascaded Architecture (Whisper STT → LLM Translation → TTS Voice)
If you prefer using text-focused LLMs or local models, you can decouple the pipeline in `server.ts`:
1. **Speech-to-Text (STT)**: Transcribe input audio chunks.
2. **Text Translation LLM**: Translate text from English to Hindi.
3. **Text-to-Speech (TTS)**: Synthesize translated text back into PCM audio.

##### Recommended Free & Local Alternatives:

- **Groq API (100% Free & Ultra-Fast)**:
  - **STT**: `whisper-large-v3` (Free on Groq)
  - **LLM**: `llama-3.3-70b-versatile` or `mixtral-8x7b-32768`
  - **Speed**: Extreme token generation speed (>300 tokens/sec).

- **Ollama (100% Free & Fully Offline / Local)**:
  - Run completely private local models on your own GPU/CPU without internet.
  - **LLM**: `ollama run llama3.2` or `ollama run qwen2.5`
  - **STT**: Local `whisper.cpp`

- **DeepSeek API (High Performance, Very Cheap)**:
  - **LLM**: `deepseek-chat` (DeepSeek-V3) for translation paired with Whisper for audio input.

---

### 🛠️ How to Swap or Add a Custom LLM Provider in Code

To add or swap model providers, edit `server.ts`:

```typescript
// Example: Swapping or augmenting with custom text translation LLM
import { GoogleGenAI } from '@google/genai';

// 1. Initialize Gemini or custom client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 2. Modify the WebSocket message handler in server.ts
async function translateWithCustomLLM(text: string, targetLang: string) {
  // Call Groq, DeepSeek, OpenAI, or Ollama endpoint here
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: `You are a real-time interpreter. Translate from English/Hindi to ${targetLang}.` },
        { role: "user", content: text }
      ]
    })
  });
  return response.json();
}
```

---

## 🛠️ Project Structure

```
├── server.ts                  # Express + WebSocket backend gateway for Gemini Live
├── src/
│   ├── App.tsx                # Main React app container & state manager
│   ├── components/
│   │   ├── Header.tsx         # Navigation header & connection badges
│   │   ├── TranslationStudio.tsx # Main live voice translation workspace
│   │   ├── SubtitleOverlay.tsx# Floating meeting subtitle widget
│   │   ├── SystemAudioGuide.tsx# Browser tab & meeting audio capture guide
│   │   ├── VirtualDeviceSetup.tsx # Windows & macOS virtual cable routing setup
│   │   ├── ArchitectureView.tsx # Flow diagram & monthly cost calculator
│   │   └── AudioVisualizer.tsx# Canvas dual-tone PCM audio wave renderer
│   ├── utils/
│   │   └── pcmAudio.ts        # 16kHz audio capture & 24kHz gapless PCM player
│   └── types.ts               # Shared TypeScript interfaces
├── .env.example               # Environment variable templates
└── package.json               # Dependencies and build scripts
```

---

## 📄 License

Licensed under the [Apache License 2.0](LICENSE).
