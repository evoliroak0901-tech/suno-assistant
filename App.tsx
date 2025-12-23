import React, { useState, useRef, useEffect } from 'react';
import { ChatSession as Chat } from "@google/generative-ai";
import { TabType, AppMode, ChatMessage, ThemeSettings, VisualPromptResult, VocalPreset, LyricSection, VideoPromptResult } from './types';
import { convertToHiragana, generateSunoPrompt, createChatSession, analyzeArtistStyle, playVoiceSample, generateVisualPrompts, generateImage, analyzeVocalAudio, generateVideoPromptForSection, generateLyrics } from './services/geminiService';
import { TagPanel } from './components/TagPanel';
import { Button } from './components/Button';
import { XYPad } from './components/XYPad';
import { ChatInterface } from './components/ChatInterface';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { GENRES, VOCAL_TEXTURES, EMPHASIS_INSTRUMENTS, THEMES } from './constants';

// Icons
const IconPaste = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>;
const IconCopy = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>;
const IconArrowUp = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>;
const IconArrowDown = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>;
const IconPencil = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
const IconSparkles = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z" /></svg>;
const IconMusic = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>;
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const IconChat = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const IconSettings = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2 2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
const IconVideo = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>;
const IconHelp = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;

const mergeStructureAndContent = (structureText: string, contentText: string) => {
  const structureLines = structureText.split('\n');
  const contentLines = contentText.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('['));

  let contentIndex = 0;
  const merged = structureLines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) return trimmed;
    if (!trimmed) return '';
    const content = contentLines[contentIndex];
    contentIndex++;
    return content || '';
  });
  return merged.join('\n');
};

