import { GoogleGenerativeAI } from "@google/generative-ai";
import { PromptParams, ArtistAnalysisResult, VisualPromptResult, AudioAnalysisResult } from "../types";
import { GENRES, VOCAL_TEXTURES, EMPHASIS_INSTRUMENTS } from "../constants";

const getAiClient = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('suno_assist_api_key');
    const genAI = new GoogleGenerativeAI(apiKey || "");
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

export const convertToHiragana = async (text: string): Promise<string> => {
    if (!text.trim()) return "";
    try {
        const model = getAiClient();
        const prompt = `以下の歌詞を、元の改行構造を維持したまま、すべて「ひらがな」に変換してください。英語や[Verse]などのタグはそのまま残してください。\n\n歌詞:\n${text}`;
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error(error);
        return "変換エラー";
    }
};

export const analyzeArtistStyle = async (artistName: string): Promise<ArtistAnalysisResult | null> => {
    try {
        const model = getAiClient();
        const prompt = `アーティスト「${artistName}」のスタイルを分析し、以下のJSON形式で回答してください。
        vocalX: -100(男声)〜100(女声)
        vocalY: -100(低音)〜100(高音)
        genres: [${GENRES.join(",")}] から最大3つ
        textures: [${VOCAL_TEXTURES.join(",")}] から最大2つ
        instruments: [${EMPHASIS_INSTRUMENTS.join(",")}] から最大2つ`;
        
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json|```/g, "").trim();
        return JSON.parse(text);
    } catch (error) {
        return null;
    }
};

export const generateSunoPrompt = async (params: PromptParams): Promise<string> => {
    try {
        const model = getAiClient();
        const prompt = `Suno AI用のスタイルプロンプトを作成してください。タグのみをカンマ区切りで出力してください。設定: ${JSON.stringify(params)}`;
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        return "error";
    }
};

export const createChatSession = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('suno_assist_api_key');
    const genAI = new GoogleGenerativeAI(apiKey || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    return model.startChat({ history: [] });
};

// 他の未実装スタブ
export const generateLyrics = async () => null;
export const playVoiceSample = async () => {};
export const generateVisualPrompts = async () => null;
export const generateImage = async () => null;
export const analyzeVocalAudio = async () => null;
export const generateVideoPromptForSection = async () => null;
