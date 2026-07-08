'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

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

// ─── Constants ────────────────────────────────────────────────────────────────
const SUGGESTIONS = {
  en: [
    'Am I eligible for PM-KISAN?',
    'MGNREGA wages not paid for 3 months',
    'How to file an RTI application?',
    'My land was acquired without notice',
  ],
  hi: [
    'PM-KISAN ke liye eligible hoon kya?',
    'MGNREGA mein 3 mahine se payment nahi mili',
    'RTI application kaise file karein?',
    'Zameen bina notice ke li gayi',
  ],
};

const AGENT_LABELS: Record<string, { label: string; color: string }> = {
  SchemeAgent:   { label: 'Scheme Agent',   color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  LegalAgent:    { label: 'Legal Agent',    color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  DocumentAgent: { label: 'Document Agent', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  none:          { label: 'General',        color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
};

const WELCOME: Record<Language, string> = {
  en: 'Namaste! 🙏 I am LegalSaathi. Ask me about your legal rights, government schemes, or get help drafting an RTI application — in Hindi or English.',
  hi: 'Namaste! 🙏 Main LegalSaathi hoon. Apne kanooni adhikar, sarkari yojanaon ke baare mein poochhen, ya RTI application banane mein madad lein — Hindi ya English mein.',
};

// ─── Subcomponents ────────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex justify-start message-in">
      <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="typing-dot w-2 h-2 rounded-full bg-green-400 inline-block" />
          <span className="typing-dot w-2 h-2 rounded-full bg-green-400 inline-block" />
          <span className="typing-dot w-2 h-2 rounded-full bg-green-400 inline-block" />
        </div>
        <span className="text-green-400 text-xs ml-2">LegalSaathi is thinking...</span>
      </div>
    </div>
  );
}

function AgentBadge({ agentUsed, confidence }: { agentUsed?: string; confidence?: number }) {
  if (!agentUsed || agentUsed === 'none') return null;
  const meta = AGENT_LABELS[agentUsed] ?? AGENT_LABELS['none'];
  return (
    <div className="flex items-center gap-2 mt-2 flex-wrap">
      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${meta.color}`}>
        ⚡ {meta.label}
      </span>
      {confidence !== undefined && confidence > 0 && (
        <span className="text-xs text-gray-500">
          {Math.round(confidence * 100)}% confidence
        </span>
      )}
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  const isError = msg.role === 'error';

  if (isUser) {
    return (
      <div className="flex justify-end message-in">
        <div className="max-w-[80%] md:max-w-[65%]">
          <div className="bg-green-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-lg">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
          </div>
          {msg.timestamp && (
            <p className="text-xs text-gray-600 mt-1 text-right">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-start message-in">
        <div className="max-w-[80%] md:max-w-[65%] bg-red-950 border border-red-800 rounded-2xl rounded-tl-sm px-4 py-3">
          <p className="text-sm text-red-300">⚠️ {msg.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start message-in">
      <div className="max-w-[80%] md:max-w-[65%]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
            <span className="text-xs">⚖</span>
          </div>
          <span className="text-xs text-gray-500 font-medium">LegalSaathi</span>
          {msg.timestamp && (
            <span className="text-xs text-gray-600">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <div className="bg-gray-800 border border-gray-700 text-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg">
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
          <AgentBadge agentUsed={msg.agentUsed} confidence={msg.confidence} />
        </div>
      </div>
    </div>
  );
}

function SuggestionChips({
  lang,
  onSelect,
}: {
  lang: Language;
  onSelect: (text: string) => void;
}) {
  return (
    <div className="px-4 pb-3">
      <p className="text-xs text-gray-500 mb-2 text-center">Try asking:</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {SUGGESTIONS[lang].map((s) => (
          <button
            key={s}
            onClick={() => onSelect(s)}
            className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-green-600 text-gray-300 hover:text-green-300 rounded-full px-3 py-1.5 transition-all duration-200 cursor-pointer"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Set welcome message when language changes
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: WELCOME[lang],
        timestamp: new Date(),
      },
    ]);
  }, [lang]);

  const sendMessage = useCallback(
    async (overrideText?: string) => {
      const text = (overrideText ?? input).trim();
      if (!text || loading) return;

      setInput('');
      setRetryMessage(null);

      const userMsg: Message = {
        role: 'user',
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, lang }),
        });

        const data = await res.json();

        // Handle quota / rate limit errors
        if (res.status === 429) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'error',
              content: data.error ?? 'Rate limit reached. Please wait a moment and try again.',
              timestamp: new Date(),
            },
          ]);
          setRetryMessage(text);
          return;
        }

        // Handle other errors
        if (!res.ok) {
          throw new Error(data.error ?? 'Server error');
        }

        // ✅ Fix: API returns `reply` not `response`
        const assistantMsg: Message = {
          role: 'assistant',
          content: data.reply || 'Sorry, I could not process that. Please try again.',
          intent: data.intent,
          agentUsed: data.agentUsed,
          confidence: data.confidence,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Connection error.';
        setMessages((prev) => [
          ...prev,
          {
            role: 'error',
            content: `${message} Please check your connection and try again.`,
            timestamp: new Date(),
          },
        ]);
        setRetryMessage(text);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [input, loading, lang]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showSuggestions = messages.length <= 1;
  const charLimit = 500;
  const charCount = input.length;

  return (
    <main className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {/* Left: Logo + title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-lg shadow-lg">
              ⚖
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">LegalSaathi</h1>
              <p className="text-xs text-gray-500 leading-tight">AI Legal Aid · Rural India · 10+ Languages</p>
            </div>
          </div>

          {/* Right: Status + Language toggle */}
          <div className="flex items-center gap-3">
            {/* Online indicator */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-400">Online</span>
            </div>

            {/* Language toggle */}
            <div className="flex items-center bg-gray-800 rounded-lg p-0.5 border border-gray-700">
              <button
                onClick={() => setLang('en')}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-200 cursor-pointer ${
                  lang === 'en'
                    ? 'bg-green-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-200 cursor-pointer ${
                  lang === 'hi'
                    ? 'bg-green-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                हिं
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Messages ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}

          {loading && <TypingIndicator />}

          {/* Retry button */}
          {retryMessage && !loading && (
            <div className="flex justify-center message-in">
              <button
                onClick={() => sendMessage(retryMessage)}
                className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full px-4 py-2 transition-all duration-200 cursor-pointer"
              >
                🔄 Retry last message
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Suggestion chips (shown only at start) ─────────────────── */}
      {showSuggestions && !loading && (
        <div className="flex-shrink-0 max-w-3xl mx-auto w-full">
          <SuggestionChips lang={lang} onSelect={(t) => sendMessage(t)} />
        </div>
      )}

      {/* ── Input area ─────────────────────────────────────────────── */}
      <footer className="flex-shrink-0 bg-gray-900 border-t border-gray-800 px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 items-end">
            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, charLimit))}
                onKeyDown={handleKeyDown}
                placeholder={
                  lang === 'hi'
                    ? 'Hindi ya English mein poochhen...'
                    : 'Ask in Hindi or English... e.g. PM-KISAN ke liye eligible hoon kya?'
                }
                rows={1}
                disabled={loading}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 pr-14 text-sm outline-none border border-gray-700 focus:border-green-500 disabled:opacity-50 resize-none overflow-hidden leading-relaxed transition-colors duration-200"
                style={{ minHeight: '48px', maxHeight: '120px' }}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.style.height = 'auto';
                  t.style.height = Math.min(t.scrollHeight, 120) + 'px';
                }}
              />
              {/* Char counter */}
              {charCount > 400 && (
                <span
                  className={`absolute bottom-2.5 right-3 text-xs ${
                    charCount >= charLimit ? 'text-red-400' : 'text-gray-500'
                  }`}
                >
                  {charLimit - charCount}
                </span>
              )}
            </div>

            {/* Send button */}
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="flex-shrink-0 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-green-900/50 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-1">
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
                </span>
              ) : (
                'Send'
              )}
            </button>
          </div>

          {/* Footer text */}
          <p className="text-gray-600 text-xs mt-2 text-center">
            Powered by Mastra · Qdrant · Enkrypt AI · Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </footer>
    </main>
  );
}