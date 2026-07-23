'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, Plus, Pencil, Trash2, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AddressAutocomplete, type ParsedAddress } from '@/components/shared/AddressAutocomplete';
import { customerApi } from '@/lib/api';

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state?: string | null;
  countryCode: string;
  zipCode?: string | null;
  isDefault: boolean;
  label?: string | null;
}

interface AddressFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  countryCode: string;
  zipCode?: string;
  label?: string;
}

const EMPTY: AddressFormValues = {
  firstName: '', lastName: '', phone: '', addressLine1: '', addressLine2: '',
  city: '', state: '', countryCode: 'AE', zipCode: '', label: 'Home',
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AddressFormValues>({ defaultValues: EMPTY });

  const load = () => {
    setIsLoading(true);
    customerApi.getAddresses()
      .then((res) => setAddresses(((res.data as { data?: Address[] }).data ?? []) as Address[]))
      .catch(() => setAddresses([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditingId(null);
    reset(EMPTY);
    setErrorMsg(null);
    setShowForm(true);
  };

  const openEdit = (addr: Address) => {
    setEditingId(addr.id);
    reset({
      firstName: addr.firstName,
      lastName: addr.lastName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 ?? '',
      city: addr.city,
      state: addr.state ?? '',
      countryCode: addr.countryCode,
      zipCode: addr.zipCode ?? '',
      label: addr.label ?? 'Home',
    });
    setErrorMsg(null);
    setShowForm(true);
  };

  const onSubmit = async (data: AddressFormValues) => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      if (editingId) {
        await customerApi.updateAddress(editingId, data);
      } else {
        await customerApi.addAddress(data);
      }
      setShowForm(false);
      load();
    } catch {
      setErrorMsg('Failed to save address. Please check the details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      await customerApi.deleteAddress(id);
      load();
    } catch {
      alert('Failed to delete address.');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await customerApi.setDefaultAddress(id);
      load();
    } catch {
      alert('Failed to set default address.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">My Addresses</h1>
        <Button variant="secondary" size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Address
        </Button>
      </div>

      {isLoading ? (
        <div className="p-10 flex justify-center"><div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-16 rounded-xl bg-card border border-border shadow-sm">
          <MapPin className="h-14 w-14 text-foreground-subtle mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold mb-2">No addresses saved</h2>
          <p className="text-foreground-muted mb-4">Add delivery addresses for faster checkout.</p>
          <Button variant="primary" size="sm" onClick={openAdd}><Plus className="h-4 w-4" /> Add Address</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded-xl bg-card border border-border p-5 space-y-2 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-foreground-subtle">{addr.label || 'Address'}</span>
                {addr.isDefault && (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-success/20 text-success border border-success/30 font-medium">
                    <Star className="h-3 w-3" /> Default
                  </span>
                )}
              </div>
              <p className="font-medium">{addr.firstName} {addr.lastName}</p>
              <p className="text-sm text-foreground-muted">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
              <p className="text-sm text-foreground-muted">{addr.city}{addr.state ? `, ${addr.state}` : ''}, {addr.countryCode}</p>
              <p className="text-sm text-foreground-muted">{addr.phone}</p>
              <div className="flex items-center gap-2 pt-2">
                <button onClick={() => openEdit(addr)} className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(addr.id)} className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-background-tertiary text-foreground-muted hover:text-error transition-colors">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr.id)} className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors ml-auto">
                    Set as default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 mega-menu-backdrop animate-fade-in" onClick={() => setShowForm(false)}>
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-lg font-bold">{editingId ? 'Edit Address' : 'Add Address'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-background-tertiary text-foreground-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Label" placeholder="Home, Office…" {...register('label')} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" error={errors.firstName?.message} {...register('firstName', { required: 'Required' })} />
                <Input label="Last Name" error={errors.lastName?.message} {...register('lastName', { required: 'Required' })} />
              </div>
              <Input label="Phone Number" type="tel" placeholder="+971 50 123 4567" error={errors.phone?.message} {...register('phone', { required: 'Required' })} />

              <AddressAutocomplete
                label="Address Line 1"
                placeholder="Start typing your address…"
                error={errors.addressLine1?.message}
                onTextChange={(v) => setValue('addressLine1', v, { shouldValidate: true })}
                onPlaceSelected={(place: ParsedAddress) => {
                  setValue('addressLine1', place.addressLine1, { shouldValidate: true });
                  setValue('city', place.city, { shouldValidate: true });
                  if (place.state) setValue('state', place.state);
                  if (place.zipCode) setValue('zipCode', place.zipCode);
                  if (place.countryCode) setValue('countryCode', place.countryCode);
                }}
              />
              <input type="hidden" {...register('addressLine1', { required: 'Required' })} />
              <Input label="Address Line 2 (optional)" placeholder="Apartment, Floor" {...register('addressLine2')} />

              <div className="grid grid-cols-2 gap-4">
                <Input label="City" error={errors.city?.message} {...register('city', { required: 'Required' })} />
                <Input label="State / Emirate (optional)" {...register('state')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Country</label>
                  <select {...register('countryCode')}
                    className="w-full rounded border border-border bg-background-secondary px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
                  >
                    <option value="AE">🇦🇪 United Arab Emirates</option>
                    <option value="SA">🇸🇦 Saudi Arabia</option>
                    <option value="QA">🇶🇦 Qatar</option>
                    <option value="KW">🇰🇼 Kuwait</option>
                    <option value="BH">🇧🇭 Bahrain</option>
                  </select>
                </div>
                <Input label="Postal Code (optional)" {...register('zipCode')} />
              </div>

              {errorMsg && <p className="text-sm text-error">{errorMsg}</p>}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="lg" className="flex-1" isLoading={submitting}>Save Address</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
