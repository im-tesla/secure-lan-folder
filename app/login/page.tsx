import { loginAction } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const error = params.error;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Secure LAN Folder</CardTitle>
          <CardDescription className="text-base">Enter password to browse files</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="space-y-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="flex h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-1 text-center text-lg transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
              autoFocus
            />
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                name="remember"
                defaultChecked
                className="accent-primary"
              />
              Remember for 24 hours
            </label>
            {error && (
              <p className="text-destructive text-sm text-center font-medium">
                Invalid password — try again
              </p>
            )}
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium whitespace-nowrap transition-all outline-none hover:bg-primary/80 active:translate-y-px focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Unlock
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
