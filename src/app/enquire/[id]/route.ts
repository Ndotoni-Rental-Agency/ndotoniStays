import { NextRequest, NextResponse } from 'next/server';
/** Public promotion link: a stable, readable URL that opens the exact stay in our WhatsApp bot. */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(params.id)) return new NextResponse('Invalid stay reference', { status: 400 });
  const phone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '255790720329').replace(/\D/g, '');
  if (!/^[1-9]\d{9,14}$/.test(phone)) return new NextResponse('WhatsApp enquiry is temporarily unavailable.', { status: 503 });
  const sw = request.nextUrl.searchParams.get('lang') === 'sw';
  const text = `${sw ? 'Habari Ndotoni! Nimevutiwa na stay hii.' : 'Hi Ndotoni! I am interested in this stay.'}\nNDOTONI-STAY:${params.id}\nhttps://www.ndotonistays.com/property/${params.id}\n${sw ? 'Tarehe na wageni wangu:' : 'My dates and guests:'} `;
  const response = NextResponse.redirect(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, 307);
  response.headers.set('Cache-Control', 'no-store'); return response;
}
