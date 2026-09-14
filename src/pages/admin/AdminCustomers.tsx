import { useEffect, useState, useCallback } from 'react';
import { Users, Phone, Mail, Package, DollarSign, ChevronRight, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from './AdminLayout';
import { formatCurrency, formatDate } from '@/utils/format';
import type { Profile, Order } from '@/types';

export function AdminCustomers() {
  const [customers, setCustomers] = useState<(Profile & { order_count: number; total_spent: number; last_order: string | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<(Profile & { order_count: number; total_spent: number; last_order: string | null }) | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);

  const load = useCallback(async () => {
    const [profRes, ordRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false }),
      supabase.from('orders').select('*'),
    ]);

    const profiles = (profRes.data || []) as Profile[];
    const orders = (ordRes.data || []) as Order[];

    const enriched = profiles.map((p) => {
      const userOrders = orders.filter((o) => o.user_id === p.id && o.status !== 'CANCELADO');
      return {
        ...p,
        order_count: userOrders.length,
        total_spent: userOrders.reduce((sum, o) => sum + o.total, 0),
        last_order: userOrders.length > 0 ? userOrders[0].created_at : null,
      };
    });

    setCustomers(enriched);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const viewOrders = async (customer: (Profile & { order_count: number; total_spent: number; last_order: string | null })) => {
    setSelectedCustomer(customer);
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', customer.id)
      .order('created_at', { ascending: false });
    setCustomerOrders((data || []) as Order[]);
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-black mb-6">Clientes</h1>

      {loading ? (
        <div className="text-gray-400 animate-pulse">Carregando...</div>
      ) : customers.length === 0 ? (
        <div className="card p-8 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum cliente cadastrado ainda.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map((c) => (
            <div key={c.id} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-brand-red" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-black truncate">{c.name || 'Sem nome'}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone || '—'}</span>
                  {c.email && <span className="hidden sm:flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>}
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-right">
                <div>
                  <p className="text-xs text-gray-400">Pedidos</p>
                  <p className="text-sm font-bold text-black">{c.order_count}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total gasto</p>
                  <p className="text-sm font-bold text-brand-red">{formatCurrency(c.total_spent)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Último pedido</p>
                  <p className="text-xs text-gray-600">{c.last_order ? formatDate(c.last_order) : '—'}</p>
                </div>
              </div>
              <button onClick={() => viewOrders(c)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setSelectedCustomer(null)}>
          <div className="absolute inset-0 bg-black/50 animate-fade-in" />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-display text-lg font-bold text-black">{selectedCustomer.name || 'Cliente'}</h2>
                <p className="text-xs text-gray-500">{selectedCustomer.phone} • {selectedCustomer.email}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-2">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Package className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Pedidos</p>
                  <p className="font-bold text-black">{selectedCustomer.order_count}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <DollarSign className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Total gasto</p>
                  <p className="font-bold text-brand-red">{formatCurrency(selectedCustomer.total_spent)}</p>
                </div>
              </div>
              <h3 className="font-semibold text-sm text-black">Histórico de pedidos</h3>
              {customerOrders.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Nenhum pedido.</p>
              ) : (
                customerOrders.map((o) => (
                  <div key={o.id} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-black">#{o.order_number}</span>
                      <span className="font-bold text-brand-red">{formatCurrency(o.total)}</span>
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(o.created_at)} • {o.order_items?.length || 0} itens</p>
                    <span className={`badge mt-1 ${o.status === 'ENTREGUE' ? 'bg-green-100 text-green-700' : o.status === 'CANCELADO' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{o.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
