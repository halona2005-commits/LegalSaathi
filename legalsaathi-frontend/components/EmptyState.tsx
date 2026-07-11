'use client';

type Language = 'en' | 'hi' | 'kn';

interface EmptyStateProps {
  lang: Language;
  onSuggestion: (text: string) => void;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const suggestions: Record<Language, string[]> = {
  en: [
    'Am I eligible for PM-KISAN?',
    "My MGNREGA wages haven't been paid",
    'How do I file an RTI application?',
    'My land was acquired without notice',
  ],
  hi: [
    'PM-KISAN के लिए पात्र हूं क्या?',
    'MGNREGA का भुगतान नहीं मिला',
    'RTI आवेदन कैसे करें?',
    'मेरी जमीन बिना सूचना के ले ली गई',
  ],
  kn: [
    'PM-KISAN ಗೆ ಅರ್ಹನೇ?',
    'MGNREGA ವೇತನ ಸಿಕ್ಕಿಲ್ಲ',
    'RTI ಅರ್ಜಿ ಹೇಗೆ ಸಲ್ಲಿಸಬೇಕು?',
    'ನನ್ನ ಜಮೀನು ನೋಟಿಸ್ ಇಲ್ಲದೆ ತೆಗೆದುಕೊಳ್ಳಲಾಗಿದೆ',
  ],
};

const features: Record<Language, { icon: string; title: string; desc: string }[]> = {
  en: [
    { icon: '⚖️', title: 'Legal Rights',  desc: 'IPC, CrPC, BNS 2023' },
    { icon: '🌾', title: 'Govt Schemes',  desc: 'PM-KISAN, MGNREGA'   },
    { icon: '📄', title: 'RTI Generator', desc: 'Draft in minutes'     },
    { icon: '🎤', title: 'Voice Input',   desc: 'Hindi & regional'     },
  ],
  hi: [
    { icon: '⚖️', title: 'कानूनी अधिकार', desc: 'IPC, CrPC, BNS 2023' },
    { icon: '🌾', title: 'सरकारी योजनाएं', desc: 'PM-KISAN, MGNREGA'   },
    { icon: '📄', title: 'RTI सहायता',    desc: 'मिनटों में तैयार'     },
    { icon: '🎤', title: 'वॉइस असिस्टेंट', desc: 'हिंदी और क्षेत्रीय' },
  ],
  kn: [
    { icon: '⚖️', title: 'ಕಾನೂನು ಹಕ್ಕುಗಳು',  desc: 'IPC, CrPC, BNS 2023'    },
    { icon: '🌾', title: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು', desc: 'PM-KISAN, MGNREGA'      },
    { icon: '📄', title: 'RTI ಸಹಾಯ',          desc: 'ನಿಮಿಷಗಳಲ್ಲಿ ತಯಾರು'    },
    { icon: '🎤', title: 'ಧ್ವನಿ ಸಹಾಯಕ',       desc: 'ಕನ್ನಡ ಮತ್ತು ಪ್ರಾದೇಶಿಕ' },
  ],
};

const headings: Record<Language, {
  tagline: string;
  desc: string;
  tryText: string;
  poweredBy: string;
}> = {
  en: {
    tagline:   'AI Legal Action Engine',
    desc:      'Helping rural citizens understand legal rights, government schemes and generate legal documents — in their own language.',
    tryText:   'Try one of these questions',
    poweredBy: 'Powered by',
  },
  hi: {
    tagline:   'AI कानूनी कार्य इंजन',
    desc:      'ग्रामीण नागरिकों को उनकी भाषा में कानूनी अधिकार, सरकारी योजनाओं और कानूनी दस्तावेज़ों में सहायता।',
    tryText:   'इनमें से कोई प्रश्न पूछें',
    poweredBy: 'संचालित',
  },
  kn: {
    tagline:   'AI ಕಾನೂನು ಕ್ರಿಯಾ ಎಂಜಿನ್',
    desc:      'ಗ್ರಾಮೀಣ ನಾಗರಿಕರಿಗೆ ಅವರ ಭಾಷೆಯಲ್ಲಿ ಕಾನೂನು ಹಕ್ಕುಗಳು, ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಕಾನೂನು ದಾಖಲೆಗಳಲ್ಲಿ ಸಹಾಯ.',
    tryText:   'ಈ ಪ್ರಶ್ನೆಗಳಲ್ಲಿ ಒಂದನ್ನು ಪ್ರಯತ್ನಿಸಿ',
    poweredBy: 'ಇದರಿಂದ ಚಾಲಿತ',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function EmptyState({ lang, onSuggestion }: EmptyStateProps) {
  const h = headings[lang];

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 py-8">

      {/* Logo */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-green-600/20 border border-green-600/40 flex items-center justify-center shadow-xl shadow-green-900/20 mb-6">
        <span className="text-4xl sm:text-5xl" aria-hidden="true">⚖️</span>
      </div>

      {/* Heading */}
      <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
        LegalSaathi
      </h1>
      <p className="mt-2 text-green-400 font-semibold text-sm sm:text-base">
        {h.tagline}
      </p>
      <p className="mt-4 text-gray-400 max-w-lg text-center leading-7 text-sm sm:text-base">
        {h.desc}
      </p>

      {/* Feature cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 w-full max-w-2xl">
        {features[lang].map(item => (
          <div
            key={item.title}
            className="rounded-2xl border border-gray-800 bg-gray-900 hover:border-green-600/60 hover:bg-gray-800/80 transition-all duration-300 p-4 text-center group"
          >
            <div className="text-2xl sm:text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
              {item.icon}
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-white leading-tight">
              {item.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Suggestion chips */}
      <div className="mt-10 w-full max-w-2xl">
        <p className="text-center text-gray-500 text-sm mb-4">
          {h.tryText}
        </p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {suggestions[lang].map(question => (
            <button
              key={question}
              onClick={() => onSuggestion(question)}
              className="rounded-full border border-gray-700 bg-gray-800 hover:bg-green-700 hover:border-green-500 px-4 py-2 text-xs sm:text-sm text-gray-200 hover:text-white transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Powered by */}
      <div className="mt-12 text-center">
        <p className="text-xs text-gray-600 mb-2">{h.poweredBy}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {['Mastra', 'Qdrant', 'Enkrypt AI'].map(name => (
            <span
              key={name}
              className="rounded-full bg-gray-800 border border-gray-700 px-3 py-1 text-xs text-gray-400"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}