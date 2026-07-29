import React, { useState, useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserManagement } from "@/components/admin/UserManagement";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { storage } from "@/utils/storage";
import { validatePassword, validatePhone, validateEmail } from "@/utils/validators";
import { getErrorMessage } from "@/utils/error";
import api from "@/utils/api";
import type { IAdmin } from "@/types/admin.types";
import type { ApiResponse } from "@/types/api.types";
import {
  User,
  Lock,
  Bell,
  Globe,
  Shield,
  AlertCircle,
  CheckCircle2,
  Save,
  KeyRound,
  Loader2,
} from "lucide-react";

export default function AdminSettingsPage() {
  const { user, refreshUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const language = storage.getLanguage();

  // Profile state
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Preferences state
  const [preferences, setPreferences] = useState({
    notifications: true,
    soundAlerts: false,
  });

  // Load user data
  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  // Load preferences from localStorage
  useEffect(() => {
    const savedPrefs = storage.get<typeof preferences>("preferences");
    if (savedPrefs) setPreferences(savedPrefs);
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;

    setProfileLoading(true);
    try {
      const response = await api.put<ApiResponse<IAdmin>>(`/admin/${user._id}`, profile);
      if (response.data.success) {
        await refreshUser();
        toast({
          variant: "success",
          title: language === "am" ? "ፕሮፋይል ዘምኗል" : "Profile Updated",
          description: language === "am"
            ? "የፕሮፋይል መረጃዎ በተሳካ ሁኔታ ተቀይሯል።"
            : "Your profile information has been updated successfully.",
        });
      }
    } catch (err: any) {
      const message = getErrorMessage(err, "Failed to update profile");
      toast({ variant: "error", title: "Error", description: message });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    // Validate
    const errors: Record<string, string> = {};
    if (!passwordForm.currentPassword) {
      errors.currentPassword = language === "am" ? "አሁን ያለው የይለፍ ቃል ያስፈልጋል" : "Current password is required";
    }
    const newPassError = validatePassword(passwordForm.newPassword);
    if (newPassError) errors.newPassword = newPassError;
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = language === "am" ? "የይለፍ ቃሎች አይዛመዱም" : "Passwords do not match";
    }
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordLoading(true);
    try {
      await api.patch(`/admin/${user?._id}/change-password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({
        variant: "success",
        title: language === "am" ? "የይለፍ ቃል ተቀይሯል" : "Password Changed",
        description: language === "am"
          ? "የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል።"
          : "Your password has been changed successfully.",
      });
    } catch (err: any) {
      const message = getErrorMessage(err, "Failed to change password");
      if (err?.status === 401) {
        setPasswordErrors({ currentPassword: language === "am" ? "አሁን ያለው የይለፍ ቃል ትክክል አይደለም" : "Current password is incorrect" });
      } else {
        toast({ variant: "error", title: "Error", description: message });
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePreferencesSave = () => {
    storage.set("preferences", preferences);
    toast({
      variant: "success",
      title: language === "am" ? "ምርጫዎች ተቀምጠዋል" : "Preferences Saved",
    });
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Container maxWidth="xl" padding="default">
      <Header
        title="Settings"
        titleAmharic="ቅንብሮች"
        description={
          language === "am"
            ? "የመለያዎን እና የመተግበሪያዎን ቅንብሮች ያስተዳድሩ።"
            : "Manage your account and application settings."
        }
      />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" icon={<User className="h-4 w-4" />}>
            {language === "am" ? "ፕሮፋይል" : "Profile"}
          </TabsTrigger>
          <TabsTrigger value="password" icon={<Lock className="h-4 w-4" />}>
            {language === "am" ? "የይለፍ ቃል" : "Password"}
          </TabsTrigger>
          <TabsTrigger value="preferences" icon={<Bell className="h-4 w-4" />}>
            {language === "am" ? "ምርጫዎች" : "Preferences"}
          </TabsTrigger>
          {(user?.role === "super_admin" || user?.role === "admin") && (
            <TabsTrigger value="staff" icon={<Shield className="h-4 w-4" />}>
              {language === "am" ? "ሰራተኞች" : "Staff"}
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card variant="glass" className="max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                    {user ? getUserInitials(user.fullName) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{language === "am" ? "የግል መረጃ" : "Personal Information"}</CardTitle>
                  <CardDescription>
                    {language === "am"
                      ? "የፕሮፋይል መረጃዎን ያዘምኑ።"
                      : "Update your profile information."}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">
                    {language === "am" ? "ሙሉ ስም" : "Full Name"}
                  </Label>
                  <Input
                    id="fullName"
                    value={profile.fullName}
                    onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                    disabled={profileLoading}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    disabled={profileLoading}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">
                    {language === "am" ? "ስልክ" : "Phone"}
                  </Label>
                  <Input
                    id="phone"
                    value={profile.phoneNumber}
                    onChange={(e) => setProfile((p) => ({ ...p, phoneNumber: e.target.value }))}
                    disabled={profileLoading}
                  />
                </div>
                <Button type="submit" loading={profileLoading} leftIcon={<Save className="h-4 w-4" />}>
                  {language === "am" ? "ለውጦችን አስቀምጥ" : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card variant="glass" className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                {language === "am" ? "የይለፍ ቃል ቀይር" : "Change Password"}
              </CardTitle>
              <CardDescription>
                {language === "am"
                  ? "መለያዎን ለመጠበቅ ጠንካራ የይለፍ ቃል ይጠቀሙ።"
                  : "Use a strong password to protect your account."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword">
                    {language === "am" ? "አሁን ያለው የይለፍ ቃል" : "Current Password"}
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => {
                      setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }));
                      if (passwordErrors.currentPassword) setPasswordErrors((prev) => ({ ...prev, currentPassword: "" }));
                    }}
                    error={passwordErrors.currentPassword}
                    disabled={passwordLoading}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">
                    {language === "am" ? "አዲስ የይለፍ ቃል" : "New Password"}
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => {
                      setPasswordForm((p) => ({ ...p, newPassword: e.target.value }));
                      if (passwordErrors.newPassword) setPasswordErrors((prev) => ({ ...prev, newPassword: "" }));
                    }}
                    error={passwordErrors.newPassword}
                    disabled={passwordLoading}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">
                    {language === "am" ? "አዲሱን የይለፍ ቃል ያረጋግጡ" : "Confirm New Password"}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => {
                      setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }));
                      if (passwordErrors.confirmPassword) setPasswordErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                    error={passwordErrors.confirmPassword}
                    disabled={passwordLoading}
                  />
                </div>
                <Button type="submit" variant="primary" loading={passwordLoading} leftIcon={<Lock className="h-4 w-4" />}>
                  {language === "am" ? "የይለፍ ቃል ቀይር" : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card variant="glass" className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {language === "am" ? "ምርጫዎች" : "Preferences"}
              </CardTitle>
              <CardDescription>
                {language === "am"
                  ? "የማሳወቂያ እና የመተግበሪያ ምርጫዎችዎን ያስተዳድሩ።"
                  : "Manage your notification and application preferences."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {language === "am" ? "ማሳወቂያዎች" : "Notifications"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === "am"
                      ? "ስለ ማመልከቻ ለውጦች ማሳወቂያዎችን ይቀበሉ።"
                      : "Receive notifications about application changes."}
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications}
                  onCheckedChange={(checked) => setPreferences((p) => ({ ...p, notifications: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {language === "am" ? "የድምጽ ማንቂያዎች" : "Sound Alerts"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === "am"
                      ? "አዲስ ማመልከቻ ሲመጣ ድምጽ ያጫውቱ።"
                      : "Play a sound when new applications arrive."}
                  </p>
                </div>
                <Switch
                  checked={preferences.soundAlerts}
                  onCheckedChange={(checked) => setPreferences((p) => ({ ...p, soundAlerts: checked }))}
                />
              </div>
              <div className="pt-4">
                <Button onClick={handlePreferencesSave} leftIcon={<Save className="h-4 w-4" />}>
                  {language === "am" ? "ምርጫዎችን አስቀምጥ" : "Save Preferences"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Management Tab */}
        {(user?.role === "super_admin" || user?.role === "admin") && (
          <TabsContent value="staff">
            <UserManagement />
          </TabsContent>
        )}
      </Tabs>
    </Container>
  );
}