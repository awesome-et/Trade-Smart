import { Strategy, MarketDataPoint, StrategyEvaluationResult, SignalType } from '@/lib/types'

// Extended market data with additional indicators
export interface ExtendedMarketData extends MarketDataPoint {
  stochastic?: { k: number; d: number }
  williams_r?: number
  cci?: number
  ichimoku?: { tenkan: number; kijun: number; senkou_a: number; senkou_b: number }
  vwap?: number
  obv?: number
  adx?: number
  roc?: number
  keltner_channel?: { upper: number; middle: number; lower: number }
  supertrend?: { value: number; direction: 'up' | 'down' }
}

// Stochastic Oscillator
export function evaluateStochasticStrategy(
  strategy: Strategy,
  marketData: ExtendedMarketData[]
): StrategyEvaluationResult[] {
  const params = strategy.parameters as { overbought?: number; oversold?: number }
  const overbought = params.overbought || 80
  const oversold = params.oversold || 20

  return marketData.map(data => {
    const stoch = data.stochastic || { k: 50, d: 50 }
    let signal: SignalType | null = null
    let strength = 0

    if (stoch.k < oversold && stoch.d < oversold) {
      signal = 'buy'
      strength = (oversold - Math.max(stoch.k, stoch.d)) / oversold
    } else if (stoch.k > overbought && stoch.d > overbought) {
      signal = 'sell'
      strength = (Math.min(stoch.k, stoch.d) - overbought) / (100 - overbought)
    }

    return {
      symbol: data.symbol,
      signal_type: signal,
      signal_strength: strength,
      indicators: { stochastic: stoch },
      timestamp: data.timestamp,
    }
  })
}

// Williams %R
export function evaluateWilliamsRStrategy(
  strategy: Strategy,
  marketData: ExtendedMarketData[]
): StrategyEvaluationResult[] {
  const params = strategy.parameters as { threshold?: number }
  const threshold = params.threshold || -50

  return marketData.map(data => {
    const williamsr = data.williams_r || -50
    let signal: SignalType | null = null
    let strength = 0

    if (williamsr < -80) {
      signal = 'buy'
      strength = (-100 - williamsr) / 20
    } else if (williamsr > -20) {
      signal = 'sell'
      strength = (williamsr + 20) / 20
    }

    return {
      symbol: data.symbol,
      signal_type: signal,
      signal_strength: strength,
      indicators: { williams_r: williamsr },
      timestamp: data.timestamp,
    }
  })
}

// Commodity Channel Index (CCI)
export function evaluateCCIStrategy(
  strategy: Strategy,
  marketData: ExtendedMarketData[]
): StrategyEvaluationResult[] {
  const params = strategy.parameters as { threshold?: number }
  const threshold = params.threshold || 100

  return marketData.map(data => {
    const cci = data.cci || 0
    let signal: SignalType | null = null
    let strength = 0

    if (cci > threshold) {
      signal = 'buy'
      strength = Math.min(cci / (threshold * 2), 1)
    } else if (cci < -threshold) {
      signal = 'sell'
      strength = Math.min(Math.abs(cci) / (threshold * 2), 1)
    }

    return {
      symbol: data.symbol,
      signal_type: signal,
      signal_strength: strength,
      indicators: { cci },
      timestamp: data.timestamp,
    }
  })
}

// Ichimoku Cloud
export function evaluateIchimokuStrategy(
  strategy: Strategy,
  marketData: ExtendedMarketData[]
): StrategyEvaluationResult[] {
  return marketData.map(data => {
    const ichimoku = data.ichimoku || {
      tenkan: data.price,
      kijun: data.price,
      senkou_a: data.price,
      senkou_b: data.price,
    }

    let signal: SignalType | null = null
    let strength = 0

    // Tenkan > Kijun indicates uptrend
    if (ichimoku.tenkan > ichimoku.kijun && data.price > ichimoku.senkou_b) {
      signal = 'buy'
      strength = Math.min((ichimoku.tenkan - ichimoku.kijun) / data.price, 1)
    } else if (ichimoku.tenkan < ichimoku.kijun && data.price < ichimoku.senkou_a) {
      signal = 'sell'
      strength = Math.min((ichimoku.kijun - ichimoku.tenkan) / data.price, 1)
    }

    return {
      symbol: data.symbol,
      signal_type: signal,
      signal_strength: strength,
      indicators: { ichimoku },
      timestamp: data.timestamp,
    }
  })
}

// VWAP (Volume Weighted Average Price)
export function evaluateVWAPStrategy(
  strategy: Strategy,
  marketData: ExtendedMarketData[]
): StrategyEvaluationResult[] {
  return marketData.map(data => {
    const vwap = data.vwap || data.price
    let signal: SignalType | null = null
    let strength = 0

    if (data.price < vwap && data.price < vwap * 0.99) {
      signal = 'buy'
      strength = (vwap - data.price) / vwap
    } else if (data.price > vwap && data.price > vwap * 1.01) {
      signal = 'sell'
      strength = (data.price - vwap) / vwap
    }

    return {
      symbol: data.symbol,
      signal_type: signal,
      signal_strength: strength,
      indicators: { vwap },
      timestamp: data.timestamp,
    }
  })
}

// On-Balance Volume (OBV)
export function evaluateOBVStrategy(
  strategy: Strategy,
  marketData: ExtendedMarketData[]
): StrategyEvaluationResult[] {
  return marketData.map(data => {
    const obv = data.obv || 0
    let signal: SignalType | null = null
    let strength = 0

    if (obv > 0) {
      signal = 'buy'
      strength = Math.min(obv / 10000000, 1)
    } else if (obv < 0) {
      signal = 'sell'
      strength = Math.min(Math.abs(obv) / 10000000, 1)
    }

    return {
      symbol: data.symbol,
      signal_type: signal,
      signal_strength: strength,
      indicators: { obv },
      timestamp: data.timestamp,
    }
  })
}

