import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient'; // Adjust import path as needed
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Define PDF styles for the report
const styles = StyleSheet.create({
    page: {
      padding: 30,
      backgroundColor: '#ffffff',
    },
    header: {
      fontSize: 22,  // Adjusted size for better readability
      marginBottom: 15,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    subHeader: {
      fontSize: 16,  // Slightly smaller for subheaders
      marginTop: 15,
      marginBottom: 10,
      fontWeight: 'bold',
      color: '#333',
      borderBottomWidth: 1,
      borderBottomColor: '#cccccc',
      paddingBottom: 5,
    },
    tableHeader: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#000',
      paddingBottom: 5,
      paddingTop: 5,
      backgroundColor: '#f5f5f5',
      fontWeight: 'bold',
      fontSize: 12,  // Reduced font size
      textAlign: 'left',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#cccccc',
      paddingBottom: 5,
      paddingTop: 5,
      fontSize: 12,  // Reduced font size for the row content
    },
    tableCell: {
      flex: 1,  // Adjust flex value for balanced spacing
      padding: 8,  // Increased padding to avoid overlap
    },
    smallCell: {
      flex: 0.8,  // Adjusted size to make it smaller and prevent overlap
      padding: 8,
    },
    largeCell: {
      flex: 2,  // Increased flex for wider columns
      padding: 8,
    },
    footer: {
      position: 'absolute',
      bottom: 30,
      left: 30,
      right: 30,
      textAlign: 'center',
      fontSize: 10,
      color: '#666',
    },
    summary: {
      marginTop: 20,
      marginBottom: 10,
      padding: 10,
      backgroundColor: '#f9f9f9',
    },
    summaryItem: {
      flexDirection: 'row',
      marginBottom: 5,
    },
    summaryLabel: {
      flex: 2,
      fontWeight: 'bold',
    },
    summaryValue: {
      flex: 1,
      textAlign: 'right',
    },
  });
  

// Define the structure of transaction data with standardized date field
interface CashTransaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  transaction_type: string;
  direction: string;
}

interface DigitalTransaction {
  id: number;
  amount: number;
  description: string;
  date: string; 
  payment_method: string;
  bank_name: string;
  transaction_type: string;
  direction: string;
}

interface ChequeTransaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  cheque_number: string;
  bank_name: string;
  transaction_type: string;
  direction: string;
}

// Report type enum
type ReportType = 'all' | 'cash-only' | 'digital-cheque' | 'bank-wise';

