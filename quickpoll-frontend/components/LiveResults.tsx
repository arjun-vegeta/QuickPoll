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

// Generate shades of blue/indigo for each option
const generateColorShades = (count: number) => {
  const baseHue = 220; // Blue hue
  return Array.from({ length: count }, (_, i) => {
    const lightness = 70 - (i * (40 / Math.max(count - 1, 1))); // From light to dark
    const saturation = 70 + (i * (20 / Math.max(count - 1, 1))); // Increase saturation
    return `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
  });
};

export function LiveResults({ options, totalVotes }: LiveResultsProps) {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  // Generate color shades based on number of options
  const colors = generateColorShades(options.length);

  // Prepare data for charts
  const chartData = options
    .sort((a, b) => a.position - b.position)
    .map((option, index) => ({
      name: option.option_text,
      votes: option.vote_count,
      percentage: calculatePercentage(option.vote_count, totalVotes),
      fill: colors[index],
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
    <div className="space-y-6">
      {/* Chart Type Toggle */}
      <Tabs value={chartType} onValueChange={(value) => setChartType(value as "bar" | "pie")}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="bar" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Bar Chart
          </TabsTrigger>
          <TabsTrigger value="pie" className="gap-2">
            <PieChartIcon className="h-4 w-4" />
            Pie Chart
          </TabsTrigger>
        </TabsList>

        {/* Bar Chart */}
        <TabsContent value="bar" className="mt-6">
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                className="text-xs"
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-lg">
                        <p className="font-semibold text-sm mb-1">
                          {payload[0].payload.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Votes: <span className="font-medium text-foreground">{payload[0].value}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Percentage: <span className="font-medium text-foreground">{payload[0].payload.percentage}%</span>
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
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </TabsContent>

        {/* Pie Chart */}
        <TabsContent value="pie" className="mt-6">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[350px]"
          >
            <PieChart>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-lg">
                        <p className="font-semibold text-sm mb-1">
                          {payload[0].payload.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Votes: <span className="font-medium text-foreground">{payload[0].value}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Percentage: <span className="font-medium text-foreground">{payload[0].payload.percentage}%</span>
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
                label={({ payload, ...props }) => {
                  return (
                    <text
                      cx={props.cx}
                      cy={props.cy}
                      x={props.x}
                      y={props.y}
                      textAnchor={props.textAnchor}
                      dominantBaseline={props.dominantBaseline}
                      fill="hsl(var(--foreground))"
                      className="text-xs font-medium"
                    >
                      {payload.percentage}%
                    </text>
                  );
                }}
              />
            </PieChart>
          </ChartContainer>
        </TabsContent>
      </Tabs>

      {/* Legend with Progress Bars */}
      <div className="space-y-3 mt-6">
        {chartData.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="font-medium line-clamp-1">{item.name}</span>
              </div>
              <span className="text-muted-foreground font-medium shrink-0">
                {item.votes} ({item.percentage}%)
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.fill,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <p className="text-2xl font-bold text-foreground">{totalVotes}</p>
          <p className="text-sm text-muted-foreground">Total Votes</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <p className="text-2xl font-bold text-foreground">{options.length}</p>
          <p className="text-sm text-muted-foreground">Options</p>
        </div>
      </div>
    </div>
  );
}
