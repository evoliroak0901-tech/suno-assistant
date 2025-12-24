import { GoogleGenerativeAI } from "@google/generative-ai";
import { PromptParams, ArtistAnalysisResult } from "../types";
import { GENRES, VOCAL_TEXTURES, EMPHASIS_INSTRUMENTS } from "../constants";

// 接続設定
const getAiClient = () => {
    // Viteの環境変数の型エラーを回避するための書き方
    // @ts-ignore
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('suno_assist_api_key');
    const genAI = new GoogleGenerativeAI(apiKey || "");
    // モデル名を現在確実に動く1.5-flashに固定
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

export const convertToHiragana = async (text: string): Promise<string> => {
    if (!text.trim()) return "";
    try {
        const model = getAiClient();
        const prompt = `以下の歌詞を、元の改行構造を維持したまま、すべて「ひらがな」に変換してください。英語や[Verse]などのタグはそのまま残してください。解説は不要です。\n\n歌詞:\n${text}`;
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error("Error:", error);
        return "変換エラー";
    }
};

export const generateLyrics = async (keywords: string): Promise<string | null> => {
    try {
        const model = getAiClient();
        const prompt = `プロの作詞家として、以下のキーワードに基づいて日本語の歌詞を書いてください。[Verse], [Chorus]などのタグを使ってください。\nキーワード: ${keywords}`;
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        return null;
    }
};

export const analyzeArtistStyle = async (artistName: string): Promise<ArtistAnalysisResult | null> => {
    try {
        const model = getAiClient();
        const prompt = `アーティスト「${artistName}」のスタイルを分析し、JSON形式で返してください。vocalX, vocalYは-100から100の数値。textures, genres, instrumentsは配列。`;
        const result = await model.generateContent(prompt);
        const jsonText = result.response.text().replace(/```json|```/g, "").trim();
        return JSON.parse(jsonText);
    } catch (error) {
        return null;
    }
};

export const generateSunoPrompt = async (params: PromptParams): Promise<string> => {
    try {
        const model = getAiClient();
        const prompt = `Suno AI用の英語プロンプト（タグ羅列）を作成してください。\n設定: ${JSON.stringify(params)}`;
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        return "エラーが発生しました";
    }
};

export const createChatSession = () => {
    // @ts-ignore
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('suno_assist_api_key');
    const genAI = new GoogleGenerativeAI(apiKey || "");
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
    });
    return model.startChat({ history: [] });
};

// --- 以下、App.tsxからの呼び出しでエラーを出さないための空の関数（スタブ） ---
export const playVoiceSample = async () => {};
export const generateVisualPrompts = async () => null;
export const generateImage = async () => null;
export const analyzeVocalAudio = async () => null;
export const generateVideoPromptForSection = async () => null;
