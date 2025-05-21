import { MainLayout } from "@/components/layout/MainLayout";
import { ProfileSettings } from "@/features/user-settings/components/ProfileSettings";

export function ProfilePage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-muted-foreground">
            View and manage your profile information
          </p>
        </div>
        
        <ProfileSettings />
      </div>
    </MainLayout>
  );
} 