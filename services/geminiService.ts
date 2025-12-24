import { GoogleGenerativeAI } from "@google/generative-ai";

const getAiModel = () => {
  // @ts-ignore
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  const genAI = new GoogleGenerativeAI(apiKey);
  // 'models/' をつけず、シンプルに指定するのが現在のSDKの正解です
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

export const convertToHiragana = async (text: string): Promise<string> => {
  if (!text) return "テキストを入力してください";
  try {
    const model = getAiModel();
    // generateContent の引数をシンプルにします
    const result = await model.generateContent(`以下の日本語を全て「ひらがな」に変換してください。タグ[Verse][Chorus]と改行は維持してください。解説不要。\n\n${text}`);
    const response = await result.response;
    const output = response.text();
    return output.trim();
  } catch (error: any) {
    console.error("Gemini Error Detail:", error);
    return `エラーが発生しました: ${error.message}`;
  }
};

export const generateLyrics = async (keywords: string): Promise<string | null> => {
  try {
    const model = getAiModel();
    const result = await model.generateContent(`${keywords}をテーマに日本語の歌詞を作ってください。[Verse][Chorus]を含めて。`);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    return "歌詞生成に失敗しました";
  }
};

export const analyzeArtistStyle = async (artistName: string): Promise<any> => {
  try {
    const model = getAiModel();
    const result = await model.generateContent(`${artistName}の音楽スタイルを分析してJSONで返して。{"genres":[], "instruments":[], "vocalX":0, "vocalY":0}`);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    return { genres: ["分析エラー"], instruments: [], vocalX: 0, vocalY: 0 };
  }
};

// スタブ（ビルドエラー防止）
export const generateSunoPrompt = async () => "";
export const createChatSession = () => null;
export const playVoiceSample = async () => {};
export const generateVisualPrompts = async () => null;
export const generateImage = async () => null;
export const analyzeVocalAudio = async () => null;
export const generateVideoPromptForSection = async () => null;
