'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface StatsData {
  active_signals: number;
  total_strategies: number;
  open_trades: number;
  portfolio_value: number;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const { data: signalsData } = useSWR('/api/signals', fetcher, { refreshInterval: 10000 });
  const { data: strategiesData } = useSWR('/api/strategies', fetcher);
  const { data: tradesData } = useSWR('/api/trades?status=open', fetcher, { refreshInterval: 10000 });

  useEffect(() => {
    if (signalsData && strategiesData && tradesData) {
      setStats({
        active_signals: signalsData.count || 0,
        total_strategies: strategiesData.count || 0,
        open_trades: tradesData.count || 0,
        portfolio_value: 100000, // Mock value
      });
    }
  }, [signalsData, strategiesData, tradesData]);

  const statItems = [
    {
      label: 'Active Signals',
      value: stats?.active_signals || 0,
      icon: '📊',
      color: 'bg-blue-500/10 text-blue-400',
    },
    {
      label: 'Strategies',
      value: stats?.total_strategies || 0,
      icon: '⚙️',
      color: 'bg-green-500/10 text-green-400',
    },
    {
      label: 'Open Trades',
      value: stats?.open_trades || 0,
      icon: '💹',
      color: 'bg-yellow-500/10 text-yellow-400',
    },
    {
      label: 'Portfolio Value',
      value: `₹${(stats?.portfolio_value || 0).toLocaleString()}`,
      icon: '💰',
      color: 'bg-purple-500/10 text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <Card key={index} className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${item.color}`}>
                <span className="text-xl">{item.icon}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
