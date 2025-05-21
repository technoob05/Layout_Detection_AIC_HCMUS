import { MainLayout } from "@/components/layout/MainLayout";
import { ThemeSettings } from "@/components/layout/ThemeSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Paintbrush, Settings, User } from "lucide-react";
import { ProfileSettings } from "./ProfileSettings";

export function UserSettingsPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application preferences and account settings
          </p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid md:grid-cols-3 grid-cols-2 max-w-md bg-muted w-full">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="size-4" />
              <span>Account</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Paintbrush className="size-4" />
              <span>Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="size-4" />
              <span>Preferences</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-6">
            <ProfileSettings />
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-6">
            <ThemeSettings />
            
            {/* Additional appearance settings could go here */}
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-6">
            <div className="bg-muted/50 border rounded-lg p-8 text-center">
              <Settings className="size-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-medium mb-2">Preferences</h3>
              <p className="text-muted-foreground mb-4">
                Additional preferences will be available in a future update.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
} 