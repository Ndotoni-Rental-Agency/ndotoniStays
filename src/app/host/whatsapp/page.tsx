'use client';

import { useAuth } from '@/contexts/AuthContext';
import WhatsAppAssociation from '@/components/host/WhatsAppAssociation';

export default function WhatsAppPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">WhatsApp</h1>
        <p className="text-ink-500 text-sm mt-1">
          Link your WhatsApp number to transfer listings you created via WhatsApp to this account.
        </p>
      </div>

      <WhatsAppAssociation existingWhatsappNumber={user?.whatsappNumber || user?.phoneNumber || ''} />
    </div>
  );
}
