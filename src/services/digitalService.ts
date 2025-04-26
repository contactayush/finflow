
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type DigitalTransferType = "NEFT" | "IMPS" | "UPI" | "RTGS";
export type DigitalDirection = "incoming" | "outgoing";

export interface DigitalTransaction {
  id?: string;
  date: string;
  party: string;
  amount: number;
  bank_name: string;
  transfer_type: DigitalTransferType;
  reference_number?: string;
  direction: DigitalDirection;
  financial_year: string;
  user_id?: string;
  description: string;
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

export const fetchDigitalTransactions = async (direction?: DigitalDirection) => {
  try {
    let query = supabase
      .from("digital_transactions")
      .select("*")
      .order("date", { ascending: false });

    if (direction) {
      query = query.eq("direction", direction);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    toast.error(`Failed to fetch digital transactions: ${error.message}`);
    console.error("Error fetching digital transactions:", error);
    return [];
  }
};

export const addDigitalTransaction = async (transaction: DigitalTransaction) => {
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
      .from("digital_transactions")
      .insert(transactionWithUserId)
      .select()
      .single();

    if (error) throw error;
    toast.success("Digital transaction added successfully");
    return data;
  } catch (error: any) {
    toast.error(`Failed to add digital transaction: ${error.message}`);
    console.error("Error adding digital transaction:", error);
    throw error;
  }
};

export const updateDigitalTransaction = async (id: string, transaction: Partial<DigitalTransaction>) => {
  try {
    const { data, error } = await supabase
      .from("digital_transactions")
      .update(transaction)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    toast.success("Digital transaction updated successfully");
    return data;
  } catch (error: any) {
    toast.error(`Failed to update digital transaction: ${error.message}`);
    console.error("Error updating digital transaction:", error);
    throw error;
  }
};

export const deleteDigitalTransaction = async (id: string) => {
  try {
    const { error } = await supabase.from("digital_transactions").delete().eq("id", id);

    if (error) throw error;
    toast.success("Digital transaction deleted successfully");
    return true;
  } catch (error: any) {
    toast.error(`Failed to delete digital transaction: ${error.message}`);
    console.error("Error deleting digital transaction:", error);
    throw error;
  }
};
