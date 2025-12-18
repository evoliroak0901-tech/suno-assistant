
import React, { useState, useRef, useEffect } from 'react';
import { Chat } from "@google/genai";
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
const IconPaste = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
const IconCopy = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconArrowUp = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>;
const IconArrowDown = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>;
const IconPencil = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconSparkles = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>;
const IconMusic = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconChat = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IconSettings = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2 2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IconWand = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M10.6 6.6 12 8"/><path d="M4.8 13.6 6 12.2"/><path d="M2.5 2.5l3.5 3.5"/><path d="M19.5 4.5l-2.5 2.5"/><path d="M4.5 19.5l2.5-2.5"/></svg>;
const IconSpeaker = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>;
const IconVideo = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>;
const IconDownload = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IconHelp = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconUpload = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IconSave = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;

// Helper to merge Original Structure (Tags + Spacing) with Hiragana Content
const mergeStructureAndContent = (structureText: string, contentText: string) => {
    const structureLines = structureText.split('\n');
    // Extract pure content from contentText (remove tags and empty lines)
    const contentLines = contentText.split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('[')); // Filter out empty lines and tags from hiragana

    let contentIndex = 0;
    const merged = structureLines.map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            return trimmed; // Keep tag from structure (Original)
        }
        if (!trimmed) {
            return ''; // Keep spacing from structure (Original)
        }
        // It's a text line, replace with next available content line
        const content = contentLines[contentIndex];
        contentIndex++;
        // If we run out of content, fallback to structure line or empty
        return content || ''; 
    });
    return merged.join('\n');
};

