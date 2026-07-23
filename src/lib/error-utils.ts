/**
 * Error utility functions - Safe error handling for user-facing messages.
 * 
 * SECURITY: Never show raw error.message to users. It may contain internal
 * details (DB errors, API keys, service names) that attackers can exploit.
 * 
 * All user-facing error display should go through getSafeErrorMessage().
 */

// Known Cognito/Auth error name mappings
const AUTH_ERROR_MAP: Record<string, string> = {
  UserNotConfirmedException: 'Your account needs to be verified. Please check your email for the verification code.',
  UsernameExistsException: 'An account with this email already exists.',
  NotAuthorizedException: 'Incorrect email or password.',
  UserNotFoundException: 'No account found with this email.',
  InvalidPasswordException: 'Password does not meet requirements.',
  CodeMismatchException: 'Invalid verification code.',
  ExpiredCodeException: 'Verification code has expired. Please request a new one.',
  LimitExceededException: 'Too many attempts. Please wait a few minutes before trying again.',
  TooManyRequestsException: 'Too many requests. Please wait a moment and try again.',
};

// Messages from our backend (NdotoniError) that are safe to pass through
const SAFE_MESSAGE_PATTERNS = [
  'Please sign in to continue',
  'The requested',
  'could not be found',
  'You do not have permission',
  'Too many requests',
  'Something went wrong',
  'Email and password are required',
  'Email and verification code are required',
  'Email is required',
  'This booking has already been paid',
  'These dates are no longer available',
];

function isBackendSafeMessage(message: string): boolean {
  return SAFE_MESSAGE_PATTERNS.some(pattern => message.includes(pattern));
}

// Patterns that indicate internal/technical errors that should never be shown
const UNSAFE_PATTERNS = [
  /api[_-]?key/i,
  /dynamodb/i,
  /cognito/i,
  /lambda/i,
  /internal server/i,
  /ECONNREFUSED/i,
  /ETIMEDOUT/i,
  /unexpected token/i,
  /cannot read propert/i,
  /undefined is not/i,
  /null is not/i,
  /aws/i,
  /s3/i,
  /sqs/i,
  /sns/i,
  /arn:/i,
  /secret/i,
  /password.*hash/i,
  /table.*not.*found/i,
  /syntax error/i,
];

function containsUnsafeContent(message: string): boolean {
  return UNSAFE_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Get a safe error message suitable for displaying to the user.
 * 
 * @param error - The caught error (can be any type)
 * @param context - What the user was trying to do (e.g., 'signing in', 'loading properties')
 * @returns A user-friendly error message that never leaks internal details
 */
export function getSafeErrorMessage(error: unknown, context?: string): string {
  // Check for known auth error names
  const errorName = (error as any)?.name;
  if (errorName && AUTH_ERROR_MAP[errorName]) {
    return AUTH_ERROR_MAP[errorName];
  }

  // Extract raw message
  const rawMessage = extractRawMessage(error);

  // If matches safe backend patterns, allow through
  if (rawMessage && isBackendSafeMessage(rawMessage)) {
    return rawMessage;
  }

  // If contains unsafe content, use generic
  if (rawMessage && containsUnsafeContent(rawMessage)) {
    return context
      ? `Something went wrong while ${context}. Please try again.`
      : 'Something went wrong. Please try again.';
  }

  // Short, non-technical messages are probably safe
  if (rawMessage && rawMessage.length < 100 && !containsUnsafeContent(rawMessage)) {
    return rawMessage;
  }

  // Default generic
  return context
    ? `Something went wrong while ${context}. Please try again.`
    : 'Something went wrong. Please try again.';
}

function extractRawMessage(error: unknown): string | null {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null) {
    if ((error as any).errors?.length > 0) return (error as any).errors[0].message || null;
    if ((error as any).message) return (error as any).message;
  }
  return null;
}
