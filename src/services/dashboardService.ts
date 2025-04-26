import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getCurrentFinancialYear } from "./chequeService";

// Types
export interface TransactionSummary {
  total_inflow: number;
  cheque_transactions: number;
  cheque_amount: number;
  cash_transactions: number;
  cash_amount: number;
  digital_transactions: number;
  digital_amount: number;
  recent_transactions: any[];
}

export interface BankDistributionEntry {
  name: string;
  value: number;
}

// Dashboard Summary Function
export const fetchDashboardData = async (): Promise<TransactionSummary> => {
  try {
    const currentFinancialYear = getCurrentFinancialYear();

    const emptySummary: TransactionSummary = {
      total_inflow: 0,
      cheque_transactions: 0,
      cheque_amount: 0,
      cash_transactions: 0,
      cash_amount: 0,
      digital_transactions: 0,
      digital_amount: 0,
      recent_transactions: [],
    };

    // Fetch cheques
    const { data: chequesData, error: chequesError } = await supabase
      .from("cheques")
      .select("*")
      .eq("financial_year", currentFinancialYear)
      .order("date", { ascending: false });

    if (chequesError) throw chequesError;

    // Fetch cash
    const { data: cashData, error: cashError } = await supabase
      .from("cash_transactions")
      .select("*")
      .eq("financial_year", currentFinancialYear)
      .order("date", { ascending: false });

    if (cashError) throw cashError;

    // Fetch digital
    const { data: digitalData, error: digitalError } = await supabase
      .from("digital_transactions")
      .select("*")
      .eq("financial_year", currentFinancialYear)
      .order("date", { ascending: false });

    if (digitalError) throw digitalError;

    const cheques = chequesData || [];
    const cashTransactions = cashData || [];
    const digitalTransactions = digitalData || [];

    const chequeAmount = cheques.reduce((sum, item) => sum + Number(item.amount), 0);
    const cashAmount = cashTransactions.reduce((sum, item) => sum + Number(item.amount), 0);
    const digitalAmount = digitalTransactions.reduce((sum, item) => sum + Number(item.amount), 0);

    const allTransactions = [
      ...cheques.map((c) => ({
        ...c,
        type: "cheque",
        created_at: c.created_at,
      })),
      ...cashTransactions.map((c) => ({
        ...c,
        type: "cash",
        created_at: c.created_at,
      })),
      ...digitalTransactions.map((d) => ({
        ...d,
        type: "digital",
        created_at: d.created_at,
      })),
    ];

    const recentTransactions = allTransactions
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    return {
      total_inflow: chequeAmount + cashAmount + digitalAmount,
      cheque_transactions: cheques.length,
      cheque_amount: chequeAmount,
      cash_transactions: cashTransactions.length,
      cash_amount: cashAmount,
      digital_transactions: digitalTransactions.length,
      digital_amount: digitalAmount,
      recent_transactions: recentTransactions,
    };
  } catch (error: any) {
    toast.error(`Failed to fetch dashboard data: ${error.message}`);
    console.error("Error fetching dashboard data:", error);
    return {
      total_inflow: 0,
      cheque_transactions: 0,
      cheque_amount: 0,
      cash_transactions: 0,
      cash_amount: 0,
      digital_transactions: 0,
      digital_amount: 0,
      recent_transactions: [],
    };
  }
};

// Bank Distribution (from cheques table)
export const getBankDistribution = async (): Promise<BankDistributionEntry[]> => {
  try {
    const currentFinancialYear = getCurrentFinancialYear();

    // Fetch only from cheques and digital_transactions
    const [cheques, digital] = await Promise.all([
      supabase
        .from("cheques")
        .select("bank_name, amount")
        .eq("financial_year", currentFinancialYear),
      supabase
        .from("digital_transactions")
        .select("bank_name, amount")
        .eq("financial_year", currentFinancialYear),
    ]);

    if (cheques.error || digital.error) {
      throw new Error(
        cheques.error?.message || digital.error?.message
      );
    }

    const allData = [
      ...(cheques.data || []),
      ...(digital.data || []),
    ];

    const bankTotals: Record<string, number> = {};

    allData.forEach((item) => {
      const bank = item.bank_name?.trim() || "Others";
      const amount = Number(item.amount) || 0;
      bankTotals[bank] = (bankTotals[bank] || 0) + amount;
    });

    const { data: cashData, error: cashError } = await supabase
  .from("cash_transactions")
  .select("amount")
  .eq("financial_year", currentFinancialYear);

if (cashError) throw cashError;

const totalCash = (cashData || []).reduce((sum, tx) => sum + Number(tx.amount), 0);
if (totalCash > 0) {
  bankTotals["Cash"] = totalCash;
}

    return Object.entries(bankTotals).map(([name, value]) => ({
      name,
      value,
    }));
  } catch (error: any) {
    toast.error(`Failed to calculate bank distribution: ${error.message}`);
    console.error("Error fetching bank distribution:", error);
    return [];
  }
};

