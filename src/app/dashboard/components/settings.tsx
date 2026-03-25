"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Save, KeyRound, User, FileText } from "lucide-react";

interface SettingsProps {
  userId: string;
  userEmail: string;
}

interface UserProfile {
  full_name: string;
  phone: string;
  location: string;
  headline: string;
  linkedin: string;
  website: string;
}

interface CvPreferences {
  default_template: string;
  target_pages: number;
  font_size: string;
  include_photo: boolean;
  include_references: boolean;
  include_declaration: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  full_name: "",
  phone: "",
  location: "",
  headline: "",
  linkedin: "",
  website: "",
};

const DEFAULT_CV_PREFS: CvPreferences = {
  default_template: "professional",
  target_pages: 2,
  font_size: "medium",
  include_photo: false,
  include_references: true,
  include_declaration: false,
};

export default function Settings({ userId, userEmail }: SettingsProps) {
  const supabase = createClient();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Profile state
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // CV preferences state
  const [cvPrefs, setCvPrefs] = useState<CvPreferences>(DEFAULT_CV_PREFS);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Load profile and preferences from Supabase
  const loadSettings = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const { data } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          phone: data.phone || "",
          location: data.location || "",
          headline: data.headline || "",
          linkedin: data.linkedin || "",
          website: data.website || "",
        });
        setCvPrefs({
          default_template: data.default_template || "professional",
          target_pages: data.target_pages || 2,
          font_size: data.font_size || "medium",
          include_photo: data.include_photo ?? false,
          include_references: data.include_references ?? true,
          include_declaration: data.include_declaration ?? false,
        });
      }
    } catch {
      // Table may not exist yet — use defaults
    } finally {
      setLoadingProfile(false);
    }
  }, [userId, supabase]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: userId,
          ...profile,
          ...cvPrefs,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      if (error) throw error;
      toast.success("Profile saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const saveCvPreferences = async () => {
    setSavingPrefs(true);
    try {
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: userId,
          ...profile,
          ...cvPrefs,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      if (error) throw error;
      toast.success("CV preferences saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save preferences");
    } finally {
      setSavingPrefs(false);
    }
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={userEmail} disabled />
            <p className="text-xs text-muted-foreground">Your email cannot be changed.</p>
          </div>
        </CardContent>
      </Card>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={profile.full_name}
                onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={profile.location}
                onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                placeholder="City, Country"
              />
            </div>
            <div className="space-y-2">
              <Label>Headline</Label>
              <Input
                value={profile.headline}
                onChange={(e) => setProfile((p) => ({ ...p, headline: e.target.value }))}
                placeholder="Senior Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input
                value={profile.linkedin}
                onChange={(e) => setProfile((p) => ({ ...p, linkedin: e.target.value }))}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={profile.website}
                onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>
          <Button onClick={saveProfile} disabled={savingProfile}>
            {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* CV Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" /> CV Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Template</Label>
              <select
                value={cvPrefs.default_template}
                onChange={(e) => setCvPrefs((p) => ({ ...p, default_template: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="professional">Professional</option>
                <option value="modern">Modern</option>
                <option value="minimal">Minimal</option>
                <option value="creative">Creative</option>
                <option value="executive">Executive</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Target Pages</Label>
              <select
                value={cvPrefs.target_pages}
                onChange={(e) => setCvPrefs((p) => ({ ...p, target_pages: Number(e.target.value) }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value={1}>1 page</option>
                <option value={2}>2 pages</option>
                <option value={3}>3 pages</option>
                <option value={4}>4 pages</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Font Size</Label>
              <select
                value={cvPrefs.font_size}
                onChange={(e) => setCvPrefs((p) => ({ ...p, font_size: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-medium">Section Visibility</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={cvPrefs.include_photo}
                  onChange={(e) => setCvPrefs((p) => ({ ...p, include_photo: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                Include photo placeholder
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={cvPrefs.include_references}
                  onChange={(e) => setCvPrefs((p) => ({ ...p, include_references: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                Include references section
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={cvPrefs.include_declaration}
                  onChange={(e) => setCvPrefs((p) => ({ ...p, include_declaration: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                Include declaration section
              </label>
            </div>
          </div>

          <Button onClick={saveCvPreferences} disabled={savingPrefs}>
            {savingPrefs ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="h-5 w-5" /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button onClick={changePassword} disabled={changingPassword}>
            {changingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Deleting your account is permanent and cannot be undone. All your data will be lost.
          </p>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" disabled>
            Delete Account (Contact Support)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
