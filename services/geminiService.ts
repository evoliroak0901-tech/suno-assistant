import { GoogleGenerativeAI } from "@google/generative-ai";

const getAiModel = () => {
  // @ts-ignore
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // 'gemini-1.5-flash' ではなく、末尾に '-latest' をつけるのが現在の最も安定した指定方法です
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
};

export const convertToHiragana = async (text: string): Promise<string> => {
  if (!text) return "テキストを入力してください";
  try {
    const model = getAiModel();
    // プロンプトをより簡潔にし、AIが迷わないようにします
    const result = await model.generateContent(`Convert the following Japanese lyrics to Hiragana ONLY. Keep all [Verse], [Chorus] tags and line breaks. No explanation.\n\n${text}`);
    const response = await result.response;
    return response.text().trim();
  } catch (error: any) {
    console.error("Gemini Error:", error);
    // 404が出る場合はモデル名の不一致、403はAPIキーの問題です
    return `エラーが発生しました: ${error.message}`;
  }
};

export const generateLyrics = async (keywords: string): Promise<string | null> => {
  try {
    const model = getAiModel();
    const result = await model.generateContent(`${keywords}をテーマに、Suno AI用の日本語の歌詞を作ってください。[Verse], [Chorus]を含めてください。`);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error(error);
    return "歌詞生成エラー";
  }
};

export const analyzeArtistStyle = async (artistName: string): Promise<any> => {
  try {
    const model = getAiModel();
    const result = await model.generateContent(`${artistName}の音楽性を分析してJSONで返してください。 {"genres": [], "instruments": [], "vocalX": 0, "vocalY": 0}`);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    return { genres: ["分析エラー"], instruments: [], vocalX: 0, vocalY: 0 };
  }
};

// ビルドエラー防止
export const generateSunoPrompt = async () => "";
export const createChatSession = () => null;
export const playVoiceSample = async () => {};
export const generateVisualPrompts = async () => null;
export const generateImage = async () => null;
export const analyzeVocalAudio = async () => null;
export const generateVideoPromptForSection = async () => null;
