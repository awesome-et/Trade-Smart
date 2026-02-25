'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { StrategyType } from '@/lib/types'

const STRATEGY_CONFIGS: Record<string, {
  name: string
  description: string
  category: string
  parameters: Array<{
    name: string
    key: string
    type: 'number' | 'text' | 'select'
    default: number | string
    min?: number
    max?: number
    step?: number
    options?: Array<{ label: string; value: string }>
    help: string
  }>
}> = {
  rsi: {
    name: 'RSI (Relative Strength Index)',
    description: 'Momentum oscillator measuring speed/magnitude of price changes. Identifies overbought/oversold conditions.',
    category: 'Momentum',
    parameters: [
      { name: 'Period', key: 'rsi_period', type: 'number', default: 14, min: 2, max: 50, help: 'RSI lookback period' },
      { name: 'Oversold', key: 'oversold', type: 'number', default: 30, min: 10, max: 50, help: 'Oversold threshold for BUY signals' },
      { name: 'Overbought', key: 'overbought', type: 'number', default: 70, min: 50, max: 90, help: 'Overbought threshold for SELL signals' },
    ],
  },
  macd: {
    name: 'MACD (Moving Average Convergence Divergence)',
    description: 'Captures momentum by showing relationship between two moving averages. Signals when MACD crosses Signal line.',
    category: 'Momentum',
    parameters: [
      { name: 'Fast EMA', key: 'fast_ema', type: 'number', default: 12, min: 5, max: 20, help: 'Fast EMA period' },
      { name: 'Slow EMA', key: 'slow_ema', type: 'number', default: 26, min: 20, max: 50, help: 'Slow EMA period' },
      { name: 'Signal Period', key: 'signal_period', type: 'number', default: 9, min: 5, max: 15, help: 'Signal line period' },
    ],
  },
  bollinger_bands: {
    name: 'Bollinger Bands',
    description: 'Volatility bands around price. Signals when price touches bands, indicating potential reversals.',
    category: 'Volatility',
    parameters: [
      { name: 'Period', key: 'period', type: 'number', default: 20, min: 10, max: 50, help: 'BB period' },
      { name: 'Std Dev', key: 'std_dev', type: 'number', default: 2, min: 1, max: 3, step: 0.1, help: 'Standard deviations from middle band' },
    ],
  },
  moving_average: {
    name: 'Moving Average Crossover',
    description: 'Trend following strategy using SMA crossovers. Buy when 20>50>200, Sell when 20<50<200.',
    category: 'Trend',
    parameters: [
      { name: 'Fast MA', key: 'fast_ma', type: 'number', default: 20, min: 5, max: 50, help: 'Fast SMA period' },
      { name: 'Medium MA', key: 'medium_ma', type: 'number', default: 50, min: 20, max: 100, help: 'Medium SMA period' },
      { name: 'Slow MA', key: 'slow_ma', type: 'number', default: 200, min: 100, max: 300, help: 'Slow SMA period' },
    ],
  },
  momentum: {
    name: 'Momentum',
    description: 'Measures rate of price change. Buy when positive, Sell when negative.',
    category: 'Momentum',
    parameters: [
      { name: 'Period', key: 'period', type: 'number', default: 10, min: 5, max: 30, help: 'Momentum period' },
      { name: 'Threshold', key: 'threshold', type: 'number', default: 0, min: -100, max: 100, help: 'Momentum threshold' },
    ],
  },
  atr: {
    name: 'ATR (Average True Range)',
    description: 'Volatility indicator. Generates signals based on volatility levels.',
    category: 'Volatility',
    parameters: [
      { name: 'Period', key: 'period', type: 'number', default: 14, min: 7, max: 30, help: 'ATR period' },
      { name: 'Multiplier', key: 'atr_multiplier', type: 'number', default: 1, min: 0.5, max: 3, step: 0.1, help: 'ATR multiplier' },
    ],
  },
  stochastic: {
    name: 'Stochastic Oscillator',
    description: 'Momentum indicator comparing closing price to price range. Identifies overbought/oversold levels.',
    category: 'Momentum',
    parameters: [
      { name: 'K Period', key: 'k_period', type: 'number', default: 14, min: 5, max: 30, help: '%K period' },
      { name: 'D Period', key: 'd_period', type: 'number', default: 3, min: 1, max: 10, help: '%D period' },
      { name: 'Oversold', key: 'oversold', type: 'number', default: 20, min: 10, max: 40, help: 'Oversold threshold' },
      { name: 'Overbought', key: 'overbought', type: 'number', default: 80, min: 60, max: 90, help: 'Overbought threshold' },
    ],
  },
  williams_r: {
    name: "Williams %R",
    description: 'Momentum indicator measuring price position relative to highs/lows. Extremes indicate reversals.',
    category: 'Momentum',
    parameters: [
      { name: 'Period', key: 'period', type: 'number', default: 14, min: 7, max: 30, help: 'Williams %R period' },
      { name: 'Threshold', key: 'threshold', type: 'number', default: -50, min: -100, max: 0, help: 'Signal threshold' },
    ],
  },
  cci: {
    name: 'CCI (Commodity Channel Index)',
    description: 'Momentum oscillator measuring deviation from average price. Signals cyclical turns.',
    category: 'Momentum',
    parameters: [
      { name: 'Period', key: 'period', type: 'number', default: 20, min: 10, max: 50, help: 'CCI period' },
      { name: 'Threshold', key: 'threshold', type: 'number', default: 100, min: 50, max: 200, help: 'CCI level threshold' },
    ],
  },
  ichimoku: {
    name: 'Ichimoku Cloud',
    description: 'Comprehensive indicator showing support/resistance, trend, and momentum. All-in-one strategy.',
    category: 'Trend',
    parameters: [
      { name: 'Tenkan Period', key: 'tenkan', type: 'number', default: 9, min: 5, max: 20, help: 'Tenkan line period' },
      { name: 'Kijun Period', key: 'kijun', type: 'number', default: 26, min: 15, max: 50, help: 'Kijun line period' },
      { name: 'Senkou B Period', key: 'senkou_b', type: 'number', default: 52, min: 30, max: 100, help: 'Senkou B period' },
    ],
  },
  vwap: {
    name: 'VWAP (Volume Weighted Average Price)',
    description: 'Price level weighted by volume. Ideal for intraday trading, signals when price diverges from VWAP.',
    category: 'Trend',
    parameters: [
      { name: 'Deviation %', key: 'deviation_pct', type: 'number', default: 1, min: 0.1, max: 5, step: 0.1, help: 'Deviation % from VWAP for signal' },
    ],
  },
  obv: {
    name: 'OBV (On-Balance Volume)',
    description: 'Accumulates volume to predict price moves. Divergence signals potential reversals.',
    category: 'Volume',
    parameters: [
      { name: 'Signal Period', key: 'signal_period', type: 'number', default: 20, min: 10, max: 50, help: 'EMA period for OBV signals' },
    ],
  },
  adx: {
    name: 'ADX (Average Directional Index)',
    description: 'Trend strength indicator. Identifies strong trends regardless of direction.',
    category: 'Trend',
    parameters: [
      { name: 'Period', key: 'period', type: 'number', default: 14, min: 7, max: 30, help: 'ADX period' },
      { name: 'Threshold', key: 'threshold', type: 'number', default: 25, min: 15, max: 50, help: 'ADX trend strength threshold' },
    ],
  },
  roc: {
    name: 'ROC (Rate of Change)',
    description: 'Measures momentum by calculating percentage change over period. Buy positive, Sell negative.',
    category: 'Momentum',
    parameters: [
      { name: 'Period', key: 'period', type: 'number', default: 12, min: 5, max: 30, help: 'ROC period' },
      { name: 'Threshold', key: 'threshold', type: 'number', default: 0, min: -10, max: 10, help: 'ROC threshold' },
    ],
  },
  keltner_channel: {
    name: 'Keltner Channel',
    description: 'Volatility channels using ATR. Signals breakouts when price exits channels.',
    category: 'Volatility',
    parameters: [
      { name: 'Period', key: 'period', type: 'number', default: 20, min: 10, max: 50, help: 'EMA period for middle band' },
      { name: 'ATR Multiplier', key: 'atr_multiplier', type: 'number', default: 2, min: 1, max: 5, step: 0.5, help: 'ATR multiplier for bands' },
    ],
  },
  supertrend: {
    name: 'Supertrend',
    description: 'Trend following indicator combining ATR and closes. Clear buy/sell signals on trend changes.',
    category: 'Trend',
    parameters: [
      { name: 'Period', key: 'period', type: 'number', default: 10, min: 7, max: 20, help: 'Supertrend period' },
      { name: 'Multiplier', key: 'multiplier', type: 'number', default: 3, min: 1, max: 5, step: 0.5, help: 'ATR multiplier' },
    ],
  },
}

