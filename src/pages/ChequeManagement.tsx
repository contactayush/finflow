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
import { Filter, Plus, MoreHorizontal, FileText, RefreshCw, Loader2 } from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { ChequeDirection, ChequeStatus, deleteCheque, fetchCheques } from "@/services/chequeService";
import { ChequeForm } from "@/components/cheque/ChequeForm";
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

const getStatusBadge = (status: ChequeStatus) => {
  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    cleared: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    bounced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  };

  return (
    <Badge className={cn("font-medium", statusClasses[status])}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

function ChequeList({ direction }: { direction: ChequeDirection }) {
  const [cheques, setCheques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editCheque, setEditCheque] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chequeToDelete, setChequeToDelete] = useState<string | null>(null);

  const loadCheques = async () => {
    setLoading(true);
    try {
      const data = await fetchCheques(direction);
      setCheques(data);
    } catch (error) {
      console.error("Error loading cheques:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheques();
  }, [direction]);

  const handleOpenForm = (cheque?: any) => {
    if (cheque) {
      setEditCheque(cheque);
    } else {
      setEditCheque(null);
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditCheque(null);
  };

  const handleDeleteClick = (id: string) => {
    setChequeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!chequeToDelete) return;
    
    try {
      await deleteCheque(chequeToDelete);
      await loadCheques();
    } catch (error) {
      console.error("Error deleting cheque:", error);
    } finally {
      setDeleteDialogOpen(false);
      setChequeToDelete(null);
    }
  };

  const filteredCheques = cheques.filter((cheque) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cheque.cheque_number.toLowerCase().includes(searchLower) ||
      cheque.party.toLowerCase().includes(searchLower) ||
      cheque.bank_name.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    if (searchTerm === "") {
      loadCheques(); // Reset to original list if search term is empty
    }
  }, [searchTerm]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search cheques..."
            className="w-[250px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline" size="icon" onClick={() => loadCheques()}>
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
                <TableHead>Cheque No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>{direction === "incoming" ? "Received From" : "Issued To"}</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin mb-2" />
                      <p>Loading cheques...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCheques.length > 0 ? (
                filteredCheques.map((cheque) => (
                  <TableRow key={cheque.id}>
                    <TableCell>{cheque.cheque_number}</TableCell>
                    <TableCell>{formatDate(cheque.date)}</TableCell>
                    <TableCell>{cheque.party}</TableCell>
                    <TableCell>{cheque.description || "-"}</TableCell>
                    <TableCell>{formatCurrency(cheque.amount)}</TableCell>
                    <TableCell>{cheque.bank_name}</TableCell>
                    <TableCell>{getStatusBadge(cheque.status as ChequeStatus)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenForm(cheque)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(cheque.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileText className="h-12 w-12 mb-2 opacity-20" />
                      <h3 className="font-medium">No cheques found</h3>
                      <p className="text-sm">
                        You haven't added any {direction} cheques yet.
                      </p>
                      <Button className="mt-4" onClick={() => handleOpenForm()}>
                        <Plus className="mr-2 h-4 w-4" /> Add New Cheque
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cheque Form Dialog */}
      <ChequeForm 
        isOpen={formOpen} 
        onClose={handleCloseForm} 
        onSuccess={loadCheques}
        editCheque={editCheque}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected cheque.
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

const ChequeManagement = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cheque Management</h1>
        <p className="text-muted-foreground">
          Track and manage all your cheque transactions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span>Cheques</span>
            </div>
          </CardTitle>
          <CardDescription>
            View and manage both incoming and outgoing cheques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="incoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="incoming">Incoming Cheques</TabsTrigger>
              <TabsTrigger value="outgoing">Outgoing Cheques</TabsTrigger>
            </TabsList>
            <TabsContent value="incoming">
              <ChequeList direction="incoming" />
            </TabsContent>
            <TabsContent value="outgoing">
              <ChequeList direction="outgoing" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChequeManagement;
