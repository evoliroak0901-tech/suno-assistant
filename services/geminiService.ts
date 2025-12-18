
import { GoogleGenAI, Chat, Type, Modality } from "@google/genai";
import { PromptParams, ArtistAnalysisResult, VisualPromptResult, AudioAnalysisResult, VideoPromptResult } from "../types";
import { GENRES, VOCAL_TEXTURES, EMPHASIS_INSTRUMENTS } from "../constants";

// Helper to get client with user's key
const getAiClient = () => {
    let apiKey = '';

    // 1. Try Local Storage (User's key)
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('suno_assist_api_key');
        if (stored) apiKey = stored;
    }

    // 2. Fallback to env (Dev/Hosted with specific key)
    const processEnv = (globalThis as any).process?.env;
    if (!apiKey && processEnv && processEnv.API_KEY) {
        apiKey = processEnv.API_KEY;
    }

    if (!apiKey) {
        throw new Error("API Key is missing");
    }

    return new GoogleGenAI({ apiKey });
};

export const convertToHiragana = async (text: string): Promise<string> => {
    if (!text.trim()) return "";

    try {
        const client = getAiClient();
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are a Japanese lyrics converter. 
      Task: Convert the following Japanese song lyrics strictly into Hiragana (reading). 
      Rules:
      1. Maintain the exact same line structure and line breaks.
      2. Keep any meta tags (like [Verse], [Chorus]) or English words exactly as they are.
      3. Only output the converted text, no explanations.
      4. If there are Kanji, convert to Hiragana.
      5. If there is already Hiragana or Katakana, ensure it flows naturally as Hiragana.
      
      Lyrics:
      ${text}`,
        });

        return response.text?.trim() || "";
    } catch (error) {
        console.error("Error converting to Hiragana:", error);
        return "変換エラー: APIキーを確認してください。";
    }
};

export const generateLyrics = async (keywords: string): Promise<string | null> => {
    try {
        const client = getAiClient();
        const systemInstruction = `
        You are a professional songwriter.
        Task: Write song lyrics based on the provided keywords or theme.
        
        Requirements:
        1. Language: Japanese.
        2. Structure: Use standard song structure with tags like [Verse], [Chorus], [Bridge].
        3. Creativity: Be creative, emotional, and rhythmic suitable for a song.
        4. Length: A standard song length (Verse 1, Chorus, Verse 2, Chorus, Outro) or whatever fits the keywords.
        
        Only output the lyrics with tags.
        `;

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Keywords/Theme: ${keywords}\n\nGenerate lyrics now.`,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        return response.text?.trim() || null;
    } catch (error) {
        console.error("Error generating lyrics:", error);
        return null;
    }
};

