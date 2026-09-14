import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { StoreSettings, BusinessHour, PaymentSettings } from '@/types';

interface StoreContextValue {
  settings: StoreSettings | null;
  businessHours: BusinessHour[];
  paymentSettings: PaymentSettings | null;
  loading: boolean;
  isOpen: boolean;
  refresh: () => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [settingsRes, hoursRes, paymentRes] = await Promise.all([
      supabase.from('store_settings').select('*').maybeSingle(),
      supabase.from('business_hours').select('*').order('day_of_week'),
      supabase.from('payment_settings').select('*').maybeSingle(),
    ]);

    if (settingsRes.data) setSettings(settingsRes.data as StoreSettings);
    if (hoursRes.data) setBusinessHours(hoursRes.data as BusinessHour[]);
    if (paymentRes.data) setPaymentSettings(paymentRes.data as PaymentSettings);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const checkOpen = useCallback(() => {
    if (!settings?.is_temporarily_closed === false) {
      if (settings?.is_temporarily_closed) return false;
    }
    if (businessHours.length === 0) return true;
    const now = new Date();
    const day = now.getDay();
    const today = businessHours.find((h) => h.day_of_week === day);
    if (!today || !today.is_open) return false;
    const currentTime = now.toTimeString().slice(0, 5);
    return currentTime >= today.open_time && currentTime <= today.close_time;
  }, [settings, businessHours]);

  return (
    <StoreContext.Provider
      value={{
        settings,
        businessHours,
        paymentSettings,
        loading,
        isOpen: checkOpen(),
        refresh: load,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
