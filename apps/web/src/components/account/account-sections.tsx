import { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AccountOrders() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your order history
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>All your past and current orders</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Orders section coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function AccountWishlist() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wishlist</h1>
        <p className="text-muted-foreground mt-2">
          Items you've saved for later
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Items</CardTitle>
          <CardDescription>Your wishlist collection</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Wishlist section coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function AccountAddresses() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Addresses</h1>
        <p className="text-muted-foreground mt-2">
          Manage your shipping and billing addresses
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Addresses</CardTitle>
          <CardDescription>Your delivery locations</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Addresses section coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

interface AccountProfileProps {
  userName?: string;
  userEmail?: string;
}

export function AccountProfile({ userName = "User", userEmail = "user@example.com" }: AccountProfileProps) {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setName(userName);
    setEmail(userEmail);
  }, [userName, userEmail]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Validate inputs
      if (!name || name.trim().length === 0) {
        toast.error("Name is required");
        setIsSaving(false);
        return;
      }

      // Update user profile via better-auth
      const updateData: { name: string; image?: string } = {
        name: name.trim(),
      };

      // Include image if it was changed
      if (profileImage) {
        updateData.image = profileImage;
      }

      const response = await authClient.updateUser(updateData);

      if (response.error) {
        throw new Error(response.error.message || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");

      // Refresh the page to update the session data
      router.invalidate();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:mt-2 sm:text-base">
          Update your personal information and profile picture
        </p>
      </div>

      {/* Profile Picture Section */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Profile Picture</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Upload a profile picture to personalize your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
            {/* Avatar - Responsive size */}
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28">
              <AvatarImage src={profileImage || undefined} alt={name} />
              <AvatarFallback className="text-xl sm:text-2xl md:text-3xl">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>

            {/* Upload Controls */}
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <Label htmlFor="profile-picture" className="cursor-pointer">
                <div className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90 sm:px-4">
                  <Camera className="h-4 w-4" />
                  <span>Change Picture</span>
                </div>
                <Input
                  id="profile-picture"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </Label>
              <p className="text-center text-xs text-muted-foreground sm:text-left">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Section */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Update your name and email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="text-sm sm:text-base"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="text-sm sm:text-base"
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function AccountSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your account preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Preferences and configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Settings section coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
