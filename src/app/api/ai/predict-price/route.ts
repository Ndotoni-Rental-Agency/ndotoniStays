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

    const prompt = `You are a pricing analyst for Tanzania's short-term rental market (like Airbnb).
Suggest a competitive nightly rate in TZS based on real market conditions.

Property details:
- Type: ${propertyType}
- Location: ${district}, ${region}
- Max guests: ${maxGuests || 2}
- Bedrooms: ${bedrooms || 1}
- Bathrooms: ${bathrooms || 1}
${amenities?.length ? `- Amenities: ${amenities.join(', ')}` : ''}
${contextLine}
TANZANIA SHORT-TERM RENTAL PRICING KNOWLEDGE (2024-2025):

PREMIUM AREAS (higher rates):
- Masaki, Oyster Bay, Peninsula: TZS 150,000-500,000+/night (expat/diplomat area, ocean proximity)
- Msasani, Mikocheni: TZS 80,000-250,000/night (upscale residential)
- Mbezi Beach, Kawe: TZS 60,000-200,000/night (beach access)
- Zanzibar (Stone Town, Nungwi, Paje): TZS 100,000-400,000/night (tourism premium)

MID-RANGE AREAS:
- Kinondoni, Sinza, Kijitonyama: TZS 40,000-120,000/night
- Kimara, Ubungo, Tegeta: TZS 30,000-80,000/night
- Arusha city center: TZS 50,000-150,000/night

BUDGET AREAS:
- Temeke, Ilala, Manzese: TZS 20,000-60,000/night
- Peripheral areas: TZS 15,000-40,000/night

PROPERTY TYPE MULTIPLIERS:
- Villa with pool: 2-3x base rate
- Hotel room: 0.7-1x base rate
- Entire apartment: 1-1.5x base rate
- Private room: 0.4-0.6x apartment rate
- Studio: 0.6-0.8x apartment rate
- Lodge (safari/nature): 1.5-3x depending on experience

AMENITY PREMIUMS:
- Swimming pool: +30-50%
- Ocean/beach view: +20-40%
- Generator/reliable power: +10-15%
- Hot water: +5-10%
- Security/gated: +5-10%

CAPACITY RULES:
- Base rate covers 2 guests
- Each additional guest capacity: +10-15% on the rate
- Family-sized (4+ bedrooms): premium for group travel

IMPORTANT:
- Never suggest below TZS 15,000/night (below market even for budget)
- Never suggest above TZS 1,000,000/night unless truly luxury with pool + ocean + 4+ bedrooms
- Round to nearest 5,000 TZS
- The suggested price should be what a host can ACTUALLY charge and get bookings

Respond ONLY with valid JSON in this exact format (no other text):
{"suggestedPrice": 75000, "currency": "TZS", "reasoning": "Brief 1-sentence explanation of why this price fits", "range": {"min": 50000, "max": 100000}}`;

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
