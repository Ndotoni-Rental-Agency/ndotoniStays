import { NextRequest } from 'next/server';
import { donationGateway } from '@/lib/donation-gateway';
export const dynamic = 'force-dynamic';
export function POST(request: NextRequest) { return donationGateway(request, '/donations', 'POST'); }
