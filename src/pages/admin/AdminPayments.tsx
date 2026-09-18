import { useEffect, useState, useCallback } from 'react';
import { QrCode, CreditCard, Banknote, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from './AdminLayout';
import { useToast } from '@/components/ui/Toast';
import type { PaymentSettings } from '@/types';

export function AdminPayments() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PaymentSettings | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('payment_settings').select('*').maybeSingle();
    if (error) { showToast('Erro', 'error'); return; }
    setSettings(data as PaymentSettings);
    setForm(data as PaymentSettings);
    setLoading(false);
  }, [useToast]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    const { error } = await supabase.from('payment_settings').update({
      pix_enabled: form.pix_enabled, pix_key: form.pix_key, pix_key_type: form.pix_key_type,
      pix_receiver_name: form.pix_receiver_name, pix_instructions: form.pix_instructions, pix_qr_code_url: form.pix_qr_code_url,
      card_enabled: form.card_enabled, card_credit: form.card_credit, card_debit: form.card_debit, card_instructions: form.card_instructions,
      cash_enabled: form.cash_enabled, cash_change_available: form.cash_change_available,
      updated_at: new Date().toISOString(),
    }).eq('id', form.id);
    if (error) { showToast('Erro ao salvar', 'error'); } else { showToast('Configurações salvas!', 'success'); }
    setSaving(false);
  };

  if (loading || !form) return <AdminLayout><div className="text-gray-400 animate-pulse">Carregando...</div></AdminLayout>;

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-black mb-6">Pagamentos</h1>

      <div className="space-y-4">
        {/* PIX */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-brand-red" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-black">PIX</h2>
              <p className="text-xs text-gray-500">Receba pagamentos via PIX</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.pix_enabled} onChange={(e) => setForm({ ...form, pix_enabled: e.target.checked })} className="w-5 h-5 accent-brand-red" />
              <span className="text-sm font-medium">{form.pix_enabled ? 'Ativado' : 'Desativado'}</span>
            </label>
          </div>

          {form.pix_enabled && (
            <div className="space-y-3 animate-fade-in">
              <div>
                <label className="text-sm font-medium text-gray-700">Nome do recebedor</label>
                <input value={form.pix_receiver_name} onChange={(e) => setForm({ ...form, pix_receiver_name: e.target.value })} className="input-field mt-1" placeholder="Alisson Lanches" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Chave PIX</label>
                  <input value={form.pix_key} onChange={(e) => setForm({ ...form, pix_key: e.target.value })} className="input-field mt-1" placeholder="Sua chave PIX" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tipo da chave</label>
                  <select value={form.pix_key_type} onChange={(e) => setForm({ ...form, pix_key_type: e.target.value as PaymentSettings['pix_key_type'] })} className="input-field mt-1">
                    <option value="cpf">CPF</option>
                    <option value="email">E-mail</option>
                    <option value="phone">Telefone</option>
                    <option value="random">Aleatória</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Instruções de pagamento</label>
                <textarea value={form.pix_instructions} onChange={(e) => setForm({ ...form, pix_instructions: e.target.value })} className="input-field mt-1 resize-none" rows={2} placeholder="Faça o PIX e envie o comprovante no WhatsApp." />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">QR Code PIX (URL da imagem)</label>
                <input value={form.pix_qr_code_url} onChange={(e) => setForm({ ...form, pix_qr_code_url: e.target.value })} className="input-field mt-1" placeholder="https://..." />
                {form.pix_qr_code_url && <img src={form.pix_qr_code_url} alt="QR Code" className="mt-2 w-32 h-32 rounded-xl object-contain" />}
              </div>
            </div>
          )}
        </div>

        {/* Cartão */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-brand-red" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-black">Cartão</h2>
              <p className="text-xs text-gray-500">Pagamento presencial na loja</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.card_enabled} onChange={(e) => setForm({ ...form, card_enabled: e.target.checked })} className="w-5 h-5 accent-brand-red" />
              <span className="text-sm font-medium">{form.card_enabled ? 'Ativado' : 'Desativado'}</span>
            </label>
          </div>

          {form.card_enabled && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.card_credit} onChange={(e) => setForm({ ...form, card_credit: e.target.checked })} className="accent-brand-red" />
                  <span className="text-sm">Crédito</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.card_debit} onChange={(e) => setForm({ ...form, card_debit: e.target.checked })} className="accent-brand-red" />
                  <span className="text-sm">Débito</span>
                </label>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Instruções</label>
                <textarea value={form.card_instructions} onChange={(e) => setForm({ ...form, card_instructions: e.target.value })} className="input-field mt-1 resize-none" rows={2} placeholder="Pagamento na maquininha na retirada/entrega." />
              </div>
              <p className="text-xs text-gray-400">Nenhum dado de cartão é armazenado no sistema.</p>
            </div>
          )}
        </div>

        {/* Dinheiro */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-brand-red" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-black">Dinheiro</h2>
              <p className="text-xs text-gray-500">Pagamento em dinheiro</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.cash_enabled} onChange={(e) => setForm({ ...form, cash_enabled: e.target.checked })} className="w-5 h-5 accent-brand-red" />
              <span className="text-sm font-medium">{form.cash_enabled ? 'Ativado' : 'Desativado'}</span>
            </label>
          </div>

          {form.cash_enabled && (
            <div className="animate-fade-in">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.cash_change_available} onChange={(e) => setForm({ ...form, cash_change_available: e.target.checked })} className="accent-brand-red" />
                <span className="text-sm">Aceita troco</span>
              </label>
            </div>
          )}
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 w-full sm:w-auto">
          <Save className="w-5 h-5" /> {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>
    </AdminLayout>
  );
}
