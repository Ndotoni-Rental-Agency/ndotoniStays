/** Matches GraphQL GuestManualPaymentOptions on Booking. */
export type GuestManualPaymentOptions = {
  lipaNumber: string;
  accountName: string;
  paymentReference?: string | null;
};

/** Pre-deploy fallback: set NEXT_PUBLIC_* in stays env . */
export function guestManualPaymentOptionsFromEnv(bookingId: string): GuestManualPaymentOptions | null {
  const lipaNumber = process.env.NEXT_PUBLIC_NDOTONI_LIPA_NUMBER?.trim();
  const accountName = process.env.NEXT_PUBLIC_NDOTONI_PAYMENT_ACCOUNT_NAME?.trim();
  if (!lipaNumber || !accountName) return null;
  return { lipaNumber, accountName, paymentReference: bookingId };
}

export function resolveGuestManualPaymentOptions(
  fromBooking: GuestManualPaymentOptions | null | undefined,
  bookingId: string,
): GuestManualPaymentOptions | null {
  if (fromBooking?.lipaNumber?.trim() && fromBooking?.accountName?.trim()) {
    return {
      lipaNumber: fromBooking.lipaNumber.trim(),
      accountName: fromBooking.accountName.trim(),
      paymentReference: fromBooking.paymentReference ?? bookingId,
    };
  }
  return guestManualPaymentOptionsFromEnv(bookingId);
}

/** GraphQL selection set fragment — keep in sync with getBooking / createBooking. */
export const GUEST_MANUAL_PAYMENT_OPTIONS_FIELDS = `
  guestManualPaymentOptions {
    lipaNumber
    accountName
    paymentReference
    __typename
  }
`;
