'use client';

import { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function CustomSignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    emailAddress: '',
    password: '',
  });
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const signUpWithGoogle = async () => {
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard'
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Google sign up failed');
    }
  };

  const signUpWithGitHub = async () => {
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_github',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard'
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'GitHub sign up failed');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Create the user with Clerk (without firstName/lastName since they're not enabled)
      await signUp.create({
        emailAddress: formData.emailAddress,
        password: formData.password,
        username: formData.username,
      });

      // Send email verification
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error('Sign up error:', err); // Debug log
      
      // Handle different error structures
      let errorMessage = 'An error occurred during sign up';
      
      if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        errorMessage = err.errors[0].message || err.errors[0].longMessage || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      
      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        
        // Update user with firstName and lastName after successful verification
        try {
          console.log('🔄 Attempting to update user:', {
            clerkId: completeSignUp.createdUserId,
            firstName: formData.firstName,
            lastName: formData.lastName,
          });
          
          const response = await fetch('/api/update-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              clerkId: completeSignUp.createdUserId,
              firstName: formData.firstName,
              lastName: formData.lastName,
            }),
          });
          
          const responseData = await response.json();
          console.log('📊 Update response:', responseData);
          
          if (!response.ok) {
            console.error('❌ Failed to update user data:', responseData);
          } else {
            console.log('✅ User data updated successfully');
          }
        } catch (updateError) {
          console.error('❌ Error updating user data:', updateError);
        }
        
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Verification error:', err); // Debug log
      
      // Handle different error structures
      let errorMessage = 'Verification failed';
      
      if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        errorMessage = err.errors[0].message || err.errors[0].longMessage || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
          
          {!pendingVerification ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">
                  Create your account
                </h1>
                <p className="text-gray-400 text-sm">
                  Join us and start your journey
                </p>
              </div>
              
              {/* OAuth Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={signUpWithGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-medium py-2.5 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                 Google
                </button>

                <button
                  type="button"
                  onClick={signUpWithGitHub}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 border border-gray-600 text-white font-medium py-2.5 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                 GitHub
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">Or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* First Name and Last Name Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-gray-300 text-sm font-medium mb-2">
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-gray-300 text-sm font-medium mb-2">
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                {/* User Name */}
                <div>
                    <label htmlFor='username' className='block text-gray-300 text-sm font-medium mb-2'>
                        Username *
                    </label>
                    <input
                        id='username'
                        name='username'
                        type='text'
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                        className='w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                        placeholder='AlexAlex'
                    />
                </div>
                {/* Email */}
                <div>
                  <label htmlFor="emailAddress" className="block text-gray-300 text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    id="emailAddress"
                    name="emailAddress"
                    type="email"
                    value={formData.emailAddress}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-gray-300 text-sm font-medium mb-2">
                    Password *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    placeholder="••••••••"
                    minLength={8}
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Must be at least 8 characters long
                  </p>
                </div>

                {error && (
                  <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-md p-3 text-sm">
                    {error}
                  </div>
                )}

                {/* CAPTCHA Container */}
                <div id="clerk-captcha" className="flex justify-center mb-4"></div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">
                  Verify your email
                </h1>
                <p className="text-gray-400 text-sm">
                  We sent a verification code to
                </p>
                <p className="text-white font-medium">
                  {formData.emailAddress}
                </p>
              </div>
              
              <form onSubmit={handleVerification} className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-gray-300 text-sm font-medium mb-2">
                    Verification Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center tracking-widest text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>

                {error && (
                  <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-md p-3 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>

                <button
                  type="button"
                  onClick={() => setPendingVerification(false)}
                  className="w-full text-gray-400 hover:text-white text-sm underline transition-colors"
                >
                  ← Back to sign up
                </button>
              </form>
            </>
          )}

          {/* Sign In Link */}
          <div className="mt-6 text-center border-t border-gray-700 pt-6">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <a 
                href="/sign-in" 
                className="text-blue-400 hover:text-blue-300 underline font-medium transition-colors"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
