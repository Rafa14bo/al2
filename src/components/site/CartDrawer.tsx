import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart";
import { buildOrderMessage, formatBRL } from "@/lib/cart-logic";

import { BUSINESS } from "@/lib/menu";
const WHATSAPP_NUMBER = BUSINESS.whatsapp;
const PAYMENTS = ["Pix", "Cartão", "Dinheiro"];

export function CartDrawer() {
  const { lines, isOpen, setOpen, updateQuantity, subtotal, count, clear } = useCart();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("Pix");

  const checkout = () => {
    if (name.trim().length < 2 || address.trim().length < 5) {
      toast.error("Preencha seu nome e endereço para finalizar.");
      return;
    }
    const msg = buildOrderMessage(lines, { name: name.trim(), address: address.trim(), payment });
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
    toast.success("Pedido enviado! Finalize a conversa no WhatsApp.");
    clear();
    setOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 border-border bg-card p-0 sm:max-w-md">
        <div className="border-b border-border p-6">
          <SheetTitle className="font-display text-4xl font-normal">Sua sacola</SheetTitle>
          <SheetDescription>{count === 0 ? "Nada por aqui ainda." : `${count} ${count === 1 ? "item" : "itens"}`}</SheetDescription>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {lines.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex h-full flex-col items-center justify-center text-center"
            >
              <div className="grid h-24 w-24 animate-float place-items-center rounded-full bg-secondary">
                <ShoppingBag className="h-10 w-10 text-primary" />
              </div>
              <p className="mt-6 font-display text-3xl">Bateu a fome?</p>
              <p className="mt-2 text-muted-foreground">Escolha seus favoritos no cardápio.</p>
              <Button asChild variant="flame" size="xl" className="mt-6" onClick={() => setOpen(false)}>
                <Link to="/cardapio">Ver cardápio</Link>
              </Button>
            </motion.div>
          ) : (
            <ul className="space-y-3">
              <AnimatePresence initial={false}>
                {lines.map((l) => (
                  <motion.li
                    key={l.key}
                    layout
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 60, transition: { duration: 0.2 } }}
                    className="flex gap-3 rounded-2xl border border-border bg-background p-3"
                  >
                    <img src={l.image} alt="" className="h-20 w-20 shrink-0 rounded-xl bg-secondary object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-display text-2xl leading-tight">{l.name}</p>
                        <button
                          onClick={() => updateQuantity(l.key, 0)}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                          aria-label="Remover"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {l.extras.length > 0 && <p className="truncate text-xs text-muted-foreground">+ {l.extras.join(", ")}</p>}
                      {l.note && <p className="truncate text-xs italic text-muted-foreground">“{l.note}”</p>}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-full border border-border">
                          <Button variant="ghost" size="iconSm" onClick={() => updateQuantity(l.key, l.quantity - 1)} aria-label="Diminuir">
                            <Minus />
                          </Button>
                          <span className="w-6 text-center font-semibold">{l.quantity}</span>
                          <Button variant="ghost" size="iconSm" onClick={() => updateQuantity(l.key, l.quantity + 1)} aria-label="Aumentar">
                            <Plus />
                          </Button>
                        </div>
                        <span className="font-semibold text-primary">{formatBRL(l.unitPrice * l.quantity)}</span>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-3 border-t border-border p-6">
            <Input placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl bg-background" maxLength={60} />
            <Input placeholder="Endereço de entrega" value={address} onChange={(e) => setAddress(e.target.value)} className="h-11 rounded-xl bg-background" maxLength={140} />
            <div className="flex gap-2">
              {PAYMENTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPayment(p)}
                  className={`relative isolate flex-1 rounded-xl border py-2 text-sm font-semibold transition-colors ${
                    payment === p ? "border-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {payment === p && <motion.span layoutId="pay-pill" className="absolute inset-0 -z-10 rounded-xl bg-primary" />}
                  <span className="relative">{p}</span>
                </button>
              ))}
            </div>
            <div className="flex items-end justify-between pt-2">
              <span className="text-muted-foreground">Subtotal</span>
              <motion.span key={subtotal} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="font-display text-4xl">
                {formatBRL(subtotal)}
              </motion.span>
            </div>
            <p className="text-xs text-muted-foreground">Taxa de entrega combinada no WhatsApp.</p>
            <Button variant="flame" size="xl" className="w-full" onClick={checkout}>
              Finalizar pelo WhatsApp
            </Button>
          </motion.div>
        )}
      </SheetContent>
    </Sheet>
  );
}
