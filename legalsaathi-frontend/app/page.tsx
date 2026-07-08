'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import EmptyState from '@/components/EmptyState';
import { ToastContainer } from '@/components/Toast';
import { MessageSkeleton } from '@/components/SkeletonLoader';
import { useToast } from '@/hooks/useToast';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
  intent?: string;
  agentUsed?: string;
  confidence?: number;
  timestamp?: Date;
}

type Language = 'en' | 'hi';

// ─── UI Text ──────────────────────────────────────────────────────────────────
const UI_TEXT = {
  en: {
    subtitle:       'AI Legal Aid · Rural India · 10+ Languages',
    online:         'Online',
    clear:          'Clear chat',
    confirmClear:   'Confirm?',
    placeholder:    'Ask in Hindi or English...',
    send:           'Send',
    footer:         'Powered by Mastra · Qdrant · Enkrypt AI · Enter to send · Shift+Enter for new line',
    thinking:       'LegalSaathi is thinking...',
    copy:           'Copy',
    copied:         'Copied!',
    retry:          '🔄 Retry last message',
    agentLabel:     'LegalSaathi',
    confidence:     'confidence',
    voiceStart:     'Start voice input',
    voiceStop:      'Stop recording',
    voiceListening: 'Listening...',
    langToast:      'English mode activated',
  },
  hi: {
    subtitle:       'AI कानूनी सहायता · ग्रामीण भारत · 10+ भाषाएं',
    online:         'ऑनलाइन',
    clear:          'साफ करें',
    confirmClear:   'पक्का?',
    placeholder:    'हिंदी या अंग्रेज़ी में पूछें...',
    send:           'भेजें',
    footer:         'Mastra · Qdrant · Enkrypt AI द्वारा संचालित · भेजने के लिए Enter दबाएं',
    thinking:       'LegalSaathi सोच रहा है...',
    copy:           'कॉपी',
    copied:         'कॉपी हो गया!',
    retry:          '🔄 फिर से भेजें',
    agentLabel:     'LegalSaathi',
    confidence:     'विश्वास',
    voiceStart:     'बोलकर पूछें',
    voiceStop:      'रिकॉर्डिंग बंद करें',
    voiceListening: 'सुन रहा हूं...',
    langToast:      'हिंदी मोड सक्रिय',
  },
};

// ─── Constants ────────────────────────────────────────────────────────────────
const WELCOME: Record<Language, string> = {
  en: 'Namaste! 🙏 I am LegalSaathi. Ask me about your legal rights, government schemes, or get help drafting an RTI application — in Hindi or English.',
  hi: 'Namaste! 🙏 Main LegalSaathi hoon. Apne kanooni adhikar, sarkari yojanaon ke baare mein poochhen, ya RTI application banane mein madad lein — Hindi ya English mein.',
};

