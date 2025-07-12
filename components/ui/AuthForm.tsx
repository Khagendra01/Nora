import React, { useState } from 'react';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onSubmit: (email: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        disabled={loading}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {mode === 'signin' ? 'Sign In' : 'Sign Up'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}; 