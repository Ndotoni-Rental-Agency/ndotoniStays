import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
  }

  try {
    const { title, propertyType, district, region, maxGuests, nightlyRate, currency, amenities, userContext } = await request.json();

    const contextLine = userContext ? `\nAdditional context from the host: "${userContext}"\nIncorporate these details into the description.\n` : '';

    const prompt = `Write a short, appealing property description for a vacation rental listing in Tanzania.

Property details:
- Title: ${title}
- Type: ${propertyType}
- Location: ${district}, ${region}
- Max guests: ${maxGuests || 2}
${nightlyRate ? `- Price: ${currency || 'TZS'} ${nightlyRate}/night` : ''}
${amenities?.length ? `- Amenities: ${amenities.join(', ')}` : ''}
${contextLine}
Rules:
- Keep it 2-3 sentences (under 200 characters)
- Highlight the best features and location
- Make it sound welcoming and professional
- Can mix English and Swahili naturally
- Just return the description text, nothing else`;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 });
    }

    const data = await response.json();
    const description = data.content?.[0]?.text?.trim() || '';

    return NextResponse.json({ description });
  } catch (error) {
    console.error('Description generation error:', error);
    return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 });
  }
}
