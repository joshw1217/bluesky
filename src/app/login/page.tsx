'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push('/account');
      router.refresh()
    } else {
      const data = await res.json();
      setError(data.error);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <div className="mx-auto flex min-h-0 w-full flex-1 flex-col items-center justify-center bg-white bg-[url('/background.jpg')] bg-cover bg-center p-6 shadow">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="..."
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="..."
          />
          {error && <p className="text-red-500">{error}</p>}
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 mt-2">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
