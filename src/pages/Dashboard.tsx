
import { useEffect, useState } from "react";
import { FileText, DollarSign, CreditCard, TrendingUp, RefreshCw } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { TransactionChart } from "@/components/dashboard/TransactionChart";
import { BankDistributionChart } from "@/components/dashboard/BankDistributionChart";
import { RecentTransactions } from "@/components/transactions/RecentTransactions";
import { fetchDashboardData, TransactionSummary } from "@/services/dashboardService";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await fetchDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    loadDashboardData();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Financial overview for the current period
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Inflow"
          value={dashboardData ? formatCurrency(dashboardData.total_inflow) : "₹0"}
          description="Current Financial Year"
          icon={<TrendingUp className="h-5 w-5" />}
          trend={dashboardData?.total_inflow > 0 ? { value: 12, isPositive: true } : undefined}
        />
        <StatCard
          title="Cheque Transactions"
          value={dashboardData ? formatCurrency(dashboardData.cheque_amount) : "₹0"}
          description={`${dashboardData?.cheque_transactions || 0} transactions`}
          icon={<FileText className="h-5 w-5" />}
          trend={dashboardData?.cheque_amount > 0 ? { value: 8, isPositive: true } : undefined}
        />
        <StatCard
          title="Cash Transactions"
          value={dashboardData ? formatCurrency(dashboardData.cash_amount) : "₹0"}
          description={`${dashboardData?.cash_transactions || 0} transactions`}
          icon={<DollarSign className="h-5 w-5" />}
          trend={dashboardData?.cash_amount > 0 ? { value: 3, isPositive: true } : undefined}
        />
        <StatCard
          title="Digital Transfers"
          value={dashboardData ? formatCurrency(dashboardData.digital_amount) : "₹0"}
          description={`${dashboardData?.digital_transactions || 0} transactions`}
          icon={<CreditCard className="h-5 w-5" />}
          trend={dashboardData?.digital_amount > 0 ? { value: 18, isPositive: true } : undefined}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-4">
          <TransactionChart />
        </div>
        <div className="md:col-span-3">
          <BankDistributionChart />
        </div>
      </div>

      <div>
        <RecentTransactions transactions={dashboardData?.recent_transactions || []} />
      </div>
    </div>
  );
};

export default Dashboard;
