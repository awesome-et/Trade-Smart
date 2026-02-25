'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error('[v0] Error caught by boundary:', error);
  }, [error]);

  return (
    <div className="flex-1 p-6 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Something went wrong</CardTitle>
          <CardDescription>
            An error occurred while loading this page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-destructive/10 rounded text-sm font-mono text-destructive max-h-32 overflow-y-auto">
            {error.message || 'Unknown error'}
          </div>
          <div className="flex gap-2">
            <Button onClick={reset} variant="default" className="flex-1">
              Try again
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="outline" className="flex-1">
              Go home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
