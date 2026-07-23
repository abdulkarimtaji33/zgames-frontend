'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Mail } from 'lucide-react';
import { AdminModal } from '@/components/admin/AdminModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { FormField, FormInput } from '@/components/admin/FormField';
import { Button } from '@/components/ui/Button';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminSettingsApi } from '@/lib/api/adminApi';

const ADMIN_NOTIFICATION_EMAIL_KEY = 'admin_notification_email';
const STORE_THEME_KEY = 'store_theme_default';

interface SettingRow {
  key: string;
  value: string;
  group?: string;
  label?: string;
  description?: string;
}

const EMPTY_NEW = { key: '', value: '', group: 'general', label: '' };

export default function AdminSettingsPage() {
  const toast = useAdminToast((s) => s.show);
  const [settings, setSettings] = useState<SettingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [newSetting, setNewSetting] = useState(EMPTY_NEW);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [themeDefault, setThemeDefault] = useState<'light' | 'dark'>('light');
  const [savingTheme, setSavingTheme] = useState(false);
  const [savingNotifyEmail, setSavingNotifyEmail] = useState(false);

  const load = () => {
    setIsLoading(true);
    adminSettingsApi.findAll()
      .then((res) => {
        const rows = (res.data.data ?? []) as Array<Record<string, unknown>>;
        setSettings(rows.map((s) => ({
          key: String(s.key),
          value: typeof s.value === 'string' ? s.value : JSON.stringify(s.value ?? ''),
          group: s.group ? String(s.group) : 'general',
          label: s.description ? String(s.description) : String(s.key),
          description: s.description ? String(s.description) : undefined,
        })));
        const notifyRow = rows.find((s) => s.key === ADMIN_NOTIFICATION_EMAIL_KEY);
        setNotifyEmail(notifyRow ? String(notifyRow.value ?? '') : '');
        const themeRow = rows.find((s) => s.key === STORE_THEME_KEY);
        setThemeDefault(themeRow && String(themeRow.value) === 'dark' ? 'dark' : 'light');
      })
      .catch(() => setSettings([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSaveNotifyEmail = async () => {
    setSavingNotifyEmail(true);
    try {
      await adminSettingsApi.upsert({
        key: ADMIN_NOTIFICATION_EMAIL_KEY,
        value: notifyEmail.trim(),
        group: 'notifications',
        description: 'Email address that receives new-order alerts',
      });
      toast('Notification email saved', 'success');
      load();
    } catch {
      toast('Failed to save notification email', 'error');
    } finally {
      setSavingNotifyEmail(false);
    }
  };

  const handleSaveTheme = async (value: 'light' | 'dark') => {
    setThemeDefault(value);
    setSavingTheme(true);
    try {
      await adminSettingsApi.upsert({
        key: STORE_THEME_KEY,
        value,
        group: 'appearance',
        description: 'Default storefront theme (light or dark) shown to new visitors',
      });
      toast('Default theme saved', 'success');
      load();
    } catch {
      toast('Failed to save default theme', 'error');
    } finally {
      setSavingTheme(false);
    }
  };

  const groups = useMemo(() => {
    const map = new Map<string, SettingRow[]>();
    settings.filter((s) => s.key !== ADMIN_NOTIFICATION_EMAIL_KEY && s.key !== STORE_THEME_KEY).forEach((s) => {
      const g = s.group ?? 'general';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(s);
    });
    return map;
  }, [settings]);

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await adminSettingsApi.bulkUpdate({
        settings: settings.map((s) => ({
          key: s.key,
          value: s.value,
          group: s.group,
          description: s.label,
        })),
      });
      toast('Settings saved', 'success');
      load();
    } catch {
      toast('Failed to save settings', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdd = async () => {
    setSubmitting(true);
    try {
      await adminSettingsApi.upsert({
        key: newSetting.key,
        value: newSetting.value,
        group: newSetting.group,
        description: newSetting.label || newSetting.key,
      });
      toast('Setting added', 'success');
      setAddOpen(false);
      setNewSetting(EMPTY_NEW);
      load();
    } catch {
      toast('Failed to add setting', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteKey) return;
    setSubmitting(true);
    try {
      await adminSettingsApi.remove(deleteKey);
      toast('Setting deleted', 'success');
      setDeleteKey(null);
      load();
    } catch {
      toast('Failed to delete setting', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 flex justify-center"><div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add Setting</Button>
          <Button variant="primary" size="sm" onClick={handleSave} isLoading={submitting}>Save Changes</Button>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-accent" />
          <h3 className="font-heading font-bold text-sm">New Order Notifications</h3>
        </div>
        <p className="text-xs text-foreground-muted">
          Whenever a new order comes in (Cash on Delivery instantly, card payments once paid), an alert email is sent here and an in-app notification is created for admin/super-admin staff.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.value)}
            placeholder="orders@cgagames.com"
            className="flex-1 px-3 py-2 rounded-lg bg-background-tertiary border border-border text-sm focus:outline-none focus:border-accent"
          />
          <Button variant="primary" size="sm" onClick={handleSaveNotifyEmail} isLoading={savingNotifyEmail}>Save</Button>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border p-5 space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-bold text-sm">Storefront Theme</h3>
        </div>
        <p className="text-xs text-foreground-muted">
          Choose the default appearance shown to first-time visitors. Returning visitors who manually switch themes keep their own preference.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => handleSaveTheme('light')}
            disabled={savingTheme}
            className={`flex-1 px-3 py-2 rounded-lg border text-sm transition-colors ${themeDefault === 'light' ? 'border-accent text-accent bg-accent/5' : 'border-border text-foreground-muted hover:bg-background-tertiary'}`}
          >
            Light (default)
          </button>
          <button
            onClick={() => handleSaveTheme('dark')}
            disabled={savingTheme}
            className={`flex-1 px-3 py-2 rounded-lg border text-sm transition-colors ${themeDefault === 'dark' ? 'border-accent text-accent bg-accent/5' : 'border-border text-foreground-muted hover:bg-background-tertiary'}`}
          >
            Dark
          </button>
        </div>
      </div>

      {settings.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-8 text-center">
          <p className="text-sm text-foreground-muted mb-4">No settings configured yet.</p>
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add First Setting</Button>
        </div>
      ) : (
        Array.from(groups.entries()).map(([group, items]) => (
          <div key={group} className="rounded-xl bg-card border border-border overflow-hidden">
            <div className="px-5 py-3 bg-background-tertiary border-b border-border">
              <h3 className="font-heading font-bold text-sm capitalize">{group}</h3>
            </div>
            <div className="divide-y divide-border">
              {items.map((s) => (
                <div key={s.key} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{s.label ?? s.key}</p>
                    <p className="text-xs text-foreground-muted font-mono">{s.key}</p>
                  </div>
                  <input
                    className="sm:w-64 px-3 py-2 rounded-lg bg-background-tertiary border border-border text-sm focus:outline-none focus:border-accent"
                    value={s.value}
                    onChange={(e) => setSettings((prev) => prev.map((x) => x.key === s.key ? { ...x, value: e.target.value } : x))}
                  />
                  <button onClick={() => setDeleteKey(s.key)} className="p-1.5 rounded hover:bg-background-tertiary text-foreground-muted hover:text-error transition-colors self-start sm:self-center">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <AdminModal open={addOpen} title="Add Setting" onClose={() => setAddOpen(false)} onSubmit={handleAdd} isSubmitting={submitting} submitLabel="Add">
        <div className="space-y-4">
          <FormField label="Key"><FormInput value={newSetting.key} onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })} placeholder="site.name" /></FormField>
          <FormField label="Label"><FormInput value={newSetting.label} onChange={(e) => setNewSetting({ ...newSetting, label: e.target.value })} placeholder="Site Name" /></FormField>
          <FormField label="Value"><FormInput value={newSetting.value} onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })} /></FormField>
          <FormField label="Group"><FormInput value={newSetting.group} onChange={(e) => setNewSetting({ ...newSetting, group: e.target.value })} placeholder="general" /></FormField>
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteKey} title="Delete Setting" message={`Delete setting "${deleteKey}"?`} onConfirm={handleDelete} onCancel={() => setDeleteKey(null)} isLoading={submitting} destructive />
    </div>
  );
}
