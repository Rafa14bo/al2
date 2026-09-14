import { useEffect, useState } from 'react';
import { TrendingUp, ShoppingCart, Users, Package, DollarSign, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from './AdminLayout';
import { formatCurrency, formatDate } from '@/utils/format';
import type { Order } from '@/types';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    todaySales: 0,
    todayOrders: 0,
    avgTicket: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<{ day: string; total: number }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const today = new Date().toISOString().slice(0, 10);

        const { data: todayOrders } = await supabase
          .from('orders')
          .select('*')
          .gte('created_at', `${today}T00:00:00`)
          .neq('status', 'CANCELADO');

        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        const { count: customersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'customer');

        const { data: recent } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false })
          .limit(5);

        const todayTotal = (todayOrders || []).reduce((sum, o) => sum + (o as Order).total, 0);
        const ordersCount = (todayOrders || []).length;

        setStats({
          todaySales: todayTotal,
          todayOrders: ordersCount,
          avgTicket: ordersCount > 0 ? todayTotal / ordersCount : 0,
          totalProducts: productsCount || 0,
          totalCustomers: customersCount || 0,
        });

        setRecentOrders((recent || []) as Order[]);

        // Last 7 days sales
        const last7 = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dayStr = d.toISOString().slice(0, 10);
          const { data } = await supabase
            .from('orders')
            .select('total')
            .gte('created_at', `${dayStr}T00:00:00`)
            .lt('created_at', `${dayStr}T23:59:59`)
            .neq('status', 'CANCELADO');
          const dayTotal = (data || []).reduce((sum, o) => sum + (o as { total: number }).total, 0);
          last7.push({
            day: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d.getDay()],
            total: dayTotal,
          });
        }
        setSalesData(last7);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const maxSale = Math.max(...salesData.map((d) => d.total), 1);

  const statCards = [
    { label: 'Vendas hoje', value: formatCurrency(stats.todaySales), icon: DollarSign, color: 'bg-green-500' },
    { label: 'Pedidos hoje', value: String(stats.todayOrders), icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Ticket médio', value: formatCurrency(stats.avgTicket), icon: TrendingUp, color: 'bg-brand-red' },
    { label: 'Produtos', value: String(stats.totalProducts), icon: Package, color: 'bg-orange-500' },
    { label: 'Clientes', value: String(stats.totalCustomers), icon: Users, color: 'bg-purple-500' },
  ];

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-black mb-6">Dashboard</h1>

      {loading ? (
        <div className="text-gray-400 animate-pulse">Carregando...</div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {statCards.map((card) => (
              <div key={card.label} className="card p-4">
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-2`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className="font-display text-lg font-bold text-black">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Sales chart */}
          <div className="card p-5 mb-6">
            <h2 className="font-semibold text-black mb-4">Vendas — últimos 7 dias</h2>
            <div className="flex items-end justify-between gap-2 h-40">
              {salesData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs font-semibold text-gray-600">{d.total > 0 ? formatCurrency(d.total).replace('R$', '') : ''}</div>
                  <div
                    className="w-full bg-brand-red rounded-t-lg transition-all hover:bg-brand-red-dark"
                    style={{ height: `${(d.total / maxSale) * 100}%`, minHeight: d.total > 0 ? '4px' : '0' }}
                  />
                  <span className="text-xs text-gray-400">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent orders */}
          <div className="card p-5">
            <h2 className="font-semibold text-black mb-4">Pedidos recentes</h2>
            {recentOrders.length === 0 ? (
              <p className="text-gray-400 text-sm">Nenhum pedido ainda.</p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div>
                      <p className="text-sm font-semibold text-black">#{order.order_number} — {order.customer_name}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.created_at)} • {order.order_items?.length || 0} itens</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-brand-red text-sm">{formatCurrency(order.total)}</span>
                      <span className={`badge ${
                        order.status === 'ENTREGUE' ? 'bg-green-100 text-green-700' :
                        order.status === 'CANCELADO' ? 'bg-red-100 text-red-700' :
                        order.status === 'NOVO' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
