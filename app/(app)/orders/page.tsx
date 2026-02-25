'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useSWR from 'swr';
import { Loader2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Position {
  tradingsymbol: string;
  exchange: string;
  quantity: number;
  average_price: number;
  last_price: number;
  pnl: number;
  pnl_percentage: number;
}

interface Holding {
  tradingsymbol: string;
  exchange: string;
  quantity: number;
  price: number;
  last_price: number;
  pnl: number;
  pnl_percentage: number;
}

interface AccountInfo {
  equity: number;
  cash: number;
  used_margin: number;
  available_margin: number;
}

export default function OrdersPage() {
  const { data, isLoading, error } = useSWR('/api/account/info', fetcher, { refreshInterval: 5000 });
  const [positions, setPositions] = useState<Position[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [account, setAccount] = useState<AccountInfo | null>(null);

  useEffect(() => {
    if (data?.data) {
      setPositions(data.data.positions || []);
      setHoldings(data.data.holdings || []);
      setAccount(data.data.account);
    }
  }, [data]);

  const totalPositionValue = positions.reduce((sum, p) => sum + p.quantity * p.last_price, 0);
  const totalPositionPnL = positions.reduce((sum, p) => sum + p.pnl, 0);

  const totalHoldingsValue = holdings.reduce((sum, h) => sum + h.quantity * h.last_price, 0);
  const totalHoldingsPnL = holdings.reduce((sum, h) => sum + h.pnl, 0);

  return (
    <main className="flex-1 p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Orders & Positions</h1>
          <p className="text-muted-foreground mt-1">Manage your trading positions and holdings</p>
        </div>

        {/* Account Summary */}
        {account && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Equity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">₹{account.equity?.toFixed(2) || '0'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Available Cash</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">₹{account.cash?.toFixed(2) || '0'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Used Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">₹{account.used_margin?.toFixed(2) || '0'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Available Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">₹{account.available_margin?.toFixed(2) || '0'}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Positions & Holdings Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Positions & Holdings</CardTitle>
            <CardDescription>Intraday and overnight positions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">Failed to load positions</div>
            ) : (
              <Tabs defaultValue="positions" className="w-full">
                <TabsList>
                  <TabsTrigger value="positions">
                    Intraday Positions ({positions.length})
                  </TabsTrigger>
                  <TabsTrigger value="holdings">
                    Holdings ({holdings.length})
                  </TabsTrigger>
                </TabsList>

                {/* Positions Tab */}
                <TabsContent value="positions" className="space-y-4">
                  {positions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">No open positions</div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Position Value</p>
                          <p className="text-xl font-bold">₹{totalPositionValue.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total P&L</p>
                          <p className={`text-xl font-bold ${totalPositionPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{totalPositionPnL.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">P&L %</p>
                          <p className={`text-xl font-bold ${totalPositionPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {((totalPositionPnL / totalPositionValue) * 100).toFixed(2)}%
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {positions.map((position) => (
                          <div
                            key={position.tradingsymbol}
                            className="p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                              <div>
                                <p className="text-lg font-bold">{position.tradingsymbol}</p>
                                <p className="text-xs text-muted-foreground">{position.exchange}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Quantity</p>
                                <p className="font-semibold">{position.quantity}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Avg Price</p>
                                <p className="font-semibold">₹{position.average_price.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Current Price</p>
                                <p className="font-semibold">₹{position.last_price.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">P&L</p>
                                <p className={`font-semibold ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  ₹{position.pnl.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Return %</p>
                                <p className={`font-semibold ${position.pnl_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {position.pnl_percentage.toFixed(2)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* Holdings Tab */}
                <TabsContent value="holdings" className="space-y-4">
                  {holdings.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">No holdings</div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Holdings Value</p>
                          <p className="text-xl font-bold">₹{totalHoldingsValue.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total P&L</p>
                          <p className={`text-xl font-bold ${totalHoldingsPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{totalHoldingsPnL.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">P&L %</p>
                          <p className={`text-xl font-bold ${totalHoldingsPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {((totalHoldingsPnL / totalHoldingsValue) * 100).toFixed(2)}%
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {holdings.map((holding) => (
                          <div
                            key={holding.tradingsymbol}
                            className="p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                              <div>
                                <p className="text-lg font-bold">{holding.tradingsymbol}</p>
                                <p className="text-xs text-muted-foreground">{holding.exchange}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Quantity</p>
                                <p className="font-semibold">{holding.quantity}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Buy Price</p>
                                <p className="font-semibold">₹{holding.price.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Current Price</p>
                                <p className="font-semibold">₹{holding.last_price.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">P&L</p>
                                <p className={`font-semibold ${holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  ₹{holding.pnl.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Return %</p>
                                <p className={`font-semibold ${holding.pnl_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {holding.pnl_percentage.toFixed(2)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
