import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from './AdminLayout';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/utils/format';
import type { Coupon } from '@/types';

export function AdminCoupons() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState({
    code: '', discount_type: 'percent' as 'percent' | 'fixed', discount_value: '',
    min_order: '', start_date: '', end_date: '', usage_limit: '', is_active: true,
  });

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (error) { showToast('Erro ao carregar', 'error'); return; }
    setCoupons(data as Coupon[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.code.trim() || !form.discount_value) return;
    const payload = {
      code: form.code.toUpperCase(),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value) || 0,
      min_order: parseFloat(form.min_order) || 0,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      is_active: form.is_active,
    };
    if (editing) {
      const { error } = await supabase.from('coupons').update(payload).eq('id', editing.id);
      if (error) { showToast('Erro', 'error'); return; }
      showToast('Cupom atualizado!', 'success');
    } else {
      const { error } = await supabase.from('coupons').insert(payload);
      if (error) { showToast('Erro: código já existe?', 'error'); return; }
      showToast('Cupom criado!', 'success');
    }
    setShowForm(false);
    setEditing(null);
    setForm({ code: '', discount_type: 'percent', discount_value: '', min_order: '', start_date: '', end_date: '', usage_limit: '', is_active: true });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este cupom?')) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) { showToast('Erro', 'error'); return; }
    showToast('Cupom excluído', 'info');
    load();
  };

  const discountLabel = (c: Coupon) => {
    const desc = c.discount_type === 'percent'
      ? c.discount_value + '% de desconto'
      : formatCurrency(c.discount_value) + ' de desconto';
    const parts = [desc];
    if (c.min_order > 0) parts.push('Mín: ' + formatCurrency(c.min_order));
    if (c.usage_limit) parts.push('Usos: ' + c.usage_count + '/' + c.usage_limit);
    return parts.join(' • ');
  };

  const badgeClass = (c: Coupon) => c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500';

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-black">Cupons</h1>
        <button onClick={() => { setEditing(null); setForm({ code: '', discount_type: 'percent', discount_value: '', min_order: '', start_date: '', end_date: '', usage_limit: '', is_active: true }); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Novo cupom
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 animate-pulse">Carregando...</div>
      ) : (
        <div className="space-y-2">
          {coupons.map((c) => (
            <div key={c.id} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center">
                <Tag className="w-5 h-5 text-brand-red" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-black">{c.code}</p>
                <p className="text-xs text-gray-500">{discountLabel(c)}</p>
              </div>
              <span className={'badge ' + badgeClass(c)}>
                {c.is_active ? 'Ativo' : 'Inativo'}
              </span>
              <button onClick={() => { setEditing(c); setForm({ code: c.code, discount_type: c.discount_type, discount_value: String(c.discount_value), min_order: String(c.min_order), start_date: c.start_date || '', end_date: c.end_date || '', usage_limit: c.usage_limit ? String(c.usage_limit) : '', is_active: c.is_active }); setShowForm(true); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {coupons.length === 0 && <p className="text-gray-400 text-center py-8">Nenhum cupom cadastrado.</p>}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/50 animate-fade-in" />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-black">{editing ? 'Editar cupom' : 'Novo cupom'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Código*</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-field mt-1 uppercase" placeholder="EX: DESCONTO10" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Tipo de desconto</label>
                <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percent' | 'fixed' })} className="input-field mt-1">
                  <option value="percent">Percentual (%)</option>
                  <option value="fixed">Valor fixo (R$)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Valor do desconto*</label>
                <input type="number" step="0.01" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} className="input-field mt-1" placeholder="10" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Pedido mínimo (R$)</label>
                <input type="number" step="0.01" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value })} className="input-field mt-1" placeholder="0" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Data inicial</label>
                  <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="input-field mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Data final</label>
                  <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="input-field mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Limite de uso</label>
                <input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} className="input-field mt-1" placeholder="Ilimitado" />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-brand-red" />
                <span className="text-sm">Ativo</span>
              </label>
              <button onClick={handleSave} disabled={!form.code || !form.discount_value} className="btn-primary w-full">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
