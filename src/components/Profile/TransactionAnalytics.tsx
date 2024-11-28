import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { name: 'Mon', gifts: 4 },
  { name: 'Tue', gifts: 3 },
  { name: 'Wed', gifts: 7 },
  { name: 'Thu', gifts: 2 },
  { name: 'Fri', gifts: 6 },
  { name: 'Sat', gifts: 8 },
  { name: 'Sun', gifts: 5 },
];

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
          <p className="text-sm text-gray-400">Total Views</p>
          <p className="text-2xl font-bold">1.2k</p>
        </div>
      </div>

      {/* Gift Activity Chart */}
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
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}; 