import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { addCashTransaction, CashDirection, CashTransaction, getCurrentFinancialYear, updateCashTransaction } from "@/services/cashService";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns"; // Ensure you have date-fns installed

interface CashFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editTransaction?: any;
}

export function CashForm({ isOpen, onClose, onSuccess, editTransaction }: CashFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<CashTransaction>>({
    date: new Date().toISOString().split("T")[0],
    party: "",
    amount: 0,
    description: "",
    direction: "incoming" as CashDirection,
    financial_year: getCurrentFinancialYear(),
  });

  useEffect(() => {
    if (editTransaction) {
      // Format date from database (if needed)
      const formattedDate = editTransaction.date ? 
        (typeof editTransaction.date === 'string' && editTransaction.date.includes('T') ? 
          editTransaction.date.split('T')[0] : editTransaction.date) : 
        new Date().toISOString().split('T')[0];
      
      setFormData({
        ...editTransaction,
        date: formattedDate,
      });
    } else {
      // Reset form for new transaction
      setFormData({
        date: new Date().toISOString().split("T")[0],
        party: "",
        amount: 0,
        description: "",
        direction: "incoming" as CashDirection,
        financial_year: getCurrentFinancialYear(),
      });
    }
  }, [editTransaction, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "amount" ? parseFloat(value) : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.party || !formData.date) {
        toast.error("Please fill all required fields");
        setIsSubmitting(false);
        return;
      }

      if (formData.amount <= 0) {
        toast.error("Amount must be greater than 0");
        setIsSubmitting(false);
        return;
      }

      if (editTransaction?.id) {
        await updateCashTransaction(editTransaction.id, formData as CashTransaction);
      } else {
        await addCashTransaction(formData as CashTransaction);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving cash transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-background">
        <DialogHeader>
          <DialogTitle>
            {editTransaction
              ? "Edit Cash Transaction"
              : "Add New Cash Transaction"}
          </DialogTitle>
          <DialogDescription>
            {editTransaction
              ? "Update the transaction details below."
              : "Enter the details for the new cash transaction."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="direction">Direction</Label>
              <Select
                value={formData.direction}
                onValueChange={(value) =>
                  handleSelectChange("direction", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incoming">Cash Received</SelectItem>
                  <SelectItem value="outgoing">Cash Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="date">Date</Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`justify-start text-left font-normal ${
                        !formData.date ? "text-muted-foreground" : ""
                      }`}
                    >
                      {formData.date
                        ? format(new Date(formData.date), "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(formData.date)}
                      onSelect={(date) => {
                        if (date) {
                          setFormData({
                            ...formData,
                            date: date.toISOString().split("T")[0],
                          });
                          setDatePickerOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  className="bg-transparent border border-border dark:border-border-dark text-foreground dark:text-foreground-dark dark:bg-background-dark"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="party">
                {formData.direction === "incoming"
                  ? "Received From"
                  : "Paid To"}
              </Label>
              <Input
                id="party"
                name="party"
                value={formData.party}
                onChange={handleChange}
                required
                className="bg-transparent border border-border dark:border-border-dark text-foreground dark:text-foreground-dark dark:bg-background-dark"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={3}
                className="bg-transparent border border-border dark:border-border-dark text-foreground dark:text-foreground-dark dark:bg-background-dark"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editTransaction ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
