import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getOrdersByUser } from '@/services/api';
import { formatCurrency, formatDate } from '@/utils/format';
import type { Order } from '@/types';

export function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchNumber, setSearchNumber] = useState('');

  useEffect(() => {
    if (user) {
      getOrdersByUser(user.id)
        .then(setOrders)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="font-display text-2xl font-bold text-black mb-6">Meus Pedidos</h1>

        {/* Guest search */}
        {!user && (
          <div className="card p-5 mb-4">
            <p className="text-sm text-gray-600 mb-3">Acompanhe seu pedido pelo número:</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={searchNumber}
                  onChange={(e) => setSearchNumber(e.target.value)}
                  placeholder="Número do pedido"
                  className="input-field pl-10"
                />
              </div>
              <Link to={searchNumber ? `/pedido/${searchNumber}` : '#'} className={`btn-primary shrink-0 ${!searchNumber && 'pointer-events-none opacity-50'}`}>
                Buscar
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Não tem conta? <Link to="/entrar" className="text-brand-red font-semibold">Crie uma</Link> para ver todos seus pedidos.
            </p>
          </div>
        )}

        {/* Logged in orders */}
        {user && (
          <>
            {loading ? (
              <div className="card p-8 text-center text-gray-400 animate-pulse">Carregando...</div>
            ) : orders.length === 0 ? (
              <div className="card p-8 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">Você ainda não fez pedidos.</p>
                <Link to="/cardapio" className="btn-primary">Ver Cardápio</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Link key={order.id} to={`/pedido/${order.order_number}`} className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                      <p className="font-semibold text-black text-sm">Pedido #{order.order_number}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{order.order_items?.length || 0} {(order.order_items?.length || 0) === 1 ? 'item' : 'itens'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-brand-red">{formatCurrency(order.total)}</p>
                        <span className={`badge mt-1 ${
                          order.status === 'ENTREGUE' ? 'bg-green-100 text-green-700' :
                          order.status === 'CANCELADO' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{order.status}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
