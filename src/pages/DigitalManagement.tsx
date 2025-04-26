
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Filter, Plus, MoreHorizontal, CreditCard, RefreshCw, Loader2 } from "lucide-react";
import { cn, formatCurrency, formatDate, getTransferTypeClasses } from "@/lib/utils";
import { deleteDigitalTransaction, DigitalDirection, DigitalTransferType, fetchDigitalTransactions } from "@/services/digitalService";
import { DigitalForm } from "@/components/digital/DigitalForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const getTransferTypeBadge = (type: DigitalTransferType) => {
  return (
    <Badge className={cn(getTransferTypeClasses(type), "font-medium")}>
      {type}
    </Badge>
  );
};

function DigitalList({ direction }: { direction: DigitalDirection }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await fetchDigitalTransactions(direction);
      setTransactions(data);
    } catch (error) {
      console.error("Error loading digital transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [direction]);

  const handleOpenForm = (transaction?: any) => {
    if (transaction) {
      setEditTransaction(transaction);
    } else {
      setEditTransaction(null);
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditTransaction(null);
  };

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;
    
    try {
      await deleteDigitalTransaction(transactionToDelete);
      await loadTransactions();
    } catch (error) {
      console.error("Error deleting digital transaction:", error);
    } finally {
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.party.toLowerCase().includes(searchLower) ||
      transaction.bank_name.toLowerCase().includes(searchLower) ||
      (transaction.reference_number && transaction.reference_number.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search transfers..."
            className="w-[250px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline" size="icon" onClick={() => loadTransactions()}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>{direction === "incoming" ? "Received From" : "Transferred To"}</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reference No.</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin mb-2" />
                      <p>Loading transactions...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>{transaction.party}</TableCell>
                    <TableCell>{transaction.description || "-"}</TableCell>
                    <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>{transaction.bank_name}</TableCell>
                    <TableCell>{getTransferTypeBadge(transaction.transfer_type as DigitalTransferType)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {transaction.reference_number || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenForm(transaction)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(transaction.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <CreditCard className="h-12 w-12 mb-2 opacity-20" />
                      <h3 className="font-medium">No transfers found</h3>
                      <p className="text-sm">
                        You haven't added any {direction} digital transfers yet.
                      </p>
                      <Button className="mt-4" onClick={() => handleOpenForm()}>
                        <Plus className="mr-2 h-4 w-4" /> Add New Transfer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Digital Transaction Form Dialog */}
      <DigitalForm 
        isOpen={formOpen} 
        onClose={handleCloseForm} 
        onSuccess={loadTransactions}
        editTransaction={editTransaction}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected digital transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const DigitalManagement = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Digital Transfers</h1>
        <p className="text-muted-foreground">
          Manage all your digital banking transactions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <span>Digital Transactions</span>
            </div>
          </CardTitle>
          <CardDescription>
            View and manage all electronic transfers (NEFT, IMPS, UPI, RTGS)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="incoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="incoming">Received Transfers</TabsTrigger>
              <TabsTrigger value="outgoing">Sent Transfers</TabsTrigger>
            </TabsList>
            <TabsContent value="incoming">
              <DigitalList direction="incoming" />
            </TabsContent>
            <TabsContent value="outgoing">
              <DigitalList direction="outgoing" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DigitalManagement;
