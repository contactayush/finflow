
import { ArrowDown, ArrowUp, FileText, DollarSign, CreditCard } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type TransactionType = "cheque" | "cash" | "digital";
type TransactionDirection = "incoming" | "outgoing";
type ChequeStatus = "pending" | "cleared" | "bounced" | "cancelled";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  description?: string;
  party: string;
  type: TransactionType;
  direction: TransactionDirection;
  status?: ChequeStatus;
  reference_number?: string;
  transfer_type?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-IN", options);
};

const getTypeIcon = (type: TransactionType) => {
  switch (type) {
    case "cheque":
      return <FileText className="h-4 w-4" />;
    case "cash":
      return <DollarSign className="h-4 w-4" />;
    case "digital":
      return <CreditCard className="h-4 w-4" />;
  }
};

const getStatusBadge = (status?: ChequeStatus) => {
  if (!status) return null;

  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    cleared: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    bounced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  };

  return (
    <Badge className={cn("text-xs", statusClasses[status])}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export function RecentTransactions({ transactions = [] }: { transactions: Transaction[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full",
                      transaction.direction === "incoming"
                        ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                    )}
                  >
                    {transaction.direction === "incoming" ? (
                      <ArrowDown className="h-5 w-5" />
                    ) : (
                      <ArrowUp className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">
                      {transaction.party}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground space-x-2">
                      <span>{formatDate(transaction.date)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        {getTypeIcon(transaction.type)}
                        {transaction.type.charAt(0).toUpperCase() +
                          transaction.type.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div
                    className={cn(
                      "font-medium",
                      transaction.direction === "incoming"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {transaction.direction === "incoming" ? "+" : "-"}
                    {formatCurrency(Number(transaction.amount))}
                  </div>
                  {getStatusBadge(transaction.status as ChequeStatus)}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-muted-foreground">No recent transactions found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
