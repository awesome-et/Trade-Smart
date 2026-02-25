'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardStats from '@/components/dashboard-stats';
import SignalsList from '@/components/signals-list';
import StrategiesOverview from '@/components/strategies-overview';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="flex-1 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Trading Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor your strategies and signals</p>
          </div>
          <div className="flex gap-3">
            <Link href="/signals">
              <Button variant="outline">View Signals</Button>
            </Link>
            <Link href="/strategies">
              <Button>Manage Strategies</Button>
            </Link>
          </div>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Signals */}
          <div className="lg:col-span-2">
            <SignalsList />
          </div>

          {/* Strategies Overview */}
          <div>
            <StrategiesOverview />
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your trading engine</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/strategies/new">
                <Button variant="outline" className="w-full">
                  Create Strategy
                </Button>
              </Link>
              <Link href="/backtest">
                <Button variant="outline" className="w-full">
                  Run Backtest
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button variant="outline" className="w-full">
                  View Portfolio
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" className="w-full">
                  Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
