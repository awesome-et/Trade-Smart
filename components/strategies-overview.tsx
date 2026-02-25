'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Strategy {
  id: string;
  name: string;
  strategy_type: string;
  status: string;
}

export default function StrategiesOverview() {
  const { data, isLoading } = useSWR('/api/strategies?active=true', fetcher);

  const strategies = data?.data || [];

  const strategyLabels: Record<string, string> = {
    rsi: 'RSI',
    macd: 'MACD',
    bollinger_bands: 'Bollinger Bands',
    moving_average: 'Moving Average',
    momentum: 'Momentum',
    atr: 'ATR',
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Active Strategies</CardTitle>
        <CardDescription>Your running strategies</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : strategies.length === 0 ? (
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">No active strategies</p>
            <Link href="/strategies/new" className="w-full">
              <Button className="w-full">Create Strategy</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {strategies.slice(0, 5).map((strategy: Strategy) => (
              <div
                key={strategy.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border hover:bg-secondary/50 transition"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-sm">{strategy.name}</span>
                  <Badge variant="outline" className="w-fit text-xs">
                    {strategyLabels[strategy.strategy_type] || strategy.strategy_type}
                  </Badge>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
