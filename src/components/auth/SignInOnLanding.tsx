'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

/** `?signin=1` (from the email confirmation page) opens sign-in on the page they came back to. */
export function SignInOnLanding() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (params.get('signin') !== '1' || isLoading) return;
    const rest = new URLSearchParams(params.toString());
    rest.delete('signin');
    router.replace(`${pathname}${rest.toString() ? `?${rest}` : ''}`, { scroll: false });
    if (!isAuthenticated) setOpen(true);
  }, [params, pathname, router, isAuthenticated, isLoading]);
  return <AuthModal isOpen={open && !isAuthenticated} onClose={() => setOpen(false)} initialView="signIn" />;
}
