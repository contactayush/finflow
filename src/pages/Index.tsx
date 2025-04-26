
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  BellIcon, 
  CalendarIcon, 
  CreditCardIcon, 
  FileTextIcon, 
  DollarSignIcon, 
  BarChart2Icon 
} from "lucide-react";

const Index = () => {
  const [counter, setCounter] = useState(0);
  
  const handleIncrement = () => {
    console.log("Increment clicked");
    setCounter(prev => prev + 1);
  };
  
  const handleDecrement = () => {
    console.log("Decrement clicked");
    setCounter(prev => prev - 1);
  };
  
  return (
    <div className="p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to FinFlow</h1>
        <p className="text-xl text-muted-foreground">Your personal financial transaction manager</p>
      </div>
      
      {/* Counter demo to verify button functionality */}
      <div className="flex flex-col items-center justify-center gap-4 p-6 border rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Button Test</h2>
        <div className="text-4xl font-bold">{counter}</div>
        <div className="flex gap-4">
          <Button onClick={handleDecrement} variant="outline">Decrement</Button>
          <Button onClick={handleIncrement}>Increment</Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Try clicking these buttons to verify they work correctly
        </p>
      </div>
      
      {/* Feature showcase */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard 
          icon={<FileTextIcon className="h-6 w-6" />}
          title="Cheque Management"
          description="Track both outgoing and incoming cheques with detailed status tracking."
        />
        <FeatureCard
          icon={<DollarSignIcon className="h-6 w-6" />}
          title="Cash Transactions"
          description="Record and manage all your cash entries with comprehensive tracking."
        />
        <FeatureCard
          icon={<CreditCardIcon className="h-6 w-6" />}
          title="Digital Transfers"
          description="Monitor IMPS, NEFT, and UPI transfers with complete reference details."
        />
        <FeatureCard
          icon={<BarChart2Icon className="h-6 w-6" />}
          title="Powerful Analytics"
          description="Visualize your financial data with intuitive charts and reports."
        />
        <FeatureCard
          icon={<BellIcon className="h-6 w-6" />}
          title="Notifications"
          description="Stay updated with alerts for pending cheques and transaction status changes."
        />
        <FeatureCard
          icon={<CalendarIcon className="h-6 w-6" />}
          title="Financial Year Tracking"
          description="Organize your data by financial years with easy archiving and retrieval."
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="flex flex-col gap-3 p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-2 w-fit rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
      <Button className="mt-auto self-start" variant="outline" size="sm">
        Learn More
      </Button>
    </div>
  );
};

export default Index;
