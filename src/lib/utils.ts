
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-IN", options);
}

export const getStatusClasses = (status: string) => {
  const statusClasses: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    cleared: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    bounced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  };

  return statusClasses[status] || "";
};

export const getTransferTypeClasses = (type: string) => {
  const typeClasses: Record<string, string> = {
    NEFT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    IMPS: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    UPI: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    RTGS: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  };

  return typeClasses[type] || "";
};

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
