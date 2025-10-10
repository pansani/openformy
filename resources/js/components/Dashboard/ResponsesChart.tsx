import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { TrendingUpIcon } from 'lucide-react';

interface ChartDataPoint {
  date: string;
  responses: number;
}

interface ResponsesChartProps {
  data: ChartDataPoint[];
}

const chartConfig = {
  responses: {
    label: "Responses",
    color: "hsl(270, 60%, 60%)",
  },
} satisfies ChartConfig;

export function ResponsesChart({ data }: ResponsesChartProps) {
  const formattedData = data.map((point) => ({
    ...point,
    dateFormatted: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  const totalResponses = data.reduce((sum, point) => sum + point.responses, 0);

  if (totalResponses === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Responses Over Time</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16 text-muted-foreground">
            <TrendingUpIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No response data yet</p>
            <p className="text-xs mt-1">Your response analytics will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Responses Over Time</CardTitle>
        <CardDescription>
          Last 30 days • {totalResponses} total responses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-[16/5] w-full">
          <AreaChart data={formattedData} accessibilityLayer>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
            <XAxis
              dataKey="dateFormatted"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-muted-foreground"
              tickFormatter={(value, index) => {
                if (index % 5 === 0) return value;
                return '';
              }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="responses"
              stroke="var(--color-responses)"
              fill="var(--color-responses)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
