import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { title, propertyType, district, region, street, amenities, maxGuests, checkInTime, checkOutTime, userContext, existingExamples } = body;

    // Build user context section
    let userContextSection = '';
    if (userContext && userContext.trim()) {
      userContextSection = `\n\nThe host provided these additional details about the property:\n"${userContext.trim()}"\n\nUse this information to make the instructions more specific and accurate.`;
    }

    // Build examples section from host's other properties
    let examplesSection = '';
    if (existingExamples && existingExamples.length > 0) {
      examplesSection = `\n\nThis host already has check-in instructions for their other properties. Use these as reference for tone and style:\n`;
      for (const example of existingExamples.slice(0, 3)) {
        const instr = example.instructions;
        const parts = [
          instr.directions && `Directions: ${instr.directions}`,
          instr.accessCode && `Access: ${instr.accessCode}`,
          instr.parkingInfo && `Parking: ${instr.parkingInfo}`,
          instr.wifiName && `WiFi: ${instr.wifiName}`,
          instr.contactName && `Contact: ${instr.contactName}`,
          instr.additionalNotes && `Notes: ${instr.additionalNotes}`,
        ].filter(Boolean).join('; ');
        if (parts) {
          examplesSection += `- "${example.title}": ${parts}\n`;
        }
      }
      examplesSection += `\nMatch this host's communication style and level of detail. Adapt for the new property's specific location and type.`;
    }

    const prompt = `You are a helpful assistant for short-term rental hosts in Tanzania. Generate practical check-in instructions for a guest arriving at this property.

Property details:
- Title: ${title}
- Type: ${propertyType}
- Location: ${street ? `${street}, ` : ''}${district}, ${region}
- Max guests: ${maxGuests || 'not specified'}
- Check-in time: ${checkInTime || '14:00'}
- Check-out time: ${checkOutTime || '11:00'}
- Amenities: ${amenities?.join(', ') || 'not specified'}${userContextSection}${examplesSection}

Generate realistic, helpful check-in instructions. Be specific to Tanzania/East Africa context (mention things like security guards, askari, gates, boda boda landmarks if appropriate for the area). Keep it concise and practical.

Return a JSON object with exactly these fields:
{
  "directions": "How to find the property from the main road (2-3 sentences, include landmarks)",
  "parkingInfo": "Parking info (1 sentence, or empty string if not applicable)",
  "additionalNotes": "Any helpful tips for the guest (1-2 sentences)",
  "contactName": "Suggested contact role, e.g. 'Caretaker' or 'Security'"
}

Return ONLY the JSON, no markdown or explanation.`;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      return NextResponse.json({ error: 'Failed to generate instructions' }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    try {
      const parsed = JSON.parse(text);
      return NextResponse.json(parsed);
    } catch {
      // If JSON parsing fails, return a basic structure
      return NextResponse.json({
        directions: text.slice(0, 200),
        parkingInfo: '',
        additionalNotes: '',
        contactName: '',
      });
    }
  } catch (error) {
    console.error('Check-in instructions generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
