import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Truck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from './AdminLayout';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/utils/format';
import type { DeliveryZone } from '@/types';

export function AdminDelivery() {
  const { showToast } = useToast();
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DeliveryZone | null>(null);
  const [form, setForm] = useState({ name: '', delivery_fee: '', min_order: '', estimated_time: '30-45 min', is_active: true });

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('delivery_zones').select('*').order('name');
    if (error) { showToast('Erro', 'error'); return; }
    setZones(data as DeliveryZone[]);
    setLoading(false);
  }, [useToast]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name, delivery_fee: parseFloat(form.delivery_fee) || 0,
      min_order: parseFloat(form.min_order) || 0, estimated_time: form.estimated_time, is_active: form.is_active,
    };
    if (editing) {
      const { error } = await supabase.from('delivery_zones').update(payload).eq('id', editing.id);
      if (error) { showToast('Erro', 'error'); return; }
      showToast('Zona atualizada!', 'success');
    } else {
      const { error } = await supabase.from('delivery_zones').insert(payload);
      if (error) { showToast('Erro', 'error'); return; }
      showToast('Zona criada!', 'success');
    }
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', delivery_fee: '', min_order: '', estimated_time: '30-45 min', is_active: true });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta zona?')) return;
    const { error } = await supabase.from('delivery_zones').delete().eq('id', id);
    if (error) { showToast('Erro', 'error'); return; }
    showToast('Zona excluída', 'info');
    load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-black">Entrega</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', delivery_fee: '', min_order: '', estimated_time: '30-45 min', is_active: true }); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Nova zona
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 animate-pulse">Carregando...</div>
      ) : (
        <div className="space-y-2">
          {zones.map((z) => (
            <div key={z.id} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center">
                <Truck className="w-5 h-5 text-brand-red" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-black">{z.name}</p>
                <p className="text-xs text-gray-500">
                  Taxa: {formatCurrency(z.delivery_fee)} • Mín: {formatCurrency(z.min_order)} • {z.estimated_time}
                </p>
              </div>
              <span className={`badge ${z.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {z.is_active ? 'Ativa' : 'Inativa'}
              </span>
              <button onClick={() => { setEditing(z); setForm({ name: z.name, delivery_fee: String(z.delivery_fee), min_order: String(z.min_order), estimated_time: z.estimated_time, is_active: z.is_active }); setShowForm(true); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(z.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {zones.length === 0 && <p className="text-gray-400 text-center py-8">Nenhuma zona de entrega. Cadastre os bairros que você entrega.</p>}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/50 animate-fade-in" />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-5 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-black">{editing ? 'Editar zona' : 'Nova zona'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Bairro/Região*</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field mt-1" placeholder="Ex: Centro" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Taxa de entrega (R$)</label>
                <input type="number" step="0.01" value={form.delivery_fee} onChange={(e) => setForm({ ...form, delivery_fee: e.target.value })} className="input-field mt-1" placeholder="0.00" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Pedido mínimo (R$)</label>
                <input type="number" step="0.01" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value })} className="input-field mt-1" placeholder="0.00" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Tempo estimado</label>
                <input value={form.estimated_time} onChange={(e) => setForm({ ...form, estimated_time: e.target.value })} className="input-field mt-1" placeholder="30-45 min" />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-brand-red" />
                <span className="text-sm">Ativa</span>
              </label>
              <button onClick={handleSave} disabled={!form.name.trim()} className="btn-primary w-full">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
