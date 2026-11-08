import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchPropertyForSEO } from '@/lib/fetch-property';
import { buildPropertyMetadata } from '@/lib/property-seo';
import { PropertyJsonLd } from '@/components/seo/PropertyJsonLd';
import { PropertyDetailClient } from './PropertyDetailClient';

type PageProps = { params: { id: string } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const property = await fetchPropertyForSEO(params.id);
  if (!property) notFound();
  return buildPropertyMetadata(property);
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const property = await fetchPropertyForSEO(params.id);
  if (!property) notFound();
  return <>
    {property.status === 'AVAILABLE' && <PropertyJsonLd property={property} />}
    <PropertyDetailClient key={params.id} initialProperty={property} />
  </>;
}
