/**
 * GraphQL queries for ndotoniStays
 * These hit the same AppSync API as ndotoniWeb
 */

export const searchShortTermProperties = /* GraphQL */ `
  query SearchShortTermProperties($input: ShortTermSearchInput!) {
    searchShortTermProperties(input: $input) {
      properties {
        propertyId
        hostId
        title
        description
        propertyType
        region
        district
        images
        thumbnail
        amenities
        nightlyRate
        currency
        cleaningFee
        maxGuests
        instantBookEnabled
        averageRating
        ratingSummary {
          averageRating
          totalReviews
        }
        status
        createdAt
      }
      nextToken
    }
  }
`;

export const getShortTermProperty = /* GraphQL */ `
  query GetShortTermProperty($propertyId: ID!) {
    getShortTermProperty(propertyId: $propertyId) {
      propertyId
      hostId
      title
      description
      propertyType
      address {
        street
        city
        region
        district
        country
      }
      region
      district
      coordinates {
        latitude
        longitude
      }
      images
      thumbnail
      amenities
      nightlyRate
      currency
      cleaningFee
      serviceFeePercentage
      taxPercentage
      minimumStay
      maximumStay
      advanceBookingDays
      instantBookEnabled
      cancellationPolicy
      checkInTime
      checkOutTime
      checkInInstructions
      maxGuests
      maxAdults
      maxChildren
      maxInfants
      allowsPets
      allowsChildren
      allowsInfants
      allowsSmoking
      houseRules
      ratingSummary {
        averageRating
        totalReviews
        cleanliness
        accuracy
        communication
        location
        value
      }
      averageRating
      status
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

export const getBlockedDates = /* GraphQL */ `
  query GetBlockedDates($propertyId: ID!, $startDate: AWSDate, $endDate: AWSDate) {
    getBlockedDates(propertyId: $propertyId, startDate: $startDate, endDate: $endDate) {
      propertyId
      blockedRanges {
        startDate
        endDate
        reason
      }
    }
  }
`;

export const checkAvailability = /* GraphQL */ `
  query CheckAvailability($propertyId: ID!, $checkInDate: AWSDate!, $checkOutDate: AWSDate!) {
    checkAvailability(propertyId: $propertyId, checkInDate: $checkInDate, checkOutDate: $checkOutDate) {
      propertyId
      startDate
      endDate
      available
      unavailableDates
    }
  }
`;

export const calculateBookingPrice = /* GraphQL */ `
  query CalculateBookingPrice($propertyId: ID!, $checkInDate: AWSDate!, $checkOutDate: AWSDate!, $numberOfGuests: Int!) {
    calculateBookingPrice(propertyId: $propertyId, checkInDate: $checkInDate, checkOutDate: $checkOutDate, numberOfGuests: $numberOfGuests) {
      nightlyRate
      numberOfNights
      subtotal
      cleaningFee
      serviceFee
      taxes
      total
      currency
    }
  }
`;

export const getPropertyReviews = /* GraphQL */ `
  query GetPropertyReviews($propertyId: ID!, $limit: Int, $nextToken: String) {
    getPropertyReviews(propertyId: $propertyId, limit: $limit, nextToken: $nextToken) {
      reviews {
        reviewId
        guestId
        guest {
          firstName
          lastName
          profileImage
        }
        overallRating
        cleanliness
        accuracy
        communication
        location
        value
        comment
        photos
        hostResponse
        verifiedStay
        createdAt
      }
      nextToken
      count
    }
  }
`;

export const getMe = /* GraphQL */ `
  query GetMe {
    getMe {
      userId
      email
      firstName
      lastName
      phoneNumber
      profileImage
      userType
      createdAt
    }
  }
`;

export const getPayment = /* GraphQL */ `
  query GetPayment($paymentId: ID!) {
    getPayment(paymentId: $paymentId) {
      paymentId
      bookingId
      amount
      currency
      status
      transactionID
      errorMessage
      completedAt
      createdAt
    }
  }
`;

export const listMyShortTermProperties = /* GraphQL */ `
  query ListMyShortTermProperties($limit: Int, $nextToken: String) {
    listMyShortTermProperties(limit: $limit, nextToken: $nextToken) {
      properties {
        propertyId
        title
        propertyType
        region
        district
        nightlyRate
        currency
        thumbnail
        status
        instantBookEnabled
        maxGuests
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
