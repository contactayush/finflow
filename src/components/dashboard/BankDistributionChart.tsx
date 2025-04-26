import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getBankDistribution } from "@/services/dashboardService";
import { Skeleton } from "@/components/ui/skeleton";

import { TooltipProps } from "recharts";

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) return null;

  const { name, value } = payload[0];

  return (
    <div
      style={{
        backgroundColor: "hsl(var(--popover))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius)",
        padding: "0.5rem 0.75rem",
        color: "hsl(var(--foreground))",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <span style={{ fontWeight: 600 }}>{name}</span>: ₹{value.toLocaleString()}
    </div>
  );
};

const COLORS = ["#6E59A5", "#9B87F5", "#33C3F0", "#7FDBFF", "#0FA0CE"];

export function BankDistributionChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["bankDistribution"],
    queryFn: getBankDistribution,
  });

  if (isLoading) {
    return (
      <Card className="financial-card">
        <CardHeader>
          <CardTitle>Bank Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-[300px]" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="financial-card">
        <CardHeader>
          <CardTitle>Bank Distribution</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-sm text-red-500">
          Failed to load data.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="financial-card">
      <CardHeader>
        <CardTitle>Bank Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100} // Adjusting outer radius for more space
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => (
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>
                  {name}: {(percent * 100).toFixed(0)}%
                </span>
              )}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
