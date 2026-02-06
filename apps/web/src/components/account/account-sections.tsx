import { useState, useEffect } from "react";
import { Camera, CheckCircle2, AlertCircle, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  session: any; // Type should be more specific based on your auth client
}

export function AccountProfile({ session }: AccountProfileProps) {
  const router = useRouter();
  const user = session?.user;

  const [profileImage, setProfileImage] = useState<string | null>(user?.image || null);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : ""
  );
  const [gender, setGender] = useState(user?.gender || "");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  // Check for changes to enable/disable buttons
  useEffect(() => {
    const isNameChanged = name !== (user?.name || "");
    const isEmailChanged = email !== (user?.email || "");
    const isPhoneChanged = phoneNumber !== (user?.phoneNumber || "");
    const isGenderChanged = gender !== (user?.gender || "");
    const isImageChanged = profileImage !== (user?.image || null);
    
    // Date comparison
    const originalDob = user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "";
    const isDobChanged = dateOfBirth !== originalDob;

    setHasChanges(isNameChanged || isEmailChanged || isPhoneChanged || isDobChanged || isGenderChanged || isImageChanged);
  }, [name, email, phoneNumber, dateOfBirth, gender, profileImage, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhoneNumber(user?.phoneNumber || "");
    setGender(user?.gender || "");
    setDateOfBirth(user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "");
    setProfileImage(user?.image || null);
    setHasChanges(false);
    toast.info("Changes discarded");
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
    if (!name.trim()) {
      toast.error("Full Name is required");
      return;
    }

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Handle Email Change if it's different
      if (email.trim() !== user?.email) {
        // Send OTP to the new email using custom endpoint
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/email-change/send-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email: email.trim() }),
        });

        const result = await response.json();

        if (!response.ok || result.error) {
          throw new Error(
            result.error || "Failed to send verification code"
          );
        }

        // Store the pending email and show OTP dialog
        setPendingEmail(email.trim());
        setShowOTPDialog(true);
        toast.success(`Verification code sent to ${email.trim()}`);
        setIsSaving(false);
        return; // Stop here and wait for OTP verification
      }

      // 2. Handle Profile Update for other fields (when email hasn't changed)
      const updateData: any = {
        name: name.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        gender: gender || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        image: profileImage,
      };

      const { error: updateError } = await authClient.updateUser(updateData);

      if (updateError) throw new Error(updateError.message || "Failed to update profile details");

      toast.success("Profile updated successfully!");
      router.invalidate();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    if (otp.trim().length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsVerifyingOTP(true);
    try {
      // Verify the OTP and update email using custom endpoint
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/email-change/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: pendingEmail,
          otp: otp.trim(),
          userId: user?.id,
        }),
      });

      const verifyResult = await response.json();

      if (!response.ok || verifyResult.error) {
        throw new Error(
          verifyResult.error || "Invalid verification code"
        );
      }

      // Email has been updated on the server

      // Update other profile fields
      const updateData: any = {
        name: name.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        gender: gender || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        image: profileImage,
      };

      const { error: updateError } = await authClient.updateUser(updateData);

      if (updateError) throw new Error(updateError.message || "Failed to update profile details");

      toast.success("Email verified and profile updated successfully!");
      setShowOTPDialog(false);
      setOtp("");
      setPendingEmail("");
      router.invalidate();
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to verify code");
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/email-change/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email: pendingEmail }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(
          result.error || "Failed to resend code"
        );
      }

      toast.success(`Verification code resent to ${pendingEmail}`);
      setOtp(""); // Clear the input field
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to resend code"
      );
    }
  };

  const handleCloseOTPDialog = () => {
    setShowOTPDialog(false);
    setOtp("");
    setPendingEmail("");
    // Reset email to original value
    setEmail(user?.email || "");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              This will be displayed on your profile and across the app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-2 border-muted transition-all duration-200 group-hover:opacity-90">
                  <AvatarImage src={profileImage || undefined} className="object-cover" />
                  <AvatarFallback className="text-2xl font-semibold">
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>
                {profileImage && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-1 -right-1 h-7 w-7 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleRemoveImage}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Label
                    htmlFor="avatar-upload"
                    className="cursor-pointer inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors h-10"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Upload Image
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or GIF. Max 2MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>
              Update your basic information to get personalized experiences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full-name" className="text-sm font-semibold">Full Name <span className="text-destructive">*</span></Label>
                <Input
                  id="full-name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email Address <span className="text-destructive">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+880 1XXX-XXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              {/* DOB */}
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-sm font-semibold">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Add your birthday for exclusive discounts!
                </p>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-semibold">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t bg-muted/50 py-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={!hasChanges || isSaving}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={!hasChanges || isSaving}
              className="px-8"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* OTP Verification Dialog */}
      <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
            <DialogDescription>
              We've sent a 6-digit verification code to <strong>{pendingEmail}</strong>.
              Please enter it below to confirm your new email address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="text-center text-lg tracking-widest"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                The code will expire in 5 minutes
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleResendOTP}
              disabled={isVerifyingOTP}
            >
              Resend Code
            </Button>
            <div className="flex gap-2 flex-1">
              <Button
                variant="outline"
                onClick={handleCloseOTPDialog}
                disabled={isVerifyingOTP}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyOTP}
                disabled={isVerifyingOTP || otp.length !== 6}
                className="flex-1"
              >
                {isVerifyingOTP ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
