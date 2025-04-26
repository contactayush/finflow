
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ChequeStatus = "pending" | "cleared" | "bounced" | "cancelled";
export type ChequeDirection = "incoming" | "outgoing";

export interface Cheque {
  id?: string;
  cheque_number: string;
  date: string;
  party: string;
  amount: number;
  bank_name: string;
  status: ChequeStatus;
  direction: ChequeDirection;
  financial_year: string;
  user_id?: string;
  description?: string;
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

export const fetchCheques = async (direction?: ChequeDirection) => {
  try {
    let query = supabase
      .from("cheques")
      .select("*")
      .order("date", { ascending: false });

    if (direction) {
      query = query.eq("direction", direction);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    toast.error(`Failed to fetch cheques: ${error.message}`);
    console.error("Error fetching cheques:", error);
    return [];
  }
};

export const addCheque = async (cheque: Cheque) => {
  try {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Add user_id to the cheque
    const chequeWithUserId = {
      ...cheque,
      user_id: user.id
    };

    const { data, error } = await supabase.from("cheques").insert(chequeWithUserId).select().single();

    if (error) throw error;
    toast.success("Cheque added successfully");
    return data;
  } catch (error: any) {
    toast.error(`Failed to add cheque: ${error.message}`);
    console.error("Error adding cheque:", error);
    throw error;
  }
};

export const updateCheque = async (id: string, cheque: Partial<Cheque>) => {
  try {
    const { data, error } = await supabase
      .from("cheques")
      .update(cheque)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    toast.success("Cheque updated successfully");
    return data;
  } catch (error: any) {
    toast.error(`Failed to update cheque: ${error.message}`);
    console.error("Error updating cheque:", error);
    throw error;
  }
};

export const deleteCheque = async (id: string) => {
  try {
    const { error } = await supabase.from("cheques").delete().eq("id", id);

    if (error) throw error;
    toast.success("Cheque deleted successfully");
    return true;
  } catch (error: any) {
    toast.error(`Failed to delete cheque: ${error.message}`);
    console.error("Error deleting cheque:", error);
    throw error;
  }
};
