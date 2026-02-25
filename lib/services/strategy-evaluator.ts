import { Strategy, MarketDataPoint, StrategyEvaluationResult, SignalType } from '@/lib/types';
import {
  evaluateStochasticStrategy,
  evaluateWilliamsRStrategy,
  evaluateCCIStrategy,
  evaluateIchimokuStrategy,
  evaluateVWAPStrategy,
  evaluateOBVStrategy,
  evaluateADXStrategy,
  evaluateROCStrategy,
  evaluateKeltnerChannelStrategy,
  evaluateSuperTrendStrategy,
  evaluateCombinedStrategy,
  ExtendedMarketData,
} from './strategy-evaluator-extended';

export async function evaluateStrategy(
  strategy: Strategy,
  marketData: MarketDataPoint[]
): Promise<StrategyEvaluationResult[]> {
  const extendedData = marketData as ExtendedMarketData[];
  
  switch (strategy.strategy_type) {
    case 'rsi':
      return evaluateRSIStrategy(strategy, marketData);
    case 'macd':
      return evaluateMACDStrategy(strategy, marketData);
    case 'bollinger_bands':
      return evaluateBollingerBandsStrategy(strategy, marketData);
    case 'moving_average':
      return evaluateMovingAverageStrategy(strategy, marketData);
    case 'momentum':
      return evaluateMomentumStrategy(strategy, marketData);
    case 'atr':
      return evaluateATRStrategy(strategy, marketData);
    case 'stochastic':
      return evaluateStochasticStrategy(strategy, extendedData);
    case 'williams_r':
      return evaluateWilliamsRStrategy(strategy, extendedData);
    case 'cci':
      return evaluateCCIStrategy(strategy, extendedData);
    case 'ichimoku':
      return evaluateIchimokuStrategy(strategy, extendedData);
    case 'vwap':
      return evaluateVWAPStrategy(strategy, extendedData);
    case 'obv':
      return evaluateOBVStrategy(strategy, extendedData);
    case 'adx':
      return evaluateADXStrategy(strategy, extendedData);
    case 'roc':
      return evaluateROCStrategy(strategy, extendedData);
    case 'keltner_channel':
      return evaluateKeltnerChannelStrategy(strategy, extendedData);
    case 'supertrend':
      return evaluateSuperTrendStrategy(strategy, extendedData);
    case 'combined':
      // For combined strategies, we'd need to fetch sub-strategies and evaluate them
      // This is handled in the market-scan API
      return [];
    default:
      return [];
  }
}

function evaluateRSIStrategy(
  strategy: Strategy,
  marketData: MarketDataPoint[]
): StrategyEvaluationResult[] {
  const params = strategy.parameters as {
    overbought?: number;
    oversold?: number;
    threshold?: number;
  };
  const overbought = params.overbought || 70;
  const oversold = params.oversold || 30;

  return marketData.map(data => {
    const rsi = data.rsi || 50;
    let signal: SignalType | null = null;
    let strength = 0;

    if (rsi <= oversold) {
      signal = 'buy';
      strength = (oversold - rsi) / oversold;
    } else if (rsi >= overbought) {
      signal = 'sell';
      strength = (rsi - overbought) / (100 - overbought);
    }

    return {
      symbol: data.symbol,
      signal_type: signal,
      signal_strength: strength,
      indicators: { rsi },
      timestamp: data.timestamp,
    };
  });
}

function evaluateMACDStrategy(
  strategy: Strategy,
  marketData: MarketDataPoint[]
): StrategyEvaluationResult[] {
  return marketData.map(data => {
    const macd = data.macd || { value: 0, signal: 0, histogram: 0 };
    let signal: SignalType | null = null;
    let strength = 0;

    if (macd.value > macd.signal && macd.histogram > 0) {
      signal = 'buy';
      strength = Math.min(Math.abs(macd.histogram) / 100, 1);
    } else if (macd.value < macd.signal && macd.histogram < 0) {
      signal = 'sell';
      strength = Math.min(Math.abs(macd.histogram) / 100, 1);
    }

    return {
      symbol: data.symbol,
      signal_type: signal,
      signal_strength: strength,
      indicators: { macd },
      timestamp: data.timestamp,
    };
  });
}

function evaluateBollingerBandsStrategy(
  strategy: Strategy,
  marketData: MarketDataPoint[]
): StrategyEvaluationResult[] {
  return marketData.map(data => {
    const bb = data.bollinger_bands || { upper: 0, middle: 0, lower: 0 };
    let signal: SignalType | null = null;
    let strength = 0;

    if (data.price <= bb.lower) {
      signal = 'buy';
      strength = (bb.middle - data.price) / (bb.middle - bb.lower);
    } else if (data.price >= bb.upper) {
      signal = 'sell';
      strength = (data.price - bb.middle) / (bb.upper - bb.middle);
    }

    return {
      symbol: data.symbol,
      signal_type: signal,
      signal_strength: strength,
      indicators: { bollinger_bands: bb },
      timestamp: data.timestamp,
    };
  });
}

function evaluateMovingAverageStrategy(
  strategy: Strategy,
  marketData: MarketDataPoint[]
): StrategyEvaluationResult[] {
  return marketData.map(data => {
    const sma20 = data.sma_20 || data.price;
    const sma50 = data.sma_50 || data.price;
    const sma200 = data.sma_200 || data.price;

    let signal: SignalType | null = null;
    let strength = 0;

    if (sma20 > sma50 && sma50 > sma200) {
      signal = 'buy';
      strength = Math.min((sma20 - sma200) / sma200, 1);
    } else if (sma20 < sma50 && sma50 < sma200) {
      signal = 'sell';
      strength = Math.min((sma200 - sma20) / sma200, 1);
    }

    return {
      symbol: data.symbol,
      signal_type: signal,
      signal_strength: strength,
      indicators: { sma_20: sma20, sma_50: sma50, sma_200: sma200 },
      timestamp: data.timestamp,
    };
  });
}

function evaluateMomentumStrategy(
  strategy: Strategy,
  marketData: MarketDataPoint[]
): StrategyEvaluationResult[] {
  return marketData.map(data => {
    const momentum = data.momentum || 0;
    let signal: SignalType | null = null;
    let strength = 0;

    if (momentum > 0) {
      signal = 'buy';
      strength = Math.min(momentum / 100, 1);
    } else if (momentum < 0) {
      signal = 'sell';
      strength = Math.min(Math.abs(momentum) / 100, 1);
    }

    return {
      symbol: data.symbol,
      signal_type: signal,
      signal_strength: strength,
      indicators: { momentum },
      timestamp: data.timestamp,
    };
  });
}

function evaluateATRStrategy(
  strategy: Strategy,
  marketData: MarketDataPoint[]
): StrategyEvaluationResult[] {
  const params = strategy.parameters as { atr_multiplier?: number };
  const multiplier = params.atr_multiplier || 1;

  return marketData.map(data => {
    const atr = (data.atr || 0) * multiplier;
    let signal: SignalType | null = null;
    let strength = 0;

    // ATR-based volatility signals
    if (atr > data.price * 0.02) {
      signal = 'buy';
      strength = Math.min(atr / (data.price * 0.05), 1);
    }

    return {
      symbol: data.symbol,
      signal_type: signal,
      signal_strength: strength,
      indicators: { atr },
      timestamp: data.timestamp,
    };
  });
}
