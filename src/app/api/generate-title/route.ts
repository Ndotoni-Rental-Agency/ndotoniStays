import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'AI title generation is not configured' },
      { status: 500 }
    );
  }

  try {
    const { propertyType, district, region, maxGuests, currency, nightlyRate } = await request.json();

    const prompt = `Generate a short, catchy property listing title for a vacation rental in Tanzania. 

Property details:
- Type: ${propertyType || 'Hotel'}
- Location: ${district || region || 'Dar es Salaam'}
- Max guests: ${maxGuests || 2}
${nightlyRate ? `- Nightly rate: ${currency || 'TZS'} ${nightlyRate}` : ''}

Rules:
- Keep it under 60 characters
- Make it appealing to travelers
- Mention the location or area
- Can be in English or Swahili (prefer English)
- Do NOT use quotes around the title
- Just return the title text, nothing else`;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to generate title' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const title = data.content?.[0]?.text?.trim() || '';

    return NextResponse.json({ title });
  } catch (error) {
    console.error('Title generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate title' },
      { status: 500 }
    );
  }
}
