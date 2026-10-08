import { NextRequest, NextResponse } from 'next/server';
import { donationGateway } from '@/lib/donation-gateway';
export const dynamic = 'force-dynamic';
export function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!/^[0-9a-f]{30}$/.test(params.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return donationGateway(request, `/donations/${params.id}`, 'GET');
}