const AGENT_LABELS: Record<string, { label: string; color: string }> = {
  SchemeAgent:   { label: 'Scheme Agent',   color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  LegalAgent:    { label: 'Legal Agent',    color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  DocumentAgent: { label: 'Document Agent', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  none:          { label: 'General',        color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
};

const LANG_KEY = 'legalsaathi-lang';
const LANG_CODES: Record<Language, string> = { en: 'en-IN', hi: 'hi-IN' };
const CHAR_LIMIT = 500;

// ─── Voice Button ─────────────────────────────────────────────────────────────
function VoiceButton({ lang, onResult, disabled, t }: {
  lang: Language;
  onResult: (text: string) => void;
  disabled: boolean;
  t: typeof UI_TEXT['en'];
}) {
  const [listening, setListening]   = useState(false);
  const [supported, setSupported]   = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SR = (window as typeof window & { webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
             ?? (window as typeof window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) setSupported(false);
  }, []);

  // Stop when language changes
  useEffect(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const toggleVoice = () => {
    if (!supported) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SR = (window as typeof window & { webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
             ?? (window as typeof window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = LANG_CODES[lang];
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart  = () => setListening(true);
    rec.onerror  = () => setListening(false);
    rec.onend    = () => setListening(false);
    rec.onresult = (e: SpeechRecognitionEvent) => {
      onResult(e.results[0][0].transcript);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  if (!supported) return null;

  return (
    <button
      onClick={toggleVoice}
      disabled={disabled}
      aria-label={listening ? t.voiceStop : t.voiceStart}
      title={listening ? t.voiceStop : t.voiceStart}
      className={`
        flex-shrink-0 rounded-xl px-3 py-3 transition-all duration-200
        cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
        ${listening
          ? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/40 animate-pulse'
          : 'bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-gray-500'}
      `}
    >
      {listening ? (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
    </button>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────────
function TypingIndicator({ t }: { t: typeof UI_TEXT['en'] }) {
  return (
    <div className="flex justify-start message-in" role="status" aria-label={t.thinking}>
      <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
        <span className="typing-dot w-2 h-2 rounded-full bg-green-400 inline-block" aria-hidden="true" />
        <span className="typing-dot w-2 h-2 rounded-full bg-green-400 inline-block" aria-hidden="true" />
        <span className="typing-dot w-2 h-2 rounded-full bg-green-400 inline-block" aria-hidden="true" />
        <span className="text-green-400 text-xs ml-1">{t.thinking}</span>
      </div>
    </div>
  );
}

function AgentBadge({ agentUsed, confidence, t }: {
  agentUsed?: string;
  confidence?: number;
  t: typeof UI_TEXT['en'];
}) {
  if (!agentUsed || agentUsed === 'none') return null;
  const meta = AGENT_LABELS[agentUsed] ?? AGENT_LABELS['none'];
  return (
    <div className="flex items-center gap-2 mt-2 flex-wrap">
      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${meta.color}`}>
        ⚡ {meta.label}
      </span>
      {confidence !== undefined && confidence > 0 && (
        <span className="text-xs text-gray-500">
          {Math.round(confidence * 100)}% {t.confidence}
        </span>
      )}
    </div>
  );
}

function CopyButton({ text, t }: { text: string; t: typeof UI_TEXT['en'] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? t.copied : t.copy}
      title={copied ? t.copied : t.copy}
      className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-green-400 transition-colors duration-150 cursor-pointer"
    >
      {copied ? (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {t.copied}
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {t.copy}
        </>
      )}
    </button>
  );
}

function MessageBubble({ msg, t }: { msg: Message; t: typeof UI_TEXT['en'] }) {
  const isUser  = msg.role === 'user';
  const isError = msg.role === 'error';
  const time = msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isUser) {
    return (
      <div className="flex justify-end message-in">
        <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[65%]">
          <div
            className="bg-green-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-md"
            role="article" aria-label="Your message"
          >
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
          </div>
          {time && <p className="text-xs text-gray-600 mt-1 text-right">{time}</p>}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-start message-in">
        <div
          className="max-w-[85%] sm:max-w-[75%] md:max-w-[65%] bg-red-950 border border-red-800 rounded-2xl rounded-tl-sm px-4 py-3"
          role="alert"
        >
          <p className="text-sm text-red-300">⚠️ {msg.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start message-in">
      <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[65%]">
        <div className="flex items-center gap-2 mb-1.5">
          <div
            className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0"
            aria-hidden="true"
          >
            <span className="text-xs">⚖</span>
          </div>
          <span className="text-xs text-gray-500 font-medium">{t.agentLabel}</span>
          {time && <span className="text-xs text-gray-600">{time}</span>}
        </div>
        <div
          className="bg-gray-800 border border-gray-700 text-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md"
          role="article" aria-label="LegalSaathi response"
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
          <AgentBadge agentUsed={msg.agentUsed} confidence={msg.confidence} t={t} />
        </div>
        <CopyButton text={msg.content} t={t} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const [messages, setMessages]           = useState<Message[]>([]);
  const [input, setInput]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [lang, setLang]                   = useState<Language>('en');
  const [retryMessage, setRetryMessage]   = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const { toasts, addToast, removeToast } = useToast();

  const t = UI_TEXT[lang];

  // Restore saved language
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY) as Language | null;
      if (saved === 'en' || saved === 'hi') setLang(saved);
    } catch { /* ignore */ }
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Reset messages on lang change
  useEffect(() => {
    setMessages([{ role: 'assistant', content: WELCOME[lang], timestamp: new Date() }]);
    setRetryMessage(null);
  }, [lang]);

  const handleSetLang = (newLang: Language) => {
    if (newLang === lang) return;
    setLang(newLang);
    addToast(UI_TEXT[newLang].langToast, 'info', 2000);
    try { localStorage.setItem(LANG_KEY, newLang); } catch { /* ignore */ }
  };

  const handleClearChat = () => {
    if (showClearConfirm) {
      setMessages([{ role: 'assistant', content: WELCOME[lang], timestamp: new Date() }]);
      setRetryMessage(null);
      setInput('');
      setShowClearConfirm(false);
      addToast(lang === 'hi' ? 'चैट साफ हो गई' : 'Chat cleared', 'info', 2000);
      inputRef.current?.focus();
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    setInput('');
    setRetryMessage(null);
    setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date() }]);
    setLoading(true);

    try {
      const res  = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text, lang }),
      });

      const data = await res.json();

      if (res.status === 429) {
        const msg = data.error ?? '⏳ Rate limit reached. Please wait a moment.';
        addToast(msg, 'warning', 5000);
        setMessages(prev => [...prev, { role: 'error', content: msg, timestamp: new Date() }]);
        setRetryMessage(text);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error ?? `Server error (${res.status})`);
      }

      const reply = data.reply || 'Sorry, I could not process that. Please try again.';
      setMessages(prev => [...prev, {
        role:      'assistant',
        content:   reply,
        intent:    data.intent,
        agentUsed: data.agentUsed,
        confidence: data.confidence,
        timestamp: new Date(),
      }]);

      if (data.agentUsed && data.agentUsed !== 'none') {
        const label = AGENT_LABELS[data.agentUsed]?.label ?? data.agentUsed;
        addToast(`✅ Answered by ${label}`, 'success', 2500);
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Connection error.';
      addToast('Connection failed. Please check your internet.', 'error');
      setMessages(prev => [...prev, {
        role:    'error',
        content: `${message} Please check your connection and try again.`,
        timestamp: new Date(),
      }]);
      setRetryMessage(text);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, loading, lang, addToast]);

  const handleVoiceResult = (transcript: string) => {
    setInput(prev => prev ? `${prev} ${transcript}` : transcript);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isWelcomeScreen =
    messages.length === 1 &&
    messages[0].role === 'assistant' &&
    messages[0].content === WELCOME[lang];

  const charCount = input.length;

  return (
    <main className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">

      {/* ── Toasts ────────────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 bg-gray-900 border-b border-gray-800 px-4 py-3" role="banner">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">

          {/* Logo + title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-green-600 flex items-center justify-center text-base sm:text-lg shadow-lg flex-shrink-0"
              aria-hidden="true"
            >⚖</div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-white leading-tight">LegalSaathi</h1>
              <p className="text-xs text-gray-500 leading-tight hidden sm:block">{t.subtitle}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Online pill */}
            <div className="hidden md:flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
              <span className="text-xs text-gray-400">{t.online}</span>
            </div>

            {/* Clear chat */}
            <button
              onClick={handleClearChat}
              aria-label={showClearConfirm ? t.confirmClear : t.clear}
              className={`text-xs px-2 sm:px-3 py-1.5 rounded-lg border font-medium transition-all duration-200 cursor-pointer ${
                showClearConfirm
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-700'
              }`}
            >
              {showClearConfirm ? t.confirmClear : t.clear}
            </button>

            {/* Language toggle */}
            <div
              className="flex items-center bg-gray-800 rounded-lg p-0.5 border border-gray-700"
              role="group" aria-label="Language selection"
            >
              {(['en', 'hi'] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => handleSetLang(l)}
                  aria-pressed={lang === l}
                  aria-label={l === 'en' ? 'Switch to English' : 'Switch to Hindi'}
                  className={`text-xs px-2 sm:px-3 py-1.5 rounded-md font-medium transition-all duration-200 cursor-pointer ${
                    lang === l ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {l === 'en' ? 'EN' : 'हिं'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Messages ──────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto"
        role="log" aria-label="Chat messages" aria-live="polite"
      >
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5">

          {isWelcomeScreen ? (
            <EmptyState lang={lang} onSuggestion={text => sendMessage(text)} />
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} t={t} />
              ))}
            </>
          )}

          {loading && (
            <>
              <TypingIndicator t={t} />
              <MessageSkeleton />
            </>
          )}

          {retryMessage && !loading && (
            <div className="flex justify-center message-in">
              <button
                onClick={() => sendMessage(retryMessage)}
                aria-label="Retry sending last message"
                className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full px-4 py-2 transition-all duration-200 cursor-pointer"
              >
                {t.retry}
              </button>
            </div>
          )}

          <div ref={bottomRef} aria-hidden="true" />
        </div>
      </div>

      {/* ── Input ─────────────────────────────────────────────────── */}
      <footer
        className="flex-shrink-0 bg-gray-900 border-t border-gray-800 px-3 sm:px-4 py-3"
        role="contentinfo"
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 items-end">

            {/* Voice */}
            <VoiceButton lang={lang} onResult={handleVoiceResult} disabled={loading} t={t} />

            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value.slice(0, CHAR_LIMIT))}
                onKeyDown={handleKeyDown}
                placeholder={t.placeholder}
                rows={1}
                disabled={loading}
                aria-label="Message input"
                aria-describedby="input-hint"
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 pr-12 text-sm outline-none border border-gray-700 focus:border-green-500 disabled:opacity-50 resize-none overflow-hidden leading-relaxed transition-colors duration-200"
                style={{ minHeight: '48px', maxHeight: '120px' }}
                onInput={e => {
                  const el = e.currentTarget;
                  el.style.height = 'auto';
                  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                }}
              />
              {charCount > 400 && (
                <span
                  className={`absolute bottom-2.5 right-3 text-xs tabular-nums ${
                    charCount >= CHAR_LIMIT ? 'text-red-400' : 'text-gray-500'
                  }`}
                  aria-live="polite"
                >
                  {CHAR_LIMIT - charCount}
                </span>
              )}
            </div>

            {/* Send */}
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="flex-shrink-0 bg-green-600 hover:bg-green-500 active:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 sm:px-5 py-3 text-sm font-semibold transition-all duration-150 shadow-md hover:shadow-green-900/40 cursor-pointer min-w-[60px] flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center gap-1" aria-hidden="true">
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
                </span>
              ) : t.send}
            </button>
          </div>

          <p id="input-hint" className="text-gray-600 text-xs mt-2 text-center select-none">
            {t.footer}
          </p>
        </div>
      </footer>
    </main>
  );
}