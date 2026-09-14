import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { CartItem, Product, ProductAddon } from '@/types';
import { generateCartItemId } from '@/utils/format';

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, quantity: number, addons: ProductAddon[], notes: string) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const CART_KEY = 'alisson-lanches-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: Product, quantity: number, addons: ProductAddon[], notes: string) => {
    const addonList = addons.map((a) => ({ name: a.name, price: a.price }));
    const basePrice = product.price;
    const addonsTotal = addonList.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = basePrice + addonsTotal;
    const totalPrice = unitPrice * quantity;

    const newItem: CartItem = {
      id: generateCartItemId(),
      product_id: product.id,
      product_name: product.name,
      product_price: basePrice,
      image_url: product.image_url,
      quantity,
      notes,
      addons: addonList,
      unit_price: unitPrice,
      total_price: totalPrice,
    };

    setItems((prev) => [...prev, newItem]);
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== cartItemId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === cartItemId
          ? { ...item, quantity, total_price: item.unit_price * quantity }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
