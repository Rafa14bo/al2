import { useEffect, useState, useCallback } from 'react';
import { X, Phone, MapPin, CreditCard, Banknote, QrCode, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from './AdminLayout';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate } from '@/utils/format';
import type { Order, OrderStatus } from '@/types';

const COLUMNS: { status: OrderStatus; label: string; color: string }[] = [
  { status: 'NOVO', label: 'Novos', color: 'bg-yellow-100 text-yellow-700' },
  { status: 'CONFIRMADO', label: 'Confirmados', color: 'bg-blue-100 text-blue-700' },
  { status: 'EM_PREPARACAO', label: 'Em preparação', color: 'bg-orange-100 text-orange-700' },
  { status: 'PRONTO', label: 'Prontos', color: 'bg-green-100 text-green-700' },
  { status: 'SAINDO_PARA_ENTREGA', label: 'Saindo', color: 'bg-purple-100 text-purple-700' },
  { status: 'ENTREGUE', label: 'Concluídos', color: 'bg-gray-100 text-gray-700' },
];

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  NOVO: 'CONFIRMADO',
  CONFIRMADO: 'EM_PREPARACAO',
  EM_PREPARACAO: 'PRONTO',
  PRONTO: 'SAINDO_PARA_ENTREGA',
  SAINDO_PARA_ENTREGA: 'ENTREGUE',
  ENTREGUE: null,
  CANCELADO: null,
};

