import TransactionReportGenerator from '../components/reports/TransactionReportGenerator';

export default function ReportsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Transaction Reports</h1>
      <TransactionReportGenerator />
    </div>
  );
}