// Average Directional Index (ADX)
export function evaluateADXStrategy(
  strategy: Strategy,
  marketData: ExtendedMarketData[]
): StrategyEvaluationResult[] {
  const params = strategy.parameters as { threshold?: number }
  const threshold = params.threshold || 25

  return marketData.map(data => {
    const adx = data.adx || 0
    let signal: SignalType | null = null
    let strength = 0

    if (adx > threshold && data.sma_20! > data.sma_50!) {
      signal = 'buy'
      strength = Math.min((adx - threshold) / (50 - threshold), 1)
    } else if (adx > threshold && data.sma_20! < data.sma_50!) {
      signal = 'sell'
      strength = Math.min((adx - threshold) / (50 - threshold), 1)
    }

    return {
      symbol: data.symbol,
      signal_type: signal,
      signal_strength: strength,
      indicators: { adx },
      timestamp: data.timestamp,
    }
  })
}

// Rate of Change (ROC)
export function evaluateROCStrategy(
  strategy: Strategy,
  marketData: ExtendedMarketData[]
): StrategyEvaluationResult[] {
  const params = strategy.parameters as { threshold?: number }
  const threshold = params.threshold || 0

  return marketData.map(data => {
    const roc = data.roc || 0
    let signal: SignalType | null = null
    let strength = 0

    if (roc > threshold) {
      signal = 'buy'
      strength = Math.min(roc / 10, 1)
    } else if (roc < -threshold) {
      signal = 'sell'
      strength = Math.min(Math.abs(roc) / 10, 1)
    }

    return {
      symbol: data.symbol,
      signal_type: signal,
      signal_strength: strength,
      indicators: { roc },
      timestamp: data.timestamp,
    }
  })
}

// Keltner Channel
export function evaluateKeltnerChannelStrategy(
  strategy: Strategy,
  marketData: ExtendedMarketData[]
): StrategyEvaluationResult[] {
  return marketData.map(data => {
    const kc = data.keltner_channel || { upper: data.price, middle: data.price, lower: data.price }
    let signal: SignalType | null = null
    let strength = 0

    if (data.price <= kc.lower) {
      signal = 'buy'
      strength = (kc.middle - data.price) / (kc.middle - kc.lower)
    } else if (data.price >= kc.upper) {
      signal = 'sell'
      strength = (data.price - kc.middle) / (kc.upper - kc.middle)
    }

    return {
      symbol: data.symbol,
      signal_type: signal,
      signal_strength: strength,
      indicators: { keltner_channel: kc },
      timestamp: data.timestamp,
    }
  })
}

// Supertrend
export function evaluateSuperTrendStrategy(
  strategy: Strategy,
  marketData: ExtendedMarketData[]
): StrategyEvaluationResult[] {
  return marketData.map(data => {
    const supertrend = data.supertrend || { value: data.price, direction: 'up' as const }
    let signal: SignalType | null = null
    let strength = 0.5

    if (supertrend.direction === 'down' && data.price > supertrend.value) {
      signal = 'buy'
      strength = Math.min((data.price - supertrend.value) / supertrend.value, 1)
    } else if (supertrend.direction === 'up' && data.price < supertrend.value) {
      signal = 'sell'
      strength = Math.min((supertrend.value - data.price) / supertrend.value, 1)
    }

    return {
      symbol: data.symbol,
      signal_type: signal,
      signal_strength: strength,
      indicators: { supertrend },
      timestamp: data.timestamp,
    }
  })
}

// Combined Strategy Evaluator
export async function evaluateCombinedStrategy(
  subStrategyResults: StrategyEvaluationResult[][],
  logicType: 'AND' | 'OR' = 'AND'
): Promise<StrategyEvaluationResult[]> {
  if (subStrategyResults.length === 0) return []

  const symbolMap = new Map<string, StrategyEvaluationResult[]>()

  // Group results by symbol
  subStrategyResults.forEach(results => {
    results.forEach(result => {
      if (!symbolMap.has(result.symbol)) {
        symbolMap.set(result.symbol, [])
      }
      symbolMap.get(result.symbol)!.push(result)
    })
  })

  // Combine results based on logic
  const combined: StrategyEvaluationResult[] = []

  symbolMap.forEach((results, symbol) => {
    if (logicType === 'AND') {
      // All strategies must have same signal
      const buys = results.filter(r => r.signal_type === 'buy')
      const sells = results.filter(r => r.signal_type === 'sell')

      if (buys.length === results.length) {
        const avgStrength = buys.reduce((sum, r) => sum + r.signal_strength, 0) / buys.length
        combined.push({
          symbol,
          signal_type: 'buy',
          signal_strength: avgStrength,
          indicators: { sub_strategies: results.length },
          timestamp: results[0].timestamp,
        })
      } else if (sells.length === results.length) {
        const avgStrength = sells.reduce((sum, r) => sum + r.signal_strength, 0) / sells.length
        combined.push({
          symbol,
          signal_type: 'sell',
          signal_strength: avgStrength,
          indicators: { sub_strategies: results.length },
          timestamp: results[0].timestamp,
        })
      }
    } else {
      // Any strategy signal counts
      const hasSignal = results.find(r => r.signal_type)
      if (hasSignal) {
        const avgStrength = results
          .filter(r => r.signal_type === hasSignal.signal_type)
          .reduce((sum, r) => sum + r.signal_strength, 0) / results.length

        combined.push({
          symbol,
          signal_type: hasSignal.signal_type,
          signal_strength: avgStrength,
          indicators: { sub_strategies: results.length },
          timestamp: hasSignal.timestamp,
        })
      }
    }
  })

  return combined
}
