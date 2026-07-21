'use client';

import { useState, Fragment } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { PhoneInput } from '@/components/ui/PhoneInput';

type AuthView = 'signIn' | 'signUp' | 'verify' | 'forgotPassword' | 'resetPassword';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
}

export function AuthModal({ isOpen, onClose, initialView = 'signIn' }: Props) {
  const { signIn, signUp, signInWithGoogle, signInWithApple, signInWithFacebook, verifyEmail, resendVerificationCode, forgotPassword, resetPassword } = useAuth();
  const [view, setView] = useState<AuthView>(initialView);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!isOpen) return null;

  function resetForm() {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
      onClose();
    } catch (err: any) {
      if (err.name === 'UserNotConfirmedException') {
        setView('verify');
        setError(null);
      } else {
        setError(err.message || 'Sign in failed. Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signUp({ email, password, firstName, lastName, phoneNumber });
      setView('verify');
      setSuccess('Account created! Check your email for the verification code.');
    } catch (err: any) {
      setError(err.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await verifyEmail(email, code);
      setSuccess('Email verified! You can now sign in.');
      setTimeout(() => {
        setView('signIn');
        resetForm();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    try {
      await resendVerificationCode(email);
      setSuccess('New code sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await forgotPassword(email);
      setView('resetPassword');
      setSuccess('Reset code sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await resetPassword(email, code, newPassword);
      setSuccess('Password reset! You can now sign in.');
      setTimeout(() => {
        setView('signIn');
        resetForm();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError('Google sign-in failed.');
    }
  }

  async function handleAppleSignIn() {
    try {
      await signInWithApple();
    } catch (err: any) {
      setError('Apple sign-in failed.');
    }
  }

  async function handleFacebookSignIn() {
    try {
      await signInWithFacebook();
    } catch (err: any) {
      setError('Facebook sign-in failed.');
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-400 hover:text-ink-600 transition-colors"
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Sign In View */}
        {view === 'signIn' && (
          <>
            <h2 className="text-2xl font-bold text-ink-900 mb-1">Welcome back</h2>
            <p className="text-sm text-ink-500 mb-6">Sign in to book and manage your stays</p>

            {/* Google */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-ink-200 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors mb-4"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            {/* Apple */}
            <button
              onClick={handleAppleSignIn}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-ink-200 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors mb-4"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </button>

            {/* Facebook - disabled until Consumer app is created */}
            {process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_SIGNIN === 'true' && (
            <button
              onClick={handleFacebookSignIn}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-ink-200 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors mb-4"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>
            )}

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ink-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-ink-400">or</span>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="input"
                  required
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 flex justify-between text-sm">
              <button onClick={() => { resetForm(); setView('forgotPassword'); }} className="text-brand-600 hover:underline">
                Forgot password?
              </button>
              <button onClick={() => { resetForm(); setView('signUp'); }} className="text-brand-600 hover:underline">
                Create account
              </button>
            </div>
          </>
        )}

        {/* Sign Up View */}
        {view === 'signUp' && (
          <>
            <h2 className="text-2xl font-bold text-ink-900 mb-1">Create an account</h2>
            <p className="text-sm text-ink-500 mb-6">Sign up to start booking stays</p>

            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-ink-200 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors mb-4"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </button>

            <button
              onClick={handleAppleSignIn}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-ink-200 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors mb-4"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Sign up with Apple
            </button>

            <button
              onClick={handleFacebookSignIn}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-ink-200 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors mb-4"
              style={{ display: process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_SIGNIN === 'true' ? undefined : 'none' }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Sign up with Facebook
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-ink-200" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-ink-400">or</span></div>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className="input" required />
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className="input" required />
              </div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input" required />
              <PhoneInput value={phoneNumber} onChange={setPhoneNumber} placeholder="Phone number" required />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 8 characters)"
                  className="input pr-10"
                  required
                  minLength={8}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-ink-500">
              Already have an account?{' '}
              <button onClick={() => { resetForm(); setView('signIn'); }} className="text-brand-600 hover:underline">Sign in</button>
            </p>
          </>
        )}

        {/* Verify Email View */}
        {view === 'verify' && (
          <>
            <h2 className="text-2xl font-bold text-ink-900 mb-1">Verify your email</h2>
            <p className="text-sm text-ink-500 mb-6">Enter the 6-digit code sent to <strong>{email}</strong></p>

            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter verification code"
                className="input text-center text-lg tracking-widest"
                maxLength={6}
                required
              />

              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              {success && <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">{success}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            <button onClick={handleResendCode} className="mt-3 w-full text-center text-sm text-brand-600 hover:underline">
              Resend code
            </button>
          </>
        )}

        {/* Forgot Password View */}
        {view === 'forgotPassword' && (
          <>
            <h2 className="text-2xl font-bold text-ink-900 mb-1">Reset password</h2>
            <p className="text-sm text-ink-500 mb-6">We&apos;ll send a reset code to your email</p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input" required />

              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>

            <button onClick={() => { resetForm(); setView('signIn'); }} className="mt-4 w-full text-center text-sm text-ink-500 hover:text-ink-700">
              Back to sign in
            </button>
          </>
        )}

        {/* Reset Password View */}
        {view === 'resetPassword' && (
          <>
            <h2 className="text-2xl font-bold text-ink-900 mb-1">Set new password</h2>
            <p className="text-sm text-ink-500 mb-6">Enter the code from your email and your new password</p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Reset code" className="input text-center tracking-widest" required />
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (min 8 characters)" className="input" required minLength={8} />

              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              {success && <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">{success}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
