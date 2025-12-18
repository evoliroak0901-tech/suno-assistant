
import React, { useState } from 'react';
import { SUNO_TAGS, THEMES } from '../constants';
import { Button } from './Button';
import { ThemeColor } from '../types';

interface TagPanelProps {
  onInsertTag: (tag: string) => void;
  themeColor: ThemeColor;
}

export const TagPanel: React.FC<TagPanelProps> = ({ onInsertTag, themeColor }) => {
  const t = THEMES[themeColor];
  const [customTag, setCustomTag] = useState("");

  // Map category names to Japanese for display
  const getCategoryName = (name: string) => {
      switch(name) {
          case "Structure": return "構成 (Structure)";
          case "Vocals": return "ボーカル (Vocals)";
          case "Instruments": return "楽器 (Instruments)";
          case "Mood & Speed": return "ムード・速度 (Mood)";
          default: return name;
      }
  };

  const handleAddCustom = () => {
    if (customTag.trim()) {
        const val = customTag.startsWith('[') && customTag.endsWith(']') ? customTag : `[${customTag}]`;
        onInsertTag(val);
        setCustomTag("");
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto ${t.bgPanel} border-t-4 ${t.borderStrong.replace('border-', 'border-opacity-50 ')} p-2 pb-8`}>
      {/* Insertion Guide */}
      <div className="flex items-center justify-center gap-2 mb-3 opacity-70">
        <div className={`h-px w-8 ${t.bgApp.replace('bg-', 'bg-slate-400 ')}`}></div>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            カーソル位置にタグ挿入
        </span>
        <div className={`h-px w-8 ${t.bgApp.replace('bg-', 'bg-slate-400 ')}`}></div>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        {/* Custom Input */}
        <div className="flex gap-2 mb-4 px-1">
             <input 
                type="text" 
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                placeholder="カスタムタグ (例: Ad-lib)"
                className="flex-1 px-3 py-1 text-base border border-gray-300 rounded outline-none focus:border-orange-500"
             />
             <Button variant="secondary" onClick={handleAddCustom} themeColor={themeColor} className="h-full py-1">
                 ＋
             </Button>
        </div>

        {SUNO_TAGS.map((category) => (
          <div key={category.name} className="space-y-2">
            <h3 className={`text-xs font-bold ${t.textSecondary} uppercase tracking-wider ml-1 opacity-70`}>
              {getCategoryName(category.name)}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.tags.map((tag) => (
                <Button
                  key={tag.value}
                  variant="tag"
                  themeColor={themeColor}
                  onClick={() => onInsertTag(tag.value)}
                  className="flex-grow md:flex-grow-0"
                >
                  {tag.label}
                </Button>
              ))}
            </div>
          </div>
        ))}
        {/* Safe area at bottom */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};
