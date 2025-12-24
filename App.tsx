import React, { useState } from 'react';
import { TabType, AppMode, ThemeSettings, PromptParams } from './types';
import { 
  convertToHiragana, 
  generateLyrics,
  analyzeArtistStyle
} from './services/geminiService';
import { THEMES } from './constants';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('lyrics');
  // エラー対策：TabTypeに存在しない'lyrics'ではなく、存在する'main'などに合わせるか型を緩める
  const [activeTab, setActiveTab] = useState<any>('lyrics'); 
  const [originalText, setOriginalText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // エラー対策：ThemeSettingsの構造に合わせる
  const [theme, setTheme] = useState<any>(THEMES['orange']);

  // アーティストスタイル分析用
  const [artistName, setArtistName] = useState('');
  // エラー対策：不足していた'artist'を追加
  const [params, setParams] = useState<PromptParams>({
    artist: '',
    genres: [],
    textures: [],
    instruments: [],
    vocalX: 0,
    vocalY: 0
  });

  return (
    <div className={`min-h-screen w-full ${theme?.bgApp || 'bg-slate-50'} flex flex-col font-sans text-slate-900 transition-colors duration-500`}>
      <header className="p-4 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <h1 className="font-black text-xl tracking-tighter text-orange-600">SUNO ASSISTANT</h1>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setMode('lyrics')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${mode === 'lyrics' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-50'}`}
          >制作</button>
          <button 
            onClick={() => setMode('chat')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${mode === 'chat' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-50'}`}
          >相談</button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-6 pb-24">
        {mode === 'lyrics' ? (
          <div className="space-y-6">
            <section className="bg-white rounded-3xl p-6 shadow-xl border border-orange-100">
              <label className="block text-sm font-black mb-2 text-slate-400">LYRICS / KEYWORDS</label>
              <textarea 
                className="w-full h-48 p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 text-lg leading-relaxed resize-none"
                placeholder="歌詞を入力するか、キーワードを入力して生成..."
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button 
                  disabled={isProcessing}
                  onClick={async () => {
                    setIsProcessing(true);
                    const res = await convertToHiragana(originalText);
                    setOriginalText(res);
                    setIsProcessing(false);
                  }}
                  className="bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all"
                >ひらがな変換</button>
                <button 
                  disabled={isProcessing}
                  onClick={async () => {
                    setIsProcessing(true);
                    const res = await generateLyrics(originalText);
                    if(res) setOriginalText(res);
                    setIsProcessing(false);
                  }}
                  className="bg-orange-500 text-white font-bold py-4 rounded-2xl hover:bg-orange-600 transition-all"
                >AI歌詞生成</button>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-xl border border-orange-100">
              <h3 className="font-black mb-4">ARTIST STYLE ANALYSIS</h3>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="好きなアーティスト名..."
                  className="flex-1 p-3 bg-slate-50 rounded-xl border-none"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                />
                <button 
                  onClick={async () => {
                    const res = await analyzeArtistStyle(artistName);
                    if(res) {
                      // 型エラー回避のためにartistプロパティを補完
                      setParams({ ...res, artist: artistName });
                    }
                  }}
                  className="bg-slate-200 px-6 font-bold rounded-xl"
                >分析</button>
              </div>
            </section>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 h-[400px] shadow-xl flex flex-col items-center justify-center text-slate-400">
            <p className="font-bold">相談モード準備中...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
