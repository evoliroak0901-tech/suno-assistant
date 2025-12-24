import React, { useState } from 'react';
import { AppMode, PromptParams } from './types';
import { 
  convertToHiragana, 
  generateLyrics,
  analyzeArtistStyle
} from './services/geminiService';
import { THEMES } from './constants';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('lyrics');
  const [originalText, setOriginalText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [artistName, setArtistName] = useState('');
  const [status, setStatus] = useState<string>('');
  
  const t = THEMES['orange'];

  const [params, setParams] = useState<PromptParams>({
    artist: '',
    genres: [],
    textures: [],
    instruments: [],
    vocalX: 0,
    vocalY: 0
  });

  // AI実行関数
  const handleAiAction = async (type: 'lyrics' | 'hiragana' | 'analyze') => {
    setIsProcessing(true);
    setStatus('AIが思考中...');
    try {
      if (type === 'lyrics') {
        const res = await generateLyrics(originalText);
        if (res) setOriginalText(res);
      } else if (type === 'hiragana') {
        const res = await convertToHiragana(originalText);
        setOriginalText(res);
      } else if (type === 'analyze') {
        const res = await analyzeArtistStyle(artistName);
        if (res) setParams({ ...res, artist: artistName });
      }
      setStatus('完了しました');
    } catch (err) {
      setStatus('エラーが発生しました');
      console.error(err);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatus(''), 3000);
    }
  };

  return (
    <div className={`min-h-screen w-full ${t.bgApp} flex flex-col font-sans text-slate-900`}>
      <header className="p-4 bg-white shadow-md flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-black text-2xl text-orange-600 tracking-tighter">SUNO ASSISTANT PRO</h1>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setMode('lyrics')} className={`px-6 py-2 rounded-lg font-bold ${mode === 'lyrics' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}>制作</button>
          <button onClick={() => setMode('chat')} className={`px-6 py-2 rounded-lg font-bold ${mode === 'chat' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}>相談</button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-8">
        {status && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl animate-bounce">
            {status}
          </div>
        )}

        {mode === 'lyrics' ? (
          <>
            {/* 歌詞セクション */}
            <section className="bg-white rounded-3xl p-8 shadow-2xl border border-orange-100 transition-all">
              <h2 className="text-xs font-black text-slate-400 mb-4 tracking-widest uppercase">Lyrics Editor</h2>
              <textarea 
                className="w-full h-64 p-6 bg-slate-50 rounded-2xl border-none focus:ring-4 focus:ring-orange-200 text-xl leading-relaxed transition-all"
                placeholder="ここに歌詞を入力、またはキーワードを入力..."
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button 
                  disabled={isProcessing}
                  onClick={() => handleAiAction('hiragana')}
                  className="bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-slate-800 active:scale-95 disabled:opacity-50 transition-all"
                >ひらがな変換</button>
                <button 
                  disabled={isProcessing}
                  onClick={() => handleAiAction('lyrics')}
                  className="bg-orange-500 text-white font-black py-5 rounded-2xl hover:bg-orange-600 shadow-lg shadow-orange-200 active:scale-95 disabled:opacity-50 transition-all"
                >AI歌詞生成</button>
              </div>
            </section>

            {/* アーティスト分析セクション */}
            <section className="bg-white rounded-3xl p-8 shadow-2xl border border-orange-100">
              <h2 className="text-xs font-black text-slate-400 mb-4 tracking-widest uppercase">Style Analyzer</h2>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  className="flex-1 p-4 bg-slate-50 rounded-2xl border-none text-lg focus:ring-4 focus:ring-orange-200"
                  placeholder="例: Vaundy, Mrs. GREEN APPLE..."
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                />
                <button 
                  disabled={isProcessing}
                  onClick={() => handleAiAction('analyze')}
                  className="bg-slate-200 px-8 font-black rounded-2xl hover:bg-slate-300 transition-all"
                >分析実行</button>
              </div>
              {params.genres.length > 0 && (
                <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <p className="text-sm font-bold text-orange-800">分析結果:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {params.genres.map(g => <span key={g} className="bg-white px-3 py-1 rounded-full text-xs font-bold border border-orange-200">{g}</span>)}
                    {params.instruments.map(i => <span key={i} className="bg-white px-3 py-1 rounded-full text-xs font-bold border border-orange-200 text-blue-600">{i}</span>)}
                  </div>
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="h-96 flex flex-col items-center justify-center bg-white rounded-3xl shadow-inner">
            <span className="text-6xl mb-4">💬</span>
            <p className="text-slate-400 font-bold">チャット相談モード・アップデート中</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
