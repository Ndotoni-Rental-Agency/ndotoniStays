'use client';

import { useAuth } from '@/contexts/AuthContext';
import WhatsAppAssociation from '@/components/host/WhatsAppAssociation';

export default function WhatsAppPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-lg mx-auto">
      <WhatsAppAssociation existingWhatsappNumber={user?.whatsappNumber || user?.phoneNumber || ''} />
    </div>
  );
}
