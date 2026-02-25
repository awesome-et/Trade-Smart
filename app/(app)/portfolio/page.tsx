'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Trade {
  id: string;
  symbol: string;
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  entry_timestamp: string;
  exit_timestamp: string | null;
  status: string;
  profit_loss: number | null;
  profit_loss_percentage: number | null;
}

export default function PortfolioPage() {
  const { data: statsData } = useSWR('/api/trades?stats=true', fetcher);
  const { data: openTradesData } = useSWR('/api/trades?status=open', fetcher, { refreshInterval: 10000 });
  const { data: closedTradesData } = useSWR('/api/trades?status=closed', fetcher);

  const stats = statsData?.data || {};
  const openTrades: Trade[] = openTradesData?.data || [];
  const closedTrades: Trade[] = closedTradesData?.data || [];

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  const statCards = [
    { label: 'Total Trades', value: stats.total_trades || 0, color: 'bg-blue-500/10' },
    { label: 'Winning Trades', value: stats.winning_trades || 0, color: 'bg-green-500/10' },
    { label: 'Losing Trades', value: stats.losing_trades || 0, color: 'bg-red-500/10' },
    { label: 'Win Rate', value: `${(stats.win_rate || 0).toFixed(1)}%`, color: 'bg-purple-500/10' },
    {
      label: 'Total P&L',
      value: `₹${(stats.total_profit_loss || 0).toLocaleString()}`,
      color: stats.total_profit_loss > 0 ? 'bg-green-500/10' : 'bg-red-500/10',
    },
  ];

  return (
    <main className="flex-1 p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground mt-1">Track your trades and performance</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((card, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase">{card.label}</p>
                  <p className="text-xl font-bold">{card.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Open Trades */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Open Trades</CardTitle>
              <CardDescription>Currently active positions</CardDescription>
            </CardHeader>
            <CardContent>
              {openTrades.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No open trades</p>
              ) : (
                <div className="space-y-2">
                  {openTrades.map((trade) => (
                    <div key={trade.id} className="p-3 border border-border rounded-lg bg-secondary/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold">{trade.symbol}</span>
                          <p className="text-xs text-muted-foreground">
                            {trade.quantity} units @ ₹{trade.entry_price.toFixed(2)}
                          </p>
                        </div>
                        <Badge variant="outline">Open</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Closed Trades */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Recent Closed Trades</CardTitle>
              <CardDescription>Recently closed positions</CardDescription>
            </CardHeader>
            <CardContent>
              {closedTrades.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No closed trades</p>
              ) : (
                <div className="space-y-2">
                  {closedTrades.slice(0, 5).map((trade) => (
                    <div key={trade.id} className="p-3 border border-border rounded-lg bg-secondary/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold">{trade.symbol}</span>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(trade.exit_timestamp || '')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              (trade.profit_loss || 0) > 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            ₹{trade.profit_loss?.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {trade.profit_loss_percentage?.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