export function AdminOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  const loadOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, order_item_addons(*))')
      .order('created_at', { ascending: false });
    if (error) {
      console.error(error);
      return;
    }
    const newOrders = (data || []) as Order[];
    const prevNewCount = orders.filter((o) => o.status === 'NOVO').length;
    const newCount = newOrders.filter((o) => o.status === 'NOVO').length;
    if (newCount > prevNewCount && orders.length > 0) {
      setNewOrderAlert(true);
      setTimeout(() => setNewOrderAlert(false), 5000);
    }
    setOrders(newOrders);
    setLoading(false);
  }, [orders]);

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadOrders();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => {
        loadOrders();
      })
      .subscribe();

    const interval = setInterval(loadOrders, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [loadOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    if (error) {
      showToast('Erro ao atualizar status', 'error');
    } else {
      showToast('Status atualizado!', 'success');
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : prev);
      }
    }
  };

  const getOrdersByStatus = (status: OrderStatus) => orders.filter((o) => o.status === status);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-black">Pedidos</h1>
        {newOrderAlert && (
          <div className="flex items-center gap-2 bg-brand-red text-white px-4 py-2 rounded-xl text-sm font-semibold animate-bounce-subtle">
            <Bell className="w-4 h-4" /> NOVO PEDIDO!
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-gray-400 animate-pulse">Carregando pedidos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto">
          {COLUMNS.map((col) => {
            const colOrders = getOrdersByStatus(col.status);
            return (
              <div key={col.status} className="bg-gray-100 rounded-2xl p-2 min-w-[200px]">
                <div className="flex items-center justify-between px-2 py-2 mb-2">
                  <span className={`badge ${col.color}`}>{col.label}</span>
                  <span className="text-xs font-bold text-gray-400">{colOrders.length}</span>
                </div>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {colOrders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="w-full text-left bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-black">#{order.order_number}</span>
                        {order.status === 'NOVO' && <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />}
                      </div>
                      <p className="text-xs text-gray-600 truncate">{order.customer_name}</p>
                      <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-gray-500">{order.order_items?.length || 0} itens</span>
                        <span className="font-bold text-sm text-brand-red">{formatCurrency(order.total)}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] text-gray-400">
                          {order.delivery_type === 'delivery' ? 'Delivery' : 'Retirada'}
                        </span>
                        <span className="text-[10px] text-gray-400">•</span>
                        <span className="text-[10px] text-gray-400">
                          {order.payment_method === 'pix' ? 'PIX' : order.payment_method === 'card' ? 'Cartão' : 'Dinheiro'}
                        </span>
                      </div>
                    </button>
                  ))}
                  {colOrders.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">Vazio</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setSelectedOrder(null)}>
          <div className="absolute inset-0 bg-black/50 animate-fade-in" />
          <div
            className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-display text-lg font-bold text-black">Pedido #{selectedOrder.order_number}</h2>
                <p className="text-xs text-gray-500">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Customer info */}
              <div>
                <h3 className="font-semibold text-sm text-black mb-2">Cliente</h3>
                <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                  <p className="text-sm text-gray-800 font-medium">{selectedOrder.customer_name}</p>
                  <a href={`tel:${selectedOrder.customer_phone}`} className="flex items-center gap-2 text-sm text-brand-red">
                    <Phone className="w-4 h-4" /> {selectedOrder.customer_phone}
                  </a>
                  {selectedOrder.customer_email && (
                    <p className="text-xs text-gray-500">{selectedOrder.customer_email}</p>
                  )}
                </div>
              </div>

              {/* Delivery info */}
              <div>
                <h3 className="font-semibold text-sm text-black mb-2">
                  {selectedOrder.delivery_type === 'delivery' ? 'Entrega' : 'Retirada'}
                </h3>
                {selectedOrder.delivery_type === 'delivery' ? (
                  <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-brand-red inline mr-1" />
                    {selectedOrder.address_street}, {selectedOrder.address_number}
                    {selectedOrder.address_complement && ` - ${selectedOrder.address_complement}`}<br />
                    {selectedOrder.address_neighborhood} - {selectedOrder.address_city}/{selectedOrder.address_state}<br />
                    CEP: {selectedOrder.address_zip}
                    {selectedOrder.address_reference && <><br /><span className="text-gray-400">Ref: {selectedOrder.address_reference}</span></>}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                    Retirada no local
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-sm text-black mb-2">Itens</h3>
                <div className="space-y-2">
                  {(selectedOrder.order_items || []).map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-black">{item.quantity}x {item.product_name}</span>
                        <span className="font-semibold text-gray-700">{formatCurrency(item.product_price * item.quantity)}</span>
                      </div>
                      {item.order_item_addons && item.order_item_addons.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          + {item.order_item_addons.map((a) => `${a.addon_name} (${formatCurrency(a.addon_price)})`).join(', ')}
                        </p>
                      )}
                      {item.notes && <p className="text-xs text-gray-400 mt-1 italic">Obs: {item.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div>
                <h3 className="font-semibold text-sm text-black mb-2">Pagamento</h3>
                <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 flex items-center gap-2">
                  {selectedOrder.payment_method === 'pix' && <QrCode className="w-4 h-4 text-brand-red" />}
                  {selectedOrder.payment_method === 'card' && <CreditCard className="w-4 h-4 text-brand-red" />}
                  {selectedOrder.payment_method === 'cash' && <Banknote className="w-4 h-4 text-brand-red" />}
                  {selectedOrder.payment_method === 'pix' ? 'PIX' : selectedOrder.payment_method === 'card' ? `Cartão (${selectedOrder.payment_card_type})` : 'Dinheiro'}
                  {selectedOrder.cash_change_for && ` — Troco para R$ ${selectedOrder.cash_change_for}`}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{formatCurrency(selectedOrder.subtotal)}</span></div>
                {selectedOrder.discount > 0 && <div className="flex justify-between text-green-600"><span>Desconto</span><span>- {formatCurrency(selectedOrder.discount)}</span></div>}
                {selectedOrder.delivery_type === 'delivery' && <div className="flex justify-between"><span className="text-gray-600">Taxa de entrega</span><span>{formatCurrency(selectedOrder.delivery_fee)}</span></div>}
                <div className="flex justify-between font-bold text-base pt-1"><span className="text-black">Total</span><span className="text-brand-red">{formatCurrency(selectedOrder.total)}</span></div>
              </div>

              {/* Status controls */}
              <div className="border-t border-gray-100 pt-3">
                <h3 className="font-semibold text-sm text-black mb-2">Status do pedido</h3>
                <div className="flex flex-wrap gap-2">
                  {COLUMNS.map((col) => (
                    <button
                      key={col.status}
                      onClick={() => handleStatusChange(selectedOrder.id, col.status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${selectedOrder.status === col.status ? col.color + ' ring-2 ring-offset-1 ring-brand-red/30' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {col.label}
                    </button>
                  ))}
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'CANCELADO')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${selectedOrder.status === 'CANCELADO' ? 'bg-red-100 text-red-700 ring-2 ring-offset-1 ring-red-300' : 'bg-gray-100 text-red-500 hover:bg-red-50'}`}
                  >
                    Cancelar
                  </button>
                </div>
                {NEXT_STATUS[selectedOrder.status] && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, NEXT_STATUS[selectedOrder.status]!)}
                    className="btn-primary w-full mt-3"
                  >
                    Avançar para: {COLUMNS.find((c) => c.status === NEXT_STATUS[selectedOrder.status])?.label}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