export const analyzeArtistStyle = async (artistName: string): Promise<ArtistAnalysisResult | null> => {
    try {
        const client = getAiClient();

        const systemInstruction = `
        You are a music analysis expert for Suno AI prompting.
        Analyze the artist provided by the user and map their style to the following parameters.
        
        Available Lists to choose from (pick the closest matches):
        - Genres: ${GENRES.join(", ")}
        - Textures: ${VOCAL_TEXTURES.join(", ")}
        - Instruments: ${EMPHASIS_INSTRUMENTS.join(", ")}

        Parameters to determine:
        1. vocalX: Number between -100 and 100.
           - -100 = Very Masculine/Deep Male
           - 0 = Neutral/Androgynous
           - 100 = Very Feminine/High Female
        2. vocalY: Number between -100 and 100.
           - -100 = Low Pitch/Deep
           - 100 = High Pitch/Soprano/Falsetto heavy
        3. genres: Array of strings (Select max 3 from the provided list, or close equivalents if not in list)
        4. textures: Array of strings (Select max 2 from provided list)
        5. instruments: Array of strings (Select max 2 from provided list)
        `;

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the artist: ${artistName}`,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        vocalX: { type: Type.NUMBER },
                        vocalY: { type: Type.NUMBER },
                        genres: { type: Type.ARRAY, items: { type: Type.STRING } },
                        textures: { type: Type.ARRAY, items: { type: Type.STRING } },
                        instruments: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                }
            }
        });

        const jsonText = response.text;
        if (!jsonText) return null;
        return JSON.parse(jsonText) as ArtistAnalysisResult;

    } catch (error) {
        console.error("Error analyzing artist:", error);
        return null;
    }
}

export const analyzeVocalAudio = async (base64Audio: string, mimeType: string): Promise<AudioAnalysisResult | null> => {
    try {
        const client = getAiClient();
        const systemInstruction = `
        You are an expert audio engineer. Listen to the provided vocal audio sample and analyze its characteristics.
        Map the analysis to the following parameters:

        1. vocalX: Number (-100 to 100).
           - -100: Very Masculine/Deep Male
           - 0: Neutral/Androgynous
           - 100: Very Feminine/High Female
        2. vocalY: Number (-100 to 100).
           - -100: Low Pitch/Deep/Bass
           - 100: High Pitch/Soprano/Falsetto
        3. textures: Select up to 2 descriptors from the list below that best match the voice:
           [${VOCAL_TEXTURES.join(", ")}]

        Return strictly JSON.
        `;

        // Strip data prefix if present (e.g. "data:audio/mp3;base64,")
        const cleanBase64 = base64Audio.split(',')[1] || base64Audio;

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: cleanBase64 } },
                    { text: "Analyze the vocals in this audio." }
                ]
            },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        vocalX: { type: Type.NUMBER },
                        vocalY: { type: Type.NUMBER },
                        textures: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                }
            }
        });

        const jsonText = response.text;
        if (!jsonText) return null;
        return JSON.parse(jsonText) as AudioAnalysisResult;
    } catch (error) {
        console.error("Error analyzing audio:", error);
        return null;
    }
};

export const generateSunoPrompt = async (params: PromptParams): Promise<string> => {
    try {
        const client = getAiClient();

        // Interpret XY Pad
        let vocalDesc = "";
        const x = params.vocalX;
        const y = params.vocalY;

        // Gender Logic
        if (x < -30) vocalDesc += "Male vocals";
        else if (x > 30) vocalDesc += "Female vocals";
        else vocalDesc += "Androgynous/Neutral vocals";

        // Pitch Logic
        if (y < -30) vocalDesc += ", Low pitch/Deep";
        else if (y > 30) vocalDesc += ", High pitch/Soprano";

        // Construct the prompt for Gemini
        const systemInstruction = `You are a Suno AI prompt generator expert.
    Task: Create a single string of comma-separated English style tags (Music Style) for Suno AI.
    
    CRITICAL CONSTRAINT: 
    The output string MUST be under 1000 characters in length. Suno AI has a strict character limit.
    If the description is too long, prioritize the most defining genres and moods, and omit less important details.

    IMPORTANT: Do NOT use the Artist Name in the output. Instead, analyze the artist's style (if provided) and convert it into descriptive genre/instrument/mood tags.

    Inputs:
    1. Vocal Characteristics: ${vocalDesc}
    2. Vocal Textures: ${params.textures.join(", ")}
    3. Target Genres: ${params.genres.join(", ")}
    4. Emphasized Instruments: ${params.instruments.join(", ")}
    5. Artist Style Reference: ${params.artist ? params.artist : "None"}

    Output format:
    [Genre], [Sub-genre], [Instruments], [Vocal Style], [Mood/Atmosphere], [Tempo]
    `;

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Generate the Suno prompt string now.",
            config: {
                systemInstruction: systemInstruction,
            }
        });

        let result = response.text?.trim() || "";

        // Enforce 1000 character limit (Suno limit)
        if (result.length > 1000) {
            result = result.substring(0, 1000);
        }

        return result;
    } catch (error) {
        console.error("Error generating prompt:", error);
        return "エラー: APIキーを確認してください。";
    }
};

export const generateVisualPrompts = async (lyrics: string): Promise<VisualPromptResult | null> => {
    try {
        const client = getAiClient();
        const systemInstruction = `
        You are a creative director. Analyze the provided lyrics and extract the core imagery, mood, and scenery.
        Output a JSON object with:
        1. sceneDescription: A very concise Japanese summary (max 30 chars). Use noun phrases (体言止め). Example: "夕暮れの海辺で佇む少女"
        2. imagePrompt: A detailed prompt for an image generator (English). Describe the subject, lighting, style (e.g., Anime style, Oil painting, Cyberpunk), and mood.
        `;

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Lyrics:\n${lyrics}`,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sceneDescription: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING },
                    }
                }
            }
        });

        const jsonText = response.text;
        if (!jsonText) return null;
        return JSON.parse(jsonText) as VisualPromptResult;

    } catch (error) {
        console.error("Error generating visual prompts:", error);
        return null;
    }
};

