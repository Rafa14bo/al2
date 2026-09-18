import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { StoreProvider } from '@/contexts/StoreContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Header, BottomNav } from '@/components/Layout';
import { WhatsAppButton } from '@/components/StoreWidgets';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

import { HomePage } from '@/pages/HomePage';
import { MenuPage } from '@/pages/MenuPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrderTrackingPage } from '@/pages/OrderTrackingPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AuthPage } from '@/pages/AuthPage';

import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminOrders } from '@/pages/admin/AdminOrders';
import { AdminProducts } from '@/pages/admin/AdminProducts';
import { AdminCategories } from '@/pages/admin/AdminCategories';
import { AdminAddons } from '@/pages/admin/AdminAddons';
import { AdminCoupons } from '@/pages/admin/AdminCoupons';
import { AdminCustomers } from '@/pages/admin/AdminCustomers';
import { AdminDelivery } from '@/pages/admin/AdminDelivery';
import { AdminPayments } from '@/pages/admin/AdminPayments';
import { AdminHours } from '@/pages/admin/AdminHours';
import { AdminSettings } from '@/pages/admin/AdminSettings';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const scrollToAnchor = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      const timer = setTimeout(scrollToAnchor, 50);
      return () => clearTimeout(timer);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  useSwipeNavigation(['/', '/cardapio', '/sacola', '/pedidos', user ? '/perfil' : '/entrar']);

  return (
    <div className="min-h-dvh bg-gray-50">
      <Header />
      <div key={location.pathname} className="page-transition">
        {children}
      </div>
      <BottomNav />
      <WhatsAppButton />
    </div>
  );
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Customer routes */}
        <Route path="/" element={<CustomerLayout><HomePage /></CustomerLayout>} />
        <Route path="/cardapio" element={<CustomerLayout><MenuPage /></CustomerLayout>} />
        <Route path="/sacola" element={<CustomerLayout><CartPage /></CustomerLayout>} />
        <Route path="/checkout" element={<CustomerLayout><CheckoutPage /></CustomerLayout>} />
        <Route path="/pedido/:number" element={<CustomerLayout><OrderTrackingPage /></CustomerLayout>} />
        <Route path="/pedidos" element={<CustomerLayout><OrdersPage /></CustomerLayout>} />
        <Route path="/perfil" element={<CustomerLayout><ProfilePage /></CustomerLayout>} />
        <Route path="/entrar" element={<CustomerLayout><AuthPage /></CustomerLayout>} />

        {/* Admin routes */}
        <Route path="/admin/entrar" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/pedidos" element={<AdminOrders />} />
        <Route path="/admin/produtos" element={<AdminProducts />} />
        <Route path="/admin/categorias" element={<AdminCategories />} />
        <Route path="/admin/adicionais" element={<AdminAddons />} />
        <Route path="/admin/cupons" element={<AdminCoupons />} />
        <Route path="/admin/clientes" element={<AdminCustomers />} />
        <Route path="/admin/entrega" element={<AdminDelivery />} />
        <Route path="/admin/pagamentos" element={<AdminPayments />} />
        <Route path="/admin/horarios" element={<AdminHours />} />
        <Route path="/admin/configuracoes" element={<AdminSettings />} />

        {/* Fallback */}
        <Route path="*" element={<CustomerLayout><HomePage /></CustomerLayout>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <ToastProvider>
          <CartProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </CartProvider>
        </ToastProvider>
      </StoreProvider>
    </AuthProvider>
  );
}

export default App;