export const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>('chat'); 
  const [hasApiKey, setHasApiKey] = useState(false); // Track API Key existence
  
  /* --- Theme Settings --- */
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
      lyrics: 'orange',
      prompt: 'blue',
      chat: 'emerald',
      creation: 'violet'
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  const currentThemeColor = themeSettings[appMode];
  const t = THEMES[currentThemeColor];

  /* --- Lyric Editor States --- */
  const [activeTab, setActiveTab] = useState<TabType>('original');
  const [originalText, setOriginalText] = useState('');
  const [hiraganaText, setHiraganaText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // AI Lyrics State
  const [isAiLyricsOpen, setIsAiLyricsOpen] = useState(false);
  const [lyricKeywords, setLyricKeywords] = useState("");
  const [isLyricsGenerating, setIsLyricsGenerating] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* --- Prompt Generator States --- */
  const [vocalX, setVocalX] = useState(0);
  const [vocalY, setVocalY] = useState(0);
  const [artistInput, setArtistInput] = useState("");
  const [isArtistAnalyzed, setIsArtistAnalyzed] = useState(false);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Vocal Presets
  const [vocalPresets, setVocalPresets] = useState<VocalPreset[]>([]);
  const [presetName, setPresetName] = useState("");

  // Custom Selection States
  const [selectedTextures, setSelectedTextures] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  
  // Custom Input States
  const [customGenre, setCustomGenre] = useState("");
  const [customGenreList, setCustomGenreList] = useState<string[]>([]);
  
  const [customTexture, setCustomTexture] = useState("");
  const [customTextureList, setCustomTextureList] = useState<string[]>([]);
  
  const [customInstrument, setCustomInstrument] = useState("");
  const [customInstrumentList, setCustomInstrumentList] = useState<string[]>([]);

  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isPromptLoading, setIsPromptLoading] = useState(false);

  /* --- Creation Mode States --- */
  const [visualResult, setVisualResult] = useState<VisualPromptResult | null>(null);
  const [videoPromptResult, setVideoPromptResult] = useState<VideoPromptResult | null>(null);
  const [isVisualLoading, setIsVisualLoading] = useState(false);
  const [isVideoPromptLoading, setIsVideoPromptLoading] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [lyricSections, setLyricSections] = useState<LyricSection[]>([]);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number>(-1);

  /* --- Chat States --- */
  const chatSession = useRef<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // --- INITIALIZATION --- //
  useEffect(() => {
      // Load presets
      const saved = localStorage.getItem('suno_vocal_presets');
      if (saved) {
          try {
              setVocalPresets(JSON.parse(saved));
          } catch (e) {
              console.error("Failed to load presets", e);
          }
      }

      // Check for API Key
      const key = localStorage.getItem('suno_assist_api_key');
      if (key) setHasApiKey(true);
      // Also check env for development
      if (!key && process.env && process.env.API_KEY) setHasApiKey(true);
  }, []);

  const handleSaveApiKey = (key: string) => {
      localStorage.setItem('suno_assist_api_key', key);
      setHasApiKey(true);
  };

  const handleRemoveApiKey = () => {
      if (window.confirm("APIキーを削除しますか？\n次回利用時に再度入力が必要になります。")) {
          localStorage.removeItem('suno_assist_api_key');
          setHasApiKey(false);
          setIsSettingsOpen(false);
      }
  };

  // --- LYRIC EDITOR LOGIC --- //

  const currentText = activeTab === 'original' ? originalText : hiraganaText;
  const setCurrentText = (text: string) => {
    if (activeTab === 'original') {
      setOriginalText(text);
    } else {
      setHiraganaText(text);
    }
  };

  const processText = async (rawText: string) => {
    const normalized = rawText.replace(/\r\n/g, '\n');
    const spacedText = normalized.split('\n').join('\n\n');
    
    setOriginalText(spacedText);
    setIsEditing(false); 
    
    setIsAiLoading(true);
    const converted = await convertToHiragana(spacedText);
    setHiraganaText(converted);
    setIsAiLoading(false);
  };

  const handleGenerateLyrics = async () => {
    if (!lyricKeywords.trim()) return;
    setIsLyricsGenerating(true);
    const generated = await generateLyrics(lyricKeywords);
    if (generated) {
        // Double the spacing for AI generated lyrics as requested (行間+1)
        const spacedGenerated = generated.replace(/\r\n/g, '\n').replace(/\n/g, '\n\n');

        // Append or Set
        const newText = originalText ? originalText + "\n\n" + spacedGenerated : spacedGenerated;
        setOriginalText(newText);
        setLyricKeywords("");
        setIsAiLyricsOpen(false); 
        
        // Auto convert to Hiragana for the updated text including the new AI lyrics
        setIsAiLoading(true);
        const converted = await convertToHiragana(newText);
        setHiraganaText(converted);
        setIsAiLoading(false);
    } else {
        alert("作詞に失敗しました。APIキーの制限などの可能性があります。");
    }
    setIsLyricsGenerating(false);
  };

  const handlePasteButton = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
         alert("このブラウザはクリップボード読み取りに対応していません。テキストエリアに直接ペーストしてください。");
         setIsEditing(true);
         setTimeout(() => textareaRef.current?.focus(), 100);
         return;
      }
      const clipboardText = await navigator.clipboard.readText();
      await processText(clipboardText);
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  const handleNativePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault(); 
    const text = e.clipboardData.getData('text');
    if (text) processText(text);
  };

  const handleCopy = async (text: string, btnId: string) => {
    try {
      let textToCopy = text;
      
      // If copying Hiragana, merge tags and structure from Original
      if (activeTab === 'hiragana' && originalText) {
          textToCopy = mergeStructureAndContent(originalText, hiraganaText);
      }
      
      // Compress double spacing to single line (空白行-1)
      const compressedText = textToCopy.replace(/\n\n/g, '\n');
      
      await navigator.clipboard.writeText(compressedText);
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.classList.add('bg-green-500', 'text-white', 'border-green-500');
        setTimeout(() => btn.classList.remove('bg-green-500', 'text-white', 'border-green-500'), 500);
      }
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleClear = () => {
    // Simply check if current text has content
    if (!currentText && !originalText && !hiraganaText) return;

    if (window.confirm('歌詞を全て削除しますか？')) {
      if (activeTab === 'original') {
          setOriginalText('');
      } else {
          setHiraganaText('');
      }
      setIsEditing(true); 
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleScroll = (direction: 'up' | 'down') => {
    if (textareaRef.current) {
      const amount = 80; 
      textareaRef.current.scrollBy({
        top: direction === 'down' ? amount : -amount,
        behavior: 'smooth'
      });
    }
  };

  const handleInsertTag = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const scrollTop = textarea.scrollTop;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = currentText;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + tag + after;
    setCurrentText(newText);
    
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.value = newText;
        // Highlight the inserted tag immediately (Selection Range)
        // This gives visual feedback "Here is what I inserted"
        const newStart = start;
        const newEnd = start + tag.length;
        textareaRef.current.setSelectionRange(newStart, newEnd);
        textareaRef.current.scrollTop = scrollTop;
        textareaRef.current.focus();
      }
    });
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing) setTimeout(() => textareaRef.current?.focus(), 50);
  };

  // --- PROMPT GENERATOR LOGIC --- //
  
  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const addCustomGenre = () => {
    if (customGenre.trim()) {
      setCustomGenreList([...customGenreList, customGenre.trim()]);
      setSelectedGenres([...selectedGenres, customGenre.trim()]);
      setCustomGenre("");
    }
  };

  const addCustomTexture = () => {
    if (customTexture.trim()) {
      setCustomTextureList([...customTextureList, customTexture.trim()]);
      setSelectedTextures([...selectedTextures, customTexture.trim()]);
      setCustomTexture("");
    }
  };

  const addCustomInstrument = () => {
    if (customInstrument.trim()) {
      setCustomInstrumentList([...customInstrumentList, customInstrument.trim()]);
      setSelectedInstruments([...selectedInstruments, customInstrument.trim()]);
      setCustomInstrument("");
    }
  };

  const handleArtistAnalysis = async () => {
      if (!artistInput.trim()) return;
      
      setIsAnalysisLoading(true);
      const result = await analyzeArtistStyle(artistInput);
      setIsAnalysisLoading(false);

      if (result) {
          applyAnalysisResult(result);
          setIsArtistAnalyzed(true);
      } else {
          alert("分析に失敗しました。");
      }
  };

  const applyAnalysisResult = (result: {vocalX: number, vocalY: number, textures: string[], genres?: string[], instruments?: string[]}) => {
      setVocalX(result.vocalX);
      setVocalY(result.vocalY);
      
      const newTextures: string[] = [];
      const customTexturesToAdd: string[] = [];
      result.textures.forEach(t => {
          const match = VOCAL_TEXTURES.find(lt => lt.toLowerCase() === t.toLowerCase());
          if (match) newTextures.push(match);
          else customTexturesToAdd.push(t);
      });
      setCustomTextureList(prev => Array.from(new Set([...prev, ...customTexturesToAdd])));
      setSelectedTextures([...newTextures, ...customTexturesToAdd]);

      if (result.genres) {
          const newGenres: string[] = [];
          const customGenresToAdd: string[] = [];
          result.genres.forEach(g => {
             const match = GENRES.find(lg => lg.toLowerCase() === g.toLowerCase());
             if (match) newGenres.push(match);
             else customGenresToAdd.push(g);
          });
          setCustomGenreList(prev => Array.from(new Set([...prev, ...customGenresToAdd])));
          setSelectedGenres([...newGenres, ...customGenresToAdd]);
      }

      if (result.instruments) {
          const newInstruments: string[] = [];
          const customInstrumentsToAdd: string[] = [];
          result.instruments.forEach(i => {
              const match = EMPHASIS_INSTRUMENTS.find(li => li.toLowerCase() === i.toLowerCase());
              if (match) newInstruments.push(match);
              else customInstrumentsToAdd.push(i);
          });
          setCustomInstrumentList(prev => Array.from(new Set([...prev, ...customInstrumentsToAdd])));
          setSelectedInstruments([...newInstruments, ...customInstrumentsToAdd]);
      }
  };

  const handleArtistInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setArtistInput(e.target.value);
      if (isArtistAnalyzed) setIsArtistAnalyzed(false);
  };

  // Audio Analysis
  const triggerFileUpload = () => {
      // Safely click the hidden input
      if (fileInputRef.current) {
          // Reset value to allow selecting same file again
          fileInputRef.current.value = "";
          fileInputRef.current.click();
      }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          setIsAnalysisLoading(true);
          const result = await analyzeVocalAudio(base64, file.type);
          setIsAnalysisLoading(false);
          
          if (result) {
             applyAnalysisResult(result);
             alert("音声分析が完了しました。ボーカル設定に反映しました。");
          } else {
              alert("音声分析に失敗しました。");
          }
      };
      reader.readAsDataURL(file);
  };

  // Preset Management
  const handleSavePreset = () => {
      if (!presetName.trim()) {
          alert("プリセット名を入力してください。");
          return;
      }
      const newPreset: VocalPreset = {
          id: Date.now().toString(),
          name: presetName,
          vocalX,
          vocalY,
          textures: selectedTextures
      };
      const updated = [...vocalPresets, newPreset];
      setVocalPresets(updated);
      localStorage.setItem('suno_vocal_presets', JSON.stringify(updated));
      setPresetName("");
  };

  const handleLoadPreset = (preset: VocalPreset) => {
      setVocalX(preset.vocalX);
      setVocalY(preset.vocalY);
      setSelectedTextures(preset.textures);
  };
  
  const handleDeletePreset = (id: string) => {
      if(!window.confirm("このプリセットを削除しますか？")) return;
      const updated = vocalPresets.filter(p => p.id !== id);
      setVocalPresets(updated);
      localStorage.setItem('suno_vocal_presets', JSON.stringify(updated));
  }

  const handlePlayVoiceSample = async () => {
      setIsPlayingSample(true);
      await playVoiceSample("あ、い、う、え、お", vocalX, vocalY);
      setIsPlayingSample(false);
  };

  const handleGeneratePrompt = async () => {
    setIsPromptLoading(true);
    const result = await generateSunoPrompt({
      vocalX,
      vocalY,
      artist: artistInput,
      textures: selectedTextures,
      genres: selectedGenres,
      instruments: selectedInstruments
    });
    setGeneratedPrompt(result);
    setIsPromptLoading(false);
  };

  const handleResetPrompt = () => {
    if (window.confirm('プロンプト設定をリセット（クリア）しますか？')) {
      setVocalX(0); setVocalY(0); setArtistInput(""); setGeneratedPrompt("");
      setIsArtistAnalyzed(false); setIsAnalysisLoading(false); setIsPromptLoading(false); setIsPlayingSample(false);
      setCustomGenre(""); setCustomTexture(""); setCustomInstrument("");
      setSelectedTextures([]); setSelectedGenres([]); setSelectedInstruments([]);
      setCustomGenreList([]); setCustomTextureList([]); setCustomInstrumentList([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- CREATION MODE LOGIC --- //
  
  // Parse lyric sections
  const parseLyricSections = () => {
      const text = originalText || hiraganaText;
      if (!text) {
          setLyricSections([]);
          return;
      }
      
      const sections: LyricSection[] = [];
      const lines = text.split('\n');
      let currentTitle = "Intro/Start";
      let currentContent = "";
      
      // Robust Regex: Finds tags like [Verse 1], [Chorus], etc. anywhere in the line
      // And trims spaces
      const tagRegex = /\[(.*?)\]/;

      lines.forEach(line => {
          const match = line.match(tagRegex);
          if (match) {
              // If we have accumulated content, push it as previous section
              if (currentContent.trim()) {
                  sections.push({ title: currentTitle, content: currentContent.trim() });
              }
              currentTitle = match[1]; // e.g., "Chorus"
              currentContent = line + "\n"; // Include the tag line for context
          } else {
              currentContent += line + "\n";
          }
      });
      // Push last section
      if (currentContent.trim()) {
           sections.push({ title: currentTitle, content: currentContent.trim() });
      }
      
      // Fallback for no tags
      if (sections.length === 0 && text.trim()) {
          sections.push({ title: "Whole Song", content: text });
      }

      setLyricSections(sections);
      // Auto-select first section if not selected or invalid
      if (sections.length > 0 && selectedSectionIndex === -1) {
          setSelectedSectionIndex(0);
      }
  };

  useEffect(() => {
      if (appMode === 'creation') {
          parseLyricSections();
      }
  }, [appMode, originalText, hiraganaText]);

  const handleGenerateVisuals = async () => {
      const text = originalText || hiraganaText;
      if (!text) {
          alert("歌詞がありません。歌詞タブに入力してください。");
          return;
      }
      setIsVisualLoading(true);
      const res = await generateVisualPrompts(text);
      if (res) {
          setVisualResult(res);
      } else {
          alert("分析に失敗しました。");
      }
      setIsVisualLoading(false);
  };

  const handleGenerateImage = async () => {
      if (!visualResult?.imagePrompt) return;
      setIsImageGenerating(true);
      setGeneratedImage(null);
      const img = await generateImage(visualResult.imagePrompt);
      if (img) {
          setGeneratedImage(img);
      } else {
          alert("画像生成に失敗しました。");
      }
      setIsImageGenerating(false);
  };
  
  const handleGenerateVideoPrompt = async () => {
      if (selectedSectionIndex < 0 || !lyricSections[selectedSectionIndex]) return;
      const section = lyricSections[selectedSectionIndex];
      
      setIsVideoPromptLoading(true);
      const res = await generateVideoPromptForSection(section.content);
      if (res) {
          setVideoPromptResult(res);
      } else {
          alert("動画プロンプト生成に失敗しました。");
      }
      setIsVideoPromptLoading(false);
  }

  const handleEditImageInChat = () => {
      if (!generatedImage) return;
      setAppMode('chat');
      handleSendChatMessage("この画像について、編集や改善の相談をしたいです。", generatedImage);
  };

  // --- CHAT LOGIC --- //

  const handleSendChatMessage = async (text: string, image?: string) => {
    if (!chatSession.current) {
        chatSession.current = createChatSession();
    }
    if (!chatSession.current) return;

    const newMsg: ChatMessage = { role: 'user', text, image };
    setChatMessages(prev => [...prev, newMsg]);
    setIsChatLoading(true);

    try {
        let result;
        if (image) {
            const base64Data = image.split(',')[1];
            const mimeType = image.split(';')[0].split(':')[1];
            result = await chatSession.current.sendMessage({
                message: {
                    role: 'user',
                    parts: [
                        { text: text },
                        { inlineData: { mimeType: mimeType, data: base64Data } }
                    ]
                }
            });
        } else {
            result = await chatSession.current.sendMessage({ message: text });
        }
        setChatMessages(prev => [...prev, { role: 'model', text: result.text || "" }]);
    } catch (e) {
        console.error("Chat Error", e);
        setChatMessages(prev => [...prev, { role: 'model', text: "すみません、エラーが発生しました。" }]);
    } finally {
        setIsChatLoading(false);
    }
  };

  const handleClearChat = () => {
      if (window.confirm("チャット履歴をクリアしますか？")) {
          chatSession.current = null;
          setChatMessages([]);
      }
  }

  // --- RENDER --- //

  if (!hasApiKey) {
      return <ApiKeyModal onSave={handleSaveApiKey} />;
  }

  return (
    <div className={`flex flex-col h-full w-full ${t.bgApp} transition-colors duration-300`}>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={themeSettings}
        onUpdateSettings={setThemeSettings}
        onRemoveApiKey={handleRemoveApiKey}
      />
      <HelpModal 
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
      
      {/* Mode Switcher */}
      <div className={`flex ${t.bgPanel} p-1 gap-1 flex-none shadow-inner pr-10 relative overflow-x-auto no-scrollbar`}>
        {/* Absolute settings/help buttons in top right */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1">
             <button 
                onClick={() => setIsHelpOpen(true)}
                className={`p-1.5 rounded-full bg-white/50 hover:bg-white shadow-sm ${t.textSecondary}`}
                title="使い方ガイド"
            >
                <IconHelp />
            </button>
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className={`p-1.5 rounded-full bg-white/50 hover:bg-white shadow-sm ${t.textSecondary}`}
                title="設定"
            >
                <IconSettings />
            </button>
        </div>

        <button 
          onClick={() => setAppMode('chat')}
          className={`min-w-[70px] flex-1 py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-1 ${appMode === 'chat' ? `bg-white ${t.textPrimary} shadow-sm` : 'text-gray-500 hover:bg-white/30'}`}
        >
          <IconChat /> <span className="hidden xs:inline">相談</span>
        </button>
        <button 
          onClick={() => setAppMode('lyrics')}
          className={`min-w-[70px] flex-1 py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-1 ${appMode === 'lyrics' ? `bg-white ${t.textPrimary} shadow-sm` : 'text-gray-500 hover:bg-white/30'}`}
        >
          <span className="text-xs">📝</span> 歌詞
        </button>
        <button 
          onClick={() => setAppMode('prompt')}
          className={`min-w-[70px] flex-1 py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-1 ${appMode === 'prompt' ? `bg-white ${t.textPrimary} shadow-sm` : 'text-gray-500 hover:bg-white/30'}`}
        >
          <span className="text-xs">🎵</span> プロンプト
        </button>
        <button 
          onClick={() => setAppMode('creation')}
          className={`min-w-[70px] flex-1 py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-1 ${appMode === 'creation' ? `bg-white ${t.textPrimary} shadow-sm` : 'text-gray-500 hover:bg-white/30'}`}
        >
          <span className="text-xs"><IconVideo /></span> 創作
        </button>
        <div className="w-10 flex-none"></div>
      </div>

      {appMode === 'lyrics' && (
        /* ================= LYRIC EDITOR VIEW ================= */
        <>
          <div className="bg-white shadow-sm z-10 flex-none transition-all duration-300">
            {/* Tabs */}
            <div className={`flex border-b ${t.border}`}>
              <button 
                onClick={() => setActiveTab('original')}
                className={`flex-1 py-3 text-sm font-bold text-center transition-colors ${activeTab === 'original' ? `${t.textPrimary} border-b-2 ${t.borderStrong} ${t.bgSoft}` : 'text-gray-400 hover:text-gray-600'}`}
              >
                オリジナル歌詞
              </button>
              <button 
                onClick={() => setActiveTab('hiragana')}
                className={`flex-1 py-3 text-sm font-bold text-center transition-colors flex items-center justify-center gap-2 ${activeTab === 'hiragana' ? `${t.textPrimary} border-b-2 ${t.borderStrong} ${t.bgSoft}` : 'text-gray-400 hover:text-gray-600'}`}
              >
                {isAiLoading ? <span className="animate-spin">⌛</span> : <IconSparkles />}
                ひらがな変換 (AI)
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between p-2 gap-2">
              <div className="flex gap-2">
                <Button themeColor={currentThemeColor} variant="secondary" onClick={() => setIsAiLyricsOpen(!isAiLyricsOpen)} className={isAiLyricsOpen ? `bg-${t.textPrimary} text-white` : ''} title="AI作詞アシスタント">
                    <IconSparkles /> <span className="ml-1">AI作詞</span>
                </Button>

                <Button themeColor={currentThemeColor} variant="secondary" onClick={handlePasteButton} title="整形して貼付">
                  <IconPaste /> <span className="ml-1">貼付</span>
                </Button>
                <Button themeColor={currentThemeColor} variant="secondary" id="copy-lyrics-btn" onClick={() => handleCopy(currentText, 'copy-lyrics-btn')} title="圧縮してコピー">
                  <IconCopy /> <span className="ml-1">コピー</span>
                </Button>
                <Button themeColor={currentThemeColor} variant="secondary" onClick={handleClear} className="!text-red-500 !border-red-100 hover:!bg-red-50" title="現在の歌詞を全削除">
                  <IconTrash /> <span className="ml-1 text-xs">全削除</span>
                </Button>
              </div>
              
              <Button 
                themeColor={currentThemeColor}
                variant="icon" 
                onClick={toggleEdit} 
                className={`${isEditing ? `${t.buttonPrimary} text-white hover:${t.buttonHover} ring-2 ${t.ring}` : t.bgPanel}`}
                title={isEditing ? "編集完了" : "編集モード"}
              >
                {isEditing ? <IconCheck /> : <IconPencil />}
              </Button>
            </div>

            {/* AI Lyrics Panel */}
            {isAiLyricsOpen && (
                <div className={`p-3 ${t.bgPanel} border-b ${t.border} animate-in slide-in-from-top-2`}>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={lyricKeywords}
                            onChange={(e) => setLyricKeywords(e.target.value)}
                            placeholder="キーワード (例: 夏, 海, 切ない恋)..."
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-base focus:ring-2 focus:ring-orange-200 outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerateLyrics()}
                        />
                        <Button 
                            themeColor={currentThemeColor}
                            onClick={handleGenerateLyrics} 
                            disabled={isLyricsGenerating || !lyricKeywords.trim()}
                            className="whitespace-nowrap"
                        >
                            {isLyricsGenerating ? "生成中..." : "生成する"}
                        </Button>
                    </div>
                </div>
            )}
          </div>

          <div className="flex-1 relative w-full overflow-hidden flex flex-col">
            <textarea
              ref={textareaRef}
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              onPaste={handleNativePaste}
              readOnly={!isEditing}
              placeholder={isEditing ? "歌詞を入力..." : "ここに歌詞が表示されます。直接貼り付けるか、「貼付」ボタンを使用してください。"}
              className={`
                flex-1 w-full p-4 resize-none outline-none text-base leading-relaxed font-sans
                ${isEditing ? 'bg-white text-gray-900' : `${t.bgSoft}/50 text-gray-800`}
                transition-all duration-200
                border-b-4 ${t.borderStrong}
                no-scrollbar
              `}
              spellCheck={false}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20 pointer-events-none">
              <button onClick={() => handleScroll('up')} className={`pointer-events-auto p-3 bg-white/80 backdrop-blur-sm border ${t.border} rounded-full shadow-lg ${t.textPrimary} active:scale-95 transition-all opacity-70 hover:opacity-100`}><IconArrowUp /></button>
              <button onClick={() => handleScroll('down')} className={`pointer-events-auto p-3 bg-white/80 backdrop-blur-sm border ${t.border} rounded-full shadow-lg ${t.textPrimary} active:scale-95 transition-all opacity-70 hover:opacity-100`}><IconArrowDown /></button>
            </div>
          </div>

          <div className="flex-none max-h-[40vh] flex flex-col bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className={`${t.buttonPrimary} text-white text-xs font-bold px-4 py-1 flex items-center justify-between`}>
                <span>SUNOタグ</span>
                <span className="opacity-75 text-[10px]">タップで挿入</span>
            </div>
            <TagPanel onInsertTag={handleInsertTag} themeColor={currentThemeColor} />
          </div>
        </>
      )}

      {appMode === 'prompt' && (
        /* ================= PROMPT GENERATOR VIEW ================= */
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header for Prompt Mode */}
           <div className={`bg-white shadow-sm z-10 flex-none p-2 border-b ${t.border} flex justify-between items-center`}>
              <span className={`font-bold ${t.textPrimary} text-sm ml-2`}>プロンプト設定</span>
              <Button themeColor={currentThemeColor} variant="secondary" onClick={handleResetPrompt} className="!text-red-500 !border-red-100 hover:!bg-red-50">
                 <IconTrash /> <span className="ml-1">リセット</span>
              </Button>
           </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white no-scrollbar">
            {/* Section 1: Vocal Pad */}
            <section className={`${t.bgSoft} p-4 rounded-xl border ${t.border} shadow-sm`}>
              <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-sm font-bold ${t.textSecondary} flex items-center gap-2`}>
                    <IconMusic /> ボーカルスタイル
                  </h3>
                  <div className="flex gap-2">
                       <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1">
                           <input 
                               type="text" 
                               value={presetName}
                               onChange={(e) => setPresetName(e.target.value)}
                               placeholder="名前..."
                               className="w-20 text-base outline-none"
                           />
                           <button onClick={handleSavePreset} className="text-gray-500 hover:text-blue-500" title="保存">
                               <IconSave />
                           </button>
                       </div>
                       
                       {vocalPresets.length > 0 && (
                           <select 
                               onChange={(e) => {
                                   const p = vocalPresets.find(vp => vp.id === e.target.value);
                                   if(p) handleLoadPreset(p);
                               }}
                               className="text-base border border-gray-200 rounded-lg max-w-[80px]"
                               defaultValue=""
                           >
                               <option value="" disabled>Load...</option>
                               {vocalPresets.map(p => (
                                   <option key={p.id} value={p.id}>{p.name}</option>
                               ))}
                           </select>
                       )}

                       <Button 
                        variant="secondary"
                        themeColor={currentThemeColor}
                        onClick={handlePlayVoiceSample}
                        disabled={isPlayingSample}
                        className="text-[10px] py-1 h-8"
                       >
                        {isPlayingSample ? <span className="animate-spin">⌛</span> : <IconSpeaker />}
                       </Button>
                  </div>
              </div>
              
              <XYPad x={vocalX} y={vocalY} onChange={(x, y) => { setVocalX(x); setVocalY(y); }} />
            </section>

            {/* Section 2: Artist Analysis & Audio */}
            <section className={`${t.bgSoft} p-4 rounded-xl border ${t.border} shadow-sm`}>
              <h3 className={`text-sm font-bold ${t.textSecondary} mb-2`}>
                アーティスト風スタイル
              </h3>
              <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <input 
                        type="text" 
                        value={artistInput}
                        onChange={handleArtistInputChange}
                        placeholder="例: King Gnu, Ado, 宇多田ヒカル"
                        className={`w-full p-3 pr-10 rounded-lg border focus:ring-2 outline-none text-base transition-all duration-300 ${
                            isArtistAnalyzed 
                            ? 'border-emerald-400 bg-emerald-50 focus:ring-emerald-200 text-emerald-800' 
                            : `${t.border} focus:ring-blue-200`
                        }`}
                    />
                    {isArtistAnalyzed && (
                         <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 animate-in fade-in zoom-in">
                             <IconCheck />
                         </div>
                    )}
                  </div>
                  <Button 
                    variant="primary" 
                    themeColor={currentThemeColor}
                    onClick={handleArtistAnalysis} 
                    disabled={isAnalysisLoading || !artistInput.trim()}
                    className={`flex-none w-12 !p-0 ${isAnalysisLoading ? 'opacity-70 cursor-wait' : ''}`}
                    title="分析して反映"
                  >
                    {isAnalysisLoading ? <span className="animate-spin">⌛</span> : <IconWand />}
                  </Button>
              </div>

              {/* Audio Upload */}
              <div className="flex items-center gap-2">
                 <input 
                    type="file" 
                    ref={fileInputRef}
                    accept=".mp3, .wav, .m4a, audio/mpeg, audio/wav, audio/x-wav, audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                    id="audio-upload"
                 />
                 <label 
                    onClick={triggerFileUpload}
                    className={`flex-1 text-xs flex items-center justify-center gap-2 border border-dashed ${t.borderStrong} rounded-lg p-2 cursor-pointer hover:bg-white/50 text-gray-500 transition-colors active:scale-95 select-none`}
                 >
                     <IconUpload />
                     音声ファイルを分析して反映 (mp3, wav)
                 </label>
              </div>
            </section>

            {/* Section 3: Vocal Textures */}
            <section className="space-y-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">声質・歌い方</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {[...VOCAL_TEXTURES, ...customTextureList].map(tex => (
                  <Button 
                    key={tex} 
                    variant="tag" 
                    themeColor={currentThemeColor}
                    active={selectedTextures.includes(tex)}
                    onClick={() => toggleSelection(tex, selectedTextures, setSelectedTextures)}
                    className="text-xs py-1"
                  >
                    {tex}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={customTexture}
                  onChange={(e) => setCustomTexture(e.target.value)}
                  placeholder="特徴を追加 (例: Whisper, Clear)..."
                  className={`flex-1 px-3 py-2 text-base border border-gray-200 rounded-lg outline-none focus:border-${currentThemeColor}-400`}
                />
                <button 
                  onClick={addCustomTexture}
                  className={`p-2 ${t.bgPanel} ${t.textPrimary} rounded-lg hover:${t.bgSoft}`}
                >
                  <IconPlus />
                </button>
              </div>
            </section>

            {/* Section 4: Genres */}
            <section className="space-y-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">ジャンル</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {[...GENRES, ...customGenreList].map(g => (
                  <Button 
                    key={g} 
                    variant="tag" 
                    themeColor={currentThemeColor}
                    active={selectedGenres.includes(g)}
                    onClick={() => toggleSelection(g, selectedGenres, setSelectedGenres)}
                    className="text-xs py-1"
                  >
                    {g}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  placeholder="ジャンル追加 (例: Funk, Rock)..."
                  className={`flex-1 px-3 py-2 text-base border border-gray-200 rounded-lg outline-none focus:border-${currentThemeColor}-400`}
                />
                <button 
                  onClick={addCustomGenre}
                  className={`p-2 ${t.bgPanel} ${t.textPrimary} rounded-lg hover:${t.bgSoft}`}
                >
                  <IconPlus />
                </button>
              </div>
            </section>

             {/* Section 5: Instruments */}
             <section className="space-y-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">強調したい楽器</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {[...EMPHASIS_INSTRUMENTS, ...customInstrumentList].map(inst => (
                  <Button 
                    key={inst} 
                    variant="tag" 
                    themeColor={currentThemeColor}
                    active={selectedInstruments.includes(inst)}
                    onClick={() => toggleSelection(inst, selectedInstruments, setSelectedInstruments)}
                    className="text-xs py-1"
                  >
                    {inst}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={customInstrument}
                  onChange={(e) => setCustomInstrument(e.target.value)}
                  placeholder="楽器追加 (例: Sax, Flute)..."
                  className={`flex-1 px-3 py-2 text-base border border-gray-200 rounded-lg outline-none focus:border-${currentThemeColor}-400`}
                />
                <button 
                  onClick={addCustomInstrument}
                  className={`p-2 ${t.bgPanel} ${t.textPrimary} rounded-lg hover:${t.bgSoft}`}
                >
                  <IconPlus />
                </button>
              </div>
            </section>

            {/* Section 6: Generation & Output */}
            <div className={`space-y-3 bg-white p-4 rounded-xl border ${t.border} shadow-sm mt-8`}>
              <Button 
                themeColor={currentThemeColor}
                variant="primary" 
                onClick={handleGeneratePrompt}
                className="w-full py-3 text-base font-bold shadow-md"
                disabled={isPromptLoading}
              >
                {isPromptLoading ? "AI生成中..." : "プロンプト生成 (AI)"}
              </Button>
              
              <div className="relative">
                <textarea 
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  placeholder="生成されたプロンプトがここに表示されます"
                  className={`w-full h-32 p-3 pr-12 text-base bg-gray-50 border border-gray-200 rounded-lg resize-none focus:ring-2 ${t.ring} outline-none`}
                />
                <button 
                  id="copy-prompt-btn"
                  onClick={() => handleCopy(generatedPrompt, 'copy-prompt-btn')}
                  className={`absolute top-2 right-2 p-2 bg-white text-gray-500 hover:${t.textPrimary} rounded-md border border-gray-200 shadow-sm transition-colors`}
                  title="コピー"
                >
                  <IconCopy />
                </button>
              </div>
              <div className="text-right text-[10px] text-gray-400">
                {generatedPrompt.length} / 1000文字
              </div>
            </div>

            <div className="h-10"></div>
          </div>
        </div>
      )}

      {appMode === 'creation' && (
          /* ================= CREATION MODE VIEW ================= */
          <div className="flex flex-col h-full overflow-hidden bg-white">
             {/* Header */}
             <div className={`bg-white shadow-sm z-10 flex-none p-4 border-b ${t.border} flex flex-col gap-2`}>
                <h2 className={`font-bold ${t.textPrimary} text-lg`}>世界観ビジュアライズ</h2>
                <p className="text-xs text-gray-500">歌詞から情景を想像し、画像・動画用のプロンプトを生成します。</p>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 no-scrollbar">
                
                {/* 1. Image Generation Section */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-2">1. 全体のイメージ画像</h3>
                    <Button 
                        themeColor={currentThemeColor}
                        variant="primary" 
                        onClick={handleGenerateVisuals}
                        disabled={isVisualLoading}
                        className="w-full py-3 font-bold mb-4"
                    >
                        {isVisualLoading ? "歌詞を分析中..." : "歌詞から全体イメージを生成"}
                    </Button>
                    
                    {visualResult && (
                        <div className="space-y-4 animate-in fade-in">
                             <div className="p-3 bg-violet-50 rounded-lg border border-violet-100">
                                <h3 className="text-xs font-bold text-violet-700 mb-1">情景描写 (Scene)</h3>
                                <p className="text-sm text-gray-800">{visualResult.sceneDescription}</p>
                             </div>
                             
                             <div>
                                <h3 className="text-xs font-bold text-gray-500 mb-1 flex items-center justify-between">
                                    画像生成プロンプト
                                </h3>
                                <div className="relative">
                                    <textarea 
                                        readOnly
                                        value={visualResult.imagePrompt}
                                        className="w-full h-24 p-3 text-xs bg-gray-100 rounded border border-gray-200 resize-none mb-2 block"
                                    />
                                    <button 
                                        onClick={() => handleCopy(visualResult.imagePrompt, 'cp-img')}
                                        className="absolute right-2 top-2 text-gray-500 hover:text-violet-500 bg-white p-1 rounded shadow-sm border border-gray-200"
                                        title="Copy"
                                    >
                                        <IconCopy />
                                    </button>
                                </div>
                                
                                <Button 
                                    variant="secondary" 
                                    onClick={handleGenerateImage} 
                                    disabled={isImageGenerating}
                                    className={`w-full py-3 font-bold flex items-center justify-center gap-2 border-yellow-300 ${isImageGenerating ? 'bg-yellow-100 text-yellow-600' : 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100'} shadow-sm transition-colors`}
                                >
                                    {isImageGenerating ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin text-xl">🍌</span>
                                            <span>描画中...</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <span className="text-lg">🍌</span> 
                                            <span>Nano Bananaで画像を生成</span>
                                        </span>
                                    )}
                                </Button>
                             </div>
                        </div>
                    )}
                </div>

                {/* 2. Generation Display Section (Image) */}
                {(generatedImage || isImageGenerating) && (
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-in fade-in">
                        <h3 className="font-bold text-gray-700 mb-2">生成された画像</h3>
                        
                        {isImageGenerating ? (
                             <div className="w-full aspect-square bg-gray-50 rounded-lg flex flex-col items-center justify-center animate-pulse border-2 border-dashed border-yellow-300">
                                <span className="text-5xl animate-bounce">🍌</span>
                                <span className="text-sm text-yellow-600 font-bold mt-4">Nano Bananaが描画中...</span>
                            </div>
                        ) : generatedImage && (
                            <>
                                <div className="relative group">
                                    <img src={generatedImage} alt="Generated" className="w-full rounded-lg shadow-md mb-4" />
                                </div>

                                <div className="flex gap-2 justify-end">
                                    <a 
                                        href={generatedImage} 
                                        download="generated_image.png" 
                                        className={`flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50`}
                                        title="保存"
                                    >
                                        <IconDownload /> 保存
                                    </a>
                                    <Button 
                                        variant="secondary" 
                                        onClick={handleEditImageInChat}
                                        className="!py-2 !px-3 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                        title="AIに相談・編集依頼"
                                    >
                                        <IconPencil /> 編集(AI連携)
                                    </Button>
                                    <Button 
                                        variant="secondary" 
                                        onClick={() => { if(window.confirm('画像を削除しますか？')) setGeneratedImage(null); }}
                                        className="!py-2 !px-3 !text-red-500 !border-red-100 hover:!bg-red-50"
                                        title="削除"
                                    >
                                        <IconTrash /> 削除
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* 3. Sora 2 Video Prompt Section */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mt-4">
                    <h3 className="font-bold text-gray-700 mb-2">2. Sora 2 動画用プロンプト (10秒)</h3>
                    <p className="text-xs text-gray-500 mb-4">歌詞のセクションを選んで、その情景を再現するプロンプトを生成します。</p>

                    <div className="flex gap-2 mb-4">
                        <select 
                            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                            onChange={(e) => setSelectedSectionIndex(Number(e.target.value))}
                            value={selectedSectionIndex}
                        >
                            <option value={-1} disabled>セクションを選択...</option>
                            {lyricSections.map((sec, idx) => (
                                <option key={idx} value={idx}>{sec.title}</option>
                            ))}
                        </select>
                        <Button 
                            themeColor={currentThemeColor}
                            onClick={handleGenerateVideoPrompt}
                            disabled={isVideoPromptLoading || selectedSectionIndex === -1}
                            className="flex-none w-24"
                        >
                            {isVideoPromptLoading ? "生成中..." : "生成"}
                        </Button>
                    </div>

                    {videoPromptResult && (
                        <div className="space-y-4 animate-in fade-in bg-slate-50 p-3 rounded-lg border border-slate-200">
                             <div className="text-xs text-gray-500 border-l-2 border-gray-300 pl-2 mb-2 italic">
                                 {videoPromptResult.lyricsPart}
                             </div>
                             
                             <div>
                                <h3 className="text-xs font-bold text-slate-700 mb-1">情景描写 (10s Scene)</h3>
                                <p className="text-sm text-gray-800">{videoPromptResult.sceneDescription}</p>
                             </div>

                             <div>
                                <h3 className="text-xs font-bold text-gray-500 mb-1">Sora 2 Prompt (English)</h3>
                                <div className="relative">
                                    <textarea 
                                        readOnly
                                        value={videoPromptResult.soraPrompt}
                                        className="w-full h-24 p-3 text-xs bg-white rounded border border-gray-200 resize-none"
                                    />
                                    <button 
                                        onClick={() => handleCopy(videoPromptResult.soraPrompt, 'cp-sora')}
                                        className="absolute right-2 bottom-2 text-gray-500 hover:text-violet-500 bg-slate-100 p-1 rounded shadow-sm border border-slate-200"
                                        title="Copy"
                                    >
                                        <IconCopy />
                                    </button>
                                </div>
                             </div>
                        </div>
                    )}
                </div>

             </div>
          </div>
      )}

      {appMode === 'chat' && (
        <ChatInterface 
          messages={chatMessages} 
          onSendMessage={(text) => handleSendChatMessage(text)} 
          isLoading={isChatLoading} 
          onClear={handleClearChat}
        />
      )}

    </div>
  );
};
