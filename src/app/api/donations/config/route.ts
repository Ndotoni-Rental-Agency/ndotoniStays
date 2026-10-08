import { NextRequest } from 'next/server';
import { donationGateway } from '@/lib/donation-gateway';
export const dynamic = 'force-dynamic';
export function GET(request: NextRequest) { return donationGateway(request, '/donations/config', 'GET'); }
