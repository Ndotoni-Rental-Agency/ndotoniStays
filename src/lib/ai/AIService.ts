/**
 * AIService — Centralized AI integration for ndotoniStays.
 *
 * All AI features go through the backend's `generateAISuggestion` GraphQL mutation.
 * This ensures a single source of truth for prompts, market data, and model config.
 * No direct Anthropic calls from the frontend.
 */

import { GraphQLClient } from '@/lib/graphql-client';

// ─── GraphQL Mutation ───

const GENERATE_AI_SUGGESTION = /* GraphQL */ `
  mutation GenerateAISuggestion($input: AISuggestionInput!) {
    generateAISuggestion(input: $input) {
      type
      title
      description
      suggestedPrice
      priceRange {
        min
        max
      }
      priceReasoning
      checkinInstructions {
        directions
        parkingInfo
        additionalNotes
        contactName
      }
      existingTitlesInArea
      marketStats {
        totalListingsInArea
        averagePrice
        medianPrice
      }
    }
  }
`;

// ─── Types ───

export type AISuggestionType = 'TITLE' | 'DESCRIPTION' | 'PRICE' | 'CHECKIN_INSTRUCTIONS' | 'ALL';

export interface AISuggestionResult {
  type: AISuggestionType;
  title?: string;
  description?: string;
  suggestedPrice?: number;
  priceRange?: { min: number; max: number };
  priceReasoning?: string;
  checkinInstructions?: {
    directions?: string;
    parkingInfo?: string;
    additionalNotes?: string;
    contactName?: string;
  };
  existingTitlesInArea?: string[];
  marketStats?: {
    totalListingsInArea: number;
    averagePrice?: number;
    medianPrice?: number;
  };
}

// ─── Service ───

class AIServiceClass {
  /**
   * Core method — calls the backend GraphQL mutation.
   */
  private async suggest(input: Record<string, any>): Promise<AISuggestionResult> {
    const result = await GraphQLClient.executeAuthenticated<{
      generateAISuggestion: AISuggestionResult;
    }>(GENERATE_AI_SUGGESTION, { input });
    return result.generateAISuggestion;
  }

  /**
   * Generate a catchy property listing title
   */
  async generateTitle(input: {
    propertyType: string;
    district: string;
    region: string;
    maxGuests?: string;
    bedrooms?: string;
    bathrooms?: string;
    stayCategories?: string[];
    currency?: string;
    nightlyRate?: string;
    userContext?: string;
    language?: string;
  }): Promise<string> {
    const result = await this.suggest({
      type: 'TITLE',
      propertyType: input.propertyType,
      region: input.region,
      district: input.district,
      maxGuests: input.maxGuests ? parseInt(input.maxGuests) : undefined,
      bedrooms: input.bedrooms ? parseInt(input.bedrooms) : undefined,
      bathrooms: input.bathrooms ? parseInt(input.bathrooms) : undefined,
      stayCategories: input.stayCategories,
      currency: input.currency,
      nightlyRate: input.nightlyRate ? parseFloat(input.nightlyRate) : undefined,
      userContext: input.userContext,
      language: input.language,
    });
    return result.title || '';
  }

  /**
   * Predict a competitive nightly rate
   */
  async predictPrice(input: {
    propertyType: string;
    district: string;
    region: string;
    maxGuests?: number;
    bedrooms?: number;
    bathrooms?: number;
    amenities?: string[];
    userContext?: string;
    language?: string;
  }): Promise<{
    suggestedPrice: number;
    currency: string;
    reasoning: string;
    range: { min: number; max: number };
  }> {
    const result = await this.suggest({
      type: 'PRICE',
      propertyType: input.propertyType,
      region: input.region,
      district: input.district,
      maxGuests: input.maxGuests,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      amenities: input.amenities,
      userContext: input.userContext,
      language: input.language,
    });
    return {
      suggestedPrice: result.suggestedPrice || 0,
      currency: 'TZS',
      reasoning: result.priceReasoning || '',
      range: result.priceRange || { min: 0, max: 0 },
    };
  }

  /**
   * Generate a property description
   */
  async generateDescription(input: {
    title: string;
    propertyType: string;
    district: string;
    region: string;
    maxGuests?: number;
    nightlyRate?: number;
    currency?: string;
    amenities?: string[];
    userContext?: string;
    language?: string;
  }): Promise<string> {
    const result = await this.suggest({
      type: 'DESCRIPTION',
      propertyType: input.propertyType,
      region: input.region,
      district: input.district,
      maxGuests: input.maxGuests,
      nightlyRate: input.nightlyRate,
      currency: input.currency,
      title: input.title,
      amenities: input.amenities,
      userContext: input.userContext,
      language: input.language,
    });
    return result.description || '';
  }

  /**
   * Generate check-in instructions
   */
  async generateCheckInInstructions(input: {
    title: string;
    propertyType: string;
    district: string;
    region: string;
    street?: string;
    amenities?: string[];
    maxGuests?: number;
    checkInTime?: string;
    checkOutTime?: string;
    existingExamples?: Array<{ title: string; instructions: any }>;
    userContext?: string;
    language?: string;
  }): Promise<{
    directions: string;
    parkingInfo: string;
    additionalNotes: string;
    contactName: string;
  }> {
    const result = await this.suggest({
      type: 'CHECKIN_INSTRUCTIONS',
      propertyType: input.propertyType,
      region: input.region,
      district: input.district,
      maxGuests: input.maxGuests,
      title: input.title,
      amenities: input.amenities,
      userContext: input.userContext,
      language: input.language,
    });
    return {
      directions: result.checkinInstructions?.directions || '',
      parkingInfo: result.checkinInstructions?.parkingInfo || '',
      additionalNotes: result.checkinInstructions?.additionalNotes || '',
      contactName: result.checkinInstructions?.contactName || '',
    };
  }
}

export const AIService = new AIServiceClass();
