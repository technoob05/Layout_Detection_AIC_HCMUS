import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { Camera, Check, Loader2, User, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function ProfileSettings() {
  const { user, error: authError } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    avatarUrl: user?.avatarUrl || "",
  });

  // Function to update profile
  const updateProfile = async () => {
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      // In a real app, this would be an API call
      // Here we're simulating a delay and success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      setIsEditing(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateProfile();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      name: user?.name || "",
      username: user?.username || "",
      email: user?.email || "",
      bio: user?.bio || "",
      avatarUrl: user?.avatarUrl || "",
    });
    setIsEditing(false);
    setFormError(null);
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!user?.name) return user?.username?.substring(0, 2).toUpperCase() || "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center pt-6 pb-6">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">You need to log in to view your profile</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full overflow-hidden">
        {/* Profile Header with Cover Image */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          {isEditing && (
            <Button 
              size="sm" 
              variant="secondary" 
              className="absolute right-4 bottom-4 gap-1.5"
            >
              <Camera className="h-4 w-4" />
              <span>Change Cover</span>
            </Button>
          )}
        </div>
        
        <CardContent className="pt-0">
          <div className="flex flex-col md:flex-row gap-6 -mt-12 md:-mt-16">
            {/* Avatar Section */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative group">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background">
                  <AvatarImage src={formData.avatarUrl} alt={formData.name || formData.username} />
                  <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Profile Info Section */}
            <div className="flex-1 flex flex-col pt-4 md:pt-6">
              {!isEditing ? (
                <>
                  <h2 className="text-2xl font-bold">{user.name || user.username}</h2>
                  <p className="text-muted-foreground">@{user.username}</p>
                  <p className="text-muted-foreground mt-1">{user.email}</p>
                  {user.bio && <p className="mt-4">{user.bio}</p>}
                  
                  <div className="mt-auto pt-6 flex gap-3">
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                  {formError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                      {formError}
                    </div>
                  )}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Username"
                        disabled={isSubmitting || true} // Typically username can't be changed
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your email"
                      disabled={isSubmitting || true} // Email typically requires verification
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      name="bio"
                      value={formData.bio || ""}
                      onChange={handleChange}
                      placeholder="Tell us about yourself"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="gap-1.5"
                    >
                      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancel} 
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Overview of your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account ID</span>
              <span className="font-medium">{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Type</span>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                Free Account
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member Since</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Connected Services</CardTitle>
            <CardDescription>Manage your connected services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="text-red-500">
                  <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
                </svg>
                <span className="font-medium">Google</span>
              </div>
              <Button size="sm" variant="outline">Connect</Button>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="text-gray-800">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                <span className="font-medium">GitHub</span>
              </div>
              <Button size="sm" variant="outline">Connect</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 