import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
  }

  try {
    const { propertyType, district, region, maxGuests, bedrooms, bathrooms, amenities, userContext } = await request.json();

    const contextLine = userContext ? `\nAdditional context from the host: "${userContext}"\nFactor this into your pricing assessment.\n` : '';

    const prompt = `You are a pricing expert for short-term rental properties in Tanzania. 
Based on the following property details, suggest a competitive nightly rate in TZS.

Property details:
- Type: ${propertyType}
- Location: ${district}, ${region}
- Max guests: ${maxGuests || 2}
- Bedrooms: ${bedrooms || 1}
- Bathrooms: ${bathrooms || 1}
${amenities?.length ? `- Amenities: ${amenities.join(', ')}` : ''}
${contextLine}
Consider:
- Tanzania market rates for ${district || region}
- Property type and capacity
- Local demand patterns

Respond ONLY with valid JSON in this exact format (no other text):
{"suggestedPrice": 75000, "currency": "TZS", "reasoning": "Brief 1-sentence explanation", "range": {"min": 50000, "max": 100000}}`;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      return NextResponse.json({ error: 'Failed to predict price', details: errorText }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text?.trim() || '';

    try {
      // Strip markdown code blocks if present
      const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      return NextResponse.json(parsed);
    } catch {
      console.error('Failed to parse AI response:', text);
      return NextResponse.json({ error: 'Invalid AI response', details: text }, { status: 500 });
    }
  } catch (error) {
    console.error('Price prediction error:', error);
    return NextResponse.json({ error: 'Failed to predict price' }, { status: 500 });
  }
}
