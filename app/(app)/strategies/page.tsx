'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Strategy {
  id: string;
  name: string;
  description: string;
  strategy_type: string;
  status: string;
  created_at: string;
}

export default function StrategiesPage() {
  const { data, isLoading, mutate } = useSWR('/api/strategies', fetcher);
  const [deleting, setDeleting] = useState<string | null>(null);

  const strategies: Strategy[] = data?.data || [];

  const strategyLabels: Record<string, string> = {
    rsi: 'RSI',
    macd: 'MACD',
    bollinger_bands: 'Bollinger Bands',
    moving_average: 'Moving Average',
    momentum: 'Momentum',
    atr: 'ATR',
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/strategies/${id}`, { method: 'DELETE' });
      mutate();
    } catch (error) {
      console.error('Error deleting strategy:', error);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <main className="flex-1 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Strategies</h1>
            <p className="text-muted-foreground mt-1">Manage and create your trading strategies</p>
          </div>
          <Link href="/strategies/new">
            <Button>Create Strategy</Button>
          </Link>
        </div>

        {/* Strategies Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading strategies...</div>
        ) : strategies.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No strategies created yet</p>
              <Link href="/strategies/new">
                <Button>Create Your First Strategy</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {strategies.map((strategy: Strategy) => (
              <Card key={strategy.id} className="bg-card border-border hover:border-primary/50 transition">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="line-clamp-2">{strategy.name}</CardTitle>
                      <Badge variant={strategy.status === 'active' ? 'default' : 'outline'}>
                        {strategy.status}
                      </Badge>
                    </div>
                    <Badge variant="secondary">{strategyLabels[strategy.strategy_type]}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {strategy.description || 'No description'}
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/strategies/${strategy.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(strategy.id)}
                      disabled={deleting === strategy.id}
                    >
                      {deleting === strategy.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
