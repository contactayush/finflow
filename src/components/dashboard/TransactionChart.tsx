import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Custom tooltip formatter
const formatter = (value: number) => {
  return `₹${value.toLocaleString("en-IN")}`;
};

// Function to fetch transaction data from all three tables and combine them
const fetchTransactionData = async () => {
  // Fetch data from the cash_transactions table
  const { data: cashData, error: cashError } = await supabase
    .from("cash_transactions")
    .select("party, direction, amount")
    .order("party", { ascending: true });

  // Fetch data from the cheques table
  const { data: chequeData, error: chequeError } = await supabase
    .from("cheques")
    .select("party, direction, amount")
    .order("party", { ascending: true });

  // Fetch data from the digital_transactions table
  const { data: digitalData, error: digitalError } = await supabase
    .from("digital_transactions")
    .select("party, direction, amount")
    .order("party", { ascending: true });

  if (cashError || chequeError || digitalError) {
    throw new Error(cashError?.message || chequeError?.message || digitalError?.message);
  }

  // Combine the data from all three tables
  const combinedData = [
    ...(cashData || []),
    ...(chequeData || []),
    ...(digitalData || []),
  ];

  // Aggregate data by party and direction
  const aggregatedData = combinedData.reduce((acc, { party, direction, amount }) => {
    const existing = acc.find(item => item.name === party);
    if (!existing) {
      acc.push({ name: party, incoming: 0, outgoing: 0 });
    }

    const item = acc.find(item => item.name === party);
    if (direction === "incoming") {
      item.incoming += amount;
    } else if (direction === "outgoing") {
      item.outgoing += amount;
    }

    return acc;
  }, []);

  return aggregatedData;
};

export function TransactionChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["transactionData"],
    queryFn: fetchTransactionData,
  });

  if (isLoading) {
    return (
      <Card className="financial-card">
        <CardHeader>
          <CardTitle>Transaction Overview</CardTitle>
        </CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="financial-card">
        <CardHeader>
          <CardTitle>Transaction Overview</CardTitle>
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
        <CardTitle>Transaction Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatter}
            />
            <Tooltip
              formatter={formatter}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Bar
              dataKey="incoming"
              fill="#6E59A5"
              radius={[4, 4, 0, 0]}
              name="Incoming"
            />
            <Bar
              dataKey="outgoing"
              fill="#33C3F0"
              radius={[4, 4, 0, 0]}
              name="Outgoing"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
