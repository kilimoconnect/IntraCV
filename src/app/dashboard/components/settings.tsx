"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Save, KeyRound, User, FileText, Mail, Phone, MapPin, Briefcase, Globe, Linkedin, AlertTriangle } from "lucide-react";

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

const DEFAULT_PROFILE: UserProfile = { full_name: "", phone: "", location: "", headline: "", linkedin: "", website: "" };
const DEFAULT_CV_PREFS: CvPreferences = { default_template: "professional", target_pages: 2, font_size: "medium", include_photo: false, include_references: true, include_declaration: false };

function SectionCard({ icon, gradient, title, description, children }: {
  icon: React.ReactNode; gradient: string; title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm shadow-slate-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
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

const selectClass = "flex h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-300 focus-visible:border-indigo-300";

export default function Settings({ userId, userEmail }: SettingsProps) {
  const supabase = createClient();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [cvPrefs, setCvPrefs] = useState<CvPreferences>(DEFAULT_CV_PREFS);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const { data } = await supabase.from("user_settings").select("*").eq("user_id", userId).single();
      if (data) {
        setProfile({ full_name: data.full_name || "", phone: data.phone || "", location: data.location || "", headline: data.headline || "", linkedin: data.linkedin || "", website: data.website || "" });
        setCvPrefs({ default_template: data.default_template || "professional", target_pages: data.target_pages || 2, font_size: data.font_size || "medium", include_photo: data.include_photo ?? false, include_references: data.include_references ?? true, include_declaration: data.include_declaration ?? false });
      }
    } catch { /* table may not exist yet */ } finally { setLoadingProfile(false); }
  }, [userId, supabase]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const { error } = await supabase.from("user_settings").upsert({ user_id: userId, ...profile, ...cvPrefs, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (error) throw error;
      toast.success("Profile saved");
    } catch (err: any) { toast.error(err.message || "Failed to save"); } finally { setSavingProfile(false); }
  };

  const saveCvPreferences = async () => {
    setSavingPrefs(true);
    try {
      const { error } = await supabase.from("user_settings").upsert({ user_id: userId, ...profile, ...cvPrefs, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (error) throw error;
      toast.success("CV preferences saved");
    } catch (err: any) { toast.error(err.message || "Failed to save"); } finally { setSavingPrefs(false); }
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
    <div className="space-y-5 max-w-2xl">

      {/* Account */}
      <SectionCard icon={<Mail className="h-4 w-4 text-white" />} gradient="from-slate-500 to-slate-700" title="Account" description="Your login credentials">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">Email address</Label>
          <Input value={userEmail} disabled className="rounded-xl border-slate-200 bg-slate-50 text-slate-500 text-sm" />
          <p className="text-xs text-slate-400">Email cannot be changed.</p>
        </div>
      </SectionCard>

      {/* Profile */}
      <SectionCard icon={<User className="h-4 w-4 text-white" />} gradient="from-indigo-500 to-violet-600" title="Profile" description="Your public-facing info">
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
          <Button onClick={saveProfile} disabled={savingProfile} className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 border-0 shadow-sm shadow-indigo-200 text-white">
            {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Profile
          </Button>
        </div>
      </SectionCard>

      {/* CV Preferences */}
      <SectionCard icon={<FileText className="h-4 w-4 text-white" />} gradient="from-violet-500 to-purple-600" title="CV Preferences" description="Default settings for your generated CVs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <FieldRow label="Default Template">
            <select value={cvPrefs.default_template} onChange={(e) => setCvPrefs((p) => ({ ...p, default_template: e.target.value }))} className={selectClass}>
              <option value="professional">Professional</option>
              <option value="modern">Modern</option>
              <option value="minimal">Minimal</option>
              <option value="creative">Creative</option>
              <option value="executive">Executive</option>
            </select>
          </FieldRow>
          <FieldRow label="Target Pages">
            <select value={cvPrefs.target_pages} onChange={(e) => setCvPrefs((p) => ({ ...p, target_pages: Number(e.target.value) }))} className={selectClass}>
              <option value={1}>1 page</option>
              <option value={2}>2 pages</option>
              <option value={3}>3 pages</option>
              <option value={4}>4 pages</option>
            </select>
          </FieldRow>
          <FieldRow label="Font Size">
            <select value={cvPrefs.font_size} onChange={(e) => setCvPrefs((p) => ({ ...p, font_size: e.target.value }))} className={selectClass}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </FieldRow>
        </div>

        <Separator className="my-4" />

        <div className="space-y-2 mb-5">
          <p className="text-xs font-semibold text-slate-600 mb-3">Section Visibility</p>
          {[
            { key: "include_photo", label: "Include photo placeholder" },
            { key: "include_references", label: "Include references section" },
            { key: "include_declaration", label: "Include declaration section" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer group">
              <div className={`relative h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                cvPrefs[key as keyof CvPreferences]
                  ? "bg-indigo-600 border-indigo-600"
                  : "border-slate-300 group-hover:border-indigo-400"
              }`}>
                <input
                  type="checkbox"
                  checked={!!cvPrefs[key as keyof CvPreferences]}
                  onChange={(e) => setCvPrefs((p) => ({ ...p, [key]: e.target.checked }))}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {cvPrefs[key as keyof CvPreferences] && (
                  <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>

        <Button onClick={saveCvPreferences} disabled={savingPrefs} className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 border-0 shadow-sm shadow-violet-200 text-white">
          {savingPrefs ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Preferences
        </Button>
      </SectionCard>

      {/* Change Password */}
      <SectionCard icon={<KeyRound className="h-4 w-4 text-white" />} gradient="from-blue-500 to-indigo-600" title="Change Password" description="Update your account password">
        <div className="space-y-4">
          <FieldRow label="New Password">
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" className="rounded-xl border-slate-200 text-sm" />
          </FieldRow>
          <FieldRow label="Confirm Password">
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" className="rounded-xl border-slate-200 text-sm" />
          </FieldRow>
          <Button onClick={changePassword} disabled={changingPassword} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-sm shadow-blue-200 text-white">
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
          <p className="text-sm text-red-700 mb-4">Deleting your account is permanent and cannot be undone. All your data will be lost.</p>
          <Button variant="outline" className="rounded-xl border-red-300 text-red-600 hover:bg-red-100 hover:border-red-400" disabled>
            Delete Account (Contact Support)
          </Button>
        </div>
      </div>

    </div>
  );
}
