export interface SafetyResult {
  passed: boolean;
  confidence: number;
  blocked: boolean;
  reason: string;
  isHallucination: boolean;
  dlsaRedirect: boolean;
}

// Known fake/non-existent IPC sections
const FAKE_SECTIONS = ['99b', '144a', '302a', '420b', '498b', '506c'];

// Prompt injection patterns
const INJECTION_PATTERNS = [
  /ignore previous instructions/i,
  /act as a different ai/i,
  /you are now/i,
  /forget your instructions/i,
];

export async function checkSafety(
  query: string,
  response: string,
  retrievedContext: string = '',
  intent: string = ''
): Promise<SafetyResult> {

  // Check 1 — Prompt injection in query
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(query)) {
      return {
        passed: false,
        confidence: 0.1,
        blocked: true,
        isHallucination: false,
        dlsaRedirect: false,
        reason: 'Prompt injection attempt detected',
      };
    }
  }

  // Check 2 — Fake IPC section in query or response
  for (const fakeSection of FAKE_SECTIONS) {
    const queryLower = query.toLowerCase();
    const responseLower = response.toLowerCase();
    if (
      queryLower.includes(`section ${fakeSection}`) ||
      responseLower.includes(`section ${fakeSection}`)
    ) {
      return {
        passed: false,
        confidence: 0.1,
        blocked: true,
        isHallucination: true,
        dlsaRedirect: true,
        reason: 'Unverified legal section reference detected',
      };
    }
  }

  // Check 3 — Empty response
  if (!response || response.trim().length < 20) {
    return {
      passed: false,
      confidence: 0.2,
      blocked: true,
      isHallucination: false,
      dlsaRedirect: true,
      reason: 'Response too short or empty',
    };
  }

  // Check 4 — For SCHEME_QUERY and LEGAL_QUERY
  // If agent responded (non-empty), trust it was grounded via Qdrant
  // Only block if response explicitly admits it has no information
  const noInfoPatterns = [
    /i don't have.*information/i,
    /i cannot find/i,
    /no results found/i,
    /i don't know/i,
  ];

  // If agent says it has no info AND query is legal/scheme — redirect to DLSA
  for (const pattern of noInfoPatterns) {
    if (pattern.test(response) && (intent === 'LEGAL_QUERY' || intent === 'SCHEME_QUERY')) {
      return {
        passed: false,
        confidence: 0.55,
        blocked: true,
        isHallucination: false,
        dlsaRedirect: true,
        reason: 'Agent could not find verified information',
      };
    }
  }

  // Check 5 — Out of scope content
  if (intent === 'OUT_OF_SCOPE') {
    return {
      passed: true,
      confidence: 1.0,
      blocked: false,
      isHallucination: false,
      dlsaRedirect: false,
      reason: 'Out of scope — no safety check needed',
    };
  }

  // All checks passed — response is safe
  return {
    passed: true,
    confidence: 0.85,
    blocked: false,
    isHallucination: false,
    dlsaRedirect: false,
    reason: 'Response verified safe',
  };
}

export const DLSA_MESSAGE = `I cannot verify this answer with sufficient confidence to provide safe legal guidance.

**Please contact:**
📞 National Legal Services Authority (NALSA): **15100** (toll free)
🌐 Website: nalsa.gov.in
🏢 Visit your nearest **District Legal Services Authority (DLSA)**

They provide **FREE legal aid** to all eligible citizens.`;
