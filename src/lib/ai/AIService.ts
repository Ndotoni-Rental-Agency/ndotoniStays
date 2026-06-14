/**
 * AIService — centralized Anthropic Claude integration for ndotoniStays.
 *
 * Provides AI-powered features:
 * - Title generation for property listings
 * - Price prediction/suggestions
 * - Description generation
 * - Review summaries
 *
 * All methods call the internal API routes (which hold the API key server-side).
 */

export interface GenerateTitleInput {
  propertyType: string;
  district: string;
  region: string;
  maxGuests?: string;
  currency?: string;
  nightlyRate?: string;
}

export interface PricePredictionInput {
  propertyType: string;
  district: string;
  region: string;
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
}

export interface GenerateDescriptionInput {
  title: string;
  propertyType: string;
  district: string;
  region: string;
  maxGuests?: number;
  nightlyRate?: number;
  currency?: string;
  amenities?: string[];
}

export interface GenerateCheckInInstructionsInput {
  title: string;
  propertyType: string;
  district: string;
  region: string;
  street?: string;
  amenities?: string[];
  maxGuests?: number;
  checkInTime?: string;
  checkOutTime?: string;
  userContext?: string;
  existingExamples?: Array<{ title: string; instructions: any }>;
}

class AIServiceClass {
  private baseUrl = '/api/ai';

  /**
   * Generate a catchy property listing title
   */
  async generateTitle(input: GenerateTitleInput): Promise<string> {
    const res = await fetch('/api/generate-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      throw new Error('Failed to generate title');
    }

    const data = await res.json();
    return data.title || '';
  }

  /**
   * Predict a competitive nightly rate based on property attributes and location
   */
  async predictPrice(input: PricePredictionInput): Promise<{
    suggestedPrice: number;
    currency: string;
    reasoning: string;
    range: { min: number; max: number };
  }> {
    const res = await fetch('/api/ai/predict-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      throw new Error('Failed to predict price');
    }

    return res.json();
  }

  /**
   * Generate a property description from basic details
   */
  async generateDescription(input: GenerateDescriptionInput): Promise<string> {
    const res = await fetch('/api/ai/generate-description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      throw new Error('Failed to generate description');
    }

    const data = await res.json();
    return data.description || '';
  }

  /**
   * Generate check-in instructions based on property details.
   * Returns structured fields that can be directly applied to the form.
   */
  async generateCheckInInstructions(input: GenerateCheckInInstructionsInput): Promise<{
    directions: string;
    parkingInfo: string;
    additionalNotes: string;
    contactName: string;
  }> {
    const res = await fetch('/api/ai/generate-checkin-instructions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      throw new Error('Failed to generate check-in instructions');
    }

    return res.json();
  }
}

// Singleton export
export const AIService = new AIServiceClass();
