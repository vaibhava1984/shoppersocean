'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/client-auth';

const auth = createClient();

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await auth.auth.signInWithPassword({ email, password });
        if (!result.data.user) throw new Error('Login failed');
        router.push('/');
        router.refresh();
      } else {
        const result = await auth.auth.signUp({ email, password, full_name: fullName, country });
        if (!result.data.user) throw new Error('Signup failed');
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed';

      // Handle migrated users who need password reset
      if (msg.includes('Password reset required') || (err as any).resetRequired) {
        setError('Your account was migrated from Supabase. Please reset your password to continue.');
        setTimeout(() => router.push('/forgot-password'), 3000);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        {isLogin ? 'Sign In' : 'Sign Up'} â Shoppers Ocean
      </h1>
      {error && <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
        )}
        {!isLogin && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Country</label>
            <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. India" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
        )}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>
      {isLogin && (
        <p style={{ marginTop: '16px', textAlign: 'center' }}>
          <a href="/forgot-password" style={{ color: '#2563eb', fontSize: '14px' }}>Forgot password?</a>
        </p>
      )}
      <p style={{ marginTop: '16px', textAlign: 'center' }}>
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); setError(''); }} style={{ color: '#2563eb' }}>
          {isLogin ? 'Sign Up' : 'Sign In'}
        </a>
      </p>
    </div>
  );
}
