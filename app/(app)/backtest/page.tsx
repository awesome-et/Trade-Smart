'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Strategy {
  id: string;
  name: string;
}

interface BacktestResult {
  id: string;
  strategy_id: string;
  start_date: string;
  end_date: string;
  total_trades: number;
  win_rate: number;
  total_return: number;
  max_drawdown: number;
  sharpe_ratio: number;
  created_at: string;
}

export default function BacktestPage() {
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: strategiesData } = useSWR('/api/strategies?active=true', fetcher);
  const { data: resultsData, mutate: mutateResults } = useSWR(
    selectedStrategy ? `/api/backtest?strategy_id=${selectedStrategy}` : null,
    fetcher
  );

  const strategies: Strategy[] = strategiesData?.data || [];
  const results: BacktestResult[] = resultsData?.data || [];

  const handleRunBacktest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStrategy || !startDate || !endDate) return;

    setLoading(true);
    try {
      const response = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy_id: selectedStrategy,
          start_date: startDate,
          end_date: endDate,
          initial_capital: 100000,
        }),
      });

      if (response.ok) {
        await mutateResults();
        alert('Backtest completed successfully!');
      }
    } catch (error) {
      console.error('Error running backtest:', error);
      alert('Failed to run backtest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Backtesting</h1>
          <p className="text-muted-foreground mt-1">Test your strategies on historical data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Backtest Form */}
          <Card className="lg:col-span-1 bg-card border-border">
            <CardHeader>
              <CardTitle>Run Backtest</CardTitle>
              <CardDescription>Configure and run a historical simulation</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRunBacktest} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Strategy</label>
                  <select
                    value={selectedStrategy}
                    onChange={(e) => setSelectedStrategy(e.target.value)}
                    className="w-full mt-2 px-3 py-2 bg-input border border-border rounded-md text-foreground"
                  >
                    <option value="">Select a strategy</option>
                    {strategies.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Running...' : 'Run Backtest'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>Historical backtest results</CardDescription>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No backtest results yet</p>
                ) : (
                  <div className="space-y-3">
                    {results.map((result) => (
                      <div key={result.id} className="p-4 border border-border rounded-lg bg-secondary/30">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Total Trades</span>
                            <p className="font-semibold">{result.total_trades}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Win Rate</span>
                            <p className="font-semibold text-green-400">{result.win_rate?.toFixed(1)}%</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Return</span>
                            <p className={`font-semibold ${result.total_return > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {result.total_return?.toFixed(2)}%
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Max Drawdown</span>
                            <p className="font-semibold text-red-400">{result.max_drawdown?.toFixed(2)}%</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Sharpe Ratio</span>
                            <p className="font-semibold">{result.sharpe_ratio?.toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date</span>
                            <p className="font-semibold">{new Date(result.created_at).toLocaleDateString()}</p>
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
      </div>
    </main>
  );
}
