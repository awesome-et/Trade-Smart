'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const STRATEGY_NAMES: Record<string, string> = {
  rsi: 'RSI (Relative Strength Index)',
  macd: 'MACD',
  bollinger_bands: 'Bollinger Bands',
  moving_average: 'Moving Average Crossover',
  momentum: 'Momentum',
  atr: 'ATR',
  stochastic: 'Stochastic Oscillator',
  williams_r: "Williams %R",
  cci: 'CCI',
  ichimoku: 'Ichimoku Cloud',
  vwap: 'VWAP',
  obv: 'OBV',
  adx: 'ADX',
  roc: 'ROC',
  keltner_channel: 'Keltner Channel',
  supertrend: 'Supertrend',
  combined: 'Combined Strategy',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  testing: 'bg-yellow-500',
}

export default function StrategyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const { data, isLoading, error, mutate } = useSWR(id ? `/api/strategies/${id}` : null, fetcher)
  const strategy = data?.data

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editStatus, setEditStatus] = useState<'active' | 'inactive' | 'testing'>('active')
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error_, setError_] = useState('')

  useEffect(() => {
    if (strategy) {
      setEditName(strategy.name)
      setEditDescription(strategy.description || '')
      setEditStatus(strategy.status)
    }
  }, [strategy])

  const handleUpdate = async () => {
    setUpdating(true)
    setError_('')

    try {
      const response = await fetch(`/api/strategies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          status: editStatus,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update strategy')
      }

      setIsEditing(false)
      mutate()
    } catch (err: any) {
      setError_(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this strategy? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/strategies/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete strategy')
      }

      router.push('/strategies')
    } catch (err: any) {
      setError_(err.message)
      setDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="flex-1 p-6">
        <div className="text-center py-12 text-muted-foreground">Loading strategy...</div>
      </main>
    )
  }

  if (error || !strategy) {
    return (
      <main className="flex-1 p-6">
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="py-6">
            <p className="text-destructive mb-4">{error ? 'Failed to load strategy' : 'Strategy not found'}</p>
            <Link href="/strategies">
              <Button variant="outline">Back to Strategies</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex-1 p-6">
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/strategies" className="text-primary hover:underline">
            ← Back to Strategies
          </Link>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </>
            )}
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                  <Input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                  <Textarea
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    rows={3}
                    className="bg-input border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="testing">Testing</option>
                  </select>
                </div>
                {error_ && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                    {error_}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setEditName(strategy.name)
                      setEditDescription(strategy.description || '')
                      setEditStatus(strategy.status)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdate} disabled={updating} className="bg-primary hover:bg-primary/90">
                    {updating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold text-foreground">{strategy.name}</h1>
                  <Badge variant="default" className={STATUS_COLORS[strategy.status] || 'bg-gray-500'}>
                    {strategy.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{strategy.description || 'No description'}</p>
              </div>
            )}
          </CardHeader>
        </Card>

        {!isEditing && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Strategy Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground font-semibold">{STRATEGY_NAMES[strategy.strategy_type]}</p>
                  <p className="text-xs text-muted-foreground mt-1">{strategy.strategy_type}</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Created</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">
                    {new Date(strategy.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Parameters</CardTitle>
                <CardDescription>Strategy configuration and thresholds</CardDescription>
              </CardHeader>
              <CardContent>
                {strategy.parameters && Object.keys(strategy.parameters).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(strategy.parameters).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                        <span className="text-foreground font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-muted-foreground text-sm">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No parameters configured</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-foreground">-</div>
                  <p className="text-xs text-muted-foreground">Total Signals</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">-</div>
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">-</div>
                  <p className="text-xs text-muted-foreground">Profit Factor</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </main>
  )
}
