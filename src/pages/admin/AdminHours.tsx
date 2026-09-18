import { useEffect, useState, useCallback } from 'react';
import { Clock, Save, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from './AdminLayout';
import { useToast } from '@/components/ui/Toast';
import { getDayName } from '@/utils/format';
import type { BusinessHour } from '@/types';

export function AdminHours() {
  const { showToast } = useToast();
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  const load = useCallback(async () => {
    const { data: hoursData, error: hErr } = await supabase.from('business_hours').select('*').order('day_of_week');
    if (hErr) { showToast('Erro', 'error'); return; }
    setHours(hoursData as BusinessHour[]);

    const { data: settings } = await supabase.from('store_settings').select('is_temporarily_closed').maybeSingle();
    setIsClosed(settings?.is_temporarily_closed || false);
    setLoading(false);
  }, [useToast]);

  useEffect(() => { load(); }, [load]);

  const updateHour = (id: string, field: keyof BusinessHour, value: string | boolean) => {
    setHours((prev) => prev.map((h) => h.id === id ? { ...h, [field]: value } : h));
  };

  const handleSave = async () => {
    setSaving(true);
    for (const h of hours) {
      await supabase.from('business_hours').update({
        is_open: h.is_open, open_time: h.open_time, close_time: h.close_time,
      }).eq('id', h.id);
    }
    const { data: settings } = await supabase.from('store_settings').select('id').maybeSingle();
    if (settings) {
      await supabase.from('store_settings').update({ is_temporarily_closed: isClosed }).eq('id', settings.id);
    }
    showToast('Horários salvos!', 'success');
    setSaving(false);
  };

  if (loading) return <AdminLayout><div className="text-gray-400 animate-pulse">Carregando...</div></AdminLayout>;

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-black mb-6">Horários</h1>

      <div className="space-y-4">
        {/* Temporarily closed */}
        <div className="card p-4 flex items-center gap-3 border-2 border-orange-200 bg-orange-50">
          <AlertCircle className="w-6 h-6 text-orange-500" />
          <div className="flex-1">
            <h2 className="font-semibold text-sm text-black">Fechar loja temporariamente</h2>
            <p className="text-xs text-gray-600">Ative para fechar a loja imediatamente, ignorando os horários.</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isClosed} onChange={(e) => setIsClosed(e.target.checked)} className="w-5 h-5 accent-brand-red" />
            <span className="text-sm font-medium">{isClosed ? 'Fechada' : 'Aberta'}</span>
          </label>
        </div>

        {/* Hours per day */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-brand-red" />
            <h2 className="font-semibold text-black">Horários de funcionamento</h2>
          </div>
          <div className="space-y-2">
            {hours.map((h) => (
              <div key={h.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50">
                <span className="text-sm font-semibold text-black w-20">{getDayName(h.day_of_week)}</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={h.is_open} onChange={(e) => updateHour(h.id, 'is_open', e.target.checked)} className="accent-brand-red" />
                  <span className="text-xs text-gray-600">{h.is_open ? 'Aberto' : 'Fechado'}</span>
                </label>
                {h.is_open && (
                  <div className="flex items-center gap-2 ml-auto">
                    <input type="time" value={h.open_time} onChange={(e) => updateHour(h.id, 'open_time', e.target.value)} className="px-2 py-1.5 rounded-lg border border-gray-200 text-sm" />
                    <span className="text-gray-400 text-xs">até</span>
                    <input type="time" value={h.close_time} onChange={(e) => updateHour(h.id, 'close_time', e.target.value)} className="px-2 py-1.5 rounded-lg border border-gray-200 text-sm" />
                  </div>
                )}
                {!h.is_open && <span className="ml-auto text-xs text-gray-400">Fechado</span>}
              </div>
            ))}
            {hours.length === 0 && <p className="text-gray-400 text-center py-4">Nenhum horário cadastrado.</p>}
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 w-full sm:w-auto">
          <Save className="w-5 h-5" /> {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>
    </AdminLayout>
  );
}