export const generateVideoPromptForSection = async (lyricsPart: string): Promise<VideoPromptResult | null> => {
    try {
        const client = getAiClient();
        const systemInstruction = `
        You are a video direction expert for Sora 2.
        Task: Create a video generation prompt for a specific section of a song (approx. 10 seconds).
        
        Input Lyrics:
        "${lyricsPart}"

        Requirements:
        1. Analyze the lyrics and mood of this specific section.
        2. Create a 'sceneDescription' (Japanese) max 30 chars.
        3. Create a 'soraPrompt' (English). 
           - Focus on visual movement, camera angle, lighting, and physics. 
           - Sora 2 prompts should be descriptive and narrative.
           - Keep it suitable for a 10-second clip.
           - High quality keywords: "Cinematic, 8k, highly detailed".

        Output JSON.
        `;

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate video prompt for this lyrics section.`,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        lyricsPart: { type: Type.STRING },
                        sceneDescription: { type: Type.STRING },
                        soraPrompt: { type: Type.STRING },
                    }
                }
            }
        });

        const jsonText = response.text;
        if (!jsonText) return null;
        return JSON.parse(jsonText) as VideoPromptResult;

    } catch (error) {
        console.error("Error generating video prompt:", error);
        return null;
    }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
    try {
        const client = getAiClient();
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash-image', // Nano Banana
            contents: { parts: [{ text: prompt }] },
            // instructions say DO NOT set responseMimeType for nano banana
        });

        // Iterate through parts to find the image
        if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData?.mimeType?.startsWith('image/')) {
                    // Return data URI
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
}

export const createChatSession = (): Chat | null => {
    try {
        const client = getAiClient();

        return client.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: "あなたはプロの音楽プロデューサー兼作詞家のアシスタントです。ユーザーの作詞、韻（ライム）、楽曲構成、Suno AIのプロンプト作成などについて、的確かつ励ますような口調でアドバイスをしてください。日本語で回答してください。",
            }
        });
    } catch (e) {
        console.error("Failed to create chat session:", e);
        return null;
    }
};

// --- Audio Helpers (WAV Converter) ---

// Convert Raw PCM (Int16) to WAV file format (with header)
function createWavFile(samples: Int16Array, sampleRate: number): Blob {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);

    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    // Write PCM samples
    const length = samples.length;
    let offset = 44;
    for (let i = 0; i < length; i++) {
        view.setInt16(offset, samples[i], true);
        offset += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

function decodeBase64ToInt16(base64: string): Int16Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return new Int16Array(bytes.buffer);
}

export const playVoiceSample = async (text: string, vocalX: number, vocalY: number): Promise<void> => {
    try {
        const client = getAiClient();

        // Determine voice based on X (Gender)
        let voiceName = 'Zephyr';
        if (vocalX < -20) {
            voiceName = 'Charon';
        } else if (vocalX > 20) {
            voiceName = 'Kore';
        } else {
            voiceName = 'Puck';
        }

        const response = await client.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: { parts: [{ text: text }] },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            console.error("No audio data received");
            return;
        }

        // Convert Raw PCM to WAV Blob
        const int16Samples = decodeBase64ToInt16(base64Audio);
        const wavBlob = createWavFile(int16Samples, 24000); // 24kHz is standard for Gemini TTS

        // Create URL and Play using standard Audio element
        const audioUrl = URL.createObjectURL(wavBlob);
        const audio = new Audio(audioUrl);

        await audio.play();

        // Cleanup after playback
        audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
        };

    } catch (error) {
        console.error("Error playing voice sample:", error);
    }
};
