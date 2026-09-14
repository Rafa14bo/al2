import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, Tag, X, UtensilsCrossed } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/Toast';
import { validateCoupon } from '@/services/api';
import { formatCurrency } from '@/utils/format';
import type { Coupon } from '@/types';

export function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const discount = coupon
    ? coupon.discount_type === 'percent'
      ? (subtotal * coupon.discount_value) / 100
      : coupon.discount_value
    : 0;
  const total = Math.max(0, subtotal - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const { coupon: c, error } = await validateCoupon(couponCode, subtotal);
      if (error) {
        setCouponError(error);
        setCoupon(null);
      } else {
        setCoupon(c);
        showToast('Cupom aplicado!', 'success');
      }
    } catch {
      setCouponError('Erro ao validar cupom.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponCode('');
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    const couponData = coupon
      ? { code: coupon.code, discountType: coupon.discount_type, discountValue: coupon.discount_value, couponId: coupon.id }
      : null;
    sessionStorage.setItem('checkout-coupon', JSON.stringify(couponData));
    sessionStorage.setItem('checkout-discount', String(discount));
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <ShoppingBag className="w-20 h-20 text-gray-200 mb-4" />
        <h2 className="font-display text-xl font-bold text-black mb-2">Sua sacola está vazia</h2>
        <p className="text-gray-500 mb-6">Adicione produtos do cardápio para começar seu pedido.</p>
        <Link to="/cardapio" className="btn-primary">Ver Cardápio</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="font-display text-2xl font-bold text-black mb-6">Sua Sacola</h1>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="card p-4 flex gap-3">
              {item.image_url ? (
                <img src={item.image_url} alt={item.product_name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-brand-red/10 to-brand-yellow/10 flex items-center justify-center shrink-0">
                  <UtensilsCrossed className="w-6 h-6 text-brand-red/30" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-black truncate">{item.product_name}</h3>
                {item.addons.length > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.addons.map((a) => a.name).join(', ')}
                  </p>
                )}
                {item.notes && (
                  <p className="text-xs text-gray-400 mt-0.5 italic">Obs: {item.notes}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-brand-red"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-semibold text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-brand-red"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-brand-red">{formatCurrency(item.total_price)}</span>
                    <button
                      onClick={() => { removeItem(item.id); showToast('Item removido', 'info'); }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coupon */}
        <div className="card p-4 mt-4">
          {coupon ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-green-600">{coupon.code}</span>
                <span className="text-xs text-gray-500">- {formatCurrency(discount)}</span>
              </div>
              <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Cupom de desconto"
                className="input-field flex-1"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={couponLoading}
                className="px-4 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Aplicar
              </button>
            </div>
          )}
          {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
        </div>

        {/* Summary */}
        <div className="card p-4 mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-black">{formatCurrency(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Desconto</span>
              <span className="font-semibold text-green-600">- {formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Taxa de entrega</span>
            <span className="font-semibold text-gray-500">Calculada no checkout</span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between">
            <span className="font-bold text-black">Total</span>
            <span className="font-bold text-brand-red text-lg">{formatCurrency(total)}</span>
          </div>
        </div>

        <button onClick={handleCheckout} className="btn-primary w-full mt-4 py-3.5">
          Finalizar Pedido
        </button>
        <button
          onClick={() => { clearCart(); showToast('Sacola limpa', 'info'); }}
          className="w-full mt-2 text-sm text-gray-500 hover:text-red-500 py-2"
        >
          Limpar sacola
        </button>
      </div>

      {/* Mobile sticky bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 safe-bottom z-30">
        <button onClick={handleCheckout} className="flex items-center justify-between w-full bg-brand-red text-white rounded-xl px-4 py-3">
          <span className="text-sm font-semibold">{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
          <span className="font-bold">{formatCurrency(total)} →</span>
        </button>
      </div>
    </div>
  );
}
