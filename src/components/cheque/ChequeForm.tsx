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
import {
  addCheque,
  Cheque,
  ChequeDirection,
  ChequeStatus,
  getCurrentFinancialYear,
  updateCheque,
} from "@/services/chequeService";
import { toast } from "sonner";

// Calendar and popover
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ChequeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editCheque?: any;
}

export function ChequeForm({ isOpen, onClose, onSuccess, editCheque }: ChequeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Cheque>>({
    cheque_number: "",
    date: new Date().toISOString().split("T")[0],
    party: "",
    amount: 0,
    bank_name: "",
    status: "pending" as ChequeStatus,
    direction: "incoming" as ChequeDirection,
    financial_year: getCurrentFinancialYear(),
    description: "", // NEW FIELD
  });

  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    if (editCheque) {
      const formattedDate = editCheque.date
        ? (typeof editCheque.date === "string" && editCheque.date.includes("T")
          ? editCheque.date.split("T")[0]
          : editCheque.date)
        : new Date().toISOString().split("T")[0];

      setFormData({
        ...editCheque,
        date: formattedDate,
        description: editCheque.description || "", // Handle description when editing
      });
    } else {
      setFormData({
        cheque_number: "",
        date: new Date().toISOString().split("T")[0],
        party: "",
        amount: 0,
        bank_name: "",
        status: "pending" as ChequeStatus,
        direction: "incoming" as ChequeDirection,
        financial_year: getCurrentFinancialYear(),
        description: "", // default empty
      });
    }
  }, [editCheque, isOpen]);

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
      if (!formData.cheque_number || !formData.party || !formData.date || !formData.bank_name) {
        toast.error("Please fill all required fields");
        setIsSubmitting(false);
        return;
      }

      if (formData.amount <= 0) {
        toast.error("Amount must be greater than 0");
        setIsSubmitting(false);
        return;
      }

      if (editCheque?.id) {
        await updateCheque(editCheque.id, formData as Cheque);
      } else {
        await addCheque(formData as Cheque);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving cheque:", error);
      toast.error("Failed to save cheque.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editCheque ? "Edit Cheque" : "Add New Cheque"}</DialogTitle>
          <DialogDescription>
            {editCheque ? "Update the cheque details below." : "Enter the details for the new cheque."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Direction and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="direction">Direction</Label>
                <Select
                  value={formData.direction}
                  onValueChange={(value) => handleSelectChange("direction", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incoming">Incoming</SelectItem>
                    <SelectItem value="outgoing">Outgoing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cleared">Cleared</SelectItem>
                    <SelectItem value="bounced">Bounced</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cheque number */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="cheque_number">Cheque Number</Label>
              <Input
                id="cheque_number"
                name="cheque_number"
                value={formData.cheque_number}
                onChange={handleChange}
                required
              />
            </div>

            {/* Date and Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="date">Date</Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      {formData.date ? format(new Date(formData.date), "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(formData.date)}
                      onSelect={(date) => {
                        if (date) {
                          setFormData({ ...formData, date: date.toISOString().split("T")[0] });
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
                />
              </div>
            </div>

            {/* Party */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="party">
                {formData.direction === "incoming" ? "Received From" : "Issued To"}
              </Label>
              <Input
                id="party"
                name="party"
                value={formData.party}
                onChange={handleChange}
                required
              />
            </div>

            {/* Bank Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input
                id="bank_name"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Description - NEW */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional note about the cheque..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editCheque ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
