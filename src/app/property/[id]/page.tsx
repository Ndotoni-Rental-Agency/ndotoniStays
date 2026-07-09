import { Metadata } from 'next';
import { fetchPropertyForSEO } from '@/lib/fetch-property';
import { PropertyJsonLd } from '@/components/seo/PropertyJsonLd';
import { PropertyDetailClient } from './PropertyDetailClient';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const property = await fetchPropertyForSEO(params.id);

  if (!property) {
    return {
      title: 'Property Not Found – ndotoni Stays',
      description: 'This property could not be found on ndotoni Stays.',
    };
  }

  const location = [property.district, property.region].filter(Boolean).join(', ');
  const title = `${property.title} – ${location} | ndotoni Stays`;
  const description =
    property.description?.slice(0, 160) ||
    `Book ${property.title} in ${location}. ${property.currency} ${property.nightlyRate.toLocaleString()} per night on ndotoni Stays.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: property.images?.length > 0
        ? [{ url: property.images[0], width: 1200, height: 630, alt: property.title }]
        : property.thumbnail
        ? [{ url: property.thumbnail, width: 1200, height: 630, alt: property.title }]
        : undefined,
      type: 'website',
      url: `https://www.ndotonistays.com/property/${property.propertyId}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: property.images?.[0] || property.thumbnail || undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const property = await fetchPropertyForSEO(params.id);

  return (
    <>
      {property && <PropertyJsonLd property={property} />}
      <PropertyDetailClient />
    </>
  );
}
