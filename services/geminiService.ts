import { GoogleGenerativeAI } from "@google/generative-ai";

const getAiModel = () => {
  // @ts-ignore
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

export const convertToHiragana = async (text: string): Promise<string> => {
  if (!text) return "テキストを入力してください";
  try {
    const model = getAiModel();
    const result = await model.generateContent(`以下の歌詞を全て「ひらがな」に変換してください。改行やタグは維持してください。\n\n${text}`);
    const response = await result.response;
    return response.text().trim();
  } catch (error: any) {
    return `エラー: ${error.message}`;
  }
};

export const generateLyrics = async (keywords: string): Promise<string | null> => {
  try {
    const model = getAiModel();
    const result = await model.generateContent(`「${keywords}」をテーマに、Suno AIで使える日本語の歌詞を生成してください。[Verse], [Chorus]などのタグを含めてください。`);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error(error);
    return "歌詞の生成に失敗しました";
  }
};

export const analyzeArtistStyle = async (artistName: string): Promise<any> => {
  try {
    const model = getAiModel();
    const prompt = `アーティスト「${artistName}」の音楽スタイルを分析し、以下のJSON形式でのみ返してください。余計な解説は不要です。
    {"genres": ["ジャンル1", "ジャンル2"], "instruments": ["楽器1", "楽器2"], "vocalX": 0, "vocalY": 0}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    return { genres: ["分析失敗"], instruments: [], vocalX: 0, vocalY: 0 };
  }
};

// 他の関数もビルドエラー防止のために残す
export const generateSunoPrompt = async () => "";
export const createChatSession = () => null;
export const playVoiceSample = async () => {};
export const generateVisualPrompts = async () => null;
export const generateImage = async () => null;
export const analyzeVocalAudio = async () => null;
export const generateVideoPromptForSection = async () => null;
