'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export function LoginForm() {
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [debug, setDebug] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDebug('→ submit fired');
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }
    setError('');
    setDebug('→ POST /api/auth...');
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, remember }),
      });
      const data = await res.json();
      setDebug(`← ${res.status} ${JSON.stringify(data)}`);
      console.log('Auth response:', res.status, data);
      if (!res.ok) {
        setError(`Invalid password (${res.status}: ${data.error})`);
        return;
      }
      setDebug(prev => prev + '\n→ navigating to /');
      window.location.href = '/';
    } catch (err: any) {
      setDebug(`← fetch failed: ${err.message}`);
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Secure LAN Folder</CardTitle>
          <CardDescription className="text-base">Enter password to browse files</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-center text-lg outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              autoFocus
            />
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="accent-primary"
              />
              Remember for 24 hours
            </label>
            {error && <p className="text-destructive text-sm text-center">{error}</p>}
            {debug && (
              <pre className="text-xs text-muted-foreground bg-muted rounded-md p-2 whitespace-pre-wrap break-all">{debug}</pre>
            )}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all hover:bg-primary/80 active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? 'Unlocking...' : 'Unlock'}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
