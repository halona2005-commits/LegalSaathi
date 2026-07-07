# ⚖️ LegalSaathi — AI Legal Aid Agent for Rural India


## The Problem

**330 million+ rural Indians have zero access to affordable legal help.**

- 1 lawyer for every 5,000 rural citizens
- A single legal consultation costs ₹500–₹2,000 — prohibitive for daily wage earners
- Most legal documents are in English or complex Hindi — alienating non-English speakers
- Citizens are unaware of critical rights and schemes like PM-KISAN, MGNREGA, and RTI
- The result: land loss, wrongful imprisonment, and denial of life-saving government benefits

---

## 💡 The Solution

LegalSaathi is a **production-grade AI Legal Action Engine** — not just a chatbot.

It helps rural Indians:
- ✅ Understand their legal rights in their own language
- ✅ Check government scheme eligibility instantly
- ✅ Generate RTI applications and legal complaints as PDFs
- ✅ Scan government documents and detect illegal clauses
- ✅ Access legal help via WhatsApp — no app download needed

---

## 🏗️ Architecture — 5 Layers

```
┌─────────────────────────────────────────────────┐
│        Layer 1 — User Interface (Blue)          │
│  Web Browser │ WhatsApp API │ Mobile PWA        │
│  Voice Input │ IndicTrans2 │ 10+ Languages      │
└─────────────────────┬───────────────────────────┘
                      │ User Query
┌─────────────────────▼───────────────────────────┐
│    Layer 2 — Mastra Agent Orchestration (Purple)│
│  Intent Router → SchemeAgent / LegalAgent /     │
│  DocumentAgent │ Mastra Memory │ Workflow Engine │
└─────────────────────┬───────────────────────────┘
                      │ Retrieve Context
┌─────────────────────▼───────────────────────────┐
│    Layer 3 — Qdrant Vector Memory (Green)       │
│  IPC & CrPC │ Govt Schemes │ Land Laws          │
│  RTI Templates │ text-embedding-3-small         │
└─────────────────────┬───────────────────────────┘
                      │ Validate
┌─────────────────────▼───────────────────────────┐
│    Layer 4 — Enkrypt AI Safety (Yellow)         │
│  Hallucination Detector │ Confidence Scorer     │
│  PII Filter │ DLSA Redirector │ Eval Pipeline   │
└─────────────────────┬───────────────────────────┘
                      │ Fetch Live Data
┌─────────────────────▼───────────────────────────┐
│    Layer 5 — External Integrations (Pink)       │
│  MyScheme.gov.in │ India Code API │ DLSA        │
│  Twilio │ GPT-4o / Claude                       │
└─────────────────────────────────────────────────┘
                      │
              Verified Safe Response
                      │
                   👨‍🌾 User
```


## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, TypeScript |
| Agent Framework | Mastra |
| Vector Database | Qdrant |
| Safety & Guardrails | Enkrypt AI |
| Multilingual AI | IndicTrans2 (AI4Bharat) |
| Voice Input | Web Speech API |
| OCR | Tesseract.js |
| Session Memory | Redis + Mastra Memory |
| WhatsApp | Twilio + WhatsApp Business API |
| LLM | GPT-4o / Claude |

---

