/**
 * GraphQL mutations for ndotoniStays
 */

export const createBooking = /* GraphQL */ `
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      booking {
        bookingId
        propertyId
        checkInDate
        checkOutDate
        numberOfGuests
        status
        bookingType
        pricing {
          nightlyRate
          numberOfNights
          subtotal
          cleaningFee
          serviceFee
          taxes
          total
          currency
        }
        createdAt
      }
      paymentStatus
      message
    }
  }
`;

export const cancelBooking = /* GraphQL */ `
  mutation CancelBooking($bookingId: ID!, $reason: String) {
    cancelBooking(bookingId: $bookingId, reason: $reason) {
      booking {
        bookingId
        status
      }
      refundAmount
      refundPercentage
      message
    }
  }
`;

export const createReview = /* GraphQL */ `
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      reviewId
      overallRating
      comment
      createdAt
    }
  }
`;

export const createShortTermPropertyDraft = /* GraphQL */ `
  mutation CreateShortTermPropertyDraft($input: CreateShortTermPropertyDraftInput!) {
    createShortTermPropertyDraft(input: $input) {
      success
      message
      propertyId
      isGuestUser
      status
    }
  }
`;

export const initiatePayment = /* GraphQL */ `
  mutation InitiatePayment($input: InitiatePaymentInput!) {
    initiatePayment(input: $input) {
      reference
      status
      amount
      currency
      message
    }
  }
`;
