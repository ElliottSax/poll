'use client';

import React, { useState, useEffect } from 'react';
import { ultraThink, ULTRATHINK_PRESETS, PredictionResult } from '@/lib/ultrathink';
import { Brain, Zap, TrendingUp, Activity, BarChart3, Cpu } from 'lucide-react';

interface UltraThinkPanelProps {
  data?: any[];
  candidateId?: string;
}

export const UltraThinkPanel: React.FC<UltraThinkPanelProps> = ({ data = [], candidateId }) => {
  const [mode, setMode] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'prediction' | 'trends' | 'quantum'>('prediction');

  useEffect(() => {
    if (data.length > 0) {
      runAnalysis();
    }
  }, [data, mode]);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      // Apply preset configuration
      const engine = new (await import('@/lib/ultrathink')).UltraThinkEngine(ULTRATHINK_PRESETS[mode]);

      // Run predictions
      if (candidateId) {
        const pred = await engine.predict(candidateId, data);
        setPrediction(pred);
      }

      // Analyze trends
      const trendAnalysis = await engine.analyzeTrends(data);
      setTrends(trendAnalysis);
    } catch (error) {
      console.error('UltraThink analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'conservative':
        return <BarChart3 className="w-5 h-5" />;
      case 'balanced':
        return <Brain className="w-5 h-5" />;
      case 'aggressive':
        return <Zap className="w-5 h-5" />;
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case 'conservative':
        return 'text-blue-500 bg-blue-50';
      case 'balanced':
        return 'text-purple-500 bg-purple-50';
      case 'aggressive':
        return 'text-red-500 bg-red-50';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getModeColor()}`}>
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">UltraThink Analytics</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Advanced ML-Powered Insights</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex space-x-2">
          {(['conservative', 'balanced', 'aggressive'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        {['prediction', 'trends', 'quantum'].map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view as any)}
            className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${
              activeView === view
                ? 'text-indigo-600 border-indigo-600'
                : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Prediction View */}
          {activeView === 'prediction' && prediction && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Prediction</span>
                  <div className="flex items-center space-x-2">
                    {getModeIcon()}
                    <span className="text-sm text-gray-500">{mode} mode</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {(prediction.prediction * 100).toFixed(1)}%
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Confidence: {(prediction.confidence * 100).toFixed(0)}%
                </div>
              </div>

              {/* Factors */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Key Factors</h3>
                <div className="space-y-2">
                  {prediction.factors.map((factor, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            factor.impact === 'positive'
                              ? 'bg-green-500'
                              : factor.impact === 'negative'
                              ? 'bg-red-500'
                              : 'bg-gray-400'
                          }`}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{factor.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${factor.weight * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-10 text-right">
                          {(factor.weight * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trends View */}
          {activeView === 'trends' && trends && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Momentum</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {trends.momentum > 0 ? '+' : ''}{(trends.momentum * 100).toFixed(2)}%
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Volatility</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(trends.volatility * 100).toFixed(1)}%
                </div>
              </div>

              {trends.keyInflectionPoints && trends.keyInflectionPoints.length > 0 && (
                <div className="col-span-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Key Inflection Points
                  </h4>
                  <div className="space-y-1">
                    {trends.keyInflectionPoints.slice(0, 3).map((point: any, i: number) => (
                      <div key={i} className="text-xs text-gray-600 dark:text-gray-400">
                        {point.type === 'peak' ? '📈' : '📉'} Position {point.index}: {point.value.toFixed(1)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quantum View */}
          {activeView === 'quantum' && (
            <div className="text-center py-8">
              <Zap className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Quantum Mode {mode === 'aggressive' ? 'Active' : 'Available'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {mode === 'aggressive'
                  ? 'Quantum-inspired algorithms are actively processing multiple scenario superpositions'
                  : 'Switch to Aggressive mode to enable quantum-inspired optimization algorithms'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer Status */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>UltraThink Engine v1.0.0</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};