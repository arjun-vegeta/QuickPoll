"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { PollOption } from "@/types/poll";
import { calculatePercentage } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface LiveResultsProps {
  options: PollOption[];
  totalVotes: number;
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

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
                      <p className="text-sm">
                        Percentage: {payload[0].payload.percentage}%
                      </p>
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

      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium">{item.name}</span>
              </div>
              <span className="text-muted-foreground">
                {item.votes} votes ({item.percentage}%)
              </span>
            </div>
            <Progress
              value={item.percentage}
              className="h-2"
              style={
                {
                  "--progress-background": item.color,
                } as React.CSSProperties
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
