// src/services/transactionService.ts
import { supabase } from "../lib/supabaseClient";

export const searchTransactions = async (query: string, category: string) => {
  try {
    if (!query) return []; // If no query is provided, return empty

    const fetchTable = async (table: string) => {
      const { data, error } = await supabase
        .from(table)
        .select("*") // Select all columns dynamically
        .ilike("party", `%${query}%`); // Apply search filter only on the 'party' column

      if (error) throw error;
      return data || [];
    };

    let result: any[] = [];

    // If category is empty, fetch from all categories
    if (category === "") {
      const [cash, digital, cheques] = await Promise.all([
        fetchTable("cash_transactions"),
        fetchTable("digital_transactions"),
        fetchTable("cheques"),
      ]);
      result = [...cash, ...digital, ...cheques]; // Combine all results from different categories
    } else {
      // Fetch results based on the specific category
      if (category === "cash") {
        result = await fetchTable("cash_transactions");
      } else if (category === "digital") {
        result = await fetchTable("digital_transactions");
      } else if (category === "cheques") {
        result = await fetchTable("cheques");
      }
    }

    return result;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};
