import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Home, UtensilsCrossed, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useStore } from '@/contexts/StoreContext';

export function Header() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { settings, isOpen } = useStore();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/alisson1.png" alt="Alisson Lanches" className="h-11 w-auto rounded-lg" />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-gray-700 hover:text-brand-red transition-colors">Início</Link>
          <Link to="/cardapio" className="text-sm font-medium text-gray-700 hover:text-brand-red transition-colors">Cardápio</Link>
          <Link to="/#sobre" className="text-sm font-medium text-gray-700 hover:text-brand-red transition-colors">Sobre</Link>
          <Link to="/#avaliacoes" className="text-sm font-medium text-gray-700 hover:text-brand-red transition-colors">Avaliações</Link>
          <Link to="/#localizacao" className="text-sm font-medium text-gray-700 hover:text-brand-red transition-colors">Localização</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-xs font-medium text-gray-600">{isOpen ? 'Aberto' : 'Fechado'}</span>
          </div>

          <Link
            to="/sacola"
            className="relative flex items-center gap-1.5 bg-brand-red text-white px-3 py-2 rounded-xl hover:bg-brand-red-dark transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-semibold">Sacola</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-yellow text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/perfil"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-gray-700" />
                )}
                <span className="hidden sm:inline text-sm font-medium text-gray-700 max-w-[80px] truncate">
                  {profile?.name || 'Perfil'}
                </span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={() => { signOut(); navigate('/'); }}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          ) : (
            <Link
              to="/entrar"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 hover:border-brand-red hover:text-brand-red transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">Entrar</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { itemCount } = useCart();
  const { user } = useAuth();

  const items = [
    { to: '/', icon: Home, label: 'Início' },
    { to: '/cardapio', icon: UtensilsCrossed, label: 'Cardápio' },
    { to: '/sacola', icon: ShoppingCart, label: 'Sacola', badge: itemCount },
    { to: '/pedidos', icon: Package, label: 'Pedidos' },
    { to: user ? '/perfil' : '/entrar', icon: User, label: user ? 'Perfil' : 'Entrar' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 safe-bottom">
      <div className="flex items-center h-16 overflow-x-auto no-scrollbar snap-x snap-mandatory">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center gap-0.5 shrink-0 w-[20%] min-w-[64px] py-1.5 transition-colors snap-start ${
                isActive ? 'text-brand-red' : 'text-gray-500 hover:text-brand-red'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
            {item.badge ? (
              <span className="absolute top-0 right-3 bg-brand-yellow text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            ) : null}
          </NavLink>
        ))}
        <div className="shrink-0 w-16" aria-hidden="true" />
      </div>
    </nav>
  );
}
