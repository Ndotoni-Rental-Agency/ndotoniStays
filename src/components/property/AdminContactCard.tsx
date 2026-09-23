'use client';

import { useEffect, useState } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { useAuth } from '@/contexts/AuthContext';
import { PhoneIcon, EnvelopeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { MessageCircle } from 'lucide-react';

// Admin-only query — never requested for non-admin users
const getPropertyContacts = /* GraphQL */ `
  query GetPropertyContacts($propertyId: ID!) {
    getPropertyContacts(propertyId: $propertyId) {
      userId
      role
      firstName
      lastName
      email
      phoneNumber
      whatsappNumber
    }
  }
`;

interface PropertyContact {
  userId: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
}

export function AdminContactCard({ propertyId }: { propertyId: string }) {
  const { user } = useAuth();
  const isAdmin = user?.userType === 'ADMIN';
  const [contact, setContact] = useState<PropertyContact | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    GraphQLClient.executeAuthenticated<{ getPropertyContacts: PropertyContact | null }>(
      getPropertyContacts,
      { propertyId }
    )
      .then((data) => setContact(data.getPropertyContacts))
      .catch((err) => console.error('Error fetching property contacts:', err))
      .finally(() => setLoaded(true));
  }, [isAdmin, propertyId]);

  if (!isAdmin || !loaded) return null;

  const name = [contact?.firstName, contact?.lastName].filter(Boolean).join(' ') || 'Unknown';
  const whatsapp = contact?.whatsappNumber?.replace(/\D/g, '');

  return (
    <div className="mt-6 p-4 rounded-xl border border-amber-300 bg-amber-50">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-800">
        <ShieldCheckIcon className="h-4 w-4" />
        Admin only · Host contact
      </p>
      {!contact ? (
        <p className="mt-2 text-sm text-ink-600">No host contact found for this listing.</p>
      ) : (
        <div className="mt-2 space-y-1.5 text-sm text-ink-900">
          <p className="font-medium">{name}</p>
          {contact.phoneNumber && (
            <a href={`tel:${contact.phoneNumber}`} className="flex items-center gap-2 hover:underline">
              <PhoneIcon className="h-4 w-4 text-ink-500" />
              {contact.phoneNumber}
            </a>
          )}
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:underline"
            >
              <MessageCircle className="h-4 w-4 text-ink-500" />
              {contact.whatsappNumber}
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:underline break-all">
              <EnvelopeIcon className="h-4 w-4 text-ink-500" />
              {contact.email}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
