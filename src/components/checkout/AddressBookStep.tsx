'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AddressAutocomplete, type ParsedAddress } from '@/components/shared/AddressAutocomplete';
import { customerApi, locationApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils/cn';

export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  city: string;
  countryCode: string;
}

interface SavedAddress extends CheckoutAddress {
  id: string;
  label?: string | null;
  isDefault: boolean;
}

interface CityOption {
  id: string;
  name: string;
  stateName: string | null;
}

interface AddressBookStepProps {
  onContinue: (data: CheckoutAddress) => void;
  submitLabel?: string;
}

/**
 * Delivery-address step shared by both skins' checkout flows. Logged-in
 * customers pick from their saved address book (default pre-selected) or
 * add a new one; guests just get the plain form. Physical orders are UAE-only
 * for now, so country is locked and city comes from the cities API (seeded,
 * grouped by emirate) rather than free text.
 */
export function AddressBookStep({ onContinue, submitLabel = 'Continue' }: AddressBookStepProps) {
  const { isAuthenticated, customer } = useAuthStore();
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(isAuthenticated);
  const [selectedId, setSelectedId] = useState<string | 'new' | null>(null);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const addressWrapperRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<CheckoutAddress>({
    defaultValues: {
      firstName: customer?.firstName ?? '',
      lastName: customer?.lastName ?? '',
      phone: customer?.phone ?? '',
      addressLine1: '',
      city: '',
      countryCode: 'AE',
    },
  });

  useEffect(() => {
    locationApi.getCities('AE')
      .then((res) => setCities(((res.data as { data?: CityOption[] }).data) ?? []))
      .catch(() => setCities([]));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoadingSaved(false);
      return;
    }
    customerApi.getAddresses()
      .then((res) => {
        const list = (((res.data as { data?: SavedAddress[] }).data) ?? []) as SavedAddress[];
        setSavedAddresses(list);
        const def = list.find((a) => a.isDefault) ?? list[0];
        setSelectedId(def ? def.id : 'new');
      })
      .catch(() => setSelectedId('new'))
      .finally(() => setLoadingSaved(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (errors.addressLine1) {
      const el = addressWrapperRef.current?.querySelector('input');
      (el as HTMLInputElement | null)?.focus();
    }
  }, [errors.addressLine1]);

  const startNew = () => {
    setSelectedId('new');
    reset({
      firstName: customer?.firstName ?? '',
      lastName: customer?.lastName ?? '',
      phone: customer?.phone ?? '',
      addressLine1: '',
      city: '',
      countryCode: 'AE',
    });
  };

  const onSubmitNew = async (data: CheckoutAddress) => {
    if (isAuthenticated && saveNewAddress) {
      try {
        await customerApi.addAddress({ ...data, label: 'Home' });
      } catch {
        // Saving to the address book is a convenience — never block checkout on it.
      }
    }
    onContinue(data);
  };

  const continueWithSaved = () => {
    const addr = savedAddresses.find((a) => a.id === selectedId);
    if (addr) {
      onContinue({
        firstName: addr.firstName,
        lastName: addr.lastName,
        phone: addr.phone,
        addressLine1: addr.addressLine1,
        city: addr.city,
        countryCode: addr.countryCode || 'AE',
      });
    }
  };

  if (loadingSaved) {
    return (
      <div className="py-10 flex justify-center">
        <div className="h-7 w-7 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const groupedCities = cities.reduce<Record<string, CityOption[]>>((acc, c) => {
    const key = c.stateName || 'Other';
    (acc[key] ??= []).push(c);
    return acc;
  }, {});
  const showForm = selectedId === 'new' || savedAddresses.length === 0;

  return (
    <div className="space-y-4">
      {savedAddresses.length > 0 && (
        <div className="space-y-2.5">
          {savedAddresses.map((addr) => (
            <label
              key={addr.id}
              className={cn(
                'flex items-start gap-3 p-4 rounded-md border cursor-pointer transition-colors',
                selectedId === addr.id ? 'border-[color:var(--color-action)] bg-accent/5' : 'border-border hover:border-border-hover',
              )}
            >
              <input
                type="radio"
                name="saved-address"
                className="accent-accent mt-1 shrink-0"
                checked={selectedId === addr.id}
                onChange={() => setSelectedId(addr.id)}
              />
              <span className="flex-1 min-w-0 text-sm">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  {addr.label || 'Address'}
                  {addr.isDefault && (
                    <span className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full bg-success/20 text-success border border-success/30 font-medium">
                      <Star className="h-2.5 w-2.5" /> Default
                    </span>
                  )}
                </span>
                <span className="block text-foreground-muted">{addr.firstName} {addr.lastName} · {addr.phone}</span>
                <span className="block text-foreground-muted">{addr.addressLine1}, {addr.city}</span>
              </span>
            </label>
          ))}
          <button
            type="button"
            onClick={startNew}
            className={cn(
              'flex items-center gap-2 w-full p-4 rounded-md border border-dashed text-sm font-medium transition-colors',
              selectedId === 'new'
                ? 'border-[color:var(--color-action)] text-[color:var(--color-action)] bg-accent/5'
                : 'border-border text-foreground-muted hover:border-border-hover hover:text-foreground',
            )}
          >
            <Plus className="h-4 w-4" /> Use a new address
          </button>
        </div>
      )}

      {showForm ? (
        <form onSubmit={handleSubmit(onSubmitNew)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" error={errors.firstName?.message} {...register('firstName', { required: 'Required' })} />
            <Input label="Last Name" error={errors.lastName?.message} {...register('lastName', { required: 'Required' })} />
          </div>
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+971 50 123 4567"
            error={errors.phone?.message}
            {...register('phone', { required: 'Required' })}
          />
          <div ref={addressWrapperRef}>
            <AddressAutocomplete
              label="Address Line 1"
              placeholder="Start typing your address…"
              error={errors.addressLine1?.message}
              onTextChange={(v) => setValue('addressLine1', v, { shouldValidate: true })}
              onPlaceSelected={(place: ParsedAddress) => {
                setValue('addressLine1', place.addressLine1, { shouldValidate: true });
                if (place.city) {
                  const match = cities.find((c) => c.name.toLowerCase() === place.city.toLowerCase());
                  setValue('city', match ? match.name : place.city, { shouldValidate: true });
                }
              }}
            />
          </div>
          <input type="hidden" {...register('addressLine1', { required: 'Required' })} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">City</label>
              <select
                {...register('city', { required: 'Required' })}
                className="w-full rounded-md border border-border bg-background-secondary px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-ring/40"
              >
                <option value="">Select a city…</option>
                {Object.entries(groupedCities).map(([state, list]) => (
                  <optgroup key={state} label={state}>
                    {list.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {errors.city && <p className="mt-1 text-xs text-error">{errors.city.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Country</label>
              <div className="w-full rounded-md border border-border bg-background-tertiary px-3 py-2.5 text-sm text-foreground-muted flex items-center gap-2">
                🇦🇪 United Arab Emirates
              </div>
              <input type="hidden" value="AE" {...register('countryCode')} />
            </div>
          </div>

          {isAuthenticated && (
            <label className="flex items-center gap-2.5 text-sm text-foreground-muted cursor-pointer select-none">
              <input
                type="checkbox"
                checked={saveNewAddress}
                onChange={(e) => setSaveNewAddress(e.target.checked)}
                className="accent-accent"
              />
              Save this address to my account
            </label>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2">{submitLabel}</Button>
        </form>
      ) : (
        <Button type="button" variant="primary" size="lg" className="w-full mt-2" onClick={continueWithSaved}>
          {submitLabel}
        </Button>
      )}
    </div>
  );
}
