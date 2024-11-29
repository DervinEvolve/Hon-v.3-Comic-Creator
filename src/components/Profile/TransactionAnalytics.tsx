import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Sparkles, TrendingUp, Calendar, Target } from 'lucide-react';

const mockData = [
  { name: 'Mon', gifts: 4, amount: 1.2 },
  { name: 'Tue', gifts: 3, amount: 0.9 },
  { name: 'Wed', gifts: 7, amount: 2.1 },
  { name: 'Thu', gifts: 2, amount: 0.6 },
  { name: 'Fri', gifts: 6, amount: 1.8 },
  { name: 'Sat', gifts: 8, amount: 2.4 },
  { name: 'Sun', gifts: 5, amount: 1.5 },
];

const comicAnalytics = {
  totalComics: 8,
  aiGenerated: 5,
  traditional: 3,
  performance: [
    { type: 'AI Generated', comics: 5, avgSupport: 0.8, color: '#818CF8' },
    { type: 'Traditional', comics: 3, avgSupport: 0.6, color: '#34D399' }
  ],
  topPerformers: [
    { name: 'Comic A', isAI: true, support: 2.4 },
    { name: 'Comic B', isAI: false, support: 1.8 },
    { name: 'Comic C', isAI: true, support: 1.6 }
  ]
};

interface EarningInsight {
  currentTrend: number;
  projectedMonthly: number;
  recommendedActions: {
    publishFrequency: string;
    contentType: string;
    potentialIncrease: number;
  };
}

const mockInsights: EarningInsight = {
  currentTrend: 2.5,  // SOL per week
  projectedMonthly: 10,
  recommendedActions: {
    publishFrequency: '3-4 comics per week',
    contentType: '70% AI-enhanced content',
    potentialIncrease: 30, // percentage
  }
};

export const TransactionAnalytics: React.FC = () => {
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-6">Transaction Analytics</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <p className="text-sm text-gray-400">Total Gifts</p>
          <p className="text-2xl font-bold">35</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <p className="text-sm text-gray-400">Unique Supporters</p>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <p className="text-sm text-gray-400">Comics Published</p>
          <p className="text-2xl font-bold">8</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <p className="text-sm text-gray-400">Avg Gift Size</p>
          <p className="text-2xl font-bold">0.3 SOL</p>
          <p className="text-xs text-green-400">↑ 0.05 SOL this week</p>
        </div>
      </div>

      {/* Enhanced Gift Activity Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockData}>
            <XAxis
              dataKey="name"
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              yAxisId="left"
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              yAxisId="right"
              orientation="right"
              unit=" SOL"
            />
            <Tooltip
              contentStyle={{
                background: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: 'white'
              }}
            />
            <Bar
              dataKey="gifts"
              fill="#60A5FA"
              radius={[4, 4, 0, 0]}
              yAxisId="left"
            />
            <Bar
              dataKey="amount"
              fill="#34D399"
              radius={[4, 4, 0, 0]}
              yAxisId="right"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* New Comic Analytics Section */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Comic Performance Analytics</h3>
        
        {/* Comic Type Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-400">Content Distribution</h4>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={comicAnalytics.performance}
                      dataKey="comics"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={40}
                    >
                      {comicAnalytics.performance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-400" />
                  <span className="text-sm">AI Generated ({comicAnalytics.aiGenerated})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-sm">Traditional ({comicAnalytics.traditional})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Comparison */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-4">Top Performing Comics</h4>
            <div className="space-y-3">
              {comicAnalytics.topPerformers.map((comic, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {comic.isAI && <Sparkles className="w-4 h-4 text-indigo-400" />}
                    <span className="text-sm">{comic.name}</span>
                  </div>
                  <span className="text-sm font-medium">{comic.support} SOL</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Growth Insights Section */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold">Growth Insights</h3>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Trajectory */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">Current Trajectory</h4>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold">{mockInsights.projectedMonthly} SOL</span>
                <span className="text-sm text-gray-400">projected this month</span>
              </div>
              <div className="mt-2 text-sm text-gray-400">
                Based on your last {mockInsights.currentTrend} SOL weekly average
              </div>
            </div>

            {/* Optimization Suggestions */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">
                Optimization Suggestions
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">
                    Publish {mockInsights.recommendedActions.publishFrequency}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm">
                    Maintain {mockInsights.recommendedActions.contentType}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-sm">
                    Potential {mockInsights.recommendedActions.potentialIncrease}% increase in support
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Path Visualization */}
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
            <div className="text-xs text-gray-400 mb-2">
              Support Growth Path
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                  style={{ width: '60%' }}
                />
              </div>
              <span className="text-xs text-gray-400">60% to next milestone</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 