export default function NewStrategyPage() {
  const router = useRouter()
  const [step, setStep] = useState<'type' | 'config' | 'combined'>('type')
  const [selectedType, setSelectedType] = useState<StrategyType | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [parameters, setParameters] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([])
  const [combinationLogic, setCombinationLogic] = useState<'AND' | 'OR'>('AND')

  const handleCreateStrategy = async () => {
    if (!name.trim() || !selectedType) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const payload: any = {
        name: name.trim(),
        description: description.trim(),
        strategy_type: selectedType,
        parameters,
      }

      if (selectedType === 'combined') {
        payload.sub_strategies = selectedStrategies
        payload.combination_logic = combinationLogic
      }

      const response = await fetch('/api/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create strategy')
      }

      router.push('/strategies')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const config = selectedType && STRATEGY_CONFIGS[selectedType as string]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/strategies" className="text-primary hover:underline mb-4 inline-block">
            ← Back to Strategies
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-2">Create New Strategy</h1>
          <p className="text-muted-foreground">Build a strategy to identify trading opportunities</p>
        </div>

        {step === 'type' && (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Select Strategy Type</CardTitle>
                <CardDescription>Choose from predefined strategies or combine multiple strategies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(STRATEGY_CONFIGS).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedType(key as StrategyType)
                        setStep('config')
                        setParameters({})
                      }}
                      className="p-4 rounded-lg border-2 border-border hover:border-primary transition text-left"
                    >
                      <div className="font-semibold text-foreground mb-1">{config.name}</div>
                      <div className="text-xs text-muted-foreground mb-2">{config.category}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">{config.description}</div>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setSelectedType('combined')
                      setStep('combined')
                    }}
                    className="p-4 rounded-lg border-2 border-accent hover:border-primary transition text-left bg-accent/5"
                  >
                    <div className="font-semibold text-foreground mb-1">Combined Strategy</div>
                    <div className="text-xs text-muted-foreground mb-2">Advanced</div>
                    <div className="text-sm text-muted-foreground">Combine multiple strategies with AND/OR logic</div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'config' && selectedType && selectedType !== 'combined' && config && (
          <Card>
            <CardHeader>
              <CardTitle>{config.name}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Strategy Name *</label>
                <Input
                  placeholder="e.g., Conservative RSI Strategy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-input border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <Textarea
                  placeholder="Describe your strategy and when you'd use it"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="bg-input border-border"
                />
              </div>

              <div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-foreground mb-2">Quick Presets:</p>
                  <div className="flex gap-2 flex-wrap">
                    {['Conservative', 'Balanced', 'Aggressive'].map(preset => (
                      <button
                        key={preset}
                        onClick={() => {
                          // Apply preset parameters
                          const presetParams: Record<string, any> = {
                            Conservative: { overbought: 75, oversold: 25 },
                            Balanced: { overbought: 70, oversold: 30 },
                            Aggressive: { overbought: 65, oversold: 35 },
                          }
                          setParameters(presetParams[preset] || {})
                        }}
                        className="text-xs px-3 py-1 rounded bg-blue-500/20 text-foreground hover:bg-blue-500/30"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Strategy Parameters</h3>
                {config.parameters.map(param => (
                  <div key={param.key}>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {param.name}
                      <span className="text-muted-foreground text-xs ml-2">{param.help}</span>
                    </label>
                    {param.type === 'number' ? (
                      <Input
                        type="number"
                        min={param.min}
                        max={param.max}
                        step={param.step || 1}
                        placeholder={String(param.default)}
                        value={parameters[param.key] ?? param.default}
                        onChange={(e) => setParameters({ ...parameters, [param.key]: parseFloat(e.target.value) })}
                        className="bg-input border-border"
                      />
                    ) : param.type === 'select' && param.options ? (
                      <select
                        value={parameters[param.key] ?? param.default}
                        onChange={(e) => setParameters({ ...parameters, [param.key]: e.target.value })}
                        className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground"
                      >
                        {param.options.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        type="text"
                        placeholder={String(param.default)}
                        value={parameters[param.key] ?? param.default}
                        onChange={(e) => setParameters({ ...parameters, [param.key]: e.target.value })}
                        className="bg-input border-border"
                      />
                    )}
                  </div>
                ))}
              </div>

              {error && <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">{error}</div>}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('type')} className="border-border">
                  Back
                </Button>
                <Button onClick={handleCreateStrategy} disabled={loading} className="flex-1 bg-primary hover:bg-primary/90">
                  {loading ? 'Creating...' : 'Create Strategy'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'combined' && (
          <Card>
            <CardHeader>
              <CardTitle>Create Combined Strategy</CardTitle>
              <CardDescription>
                Combine multiple strategies so signals only trigger when ALL (or ANY) conditions are met
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Strategy Name *</label>
                <Input
                  placeholder="e.g., Trend Confirmation Strategy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-input border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <Textarea
                  placeholder="Describe when all sub-strategies must align"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="bg-input border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Combination Logic</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setCombinationLogic('AND')}
                    className={`flex-1 p-4 rounded-lg border-2 transition ${
                      combinationLogic === 'AND'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <div className="font-semibold text-foreground">AND (All must trigger)</div>
                    <div className="text-xs text-muted-foreground mt-2">Signal only when every sub-strategy agrees</div>
                  </button>
                  <button
                    onClick={() => setCombinationLogic('OR')}
                    className={`flex-1 p-4 rounded-lg border-2 transition ${
                      combinationLogic === 'OR'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <div className="font-semibold text-foreground">OR (Any can trigger)</div>
                    <div className="text-xs text-muted-foreground mt-2">Signal when any sub-strategy triggers</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Select Strategies to Combine *</label>
                <p className="text-sm text-muted-foreground mb-4">Coming soon: Existing strategies will appear here</p>
                <div className="space-y-2">
                  {Object.entries(STRATEGY_CONFIGS).map(([key, config]) => (
                    <label key={key} className="flex items-center p-3 border border-border rounded-lg hover:bg-card/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStrategies.includes(key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStrategies([...selectedStrategies, key])
                          } else {
                            setSelectedStrategies(selectedStrategies.filter(s => s !== key))
                          }
                        }}
                        className="mr-3 w-4 h-4"
                      />
                      <div>
                        <div className="font-medium text-foreground">{config.name}</div>
                        <div className="text-xs text-muted-foreground">{config.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {selectedStrategies.length > 0 && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <p className="text-sm text-foreground font-semibold mb-2">
                    Combined strategy ({combinationLogic} logic): {selectedStrategies.length} strategies selected
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Signal will trigger only when {combinationLogic === 'AND' ? 'ALL' : 'ANY'} of the selected strategies generate a signal
                  </div>
                </div>
              )}

              {error && <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">{error}</div>}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('type')} className="border-border">
                  Back
                </Button>
                <Button
                  onClick={handleCreateStrategy}
                  disabled={loading || selectedStrategies.length === 0}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {loading ? 'Creating...' : 'Create Combined Strategy'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
