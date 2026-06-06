/**
 * Authentication Bridge for ndotoniStays
 * Same pattern as ndotoniWeb — uses same Cognito User Pool
 */

import { GraphQLClient } from '@/lib/graphql-client';
import {
  signIn as cognitoSignIn,
  signOut as cognitoSignOut,
  getCurrentUser,
  signInWithRedirect,
} from 'aws-amplify/auth';
import { getMe } from '@/graphql/queries';

// Sign up mutation (custom backend)
const signUpMutation = /* GraphQL */ `
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      success
      message
    }
  }
`;

const verifyEmailMutation = /* GraphQL */ `
  mutation VerifyEmail($email: String!, $code: String!) {
    verifyEmail(email: $email, code: $code) {
      success
      message
    }
  }
`;

const resendVerificationCodeMutation = /* GraphQL */ `
  mutation ResendVerificationCode($email: String!) {
    resendVerificationCode(email: $email) {
      success
      message
    }
  }
`;

const forgotPasswordMutation = /* GraphQL */ `
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      success
      message
    }
  }
`;

const resetPasswordMutation = /* GraphQL */ `
  mutation ResetPassword($email: String!, $confirmationCode: String!, $newPassword: String!) {
    resetPassword(email: $email, confirmationCode: $confirmationCode, newPassword: $newPassword) {
      success
      message
    }
  }
`;

export class AuthBridge {
  /**
   * Sign up using custom GraphQL mutation
   */
  static async signUp(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }) {
    const data = await GraphQLClient.executePublic<{ signUp: { success: boolean; message: string } }>(
      signUpMutation,
      { input }
    );

    if (!data.signUp?.success) {
      throw new Error(data.signUp?.message || 'Sign up failed');
    }

    return data.signUp;
  }

  /**
   * Sign in using Amplify Cognito, then fetch user profile
   */
  static async signIn(email: string, password: string) {
    const signInResult = await cognitoSignIn({ username: email, password });

    if (!signInResult.isSignedIn) {
      const nextStep = signInResult.nextStep;
      const error: any = new Error('Sign in requires additional step');

      if (nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        error.name = 'UserNotConfirmedException';
        error.message = 'Please verify your email first.';
      }

      throw error;
    }

    // Fetch user profile from backend
    const data = await GraphQLClient.executeAuthenticated<{ getMe: any }>(getMe);

    if (!data.getMe) {
      throw new Error('User profile not found');
    }

    return data.getMe;
  }

  /**
   * Verify email
   */
  static async verifyEmail(email: string, code: string) {
    const data = await GraphQLClient.executePublic<{ verifyEmail: { success: boolean; message: string } }>(
      verifyEmailMutation,
      { email, code }
    );

    if (!data.verifyEmail?.success) {
      throw new Error(data.verifyEmail?.message || 'Verification failed');
    }
  }

  /**
   * Resend verification code
   */
  static async resendVerificationCode(email: string) {
    const data = await GraphQLClient.executePublic<{ resendVerificationCode: { success: boolean; message: string } }>(
      resendVerificationCodeMutation,
      { email }
    );

    if (!data.resendVerificationCode?.success) {
      throw new Error(data.resendVerificationCode?.message || 'Failed to resend code');
    }
  }

  /**
   * Forgot password
   */
  static async forgotPassword(email: string) {
    const data = await GraphQLClient.executePublic<{ forgotPassword: { success: boolean; message: string } }>(
      forgotPasswordMutation,
      { email }
    );

    if (!data.forgotPassword?.success) {
      throw new Error(data.forgotPassword?.message || 'Failed to send reset email');
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string, code: string, newPassword: string) {
    const data = await GraphQLClient.executePublic<{ resetPassword: { success: boolean; message: string } }>(
      resetPasswordMutation,
      { email, confirmationCode: code, newPassword }
    );

    if (!data.resetPassword?.success) {
      throw new Error(data.resetPassword?.message || 'Password reset failed');
    }
  }

  /**
   * Sign in with Google via Cognito Hosted UI
   */
  static async signInWithGoogle() {
    await signInWithRedirect({ provider: 'Google' });
  }

  /**
   * Sign out
   */
  static async signOut() {
    try {
      await cognitoSignOut();
    } catch {
      // Silent
    }
    localStorage.removeItem('user');
  }

  /**
   * Check if user has valid Cognito session
   */
  static async hasSession(): Promise<boolean> {
    try {
      await getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
}
