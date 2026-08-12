# Deployed on Render (Full Live WebSocket Voice Translation)

Render is ideal for this application because **Render supports persistent Node.js background services and real-time WebSockets (`wss://`)** out of the box.

---

## 🚀 Easy Step-by-Step Render Deployment Guide

### Option A: Automatic 1-Click Blueprint (Recommended)

1. Push or Sync this repository to your **GitHub account**.
2. Go to **[dashboard.render.com](https://dashboard.render.com)** and log in.
3. Click **New +** → Select **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect `render.yaml`.
6. When prompted for `GEMINI_API_KEY`, paste your Gemini API key from AI Studio / Google AI Studio.
7. Click **Apply**. Render will build and deploy your app with full real-time WebSocket support!

---

### Option B: Manual Web Service Setup

If you prefer setting up manually on Render:

1. Go to **[dashboard.render.com](https://dashboard.render.com)** → Click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Name**: `voxflow-live-translator`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Under **Environment Variables**:
   - Add Key: `GEMINI_API_KEY`
   - Value: `your_gemini_api_key`
5. Click **Create Web Service**.

Once deployed, open your Render URL (e.g. `https://voxflow-live-translator.onrender.com`) — full bi-directional real-time speech translation over WebSockets will work seamlessly!