export const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>('chat');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    lyrics: 'orange', prompt: 'blue', chat: 'emerald', creation: 'violet'
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const currentThemeColor = themeSettings[appMode];
  const t = THEMES[currentThemeColor];

  const [activeTab, setActiveTab] = useState<TabType>('original');
  const [originalText, setOriginalText] = useState('');
  const [hiraganaText, setHiraganaText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiLyricsOpen, setIsAiLyricsOpen] = useState(false);
  const [lyricKeywords, setLyricKeywords] = useState("");
  const [isLyricsGenerating, setIsLyricsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [vocalX, setVocalX] = useState(0);
  const [vocalY, setVocalY] = useState(0);
  const [artistInput, setArtistInput] = useState("");
  const [isArtistAnalyzed, setIsArtistAnalyzed] = useState(false);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [vocalPresets, setVocalPresets] = useState<VocalPreset[]>([]);
  const [presetName, setPresetName] = useState("");
  const [selectedTextures, setSelectedTextures] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isPromptLoading, setIsPromptLoading] = useState(false);

  const [visualResult, setVisualResult] = useState<VisualPromptResult | null>(null);
  const [videoPromptResult, setVideoPromptResult] = useState<VideoPromptResult | null>(null);
  const [isVisualLoading, setIsVisualLoading] = useState(false);
  const [isVideoPromptLoading, setIsVideoPromptLoading] = useState(false);
  const [lyricSections, setLyricSections] = useState<LyricSection[]>([]);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number>(-1);

  const chatSession = useRef<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('suno_vocal_presets');
    if (saved) setVocalPresets(JSON.parse(saved));
    // Vercel環境変数またはLocalStorageからキーを確認
    if (import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('suno_assist_api_key')) {
      setHasApiKey(true);
    }
  }, []);

  const handleGenerateLyrics = async () => {
    if (!lyricKeywords.trim()) return;
    setIsLyricsGenerating(true);
    const generated = await generateLyrics(lyricKeywords);
    if (generated) {
      const spacedGenerated = generated.replace(/\n/g, '\n\n');
      setOriginalText(prev => prev ? prev + "\n\n" + spacedGenerated : spacedGenerated);
      setIsAiLoading(true);
      const conv = await convertToHiragana(spacedGenerated);
      setHiraganaText(prev => prev ? prev + "\n\n" + conv : conv);
      setIsAiLoading(false);
      setIsAiLyricsOpen(false);
    }
    setIsLyricsGenerating(false);
  };

  const handleSendChatMessage = async (text: string) => {
    if (!chatSession.current) chatSession.current = createChatSession();
    if (!chatSession.current) return;
    const newMsg: ChatMessage = { role: 'user', text };
    setChatMessages(prev => [...prev, newMsg]);
    setIsChatLoading(true);
    try {
      const result = await chatSession.current.sendMessage(text);
      const response = await result.response;
      setChatMessages(prev => [...prev, { role: 'model', text: response.text() }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'model', text: "エラーが発生しました。" }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  if (!hasApiKey) return <ApiKeyModal onSave={(key) => { localStorage.setItem('suno_assist_api_key', key); setHasApiKey(true); }} />;

  return (
    <div className={`flex flex-col h-screen w-full ${t.bgApp}`}>
      {/* Header / Mode Switcher */}
      <div className={`flex ${t.bgPanel} p-2 gap-2 flex-none shadow-md`}>
        <Button active={appMode === 'chat'} onClick={() => setAppMode('chat')} icon={<IconChat />}>相談</Button>
        <Button active={appMode === 'lyrics'} onClick={() => setAppMode('lyrics')} icon={<span>📝</span>}>歌詞</Button>
        <Button active={appMode === 'prompt'} onClick={() => setAppMode('prompt')} icon={<span>🎵</span>}>設定</Button>
        <Button active={appMode === 'creation'} onClick={() => setAppMode('creation')} icon={<IconVideo />}>創作</Button>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        {appMode === 'chat' && (
          <ChatInterface 
            messages={chatMessages} 
            onSendMessage={handleSendChatMessage} 
            isLoading={isChatLoading} 
            theme={t}
          />
        )}

        {appMode === 'lyrics' && (
          <div className="h-full flex flex-col gap-4">
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('original')} className={`px-4 py-2 rounded ${activeTab === 'original' ? t.bgSoft + ' ' + t.textPrimary : 'bg-white'}`}>原本</button>
              <button onClick={() => setActiveTab('hiragana')} className={`px-4 py-2 rounded ${activeTab === 'hiragana' ? t.bgSoft + ' ' + t.textPrimary : 'bg-white'}`}>ひらがな</button>
              <button onClick={() => setIsAiLyricsOpen(true)} className="ml-auto bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2"><IconSparkles /> AI作詞</button>
            </div>
            <textarea 
              ref={textareaRef}
              className="flex-1 p-4 border rounded-xl shadow-inner text-lg leading-relaxed focus:ring-2 outline-none"
              value={activeTab === 'original' ? originalText : hiraganaText}
              onChange={(e) => activeTab === 'original' ? setOriginalText(e.target.value) : setHiraganaText(e.target.value)}
              placeholder="ここに歌詞を入力するか、AI作詞を試してください..."
            />
            {isAiLyricsOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white p-6 rounded-2xl w-full max-w-md">
                  <h3 className="font-bold mb-4">AIに作詞を依頼</h3>
                  <input className="w-full border p-2 mb-4" value={lyricKeywords} onChange={(e)=>setLyricKeywords(e.target.value)} placeholder="例：夏の終わりの海、切ない再会" />
                  <div className="flex gap-2">
                    <button onClick={handleGenerateLyrics} className="flex-1 bg-orange-500 text-white py-2 rounded">生成</button>
                    <button onClick={()=>setIsAiLyricsOpen(false)} className="flex-1 bg-gray-200 py-2 rounded">閉じる</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {appMode === 'prompt' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm overflow-y-auto h-full">
            <h2 className="text-xl font-bold mb-4">Suno AI プロンプト設定</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold mb-2">アーティスト風分析</label>
                <div className="flex gap-2 mb-4">
                  <input className="flex-1 border p-2 rounded" value={artistInput} onChange={(e)=>setArtistInput(e.target.value)} placeholder="アーティスト名を入力" />
                  <button onClick={handleArtistAnalysis} className={`${t.bgSoft} px-4 py-2 rounded`}>分析</button>
                </div>
                <XYPad x={vocalX} y={vocalY} onChange={(x,y)=>{setVocalX(x); setVocalY(y);}} />
              </div>
              <div>
                <button onClick={async ()=>{
                  setIsPromptLoading(true);
                  const p = await generateSunoPrompt({vocalX, vocalY, artist: artistInput, textures: selectedTextures, genres: selectedGenres, instruments: selectedInstruments});
                  setGeneratedPrompt(p);
                  setIsPromptLoading(false);
                }} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mb-4">プロンプトを生成</button>
                <textarea className="w-full h-32 border p-3 rounded bg-gray-50" value={generatedPrompt} readOnly />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
