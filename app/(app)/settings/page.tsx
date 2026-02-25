'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SettingsPage() {
  const { data, mutate } = useSWR('/api/preferences', fetcher);
  const { data: zerodhaConfig } = useSWR('/api/zerodha/config', fetcher);

  const [zerodhaUserId, setZerodhaUserId] = useState('');
  const [zerodhaApiKey, setZerodhaApiKey] = useState('');
  const [zerodhaAccessToken, setZerodhaAccessToken] = useState('');
  const [scanInterval, setScanInterval] = useState(5);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (data?.data) {
      setZerodhaUserId(data.data.zerodha_user_id || '');
      setZerodhaApiKey(data.data.zerodha_api_key || '');
      setScanInterval(data.data.scan_interval_minutes || 5);
    }
  }, [data]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_interval_minutes: scanInterval,
        }),
      });

      if (response.ok) {
        setMessage('Preferences saved successfully!');
        mutate();
      } else {
        setMessage('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage('Error saving preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveZerodha = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/zerodha/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zerodha_user_id: zerodhaUserId,
          zerodha_api_key: zerodhaApiKey,
          zerodha_access_token: zerodhaAccessToken,
          scan_interval_minutes: scanInterval,
        }),
      });

      if (response.ok) {
        setMessage('Zerodha credentials saved successfully!');
        setZerodhaAccessToken(''); // Don't store in state after saving
      } else {
        setMessage('Failed to save Zerodha credentials');
      }
    } catch (error) {
      console.error('Error saving Zerodha config:', error);
      setMessage('Error saving Zerodha configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex-1 p-6">
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your trading engine</p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.includes('successfully') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}
          >
            {message}
          </div>
        )}

        {/* Scan Interval */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Scan Settings</CardTitle>
            <CardDescription>Configure market scanning intervals</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePreferences} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Scan Interval (minutes)</label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={scanInterval}
                  onChange={(e) => setScanInterval(parseInt(e.target.value))}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  How often should strategies scan the market for signals
                </p>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Zerodha Configuration */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Zerodha Configuration</CardTitle>
            <CardDescription>
              Connect your Zerodha account for real-time market data {zerodhaConfig?.data?.is_configured && '✓'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveZerodha} className="space-y-4">
              <div>
                <label className="text-sm font-medium">User ID</label>
                <Input
                  type="text"
                  placeholder="Your Zerodha User ID"
                  value={zerodhaUserId}
                  onChange={(e) => setZerodhaUserId(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">API Key</label>
                <Input
                  type="password"
                  placeholder="Your Zerodha API Key"
                  value={zerodhaApiKey}
                  onChange={(e) => setZerodhaApiKey(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Access Token</label>
                <Input
                  type="password"
                  placeholder="Your Zerodha Access Token"
                  value={zerodhaAccessToken}
                  onChange={(e) => setZerodhaAccessToken(e.target.value)}
                  className="mt-2"
                />
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Zerodha Configuration'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Trading Strategy Engine v1.0</p>
            <p>A comprehensive platform for automated trading strategy management and backtesting</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
