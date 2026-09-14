import { Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, UtensilsCrossed, Layers, Tag, Percent, Users, Truck, CreditCard, Clock, Settings, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { to: '/admin/produtos', label: 'Cardápio', icon: UtensilsCrossed },
  { to: '/admin/categorias', label: 'Categorias', icon: Layers },
  { to: '/admin/adicionais', label: 'Adicionais', icon: Tag },
  { to: '/admin/cupons', label: 'Cupons', icon: Percent },
  { to: '/admin/clientes', label: 'Clientes', icon: Users },
  { to: '/admin/entrega', label: 'Entrega', icon: Truck },
  { to: '/admin/pagamentos', label: 'Pagamentos', icon: CreditCard },
  { to: '/admin/horarios', label: 'Horários', icon: Clock },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Carregando...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/entrar" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-64 bg-black text-white md:min-h-screen md:fixed md:left-0 md:top-0 md:bottom-0 z-40 shrink-0">
        <div className="p-4 flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <img src="/alisson1.png" alt="Alisson Lanches" className="h-8 w-auto rounded bg-white/10" />
            <span className="text-xs text-brand-yellow">Painel Admin</span>
          </div>
          <Link to="/" className="text-gray-400 hover:text-white md:hidden">
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </div>
        <nav className="px-2 pb-4 overflow-x-auto md:overflow-x-hidden">
          <div className="flex md:flex-col gap-1 min-w-max md:min-w-0">
            {ADMIN_NAV.map((item) => {
              const active = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors shrink-0 ${active ? 'bg-brand-red text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
            <Link to="/" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 md:mt-4 md:border-t md:border-white/10 md:pt-4">
              <ChevronLeft className="w-4 h-4" />
              <span className="whitespace-nowrap">Voltar ao site</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-6 pb-20 md:pb-6">
        {children}
      </main>
    </div>
  );
}
