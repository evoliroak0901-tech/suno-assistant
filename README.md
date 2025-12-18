<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Suno Lyric Assist

AI-powered lyric assistant for Suno AI, featuring Japanese lyric generation, hiragana conversion, artist style analysis, vocal preset management, and more.

## Features

- 🎵 **Lyric Generation**: Generate Japanese lyrics based on keywords or themes
- 🔤 **Hiragana Conversion**: Convert Japanese lyrics to hiragana for pronunciation
- 🎤 **Vocal Styling**: XY pad for vocal gender and pitch control
- 🎨 **Artist Analysis**: Analyze artist styles and apply to your prompts
- 🎧 **Audio Analysis**: Upload vocal samples for automatic style detection
- 🖼️ **Visual Prompts**: Generate image prompts from lyrics
- 🎬 **Video Prompts**: Create Sora 2 video prompts for song sections
- 💬 **AI Chat**: Get advice on lyrics, rhymes, and song structure
- 🔊 **Voice Preview**: Preview vocal styles with TTS
- 💾 **Preset Management**: Save and load vocal presets

## BYOK (Bring Your Own Key)

This application uses a **Bring Your Own Key** model. You need to provide your own Google Gemini API key to use the AI features.

1. Get your API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Click the settings icon in the app
3. Enter your API key
4. Your key is stored locally in your browser (localStorage) and never sent to any server

## Run Locally

**Prerequisites:** Node.js 18 or higher

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd suno-lyric-assist
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

5. Enter your Gemini API key when prompted

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

### Manual Deployment

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Vercel will auto-detect Vite settings
5. Click "Deploy"

No environment variables are required for deployment since the app uses BYOK.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **AI SDK**: @google/genai
- **Styling**: Vanilla CSS
- **Deployment**: Vercel

## Usage Limits

The app includes a daily usage counter for voice generation (10 uses per day, resets at 17:00 JST) to help manage API costs.

## License

MIT

