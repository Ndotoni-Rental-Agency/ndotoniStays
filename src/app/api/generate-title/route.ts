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
    const { propertyType, district, region, maxGuests, bedrooms, bathrooms, stayCategories, currency, nightlyRate, userContext, language } = await request.json();

    const contextLine = userContext ? `\nAdditional context from the host: "${userContext}"\nUse this to make the title more specific and relevant.\n` : '';

    const categoryLine = stayCategories?.length
      ? `- Categories: ${stayCategories.join(', ')}`
      : '';

    const languageInstruction = language === 'sw'
      ? `\nIMPORTANT: Write the title in SWAHILI (Kiswahili). Use natural Swahili that Tanzanian travelers would find appealing. You may mix in common English words that are widely used in Tanzania (e.g., "Beach", "Pool", "View") if they sound natural.\n`
      : `\nIMPORTANT: Write the title in ENGLISH.\n`;

    const prompt = `You are a top-tier vacation rental copywriter specializing in Tanzania's short-term rental market.
Generate an irresistible property listing title that makes travelers immediately want to book.
${languageInstruction}
Property details:
- Type: ${propertyType || 'Hotel'}
- Location: ${district || region || 'Dar es Salaam'}
- Max guests: ${maxGuests || 2}
- Bedrooms: ${bedrooms || 1}
- Bathrooms: ${bathrooms || 1}
${categoryLine}
${nightlyRate ? `- Nightly rate: ${currency || 'TZS'} ${nightlyRate}` : ''}
${contextLine}
TITLE WRITING RULES:
- Maximum 60 characters
- Lead with the most compelling feature or feeling (not generic "Beautiful" or "Nice")
- Include the specific area/neighborhood — travelers search by location
- Use power words that evoke emotion: "Serene", "Oceanfront", "Rooftop", "Penthouse", "Hideaway", "Oasis", "Retreat", "Lush", "Breezy"
- Match the property type to appropriate language:
  • Villa/House: "Spacious", "Private", "Family-friendly", capacity highlights
  • Apartment/Studio: "Modern", "Chic", "City views", walkability
  • Hotel/Resort: "Luxury", "Getaway", "All-inclusive vibes"
  • Room: "Cozy", "Private", proximity to attractions
  • Lodge: "Safari", "Bush", "Wildlife", "Nature escape"
  • Cottage/Bungalow: "Charming", "Quaint", "Garden", "Peaceful"
- DO NOT use: "Beautiful", "Nice", "Good", "Great" (too generic)
- DO NOT use ALL CAPS or excessive punctuation
- DO NOT include the price in the title
- DO NOT wrap in quotes

GOOD EXAMPLES:
- "Oceanfront Villa with Pool in Masaki"
- "Chic Penthouse · Rooftop Terrace · Oyster Bay"
- "Serene Beach Cottage Steps from Coco Beach"
- "Modern 3BR Apartment in the Heart of Mikocheni"
- "Private Safari Lodge · Arusha National Park Gateway"
- "Breezy Loft with City Views · Kariakoo"
- "Cozy Studio Retreat near Slipway"

BAD EXAMPLES (never generate these):
- "Nice house in Dar es Salaam" (generic, boring)
- "BEAUTIFUL VILLA!!!" (caps, exclamation)
- "Property for rent" (not a title)
- "2 bedroom apartment" (just specs, no appeal)

Just return the title text, nothing else.`;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 100,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to generate title', details: errorText },
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