// PDF Document Component
const TransactionReport = ({ 
    cashTransactions, 
    digitalTransactions, 
    chequeTransactions,
    startDate,
    endDate,
    reportType,
    selectedBank
  }: { 
    cashTransactions: CashTransaction[],
    digitalTransactions: DigitalTransaction[],
    chequeTransactions: ChequeTransaction[],
    startDate: string,
    endDate: string,
    reportType: ReportType,
    selectedBank?: string
  }) => {
    // Filter transactions by bank if bank-wise report
    const filteredDigitalTransactions = reportType === 'bank-wise' && selectedBank 
      ? digitalTransactions.filter(t => t.bank_name === selectedBank)
      : digitalTransactions;
      
    const filteredChequeTransactions = reportType === 'bank-wise' && selectedBank
      ? chequeTransactions.filter(t => t.bank_name === selectedBank)
      : chequeTransactions;
    
    // Calculate total amounts
    const totalCash = (reportType === 'all' || reportType === 'cash-only') 
      ? cashTransactions.reduce((sum, transaction) => 
          sum + (transaction.transaction_type === 'income' ? transaction.amount : -transaction.amount), 0)
      : 0;
    
    const totalDigital = (reportType === 'all' || reportType === 'digital-cheque' || reportType === 'bank-wise') 
      ? filteredDigitalTransactions.reduce((sum, transaction) => 
          sum + (transaction.transaction_type === 'income' ? transaction.amount : -transaction.amount), 0)
      : 0;
    
    const totalCheque = (reportType === 'all' || reportType === 'digital-cheque' || reportType === 'bank-wise') 
      ? filteredChequeTransactions.reduce((sum, transaction) => 
          sum + (transaction.transaction_type === 'income' ? transaction.amount : -transaction.amount), 0)
      : 0;
    
    const grandTotal = totalCash + totalDigital + totalCheque;

    // Get report title based on report type
    const getReportTitle = () => {
      switch(reportType) {
        case 'all': return 'Complete Transaction Report';
        case 'cash-only': return 'Cash Transactions Report';
        case 'digital-cheque': return 'Digital & Cheque Transactions Report';
        case 'bank-wise': return `Bank Transactions Report - ${selectedBank}`;
        default: return 'Transaction Report';
      }
    };
  
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.header}>{getReportTitle()}</Text>
          
          <View style={styles.summary}>
            <Text style={{ fontSize: 14, marginBottom: 10, fontWeight: 'bold' }}>
              Report Period: {format(new Date(startDate), "MMMM d, yyyy")} - {format(new Date(endDate), "MMMM d, yyyy")}
            </Text>
            
            {(reportType === 'all' || reportType === 'cash-only') && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Cash Transactions:</Text>
                <Text style={styles.summaryValue}>${Math.abs(totalCash).toFixed(2)}</Text>
              </View>
            )}
            
            {(reportType === 'all' || reportType === 'digital-cheque' || reportType === 'bank-wise') && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Digital Transactions:</Text>
                <Text style={styles.summaryValue}>${Math.abs(totalDigital).toFixed(2)}</Text>
              </View>
            )}
            
            {(reportType === 'all' || reportType === 'digital-cheque' || reportType === 'bank-wise') && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Cheque Transactions:</Text>
                <Text style={styles.summaryValue}>${Math.abs(totalCheque).toFixed(2)}</Text>
              </View>
            )}
            
            <View style={{ ...styles.summaryItem, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#000' }}>
              <Text style={{ ...styles.summaryLabel, fontWeight: 'bold' }}>Grand Total:</Text>
              <Text style={{ ...styles.summaryValue, fontWeight: 'bold' }}>${Math.abs(grandTotal).toFixed(2)}</Text>
            </View>
          </View>
  
          {/* Cash Transactions - only show if reportType is 'all' or 'cash-only' */}
          {(reportType === 'all' || reportType === 'cash-only') && (
            <>
              <Text style={styles.subHeader}>Cash Transactions</Text>
              <View style={styles.tableHeader}>
                <Text style={styles.smallCell}>Date</Text>
                <Text style={styles.largeCell}>Description</Text>
                <Text style={styles.smallCell}>Credit/Debit</Text>
                <Text style={styles.tableCell}>Amount</Text>
              </View>
              {cashTransactions.length > 0 ? (
                cashTransactions.map((transaction, index) => {
                  if (index > 0 && index % 10 === 0) {
                    // Create a new page after every 10 transactions
                    return (
                      <>
                        <Page size="A4" style={styles.page} key={`page-cash-${index}`} />
                        <View style={styles.tableRow}>
                          <Text style={styles.smallCell}>{format(new Date(transaction.date), "MMM d, yyyy")}</Text>
                          <Text style={styles.largeCell}>{transaction.description}</Text>
                          <Text style={styles.smallCell}>
                            {transaction.direction === 'incoming' ? 'Credit' : 'Debit'}
                          </Text>
                          <Text style={styles.tableCell}>
                            {Math.abs(transaction.amount).toLocaleString()}
                          </Text>
                        </View>
                      </>
                    );
                  }
                  return (
                    <View key={transaction.id} style={styles.tableRow}>
                      <Text style={styles.smallCell}>{format(new Date(transaction.date), "MMM d, yyyy")}</Text>
                      <Text style={styles.largeCell}>{transaction.description}</Text>
                      <Text style={styles.smallCell}>
                        {transaction.direction === 'incoming' ? 'Credit' : 'Debit'}
                      </Text>
                      <Text style={styles.tableCell}>
                        {Math.abs(transaction.amount).toLocaleString()}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <Text style={{ padding: 10, fontStyle: 'italic' }}>No cash transactions in this period.</Text>
              )}
            </>
          )}
  
          {/* Digital Transactions - only show if reportType is 'all', 'digital-cheque', or 'bank-wise' */}
          {(reportType === 'all' || reportType === 'digital-cheque' || reportType === 'bank-wise') && (
            <>
              <Text style={styles.subHeader}>Digital Transactions</Text>
              <View style={styles.tableHeader}>
                <Text style={styles.smallCell}>Date</Text>
                <Text style={styles.largeCell}>Description</Text>
                <Text style={styles.largeCell}>Bank</Text>
                <Text style={styles.smallCell}>Credit/Debit</Text>
                <Text style={styles.tableCell}>Amount</Text>
              </View>
              {filteredDigitalTransactions.length > 0 ? (
                filteredDigitalTransactions.map((transaction, index) => {
                  if (index > 0 && index % 10 === 0) {
                    // Create a new page after every 10 transactions
                    return (
                      <>
                        <Page size="A4" style={styles.page} key={`page-digital-${index}`} />
                        <View style={styles.tableRow}>
                          <Text style={styles.smallCell}>{format(new Date(transaction.date), "MMM d, yyyy")}</Text>
                          <Text style={styles.largeCell}>{transaction.description}</Text>
                          <Text style={styles.largeCell}>{transaction.bank_name}</Text>
                          <Text style={styles.smallCell}>
                            {transaction.direction === 'incoming' ? 'Credit' : 'Debit'}
                          </Text>
                          <Text style={styles.tableCell}>
                            {Math.abs(transaction.amount).toLocaleString()}
                          </Text>
                        </View>
                      </>
                    );
                  }
                  return (
                    <View key={transaction.id} style={styles.tableRow}>
                      <Text style={styles.smallCell}>{format(new Date(transaction.date), "MMM d, yyyy")}</Text>
                      <Text style={styles.largeCell}>{transaction.description}</Text>
                      <Text style={styles.largeCell}>{transaction.bank_name}</Text>
                      <Text style={styles.smallCell}>
                        {transaction.direction === 'incoming' ? 'Credit' : 'Debit'}
                      </Text>
                      <Text style={styles.tableCell}>
                        {Math.abs(transaction.amount).toLocaleString()}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <Text style={{ padding: 10, fontStyle: 'italic' }}>No digital transactions in this period.</Text>
              )}
            </>
          )}
  
          {/* Cheque Transactions - only show if reportType is 'all', 'digital-cheque', or 'bank-wise' */}
          {(reportType === 'all' || reportType === 'digital-cheque' || reportType === 'bank-wise') && (
            <>
              <Text style={styles.subHeader}>Cheque Transactions</Text>
              <View style={styles.tableHeader}>
                <Text style={styles.smallCell}>Date</Text>
                <Text style={styles.tableCell}>Description</Text>
                <Text style={styles.smallCell}>Cheque #</Text>
                <Text style={styles.tableCell}>Bank</Text>
                <Text style={styles.smallCell}>Credit/Debit</Text>
                <Text style={styles.tableCell}>Amount</Text>
              </View>
              {filteredChequeTransactions.length > 0 ? (
                filteredChequeTransactions.map((transaction, index) => {
                  if (index > 0 && index % 10 === 0) {
                    // Create a new page after every 10 transactions
                    return (
                      <>
                        <Page size="A4" style={styles.page} key={`page-cheque-${index}`} />
                        <View style={styles.tableRow}>
                          <Text style={styles.smallCell}>{format(new Date(transaction.date), "MMM d, yyyy")}</Text>
                          <Text style={styles.tableCell}>{transaction.description}</Text>
                          <Text style={styles.smallCell}>{transaction.cheque_number}</Text>
                          <Text style={styles.tableCell}>{transaction.bank_name}</Text>
                          <Text style={styles.smallCell}>
                            {transaction.direction === 'incoming' ? 'Credit' : 'Debit'}
                          </Text>
                          <Text style={styles.tableCell}>
                            {Math.abs(transaction.amount).toLocaleString()}
                          </Text>
                        </View>
                      </>
                    );
                  }
                  return (
                    <View key={transaction.id} style={styles.tableRow}>
                      <Text style={styles.smallCell}>{format(new Date(transaction.date), "MMM d, yyyy")}</Text>
                      <Text style={styles.tableCell}>{transaction.description}</Text>
                      <Text style={styles.smallCell}>{transaction.cheque_number}</Text>
                      <Text style={styles.tableCell}>{transaction.bank_name}</Text>
                      <Text style={styles.smallCell}>
                        {transaction.direction === 'incoming' ? 'Credit' : 'Debit'}
                      </Text>
                      <Text style={styles.tableCell}>
                        {Math.abs(transaction.amount).toLocaleString()}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <Text style={{ padding: 10, fontStyle: 'italic' }}>No cheque transactions in this period.</Text>
              )}
            </>
          )}
  
          <Text style={styles.footer}>
            Generated on {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
          </Text>
        </Page>
      </Document>
    );
  };
  

// Main Component
const TransactionReportGenerator: React.FC = () => {
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);
  const [digitalTransactions, setDigitalTransactions] = useState<DigitalTransaction[]>([]);
  const [chequeTransactions, setChequeTransactions] = useState<ChequeTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState<ReportType>('all');
  const [availableBanks, setAvailableBanks] = useState<string[]>([]);
  const [selectedBank, setSelectedBank] = useState<string>('');

  useEffect(() => {
    // Set default date range to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setStartDate(format(firstDay, 'yyyy-MM-dd'));
    setEndDate(format(lastDay, 'yyyy-MM-dd'));
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch cash transactions
      const { data: cashData, error: cashError } = await supabase
        .from('cash_transactions')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      
      if (cashError) throw new Error(`Cash transactions: ${cashError.message}`);
      
      // Fetch digital transactions - now using 'date' instead of 'transaction_date'
      const { data: digitalData, error: digitalError } = await supabase
        .from('digital_transactions')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      
      if (digitalError) throw new Error(`Digital transactions: ${digitalError.message}`);
      
      // Fetch cheque transactions - now using 'date' instead of 'transaction_date'
      const { data: chequeData, error: chequeError } = await supabase
        .from('cheques')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      
      if (chequeError) throw new Error(`Cheque transactions: ${chequeError.message}`);
      
      setCashTransactions(cashData || []);
      setDigitalTransactions(digitalData || []);
      setChequeTransactions(chequeData || []);
      
      // Extract unique bank names for the bank filter
      const digitalBanks = [...new Set((digitalData || []).map(t => t.bank_name))];
      const chequeBanks = [...new Set((chequeData || []).map(t => t.bank_name))];
      const allBanks = [...new Set([...digitalBanks, ...chequeBanks])].filter(Boolean).sort();
      
      setAvailableBanks(allBanks);
      if (allBanks.length > 0 && !selectedBank) {
        setSelectedBank(allBanks[0]);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchTransactions();
    }
  }, [startDate, endDate]);

  // Get filtered transactions based on report type
  const getFilteredTransactions = () => {
    // For bank-wise reports, filter digital and cheque transactions by selected bank
    const filteredDigital = reportType === 'bank-wise' && selectedBank
      ? digitalTransactions.filter(t => t.bank_name === selectedBank)
      : digitalTransactions;
      
    const filteredCheque = reportType === 'bank-wise' && selectedBank
      ? chequeTransactions.filter(t => t.bank_name === selectedBank)
      : chequeTransactions;
    
    return {
      cash: (reportType === 'all' || reportType === 'cash-only') ? cashTransactions : [],
      digital: (reportType === 'all' || reportType === 'digital-cheque' || reportType === 'bank-wise') ? filteredDigital : [],
      cheque: (reportType === 'all' || reportType === 'digital-cheque' || reportType === 'bank-wise') ? filteredCheque : []
    };
  };

  // Generate appropriate report filename
  const getReportFilename = () => {
    const dateRange = `${startDate}-to-${endDate}`;
    switch(reportType) {
      case 'all': return `all-transactions-${dateRange}.pdf`;
      case 'cash-only': return `cash-transactions-${dateRange}.pdf`;
      case 'digital-cheque': return `digital-cheque-transactions-${dateRange}.pdf`;
      case 'bank-wise': return `${selectedBank}-transactions-${dateRange}.pdf`;
      default: return `transaction-report-${dateRange}.pdf`;
    }
  };

  // Get the filtered transactions for display in summary
  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="p-6 bg-blue-50 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-blue-900 mb-6">Transaction Report Generator</h2>
  
      {/* Date Range Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
          />
        </div>
      </div>
  
      {/* Report Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-blue-800 mb-1">Report Type</label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setReportType('all')}
            className={`p-2 rounded-md transition-colors ${
              reportType === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-blue-800 border border-blue-300 hover:bg-blue-100'
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setReportType('cash-only')}
            className={`p-2 rounded-md transition-colors ${
              reportType === 'cash-only' 
                ? 'bg-teal-600 text-white' 
                : 'bg-white text-teal-800 border border-teal-300 hover:bg-teal-100'
            }`}
          >
            Cash Only
          </button>
          <button
            onClick={() => setReportType('digital-cheque')}
            className={`p-2 rounded-md transition-colors ${
              reportType === 'digital-cheque' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white text-purple-800 border border-purple-300 hover:bg-purple-100'
            }`}
          >
            Digital + Cheque
          </button>
          <button
            onClick={() => setReportType('bank-wise')}
            className={`p-2 rounded-md transition-colors ${
              reportType === 'bank-wise' 
                ? 'bg-orange-600 text-white' 
                : 'bg-white text-orange-800 border border-orange-300 hover:bg-orange-100'
            }`}
          >
            Bank-Wise
          </button>
        </div>
      </div>
  
      {/* Bank Selector - only show if reportType is 'bank-wise' */}
      {reportType === 'bank-wise' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-blue-800 mb-1">Select Bank</label>
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
          >
            {availableBanks.map(bank => (
              <option key={bank} value={bank}>{bank}</option>
            ))}
            {availableBanks.length === 0 && (
              <option value="">No banks available</option>
            )}
          </select>
        </div>
      )}
  
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={fetchTransactions}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
  
        {!isLoading && !error && (
          <PDFDownloadLink
            document={
              <TransactionReport
                cashTransactions={cashTransactions}
                digitalTransactions={digitalTransactions}
                chequeTransactions={chequeTransactions}
                startDate={startDate}
                endDate={endDate}
                reportType={reportType}
                selectedBank={selectedBank}
              />
            }
            fileName={getReportFilename()}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            {({ loading }) =>
              loading ? 'Preparing document...' : `Download ${reportType === 'all' ? 'Complete' : reportType === 'cash-only' ? 'Cash' : reportType === 'digital-cheque' ? 'Digital+Cheque' : 'Bank'} Report`
            }
          </PDFDownloadLink>
        )}
      </div>
  
      {/* Status Messages */}
      {isLoading && <p className="text-blue-800">Loading transaction data...</p>}
      {error && <p className="text-red-600 font-medium">Error: {error}</p>}
  
      {/* Summary Stats - Now showing filtered counts based on report type */}
      {!isLoading && !error && (
        <div className="bg-white p-4 rounded-md shadow-inner mb-6 border border-blue-200">
          <h3 className="font-bold text-xl text-blue-900 mb-2">Transaction Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Only show cash transactions card if relevant to the report type */}
            {(reportType === 'all' || reportType === 'cash-only') && (
              <div className={`bg-teal-50 p-3 rounded border border-teal-200 shadow-sm ${reportType !== 'cash-only' ? '' : 'md:col-span-3'}`}>
                <p className="font-medium text-teal-800">Cash Transactions</p>
                <p className="text-2xl font-bold text-teal-900">{filteredTransactions.cash.length}</p>
              </div>
            )}
            
            {/* Only show digital transactions card if relevant to the report type */}
            {(reportType === 'all' || reportType === 'digital-cheque' || reportType === 'bank-wise') && (
              <div className={`bg-purple-50 p-3 rounded border border-purple-200 shadow-sm ${reportType === 'all' ? '' : (reportType === 'digital-cheque' ? 'md:col-span-2' : '')}`}>
                <p className="font-medium text-purple-800">Digital Transactions</p>
                <p className="text-2xl font-bold text-purple-900">{filteredTransactions.digital.length}</p>
              </div>
            )}
            
            {/* Only show cheque transactions card if relevant to the report type */}
            {(reportType === 'all' || reportType === 'digital-cheque' || reportType === 'bank-wise') && (
              <div className={`bg-orange-50 p-3 rounded border border-orange-200 shadow-sm ${reportType === 'all' ? '' : (reportType === 'bank-wise' ? 'md:col-span-2' : '')}`}>
                <p className="font-medium text-orange-800">Cheque Transactions</p>
                <p className="text-2xl font-bold text-orange-900">{filteredTransactions.cheque.length}</p>
              </div>
            )}
          </div>
        </div>
      )}
  
      {/* Data Preview */}
      {!isLoading && !error && (
        <div className="mb-4">
          <h3 className="font-bold text-lg text-blue-900 mb-2">Report Preview</h3>
          <div className="bg-white p-4 rounded-md border border-blue-200 shadow-sm">
            <p className="text-blue-800">
              {reportType === 'all' && "The report will include all transaction types."}
              {reportType === 'cash-only' && "The report will include only cash transactions."}
              {reportType === 'digital-cheque' && "The report will include digital and cheque transactions."}
              {reportType === 'bank-wise' && `The report will include transactions from ${selectedBank}.`}
            </p>
            <ul className="list-disc list-inside mt-2 text-blue-700">
              {(reportType === 'all' || reportType === 'cash-only') && (
                <li>{cashTransactions.length} cash transactions</li>
              )}
              {(reportType === 'all' || reportType === 'digital-cheque' || reportType === 'bank-wise') && (
                <li>
                  {reportType === 'bank-wise' && selectedBank
                    ? digitalTransactions.filter(t => t.bank_name === selectedBank).length
                    : digitalTransactions.length} digital transactions
                </li>
              )}
              {(reportType === 'all' || reportType === 'digital-cheque' || reportType === 'bank-wise') && (
                <li>
                  {reportType === 'bank-wise' && selectedBank
                    ? chequeTransactions.filter(t => t.bank_name === selectedBank).length
                    : chequeTransactions.length} cheque transactions
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionReportGenerator;