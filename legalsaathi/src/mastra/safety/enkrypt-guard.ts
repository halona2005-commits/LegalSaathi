const ENKRYPT_BASE_URL = 'https://api.enkryptai.com';

interface EnkryptResult {
  passed: boolean;
  isHallucination: boolean;
  confidence: number;
  blocked: boolean;
  reason: string;
}

export async function checkHallucination(
  query: string,
  response: string,
  context: string = ''
): Promise<EnkryptResult> {
  try {
    const res = await fetch(`${ENKRYPT_BASE_URL}/guardrails/hallucination`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.ENKRYPT_API_KEY!,
      },
      body: JSON.stringify({
        request_text: query,
        response_text: response,
        context: context,
      }),
    });

    if (!res.ok) {
      console.error('Enkrypt API error:', res.status);
      // If Enkrypt fails, allow response through (fail open)
      return {
        passed: true,
        isHallucination: false,
        confidence: 0.5,
        blocked: false,
        reason: 'Enkrypt check failed — allowed through',
      };
    }

    const data = await res.json();
    console.log('Enkrypt response:', JSON.stringify(data));

    const isHallucination = data?.summary?.is_hallucination === 1;
    const confidence = isHallucination ? 0.3 : 0.9;

    return {
      passed: !isHallucination,
      isHallucination,
      confidence,
      blocked: isHallucination,
      reason: isHallucination
        ? 'Hallucination detected — response blocked'
        : 'Response verified safe',
    };

  } catch (error) {
    console.error('Enkrypt error:', error);
    // Fail open — allow through if Enkrypt is down
    return {
      passed: true,
      isHallucination: false,
      confidence: 0.5,
      blocked: false,
      reason: 'Enkrypt unavailable — allowed through',
    };
  }
}

export const DLSA_MESSAGE = `I cannot verify this answer with sufficient confidence.

For reliable legal help, please contact:
📞 National Legal Services Authority: 15100 (toll free)
🌐 Website: nalsa.gov.in
🏢 Visit your nearest District Legal Services Authority (DLSA)

They provide FREE legal aid to eligible citizens.`;
