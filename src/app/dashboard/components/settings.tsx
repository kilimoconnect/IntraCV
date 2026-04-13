"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/auth-context";
import { useRouter } from "next/navigation";
import { Loader2, Save, KeyRound, User, Mail, Phone, MapPin, Briefcase, Globe, Linkedin, AlertTriangle } from "lucide-react";

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

const DEFAULT_PROFILE: UserProfile = { full_name: "", phone: "", location: "", headline: "", linkedin: "", website: "" };

function SectionCard({ icon, gradient, title, description, children }: {
  icon: React.ReactNode; gradient: string; title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-elevated overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100/80 flex items-center gap-3 bg-gradient-to-r from-slate-50/80 to-transparent">
        <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-sm`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function FieldRow({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
      </Label>
      {children}
    </div>
  );
}

export default function Settings({ userId, userEmail }: SettingsProps) {
  const supabase = createClient();
  const { signOut } = useAuth();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const [{ data: settings }, { data: pi }] = await Promise.all([
        supabase.from("user_settings").select("*").eq("user_id", userId).single(),
        supabase.from("cv_personal_info").select("*").eq("user_id", userId).single(),
      ]);
      // cv_personal_info is the authoritative source; fall back to user_settings
      const src = pi || settings;
      if (src) {
        setProfile({
          full_name: src.full_name || "",
          phone: src.phone || "",
          location: src.location || "",
          headline: src.headline || "",
          linkedin: src.linkedin || "",
          website: src.website || "",
        });
      }
    } catch { /* tables may not exist yet */ } finally { setLoadingProfile(false); }
  }, [userId, supabase]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const now = new Date().toISOString();
      const [r1, r2] = await Promise.all([
        supabase.from("user_settings").upsert({ user_id: userId, ...profile, updated_at: now }, { onConflict: "user_id" }),
        supabase.from("cv_personal_info").upsert({
          user_id: userId,
          full_name: profile.full_name,
          phone: profile.phone,
          location: profile.location,
          headline: profile.headline,
          linkedin: profile.linkedin,
          website: profile.website,
          updated_at: now,
        }, { onConflict: "user_id" }),
      ]);
      if (r1.error) throw r1.error;
      if (r2.error) throw r2.error;
      toast.success("Profile saved");
    } catch (err: any) { toast.error(err.message || "Failed to save"); } finally { setSavingProfile(false); }
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated");
      setNewPassword(""); setConfirmPassword("");
    } catch (err: any) { toast.error(err.message || "Failed to update password"); } finally { setChangingPassword(false); }
  };

  const deleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Deletion failed");
      }
      toast.success("Account deleted");
      await signOut();
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account");
      setDeletingAccount(false);
      setDeleteConfirm(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center animate-pulse">
          <Loader2 className="h-5 w-5 text-white animate-spin" />
        </div>
        <p className="text-sm text-slate-500">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl stagger-children">

      {/* Account */}
      <SectionCard icon={<Mail className="h-4 w-4 text-white" />} gradient="from-slate-500 to-slate-700" title="Account" description="Your login credentials">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">Email address</Label>
          <Input value={userEmail} disabled className="rounded-xl border-slate-200 bg-slate-50 text-slate-500 text-sm" />
          <p className="text-xs text-slate-400">Email cannot be changed.</p>
        </div>
      </SectionCard>

      {/* Profile */}
      <SectionCard icon={<User className="h-4 w-4 text-white" />} gradient="from-[#004aad] to-[#00c4cc]" title="Profile" description="Your public-facing info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldRow label="Full Name" icon={<User className="h-3 w-3" />}>
            <Input value={profile.full_name} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} placeholder="John Doe" className="rounded-xl border-slate-200 text-sm" />
          </FieldRow>
          <FieldRow label="Phone" icon={<Phone className="h-3 w-3" />}>
            <Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" className="rounded-xl border-slate-200 text-sm" />
          </FieldRow>
          <FieldRow label="Location" icon={<MapPin className="h-3 w-3" />}>
            <Input value={profile.location} onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))} placeholder="City, Country" className="rounded-xl border-slate-200 text-sm" />
          </FieldRow>
          <FieldRow label="Headline" icon={<Briefcase className="h-3 w-3" />}>
            <Input value={profile.headline} onChange={(e) => setProfile((p) => ({ ...p, headline: e.target.value }))} placeholder="Senior Software Engineer" className="rounded-xl border-slate-200 text-sm" />
          </FieldRow>
          <FieldRow label="LinkedIn" icon={<Linkedin className="h-3 w-3" />}>
            <Input value={profile.linkedin} onChange={(e) => setProfile((p) => ({ ...p, linkedin: e.target.value }))} placeholder="linkedin.com/in/..." className="rounded-xl border-slate-200 text-sm" />
          </FieldRow>
          <FieldRow label="Website" icon={<Globe className="h-3 w-3" />}>
            <Input value={profile.website} onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))} placeholder="https://..." className="rounded-xl border-slate-200 text-sm" />
          </FieldRow>
        </div>
        <div className="mt-5">
          <Button onClick={saveProfile} disabled={savingProfile} className="rounded-xl bg-[#ff751f] hover:bg-[#e8661a] border-0 shadow-sm hover:shadow-md shadow-[#ff751f]/20 text-white transition-all">
            {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Profile
          </Button>
        </div>
      </SectionCard>

      {/* Change Password */}
      <SectionCard icon={<KeyRound className="h-4 w-4 text-white" />} gradient="from-[#004aad] to-[#00c4cc]" title="Change Password" description="Update your account password">
        <div className="space-y-4">
          <FieldRow label="New Password">
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" className="rounded-xl border-slate-200 text-sm" />
          </FieldRow>
          <FieldRow label="Confirm Password">
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" className="rounded-xl border-slate-200 text-sm" />
          </FieldRow>
          <Button onClick={changePassword} disabled={changingPassword} className="rounded-xl bg-[#ff751f] hover:bg-[#e8661a] border-0 shadow-sm hover:shadow-md shadow-[#ff751f]/20 text-white transition-all">
            {changingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
            Update Password
          </Button>
        </div>
      </SectionCard>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-2xl border border-red-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-red-200 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-800">Danger Zone</h3>
            <p className="text-xs text-red-500 mt-0.5">Irreversible actions</p>
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm text-red-700 mb-4">
            Deleting your account is permanent and cannot be undone. Your profile, all CVs, documents, and account data will be permanently removed.
          </p>
          {!deleteConfirm ? (
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(true)}
              className="rounded-xl border-red-300 text-red-600 hover:bg-red-100 hover:border-red-400"
            >
              Delete My Account
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-red-700">Are you absolutely sure? This cannot be undone.</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(false)}
                  disabled={deletingAccount}
                  className="rounded-xl border-slate-300 text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={deleteAccount}
                  disabled={deletingAccount}
                  className="rounded-xl bg-red-600 hover:bg-red-700 text-white border-0"
                >
                  {deletingAccount ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting…</> : "Yes, Delete Everything"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
