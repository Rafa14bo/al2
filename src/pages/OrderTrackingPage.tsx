import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, Clock, Package, ChefHat, Bike, Home, X, Search, Phone, MessageCircle, Lock } from 'lucide-react';
import { getOrderByNumber, getGuestOrderByNumber } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/utils/format';
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Order, OrderStatus } from '@/types';

const STATUS_FLOW: OrderStatus[] = ['NOVO', 'CONFIRMADO', 'EM_PREPARACAO', 'PRONTO', 'SAINDO_PARA_ENTREGA', 'ENTREGUE'];

const STATUS_INFO: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  NOVO: { label: 'Pedido recebido', color: 'bg-yellow-500', icon: Clock },
  CONFIRMADO: { label: 'Confirmado', color: 'bg-blue-500', icon: Check },
  EM_PREPARACAO: { label: 'Em preparação', color: 'bg-orange-500', icon: ChefHat },
  PRONTO: { label: 'Pronto', color: 'bg-green-500', icon: Package },
  SAINDO_PARA_ENTREGA: { label: 'Saiu para entrega', color: 'bg-purple-500', icon: Bike },
  ENTREGUE: { label: 'Entregue', color: 'bg-green-600', icon: Home },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-500', icon: X },
};

export function OrderTrackingPage() {
  const { number } = useParams<{ number: string }>();
  const { settings } = useStore();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchNumber, setSearchNumber] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [phoneConfirmed, setPhoneConfirmed] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const loadOrder = useCallback(async () => {
    if (!number) return;
    try {
      if (user) {
        const data = await getOrderByNumber(parseInt(number));
        if (data) {
          setOrder(data);
          setError('');
        } else {
          setError('Não encontramos esse pedido.');
        }
        setLoading(false);
        return;
      }
      if (!phoneConfirmed || !guestPhone) {
        setLoading(false);
        return;
      }
      const data = await getGuestOrderByNumber(parseInt(number), guestPhone);
      if (data) {
        setOrder(data);
        setError('');
      } else {
        setPhoneConfirmed(false);
        setPhoneError('Pedido não encontrado. Confira o número e o telefone usados no pedido.');
      }
    } catch {
      setError('Algo deu errado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [number, user, phoneConfirmed, guestPhone]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // Realtime subscription
  useEffect(() => {
    if (!order) return;

    const channel = supabase
      .channel(`order-${order.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${order.id}` }, (payload) => {
        setOrder((prev) => prev ? { ...prev, ...payload.new } : prev);
      })
      .subscribe();

    // Fallback polling every 15 seconds
    const interval = setInterval(loadOrder, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [order?.id, loadOrder]);

  if (!number) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <Search className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="font-display text-xl font-bold text-black mb-2">Acompanhar pedido</h2>
        <p className="text-gray-500 text-sm mb-4">Digite o número do seu pedido:</p>
        <div className="flex gap-2 w-full max-w-xs">
          <input
            type="number"
            value={searchNumber}
            onChange={(e) => setSearchNumber(e.target.value)}
            placeholder="Ex: 1001"
            className="input-field"
          />
          <Link to={`/pedido/${searchNumber}`} className="btn-primary shrink-0">Buscar</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-pulse text-gray-400">Carregando pedido...</div></div>;
  }

  if (!user && !phoneConfirmed) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <Lock className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="font-display text-xl font-bold text-black mb-2">Confirme seu telefone</h2>
        <p className="text-gray-500 text-sm mb-4 text-center max-w-xs">
          Por segurança, digite o telefone usado no Pedido #{number} para acompanhá-lo.
        </p>
        <form
          className="flex flex-col gap-2 w-full max-w-xs"
          onSubmit={(e) => {
            e.preventDefault();
            setPhoneError('');
            setLoading(true);
            setPhoneConfirmed(true);
          }}
        >
          <input
            type="tel"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            placeholder="(17) 99999-9999"
            className="input-field"
            required
          />
          {phoneError && <p className="text-sm text-red-600">{phoneError}</p>}
          <button type="submit" className="btn-primary">Ver pedido</button>
        </form>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <p className="text-gray-500 mb-4">{error || 'Não encontramos esse pedido.'}</p>
        <Link to="/cardapio" className="btn-primary">Ver Cardápio</Link>
      </div>
    );
  }

  const currentStep = STATUS_FLOW.indexOf(order.status);
  const isCancelled = order.status === 'CANCELADO';

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-display text-xl font-bold text-black">Pedido #{order.order_number}</h1>
            <span className={`badge ${isCancelled ? 'bg-red-100 text-red-700' : STATUS_INFO[order.status].color + ' text-white'}`}>
              {STATUS_INFO[order.status].label}
            </span>
          </div>
          <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
        </div>

        {/* Timeline */}
        {!isCancelled && (
          <div className="card p-5">
            <h2 className="font-semibold text-black mb-4">Status do pedido</h2>
            <div className="space-y-1">
              {STATUS_FLOW.map((status, i) => {
                const info = STATUS_INFO[status];
                const isDone = i <= currentStep;
                const isCurrent = i === currentStep;
                const Icon = info.icon;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDone ? info.color + ' text-white' : 'bg-gray-100 text-gray-400'} ${isCurrent ? 'ring-4 ring-offset-2 ring-brand-red/20 animate-pulse' : ''}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {i < STATUS_FLOW.length - 1 && (
                        <div className={`w-0.5 h-6 ${i < currentStep ? 'bg-brand-red' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${isDone ? 'text-black' : 'text-gray-400'}`}>{info.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="card p-5 text-center">
            <X className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <p className="font-semibold text-black">Pedido cancelado</p>
            <p className="text-sm text-gray-500 mt-1">Entre em contato com a loja para mais informações.</p>
          </div>
        )}

        {/* Order items */}
        <div className="card p-5">
          <h2 className="font-semibold text-black mb-3">Itens do pedido</h2>
          <div className="space-y-3">
            {(order.order_items || []).map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div className="flex-1">
                  <p className="font-medium text-black">{item.quantity}x {item.product_name}</p>
                  {item.order_item_addons && item.order_item_addons.length > 0 && (
                    <p className="text-xs text-gray-500 ml-4">
                      + {item.order_item_addons.map((a) => a.addon_name).join(', ')}
                    </p>
                  )}
                  {item.notes && <p className="text-xs text-gray-400 ml-4 italic">Obs: {item.notes}</p>}
                </div>
                <span className="font-medium text-gray-700">{formatCurrency(item.product_price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-3 pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Desconto</span><span>- {formatCurrency(order.discount)}</span></div>}
            {order.delivery_type === 'delivery' && <div className="flex justify-between"><span className="text-gray-600">Taxa de entrega</span><span>{formatCurrency(order.delivery_fee)}</span></div>}
            <div className="flex justify-between font-bold text-base pt-1"><span className="text-black">Total</span><span className="text-brand-red">{formatCurrency(order.total)}</span></div>
          </div>
        </div>

        {/* Delivery info */}
        {order.delivery_type === 'delivery' && (
          <div className="card p-5">
            <h2 className="font-semibold text-black mb-2">Endereço de entrega</h2>
            <p className="text-sm text-gray-600">
              {order.address_street}, {order.address_number}<br />
              {order.address_neighborhood} - {order.address_city}/{order.address_state}<br />
              CEP: {order.address_zip}
              {order.address_reference && <><br />Ref: {order.address_reference}</>}
            </p>
          </div>
        )}

        {/* Payment info */}
        <div className="card p-5">
          <h2 className="font-semibold text-black mb-2">Pagamento</h2>
          <p className="text-sm text-gray-600">
            {order.payment_method === 'pix' ? 'PIX' : order.payment_method === 'card' ? `Cartão (${order.payment_card_type || '—'})` : 'Dinheiro'}
            {order.cash_change_for && ` — Troco para R$ ${order.cash_change_for}`}
          </p>
        </div>

        {/* Contact */}
        <div className="flex gap-2">
          <a href={`tel:${settings?.phone?.replace(/\D/g, '')}`} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-brand-red">
            <Phone className="w-4 h-4" /> Ligar
          </a>
          <a href={`https://wa.me/${settings?.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
