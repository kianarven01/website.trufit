import { useState, useEffect } from "react";
// Removed DashboardLayout import
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Lock, Sun, Mail, ShieldCheck, Loader2, AlertCircle, Phone } from "lucide-react";
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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [jobPosition, setJobPosition] = useState("");

  const [loading, setLoading] = useState(false);

  // Verification status
  const [isVerified, setIsVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  // Sync state with user data
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setAddress(user.address || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setUsername(user.username || "");
      setJobPosition(user.position || "");
      setIsVerified(!!user.is_verified);
      setIsPhoneVerified(!!user.is_phone_verified);
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

  // Phone verification dialogs
  const [phoneVerifyDialogOpen, setPhoneVerifyDialogOpen] = useState(false);
  const [phoneVerificationCode, setPhoneVerificationCode] = useState("");
  const [phoneVerifyLoading, setPhoneVerifyLoading] = useState(false);
  const [phoneSendingLoading, setPhoneSendingLoading] = useState(false);

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
        first_name: firstName,
        last_name: lastName,
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
      } else {
        toast.error(response.data.message || "Failed to send code");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error sending verification code");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSendPhoneVerification = async () => {
    setPhoneSendingLoading(true);
    try {
      const response = await api.post("/auth/phone/resend");
      if (response.data.status === "success") {
        toast.success(`Verification code sent to ${phone}`);
        setPhoneVerifyDialogOpen(true);
      } else {
        toast.error(response.data.message || "Failed to send code");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error sending verification code");
    } finally {
      setPhoneSendingLoading(false);
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

  const handleVerifyPhoneCode = async () => {
    if (phoneVerificationCode.length !== 6) {
      toast.error("Please enter a 6-digit code.");
      return;
    }
    setPhoneVerifyLoading(true);
    try {
      const response = await api.post("/auth/phone/verify", { code: phoneVerificationCode });
      if (response.data.status === "success") {
        updateUser(response.data.data.user);
        toast.success("Phone number verified successfully!");
        setPhoneVerifyDialogOpen(false);
        setPhoneVerificationCode("");
      } else {
        toast.error(response.data.message || "Verification failed");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error during verification");
    } finally {
      setPhoneVerifyLoading(false);
    }
  };

  return (
    <>
      <div className="flex h-full w-full flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 px-6 pt-5 pb-4">
          <h1 className="text-xl font-bold text-foreground">Account Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage your profile, security, and preferences</p>
        </div>

        {/* Content — full width two-column layout */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

            {/* ── LEFT COLUMN: Identity & Avatar ── */}
            <div className="flex flex-col gap-6">

              {/* Avatar Card */}
              <Card className="bg-card border-0 shadow-sm">
                <CardContent className="pt-6 flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-3xl ring-4 ring-primary/10">
                      {firstName ? firstName.charAt(0).toUpperCase() : (username?.charAt(0).toUpperCase() || "?")}
                    </div>
                    <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-card" title="Online" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-base text-foreground">
                      {firstName || lastName ? `${firstName} ${lastName}`.trim() : username}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{jobPosition || "No position set"}</p>
                  </div>
                  <div className="w-full pt-3 border-t border-border/40 space-y-3">
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span className="text-muted-foreground">Username</span>
                      <span className="font-medium text-foreground">@{username}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium text-foreground break-all">{email}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Email</span>
                      {isVerified ? (
                        <span className="text-green-500 font-semibold flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </span>
                      ) : (
                        <span className="text-amber-500 font-semibold flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Unverified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Phone</span>
                      {isPhoneVerified ? (
                        <span className="text-green-500 font-semibold flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50 font-medium">Not verified</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security & Appearance */}
              <Card className="bg-card border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">Security</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-sm border-border/50"
                    onClick={() => setPwDialogOpen(true)}
                  >
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Change Password
                  </Button>
                </CardContent>
              </Card>

              {/* Appearance */}
              <Card className="bg-card border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">Appearance</CardTitle>
                  </div>
                  <CardDescription className="text-xs">Toggle between light and dark mode</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Dark Mode</p>
                      <p className="text-xs text-muted-foreground">Preferred for this app</p>
                    </div>
                    <ThemeToggle />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── RIGHT COLUMN: Form Fields ── */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Profile Information */}
              <Card className="bg-card border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">Profile Information</CardTitle>
                  </div>
                  <CardDescription className="text-xs">Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Full Name</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="firstName" className="text-xs text-muted-foreground">First Name</Label>
                        <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="lastName" className="text-xs text-muted-foreground">Last Name</Label>
                        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" />
                      </div>
                    </div>
                  </div>

                  {/* Address & Username side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="address" className="text-xs font-semibold">Address</Label>
                      <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your address" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="username" className="text-xs font-semibold">Username</Label>
                      <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
                    </div>
                  </div>

                  {/* Job Position (read-only) */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Job Position</Label>
                    <Input value={jobPosition} disabled className="capitalize bg-muted/50 text-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground">Position is managed by your administrator.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact & Verification */}
              <Card className="bg-card border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">Contact & Verification</CardTitle>
                  </div>
                  <CardDescription className="text-xs">Manage your email and phone number</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                    <div className="flex items-center gap-2">
                      <Input id="email" type="email" value={email} disabled className="flex-1 bg-muted/50 text-muted-foreground" />
                      {isVerified ? (
                        <Badge variant="outline" className="gap-1 text-xs border-green-500/30 text-green-600 dark:text-green-400 shrink-0">
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0 gap-1 text-xs border-amber-500/30 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
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

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold">Phone Number</Label>
                    <div className="flex items-center gap-2">
                      <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="flex-1" placeholder="+63 900 000 0000" />
                      {isPhoneVerified ? (
                        <Badge variant="outline" className="gap-1 text-xs border-green-500/30 text-green-600 dark:text-green-400 shrink-0">
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0 gap-1 text-xs border-amber-500/30 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                          onClick={handleSendPhoneVerification}
                          disabled={phoneSendingLoading}
                        >
                          {phoneSendingLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Phone className="h-3 w-3" />}
                          Verify Phone
                        </Button>
                      )}
                    </div>
                    {!isPhoneVerified && phone && (
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary" onClick={() => setPhoneVerifyDialogOpen(true)}>
                        Enter verification code
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={handleSave} className="px-8" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </div>

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

      {/* Verify Phone Dialog (Code Input) */}
      <Dialog open={phoneVerifyDialogOpen} onOpenChange={setPhoneVerifyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Verify Your Phone Number</DialogTitle>
            <DialogDescription className="text-xs">
              Enter the 6-digit code sent to <span className="font-medium">{phone}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="phoneCode" className="text-xs">Verification Code</Label>
              <Input 
                id="phoneCode" 
                placeholder="000000" 
                value={phoneVerificationCode} 
                onChange={(e) => setPhoneVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                className="h-10 text-center text-lg tracking-widest font-bold" 
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              Didn't receive the code? <button className="text-primary hover:underline" onClick={handleSendPhoneVerification} disabled={phoneSendingLoading}>Resend</button>
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setPhoneVerifyDialogOpen(false)} disabled={phoneVerifyLoading}>Cancel</Button>
            <Button onClick={handleVerifyPhoneCode} disabled={phoneVerifyLoading}>
              {phoneVerifyLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AccountSettings;