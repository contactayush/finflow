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
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import {
  addDigitalTransaction,
  DigitalDirection,
  DigitalTransaction,
  DigitalTransferType,
  getCurrentFinancialYear,
  updateDigitalTransaction,
} from "@/services/digitalService";
import { toast } from "sonner";

interface DigitalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editTransaction?: any;
}

export function DigitalForm({ isOpen, onClose, onSuccess, editTransaction }: DigitalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<DigitalTransaction>>({
    date: new Date().toISOString().split("T")[0],
    party: "",
    amount: 0,
    bank_name: "",
    transfer_type: "NEFT" as DigitalTransferType,
    reference_number: "",
    direction: "incoming" as DigitalDirection,
    financial_year: getCurrentFinancialYear(),
    description: "", // ✅ added
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [view, setView] = useState<"month" | "year">("month");

  useEffect(() => {
    if (editTransaction) {
      const formattedDate = editTransaction.date
        ? (typeof editTransaction.date === "string" && editTransaction.date.includes("T")
            ? editTransaction.date.split("T")[0]
            : editTransaction.date)
        : new Date().toISOString().split("T")[0];

      setFormData({
        ...editTransaction,
        date: formattedDate,
        description: editTransaction.description || "", // ✅ added
      });
    } else {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        party: "",
        amount: 0,
        bank_name: "",
        transfer_type: "NEFT" as DigitalTransferType,
        reference_number: "",
        direction: "incoming" as DigitalDirection,
        financial_year: getCurrentFinancialYear(),
        description: "", // ✅ added
      });
    }
  }, [editTransaction, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (!formData.party || !formData.date || !formData.bank_name) {
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
        await updateDigitalTransaction(editTransaction.id, formData as DigitalTransaction);
      } else {
        await addDigitalTransaction(formData as DigitalTransaction);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving digital transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const parsedDate = parseISO(value);
    if (!isNaN(parsedDate.getTime())) {
      setFormData({ ...formData, date: value });
    }
  };

  const handleCalendarSelect = (date: Date | null) => {
    if (date) {
      setFormData({ ...formData, date: date.toISOString().split("T")[0] });
      setDatePickerOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editTransaction
              ? "Edit Digital Transaction"
              : "Add New Digital Transaction"}
          </DialogTitle>
          <DialogDescription>
            {editTransaction
              ? "Update the transaction details below."
              : "Enter the details for the new digital transaction."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
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
                    <SelectItem value="incoming">Received</SelectItem>
                    <SelectItem value="outgoing">Sent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="transfer_type">Transfer Type</Label>
                <Select
                  value={formData.transfer_type}
                  onValueChange={(value) =>
                    handleSelectChange("transfer_type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEFT">NEFT</SelectItem>
                    <SelectItem value="IMPS">IMPS</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="RTGS">RTGS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="date">Date</Label>
                <div className="flex gap-2 items-center">
                  <Popover
                    open={datePickerOpen}
                    onOpenChange={setDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-left font-normal shadow-sm justify-start ${
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="party">
                {formData.direction === "incoming"
                  ? "Received From"
                  : "Transferred To"}
              </Label>
              <Input
                id="party"
                name="party"
                value={formData.party}
                onChange={handleChange}
                required
              />
            </div>

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

            <div className="flex flex-col gap-2">
              <Label htmlFor="reference_number">Reference Number</Label>
              <Input
                id="reference_number"
                name="reference_number"
                value={formData.reference_number || ""}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label> {/* ✅ new field */}
              <Input
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
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
