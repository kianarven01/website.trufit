import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Lock, Bell, Sun, Mail, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const AccountSettings: React.FC = function () {
  const { user } = useAuth();

  // Profile fields
  const [firstName, setFirstName] = useState("Juan");
  const [lastName, setLastName] = useState("Dela Cruz");
  const [address, setAddress] = useState("123 Main St, Quezon City");
  const [email, setEmail] = useState(`${user?.username || "user"}@autoserv.ph`);
  const [phone, setPhone] = useState("+63 912 345 6789");
  const [username, setUsername] = useState(user?.username || "");
  const jobPosition = "Sales Associate";

  // Email verification
  const [emailVerified, setEmailVerified] = useState(false);
  const [changeEmailOpen, setChangeEmailOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailConfirmOpen, setEmailConfirmOpen] = useState(false);

  // Password
  const [pwDialogOpen, setPwDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const handleSave = () => {
    alert({ title: "Settings saved", description: "Your account settings have been updated." });
  };

  const handleChangePassword = () => {
    if (newPw !== confirmPw) {
      alert({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (!currentPw || !newPw) {
      alert({ title: "Error", description: "Please fill in all password fields.", variant: "destructive" });
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmPassword = () => {
    setConfirmOpen(false);
    setPwDialogOpen(false);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    alert({ title: "Password changed", description: "Your password has been updated successfully." });
  };

  const handleSendVerification = () => {
    setEmailVerified(true);
    alert({ title: "Verification sent", description: `A verification email has been sent to ${email}.` });
  };

  const handleChangeEmail = () => {
    if (!newEmail) {
      alert({ title: "Error", description: "Please enter a new email address.", variant: "destructive" });
      return;
    }
    setEmailConfirmOpen(true);
  };

  const handleConfirmEmailChange = () => {
    setEmail(newEmail);
    setNewEmail("");
    setEmailVerified(false);
    setEmailConfirmOpen(false);
    setChangeEmailOpen(false);
    alert({ title: "Email updated", description: "A verification email has been sent to your new address." });
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
                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-xs">First Name</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-8" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs">Address</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="h-8" />
                </div>

                {/* Email with verification */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <div className="flex items-center gap-2">
                    <Input id="email" type="email" value={email} disabled className="h-8 flex-1" />
                    {emailVerified ? (
                      <Badge variant="outline" className="gap-1 text-xs border-green-500/30 text-green-600 dark:text-green-400 shrink-0">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </Badge>
                    ) : (
                      <Button variant="outline" size="sm" className="h-8 shrink-0 gap-1 text-xs" onClick={handleSendVerification}>
                        <Mail className="h-3 w-3" /> Verify
                      </Button>
                    )}
                  </div>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary" onClick={() => setChangeEmailOpen(true)}>
                    Change email address
                  </Button>
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

            <Button onClick={handleSave} className="w-full sm:w-auto">Save Changes</Button>
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
            <Button variant="ghost" onClick={() => setPwDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleChangePassword}>Change Password</Button>
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPassword}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Email Dialog */}
      <Dialog open={changeEmailOpen} onOpenChange={setChangeEmailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Change Email Address</DialogTitle>
            <DialogDescription className="text-xs">Enter your new email. A verification link will be sent.</DialogDescription>
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
            <Button variant="ghost" onClick={() => setChangeEmailOpen(false)}>Cancel</Button>
            <Button onClick={handleChangeEmail}>Update Email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Email Change */}
      <AlertDialog open={emailConfirmOpen} onOpenChange={setEmailConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">Confirm Email Change</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Change your email from <span className="font-medium">{email}</span> to <span className="font-medium">{newEmail}</span>? A verification link will be sent to the new address.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmEmailChange}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

export default AccountSettings;