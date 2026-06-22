import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
  }

  try {
    const { title, propertyType, district, region, maxGuests, nightlyRate, currency, amenities, userContext, language } = await request.json();

    const contextLine = userContext ? `\nAdditional context from the host: "${userContext}"\nIncorporate these details into the description.\n` : '';

    const languageInstruction = language === 'sw'
      ? `\nIMPORTANT: Write the description in SWAHILI (Kiswahili). Use natural, appealing Swahili that Tanzanian travelers would relate to. You may keep proper nouns and well-known English terms (e.g., "WiFi", "pool") as-is.\n`
      : `\nWrite the description in English.\n`;

    const prompt = `You are a professional short-term rental copywriter for the Tanzania market. Write a compelling property description that converts browsers into bookers.
${languageInstruction}
Property details:
- Title: ${title}
- Type: ${propertyType}
- Location: ${district}, ${region}
- Max guests: ${maxGuests || 2}
${nightlyRate ? `- Price: ${currency || 'TZS'} ${nightlyRate}/night` : ''}
${amenities?.length ? `- Amenities: ${amenities.join(', ')}` : ''}
${contextLine}
DESCRIPTION WRITING RULES:
- 2-3 sentences, maximum 250 characters
- First sentence: paint a picture — what's the EXPERIENCE like? (not just "This is a nice place")
- Second sentence: highlight 1-2 standout features or amenities
- Third sentence (optional): mention proximity to attractions, beaches, restaurants, or transport
- Use sensory language: "wake up to ocean breezes", "unwind on the private terrace", "steps from the beach"
- Be SPECIFIC to the location — mention real nearby landmarks, beaches, or neighborhoods
- Match tone to property type:
  • Luxury (Villa/Resort): sophisticated, exclusive
  • Budget (Room/Hostel): practical, clean, convenient
  • Mid-range (Apartment/House): comfortable, well-equipped, homey
  • Nature (Lodge/Cottage): tranquil, scenic, escape

DO NOT:
- Start with "Welcome to..." or "This is a..." (boring openings)
- List amenities as a sentence ("It has WiFi, AC, and parking")
- Use superlatives you can't prove ("best view in Dar")
- Mention the host or "we"

GOOD EXAMPLES:
- "A sun-drenched penthouse where city skyline meets ocean horizon. Fully equipped kitchen, fast WiFi, and a rooftop lounge perfect for sundowners. Five minutes from Slipway and Oyster Bay restaurants."
- "Your private beach escape — fall asleep to the sound of waves and wake up steps from white sand. Two spacious bedrooms, outdoor shower, and a hammock garden."

Just return the description text, nothing else.`;

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
      return NextResponse.json({ error: 'Failed to generate description', details: errorText }, { status: 500 });
    }

    const data = await response.json();
    const description = data.content?.[0]?.text?.trim() || '';

    return NextResponse.json({ description });
  } catch (error) {
    console.error('Description generation error:', error);
    return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 });
  }
}
