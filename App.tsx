import React, { useState, useRef, useEffect } from 'react';
import { ChatSession as Chat } from "@google/generative-ai";
import { TabType, AppMode, ChatMessage, ThemeSettings, VisualPromptResult, PromptParams } from './types';
import { 
  convertToHiragana, 
  generateSunoPrompt, 
  createChatSession, 
  analyzeArtistStyle, 
  playVoiceSample, 
  generateVisualPrompts, 
  generateImage, 
  analyzeVocalAudio, 
  generateLyrics 
} from './services/geminiService';
import { THEMES } from './constants';

const App: React.FC = () => {
    const [mode, setMode] = useState<AppMode>('lyrics');
    const [originalText, setOriginalText] = useState('');
    const t = THEMES['orange'];

    return (
        <div className={`h-screen w-full ${t.bgApp} flex flex-col`}>
            <header className="p-4 bg-white shadow-sm flex gap-4">
                <button onClick={() => setMode('lyrics')} className="font-bold">歌詞</button>
                <button onClick={() => setMode('chat')} className="font-bold">相談</button>
            </header>
            <main className="flex-1 p-4">
                {mode === 'lyrics' ? (
                    <div className="flex flex-col gap-4">
                        <textarea 
                            className="w-full h-64 p-4 border rounded"
                            value={originalText}
                            onChange={(e) => setOriginalText(e.target.value)}
                            placeholder="歌詞を入力..."
                        />
                        <button 
                            onClick={async () => {
                                const result = await convertToHiragana(originalText);
                                setOriginalText(result);
                            }}
                            className="bg-orange-500 text-white p-2 rounded"
                        >
                            ひらがな変換を試す
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-20">相談モード（準備中）</div>
                )}
            </main>
        </div>
    );
};

export default App;
