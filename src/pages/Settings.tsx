import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from '../lib/supabaseClient'; // adjust this path to your setup

const Settings = () => {
  const methods = useForm({
    defaultValues: {
      full_name: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) return;

      const { data, error } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        reset({ full_name: data.full_name });
      }

      setLoading(false);
    };

    loadUser();
  }, [reset]);

  const onSubmit = async (values) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("users")
      .update({ full_name: values.full_name })
      .eq("id", user.id);

    if (!error) {
      alert("Profile updated!");
    } else {
      alert("Failed to update profile.");
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your preferences and account settings
          </p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Customize the application behavior and appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Dark Theme</h3>
                    <p className="text-sm text-muted-foreground">
                      Enable dark mode for a more comfortable viewing experience
                    </p>
                  </div>
                  <ThemeToggle />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="font-medium">Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts for important financial events
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="pl-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Cheque Status Changes</p>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Large Transactions</p>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Monthly Reports</p>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Offline Mode</h3>
                    <p className="text-sm text-muted-foreground">
                      Allow the application to work without internet connection
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <FormLabel htmlFor="full_name">Full Name</FormLabel>
                    <Input
                      id="full_name"
                      placeholder="Enter full name"
                      {...register("full_name")}
                      disabled={loading || isSubmitting}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button type="submit" disabled={isSubmitting}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </FormProvider>
  );
};

export default Settings;
