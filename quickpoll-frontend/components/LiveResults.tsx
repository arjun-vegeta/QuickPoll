'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PollOption } from '@/types/poll';
import { calculatePercentage } from '@/lib/utils';

interface LiveResultsProps {
  options: PollOption[];
  totalVotes: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function LiveResults({ options, totalVotes }: LiveResultsProps) {
  const data = options
    .sort((a, b) => a.position - b.position)
    .map((option, index) => ({
      name: option.option_text,
      votes: option.vote_count,
      percentage: calculatePercentage(option.vote_count, totalVotes),
      color: COLORS[index % COLORS.length],
    }));

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 border rounded shadow-lg">
                      <p className="font-semibold">{payload[0].payload.name}</p>
                      <p className="text-sm">Votes: {payload[0].value}</p>
                      <p className="text-sm">Percentage: {payload[0].payload.percentage}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded" 
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{item.name}</span>
                <span className="text-muted-foreground">
                  {item.votes} votes ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${item.percentage}%`,
                    backgroundColor: item.color 
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
