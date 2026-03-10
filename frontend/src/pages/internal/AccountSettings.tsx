import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Lock, Sun, Mail, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import api from "@/api/axios";
import { toast } from "sonner";

const AccountSettings: React.FC = function () {
  const { user, updateUser } = useAuth();

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [jobPosition, setJobPosition] = useState("");

  const [loading, setLoading] = useState(false);

  // Email status
  const [isVerified, setIsVerified] = useState(false);

  // Sync state with user data
  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      setAddress(user.address || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setUsername(user.username || "");
      setJobPosition(user.position || "");
      setIsVerified(!!user.is_verified);
    }
  }, [user]);

  // Email verification dialogs
  const [changeEmailOpen, setChangeEmailOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailConfirmOpen, setEmailConfirmOpen] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Password
  const [pwDialogOpen, setPwDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.put("/auth/profile", {
        name: fullName,
        address,
        phone,
        username,
      });

      if (response.data.status === "success") {
        updateUser(response.data.data.user);
        toast.success("Profile updated successfully");
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred while updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!currentPw || !newPw) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPw.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmPassword = async () => {
    setConfirmOpen(false);
    setPwLoading(true);
    try {
      const response = await api.post("/auth/change-password", {
        current_password: currentPw,
        password: newPw,
        password_confirmation: confirmPw,
      });

      if (response.data.status === "success") {
        toast.success("Password updated successfully");
        setPwDialogOpen(false);
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      } else {
        toast.error(response.data.message || "Failed to change password");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred while changing password");
    } finally {
      setPwLoading(false);
    }
  };

  const handleSendVerification = async () => {
    setEmailLoading(true);
    try {
      const response = await api.post("/auth/email/resend");
      if (response.data.status === "success") {
        toast.success(`Verification code sent to ${email}`);
        setVerifyDialogOpen(true);
      } else {        toast.error(response.data.message || "Failed to send code");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error sending verification code");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChangeEmail = () => {
    if (!newEmail) {
      toast.error("Please enter a new email address.");
      return;
    }
    if (newEmail === email) {
      toast.error("New email must be different from the current one.");
      return;
    }
    setEmailConfirmOpen(true);
  };

  const handleConfirmEmailChange = async () => {
    setEmailConfirmOpen(false);
    setEmailLoading(true);
    try {
      const response = await api.put("/auth/email", { email: newEmail });
      if (response.data.status === "success") {
        updateUser(response.data.data.user);
        toast.success("Email updated. Please check for verification code.");
        setChangeEmailOpen(false);
        setNewEmail("");
        setVerifyDialogOpen(true);
        if (response.data.code) {
            console.log("DEV: Verification Code is", response.data.code);
         }
      } else {
        toast.error(response.data.message || "Failed to update email");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error updating email");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit code.");
      return;
    }
    setVerifyLoading(true);
    try {
      const response = await api.post("/auth/email/verify", { code: verificationCode });
      if (response.data.status === "success") {
        updateUser(response.data.data.user);
        toast.success("Email verified successfully!");
        setVerifyDialogOpen(false);
        setVerificationCode("");
      } else {
        toast.error(response.data.message || "Verification failed");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error during verification");
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 border-b border-border px-4 py-3 sm:px-6">
          <h1 className="text-lg font-bold text-foreground">Account Settings</h1>
          <p className="text-xs text-muted-foreground">Manage your profile, security, and preferences</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="mx-auto max-w-2xl space-y-4">

            {/* Profile Information */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">Profile Information</CardTitle>
                </div>
                <CardDescription className="text-xs">Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-8" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs">Address</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="h-8" />
                </div>

                {/* Email with verification */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <div className="flex items-center gap-2">
                    <Input id="email" type="email" value={email} disabled className="h-8 flex-1 bg-muted/50" />
                    {isVerified ? (
                      <Badge variant="outline" className="gap-1 text-xs border-green-500/30 text-green-600 dark:text-green-400 shrink-0">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </Badge>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 shrink-0 gap-1 text-xs border-amber-500/30 text-amber-600 hover:bg-amber-50" 
                        onClick={handleSendVerification}
                        disabled={emailLoading}
                      >
                        {emailLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <AlertCircle className="h-3 w-3" />} 
                        Verify Now
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary" onClick={() => setChangeEmailOpen(true)}>
                      Change email address
                    </Button>
                    {!isVerified && (
                       <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary" onClick={() => setVerifyDialogOpen(true)}>
                        Enter code
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs">Phone Number</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-8" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Job Position</Label>
                  <Input value={jobPosition} disabled className="h-8 capitalize bg-muted" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs">Username</Label>
                  <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="h-8" />
                </div>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setPwDialogOpen(true)}>
              <Lock className="h-4 w-4 text-primary" />
              Change Password
            </Button>

            {/* Appearance */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">Appearance</CardTitle>
                </div>
                <CardDescription className="text-xs">Toggle between light and dark mode</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Dark Mode</Label>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSave} className="w-full sm:w-auto" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={pwDialogOpen} onOpenChange={setPwDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Change Password</DialogTitle>
            <DialogDescription className="text-xs">Enter your current password and choose a new one.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="current" className="text-xs">Current Password</Label>
              <Input id="current" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="h-8" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new" className="text-xs">New Password</Label>
              <Input id="new" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="h-8" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPw" className="text-xs">Confirm New Password</Label>
              <Input id="confirmPw" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="h-8" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setPwDialogOpen(false)} disabled={pwLoading}>Cancel</Button>
            <Button onClick={handleChangePassword} disabled={pwLoading}>
              {pwLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Password Change */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">Confirm Password Change</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">Are you sure you want to change your password?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pwLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPassword} disabled={pwLoading}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Email Dialog */}
      <Dialog open={changeEmailOpen} onOpenChange={setChangeEmailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Change Email Address</DialogTitle>
            <DialogDescription className="text-xs">Enter your new email. A verification code will be sent.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Current Email</Label>
              <Input value={email} disabled className="h-8 bg-muted" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newEmail" className="text-xs">New Email</Label>
              <Input id="newEmail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="h-8" placeholder="Enter new email address" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setChangeEmailOpen(false)} disabled={emailLoading}>Cancel</Button>
            <Button onClick={handleChangeEmail} disabled={emailLoading}>
              {emailLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Email Change */}
      <AlertDialog open={emailConfirmOpen} onOpenChange={setEmailConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">Confirm Email Change</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Change your email from <span className="font-medium">{email}</span> to <span className="font-medium">{newEmail}</span>? You will need to verify the new address.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={emailLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmEmailChange} disabled={emailLoading}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verify Email Dialog (Code Input) */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Verify Your Email</DialogTitle>
            <DialogDescription className="text-xs">
              Enter the 6-digit code sent to <span className="font-medium">{email}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-xs">Verification Code</Label>
              <Input 
                id="code" 
                placeholder="000000" 
                value={verificationCode} 
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                className="h-10 text-center text-lg tracking-widest font-bold" 
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              Didn't receive the code? <button className="text-primary hover:underline" onClick={handleSendVerification} disabled={emailLoading}>Resend</button>
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setVerifyDialogOpen(false)} disabled={verifyLoading}>Cancel</Button>
            <Button onClick={handleVerifyCode} disabled={verifyLoading}>
              {verifyLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

export default AccountSettings;