import { useEffect, useState, useCallback } from 'react';
import { Save, Store, Phone, MapPin, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from './AdminLayout';
import { useToast } from '@/components/ui/Toast';
import type { StoreSettings } from '@/types';

export function AdminSettings() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<StoreSettings | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('store_settings').select('*').maybeSingle();
    if (error) { showToast('Erro', 'error'); return; }
    setSettings(data as StoreSettings);
    setForm(data as StoreSettings);
    setLoading(false);
  }, [useToast]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    const { error } = await supabase.from('store_settings').update({
      store_name: form.store_name, logo_url: form.logo_url, phone: form.phone, whatsapp: form.whatsapp,
      address_street: form.address_street, address_neighborhood: form.address_neighborhood,
      address_city: form.address_city, address_state: form.address_state, address_zip: form.address_zip,
      maps_url: form.maps_url, description: form.description, rating: form.rating, review_count: form.review_count,
      primary_color: form.primary_color, secondary_color: form.secondary_color,
      updated_at: new Date().toISOString(),
    }).eq('id', form.id);
    if (error) { showToast('Erro ao salvar', 'error'); } else { showToast('Configurações salvas!', 'success'); }
    setSaving(false);
  };

  if (loading || !form) return <AdminLayout><div className="text-gray-400 animate-pulse">Carregando...</div></AdminLayout>;

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-black mb-6">Configurações</h1>

      <div className="space-y-4">
        {/* Store identity */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-brand-red" />
            <h2 className="font-semibold text-black">Identidade da loja</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Nome da loja</label>
              <input value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} className="input-field mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Logo (URL da imagem)</label>
              <input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} className="input-field mt-1" placeholder="https://..." />
              {form.logo_url && <img src={form.logo_url} alt="Logo" className="mt-2 h-16 rounded-xl" />}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Descrição</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field mt-1 resize-none" rows={2} />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-5 h-5 text-brand-red" />
            <h2 className="font-semibold text-black">Contato</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Telefone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">WhatsApp (com DDI)</label>
              <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="input-field mt-1" placeholder="5517981467315" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-brand-red" />
            <h2 className="font-semibold text-black">Endereço</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Rua e número</label>
              <input value={form.address_street} onChange={(e) => setForm({ ...form, address_street: e.target.value })} className="input-field mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Bairro</label>
                <input value={form.address_neighborhood} onChange={(e) => setForm({ ...form, address_neighborhood: e.target.value })} className="input-field mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">CEP</label>
                <input value={form.address_zip} onChange={(e) => setForm({ ...form, address_zip: e.target.value })} className="input-field mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">Cidade</label>
                <input value={form.address_city} onChange={(e) => setForm({ ...form, address_city: e.target.value })} className="input-field mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Estado</label>
                <input value={form.address_state} onChange={(e) => setForm({ ...form, address_state: e.target.value })} className="input-field mt-1" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Link do Google Maps (opcional)</label>
              <input value={form.maps_url} onChange={(e) => setForm({ ...form, maps_url: e.target.value })} className="input-field mt-1" placeholder="https://maps.app.goo.gl/..." />
              <p className="text-xs text-gray-400 mt-1">
                Deixe em branco para o site montar o link automaticamente a partir do endereço preenchido acima. Preencha aqui só se quiser usar o link da sua ficha do Google Business (com fotos e avaliações).
              </p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-brand-red" />
            <h2 className="font-semibold text-black">Avaliações</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Avaliação (0-5)</label>
              <input type="number" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })} className="input-field mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Nº de avaliações</label>
              <input type="number" value={form.review_count} onChange={(e) => setForm({ ...form, review_count: parseInt(e.target.value) || 0 })} className="input-field mt-1" />
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 w-full sm:w-auto">
          <Save className="w-5 h-5" /> {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>
    </AdminLayout>
  );
}
