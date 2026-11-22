'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ open: false, title: '', description: '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'We could not send the password reset email. Please try again.');
      } else if (data.accountExists === false) {
        setPopup({
          open: true,
          title: 'No account found',
          description: 'There is no account associated with this email address. Please create an account first.',
        });
      } else if (data.accountExists === true && data.emailSent === true) {
        setPopup({
          open: true,
          title: 'Password reset link sent',
          description: 'The password reset link has been sent to ' + email.trim() + '. Please check your inbox and spam folder. The link will expire in one hour.',
        });
        window.setTimeout(() => router.replace('/'), 1200);
      } else {
        setError('We could not confirm that the reset email was sent. Please try again.');
      }
    } catch {
      setError('Unable to reach the password reset service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col items-center px-4 pt-20">
      <div className="mt-10 w-full max-w-md rounded-lg bg-white p-6 sm:p-8 shadow-xl">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">Forgot Password</h1>
        <p className="mb-6 text-center text-sm text-gray-600">Enter the email address registered with your Shoppers Ocean account.</p>
        {error && <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="reset-email" className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-md border border-gray-300 px-3 py-3 text-gray-900 outline-none focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm">
          <a href="/login" className="font-medium text-blue-600 hover:underline">Back to Login</a>
        </p>
      </div>

      <Dialog open={popup.open} onOpenChange={(open) => setPopup((current) => ({ ...current, open }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{popup.title}</DialogTitle>
            <DialogDescription>{popup.description}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setPopup((current) => ({ ...current, open: false }))}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
