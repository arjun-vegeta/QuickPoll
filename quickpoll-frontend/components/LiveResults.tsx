"use client";

import { useState } from "react";
import { Pie, PieChart, Bar, BarChart, CartesianGrid, XAxis, LabelList, Cell } from "recharts";
import { PollOption } from "@/types/poll";
import { calculatePercentage } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

interface LiveResultsProps {
  options: PollOption[];
  totalVotes: number;
}

// Generate shades of green for each option - darker for higher percentages
const generateColorShades = (count: number) => {
  // Base green color #34CC41
  const baseColor = { h: 127, s: 60, l: 50 };
  
  return Array.from({ length: count }, (_, i) => {
    // Vary lightness from darker to lighter (index 0 = darkest = highest votes)
    const lightness = baseColor.l - 15 + (i * (35 / Math.max(count - 1, 1)));
    // Slightly vary saturation
    const saturation = baseColor.s + 10 - (i * (15 / Math.max(count - 1, 1)));
    return `hsl(${baseColor.h}, ${saturation}%, ${lightness}%)`;
  });
};

export function LiveResults({ options, totalVotes }: LiveResultsProps) {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  // Prepare data for charts - sorted by position first
  const sortedOptions = options.sort((a, b) => a.position - b.position);
  
  // Sort by votes to assign colors (highest votes = darkest)
  const optionsByVotes = [...sortedOptions].sort((a, b) => b.vote_count - a.vote_count);
  
  // Create color map based on vote ranking
  const colorMap = new Map();
  const colors = generateColorShades(options.length);
  optionsByVotes.forEach((option, index) => {
    colorMap.set(option.id, colors[index]);
  });

  // Prepare data for charts with colors based on vote ranking
  const chartData = sortedOptions.map((option) => ({
      name: option.option_text,
      votes: option.vote_count,
      percentage: calculatePercentage(option.vote_count, totalVotes),
      fill: colorMap.get(option.id),
    }));

  // Create chart config
  const chartConfig: ChartConfig = {
    votes: {
      label: "Votes",
    },
    ...Object.fromEntries(
      chartData.map((item, index) => [
        `option${index}`,
        {
          label: item.name,
          color: colors[index],
        },
      ])
    ),
  };

  return (
    <div className="space-y-6 overflow-visible">
      {/* Progress Bars First */}
      <div className="space-y-3">
        {chartData.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="font-medium line-clamp-1 text-[#E6E6E6]">{item.name}</span>
              </div>
              <span className="text-[#A4A4A4] font-medium shrink-0 ml-2">
                {item.votes} ({item.percentage}%)
              </span>
            </div>
            <div className="w-full bg-[#1C1C1C] rounded-full h-3 overflow-hidden border border-[#323232]">
              <div
                className="h-3 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.fill,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Chart Type Toggle */}
      <Tabs value={chartType} onValueChange={(value) => setChartType(value as "bar" | "pie")} className="mt-8 overflow-visible">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-11 bg-[#1C1C1C] border border-[#323232]">
          <TabsTrigger value="bar" className="gap-2 text-sm font-medium text-[#A4A4A4] data-[state=active]:text-black data-[state=active]:bg-[#34CC41]">
            <BarChart3 className="h-4 w-4" />
            Bar Chart
          </TabsTrigger>
          <TabsTrigger value="pie" className="gap-2 text-sm font-medium text-[#A4A4A4] data-[state=active]:text-black data-[state=active]:bg-[#34CC41]">
            <PieChartIcon className="h-4 w-4" />
            Pie Chart
          </TabsTrigger>
        </TabsList>

        {/* Bar Chart */}
        <TabsContent value="bar" className="mt-6 overflow-visible">
          <ChartContainer config={chartConfig} className="min-h-[400px] w-full overflow-visible">
            <BarChart
              data={chartData}
              margin={{ top: 30, right: 30, bottom: 120, left: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={120}
                interval={0}
                className="text-xs"
                tick={{ fill: "#E6E6E6" }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-[#323232] bg-[#1C1C1C] p-3 shadow-lg">
                        <p className="font-semibold text-sm mb-1 text-[#E6E6E6]">
                          {payload[0].payload.name}
                        </p>
                        <p className="text-sm text-[#A4A4A4]">
                          Votes: <span className="font-medium text-[#E6E6E6]">{payload[0].value}</span>
                        </p>
                        <p className="text-sm text-[#A4A4A4]">
                          Percentage: <span className="font-medium text-[#E6E6E6]">{payload[0].payload.percentage}%</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList
                  position="top"
                  offset={12}
                  style={{ fill: '#E6E6E6' }}
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </TabsContent>

        {/* Pie Chart */}
        <TabsContent value="pie" className="mt-6 overflow-visible">
          <div className="w-full overflow-visible" style={{ minHeight: '500px' }}>
            <ChartContainer
              config={chartConfig}
              className="mx-auto w-full h-full overflow-visible"
            >
              <PieChart margin={{ top: 40, right: 100, bottom: 40, left: 100 }}>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-[#323232] bg-[#1C1C1C] p-3 shadow-lg">
                        <p className="font-semibold text-sm mb-1 text-[#E6E6E6]">
                          {payload[0].payload.name}
                        </p>
                        <p className="text-sm text-[#A4A4A4]">
                          Votes: <span className="font-medium text-[#E6E6E6]">{payload[0].value}</span>
                        </p>
                        <p className="text-sm text-[#A4A4A4]">
                          Percentage: <span className="font-medium text-[#E6E6E6]">{payload[0].payload.percentage}%</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={chartData}
                dataKey="votes"
                nameKey="name"
                labelLine={{
                  stroke: '#323232',
                  strokeWidth: 1,
                }}
                label={({ cx, cy, midAngle, outerRadius, payload }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius + 30;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="#E6E6E6"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                      className="text-xs font-medium"
                    >
                      <tspan x={x} dy="-0.6em">{payload.name}</tspan>
                      <tspan x={x} dy="1.2em" className="font-bold">{payload.percentage}%</tspan>
                    </text>
                  );
                }}
              />
            </PieChart>
          </ChartContainer>
          </div>
        </TabsContent>
      </Tabs>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#323232]">
        <div className="text-center p-4 rounded-lg bg-[#1C1C1C] border border-[#323232]">
          <p className="text-2xl font-bold text-[#E6E6E6]">{totalVotes}</p>
          <p className="text-sm text-[#A4A4A4]">Total Votes</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-[#1C1C1C] border border-[#323232]">
          <p className="text-2xl font-bold text-[#E6E6E6]">{options.length}</p>
          <p className="text-sm text-[#A4A4A4]">Options</p>
        </div>
      </div>
    </div>
  );
}
