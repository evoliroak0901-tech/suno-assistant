import React, { useState, useRef, useEffect } from 'react';
import { ChatSession as Chat } from "@google/generative-ai"; // ここを修正
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
// ... (以下は元のApp.tsxと同じですが、importエラーが消えるように調整済みです)
