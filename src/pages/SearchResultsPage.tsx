import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { searchTransactions } from "../services/transactionsService";

const SearchResultsPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("query") || "";
  const category = params.get("category") || "";

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      const data = await searchTransactions(query, category);
      setResults(data);
      setLoading(false);
    };

    if (query) {
      fetchResults();
    }
  }, [query, category]);

  const formatAmount = (amount: number) =>
    amount ? `₹${amount.toLocaleString("en-IN")}` : "-";

  const formatDate = (date: string) =>
    date ? new Date(date).toLocaleDateString("en-IN") : "-";

  const formatTimestamp = (timestamp: string) =>
    timestamp ? new Date(timestamp).toLocaleString("en-IN") : "-";

  const renderCashTransaction = (txn: any, i: number) => (
    <div key={i} className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
      <p><strong>Party:</strong> {txn.party || "-"}</p>
      <p><strong>Amount:</strong> {formatAmount(txn.amount)}</p>
      <p><strong>Date:</strong> {formatDate(txn.date)}</p>
      <p><strong>Description:</strong> {txn.description || "-"}</p>
      <p><strong>Direction:</strong> {txn.direction || "-"}</p>
      <p><strong>Financial Year:</strong> {txn.financial_year || "-"}</p>
    </div>
  );

  const renderChequeTransaction = (txn: any, i: number) => (
    <div key={i} className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
      <p><strong>Party:</strong> {txn.party || "-"}</p>
      <p><strong>Amount:</strong> {formatAmount(txn.amount)}</p>
      <p><strong>Cheque Number:</strong> {txn.cheque_number || "-"}</p>
      <p><strong>Bank Name:</strong> {txn.bank_name || "-"}</p>
      <p><strong>Status:</strong> {txn.status || "-"}</p>
      <p><strong>Date:</strong> {formatDate(txn.date)}</p>
      <p><strong>Direction:</strong> {txn.direction || "-"}</p>
      <p><strong>Financial Year:</strong> {txn.financial_year || "-"}</p>
    </div>
  );

  const renderDigitalTransaction = (txn: any, i: number) => (
    <div key={i} className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
      <p><strong>Party:</strong> {txn.party || "-"}</p>
      <p><strong>Amount:</strong> {formatAmount(txn.amount)}</p>
      <p><strong>Bank Name:</strong> {txn.bank_name || "-"}</p>
      <p><strong>Transfer Type:</strong> {txn.transfer_type || "-"}</p>
      <p><strong>Reference Number:</strong> {txn.reference_number || "-"}</p>
      <p><strong>Date:</strong> {formatDate(txn.date)}</p>
      <p><strong>Direction:</strong> {txn.direction || "-"}</p>
      <p><strong>Financial Year:</strong> {txn.financial_year || "-"}</p>
    </div>
  );

  const renderTransaction = (txn: any, index: number) => {
    if ("cheque_number" in txn) return renderChequeTransaction(txn, index);
    if ("transfer_type" in txn) return renderDigitalTransaction(txn, index);
    return renderCashTransaction(txn, index);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Search Results for "{query}"</h1>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : results.length === 0 ? (
        <div className="text-center text-gray-500">No transactions found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((transaction, index) => renderTransaction(transaction, index))}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
