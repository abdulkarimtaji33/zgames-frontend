'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, FormInput } from '@/components/admin/FormField';
import { adminAuthApi } from '@/lib/api/adminApi';
import adminClient from '@/lib/api/adminClient';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { useAdminToast } from '@/hooks/useAdminToast';

export default function AdminProfilePage() {
  const { user, setAuth, accessToken, refreshToken } = useAdminAuthStore();
  const { show } = useAdminToast();
  const [profile, setProfile] = useState({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phone: user?.phone ?? '' });
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await adminClient.patch('/users/me', profile);
      setAuth(accessToken!, refreshToken!, res.data.data);
      show('Profile updated', 'success');
    } catch (e) {
      show(e instanceof Error ? e.message : 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwords.next !== passwords.confirm) { show('Passwords do not match', 'error'); return; }
    setSaving(true);
    try {
      await adminAuthApi.changePassword(passwords.current, passwords.next);
      show('Password changed', 'success');
      setPasswords({ current: '', next: '', confirm: '' });
    } catch (e) {
      show('Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-xl">
      <h1 className="font-heading text-2xl font-bold">My Profile</h1>

      <section className="rounded-xl bg-card border border-border p-5 space-y-4">
        <h2 className="font-semibold">Account Info</h2>
        <p className="text-sm text-foreground-muted">{user?.email}</p>
        <FormField label="First Name"><FormInput value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} /></FormField>
        <FormField label="Last Name"><FormInput value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} /></FormField>
        <FormField label="Phone"><FormInput value={profile.phone ?? ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></FormField>
        <Button variant="primary" size="sm" onClick={saveProfile} isLoading={saving}>Save Profile</Button>
      </section>

      <section className="rounded-xl bg-card border border-border p-5 space-y-4">
        <h2 className="font-semibold">Change Password</h2>
        <FormField label="Current Password"><FormInput type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} /></FormField>
        <FormField label="New Password"><FormInput type="password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} /></FormField>
        <FormField label="Confirm Password"><FormInput type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} /></FormField>
        <Button variant="primary" size="sm" onClick={changePassword} isLoading={saving}>Change Password</Button>
      </section>
    </div>
  );
}
