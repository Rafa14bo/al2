import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { addLine, cartTotals, setQuantity, type CartLine, type NewLine } from "./cart-logic";

const STORAGE_KEY = "brasa-cart-v1";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  bump: number;
  open: () => void;
  close: () => void;
  setOpen: (v: boolean) => void;
  add: (line: NewLine) => void;
  updateQuantity: (key: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const add = useCallback((line: NewLine) => {
    setLines((prev) => addLine(prev, line));
    setBump((b) => b + 1);
  }, []);

  const updateQuantity = useCallback((key: string, qty: number) => {
    setLines((prev) => setQuantity(prev, key, qty));
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const { count, subtotal } = cartTotals(lines);
    return {
      lines,
      count,
      subtotal,
      isOpen,
      bump,
      open: () => setOpen(true),
      close: () => setOpen(false),
      setOpen,
      add,
      updateQuantity,
      clear: () => setLines([]),
    };
  }, [lines, isOpen, bump, add, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
