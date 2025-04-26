
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CashDirection = "incoming" | "outgoing";

export interface CashTransaction {
  id?: string;
  date: string;
  party: string;
  amount: number;
  description?: string;
  direction: CashDirection;
  financial_year: string;
  user_id?: string;
}

export const getCurrentFinancialYear = () => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = today.getFullYear();
  
  // In India, financial year starts from April (month 4)
  if (currentMonth >= 4) {
    return `${currentYear}-${currentYear + 1}`;
  } else {
    return `${currentYear - 1}-${currentYear}`;
  }
};

export const fetchCashTransactions = async (direction?: CashDirection) => {
  try {
    let query = supabase
      .from("cash_transactions")
      .select("*")
      .order("date", { ascending: false });

    if (direction) {
      query = query.eq("direction", direction);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    toast.error(`Failed to fetch cash transactions: ${error.message}`);
    console.error("Error fetching cash transactions:", error);
    return [];
  }
};

export const addCashTransaction = async (transaction: CashTransaction) => {
  try {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Add user_id to the transaction
    const transactionWithUserId = {
      ...transaction,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from("cash_transactions")
      .insert(transactionWithUserId)
      .select()
      .single();

    if (error) throw error;
    toast.success("Cash transaction added successfully");
    return data;
  } catch (error: any) {
    toast.error(`Failed to add cash transaction: ${error.message}`);
    console.error("Error adding cash transaction:", error);
    throw error;
  }
};

export const updateCashTransaction = async (id: string, transaction: Partial<CashTransaction>) => {
  try {
    const { data, error } = await supabase
      .from("cash_transactions")
      .update(transaction)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    toast.success("Cash transaction updated successfully");
    return data;
  } catch (error: any) {
    toast.error(`Failed to update cash transaction: ${error.message}`);
    console.error("Error updating cash transaction:", error);
    throw error;
  }
};

export const deleteCashTransaction = async (id: string) => {
  try {
    const { error } = await supabase.from("cash_transactions").delete().eq("id", id);

    if (error) throw error;
    toast.success("Cash transaction deleted successfully");
    return true;
  } catch (error: any) {
    toast.error(`Failed to delete cash transaction: ${error.message}`);
    console.error("Error deleting cash transaction:", error);
    throw error;
  }
};
