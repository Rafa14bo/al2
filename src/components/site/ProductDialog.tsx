import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CUSTOMIZABLE, EXTRAS, type Product } from "@/lib/menu";
import { formatBRL } from "@/lib/cart-logic";
import { useCart } from "@/lib/cart";

export function ProductDialog({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { add, open } = useCart();
  const [extras, setExtras] = useState<string[]>([]);
  const [optionIdx, setOptionIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (product) {
      setExtras([]);
      setOptionIdx(0);
      setQty(1);
      setNote("");
    }
  }, [product]);

  if (!product) return null;
  const canCustomize = CUSTOMIZABLE.includes(product.category);
  const option = product.options?.[optionIdx];
  const extrasTotal = EXTRAS.filter((e) => extras.includes(e.id)).reduce((s, e) => s + e.price, 0);
  const unit = (option?.price ?? product.price) + extrasTotal;
  const total = unit * qty;

  const toggle = (id: string) =>
    setExtras((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const confirm = () => {
    const name = option ? `${product.name} — ${option.label}` : product.name;
    add({
      productId: option ? `${product.id}:${option.label}` : product.id,
      name,
      image: product.image,
      unitPrice: unit,
      quantity: qty,
      extras: EXTRAS.filter((e) => extras.includes(e.id)).map((e) => e.label),
      ...(note.trim() ? { note: note.trim() } : {}),
    });
    toast.success(`${qty}x ${name} na sacola!`, { action: { label: "Ver sacola", onClick: open } });
    onClose();
  };

  return (
    <Dialog open={!!product} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto rounded-3xl border-border bg-card p-0 sm:rounded-3xl">
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto">
            {product.cutout && <div className="absolute inset-0 bg-gradient-glow" />}
            <motion.img
              initial={{ scale: 1.15, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              src={product.image}
              alt={product.name}
              className={`h-full w-full md:absolute md:inset-0 ${product.cutout ? "object-contain p-6" : "object-cover"}`}
            />
          </div>
          <div className="flex flex-col p-6 md:p-8">
            <DialogTitle className="font-display text-5xl font-normal">{product.name}</DialogTitle>
            {product.description && <DialogDescription className="mt-3 text-base">{product.description}</DialogDescription>}

            {product.options && (
              <div className="mt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary">Escolha a opção</p>
                <div className="grid grid-cols-2 gap-2">
                  {product.options.map((o, i) => (
                    <button
                      key={o.label}
                      type="button"
                      onClick={() => setOptionIdx(i)}
                      className={`relative isolate rounded-2xl border px-4 py-3 text-left transition-colors ${
                        i === optionIdx ? "border-primary text-primary-foreground" : "border-border hover:border-primary/50"
                      }`}
                    >
                      {i === optionIdx && <motion.span layoutId="opt-pill" className="absolute inset-0 -z-10 rounded-2xl bg-primary" />}
                      <span className="block font-semibold">{o.label}</span>
                      <span className={`text-sm ${i === optionIdx ? "" : "text-muted-foreground"}`}>{formatBRL(o.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {canCustomize && (
              <div className="mt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary">Adicionais</p>
                <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {EXTRAS.map((e) => {
                    const on = extras.includes(e.id);
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => toggle(e.id)}
                        className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-all duration-300 ${
                          on ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${
                              on ? "border-primary bg-primary text-primary-foreground" : "border-border"
                            }`}
                          >
                            <AnimatePresence>
                              {on && (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                  <Check className="h-3 w-3" />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </span>
                          {e.label}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">+{formatBRL(e.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Alguma observação? Ex: sem cebola, sem tomate..."
              className="mt-5 resize-none rounded-2xl border-border bg-background"
              maxLength={140}
            />

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1">
                <Button variant="ghost" size="iconSm" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuir">
                  <Minus />
                </Button>
                <span className="w-8 text-center font-display text-2xl">{qty}</span>
                <Button variant="ghost" size="iconSm" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Aumentar">
                  <Plus />
                </Button>
              </div>
              <Button variant="flame" size="xl" className="flex-1 px-4" onClick={confirm}>
                Adicionar •{" "}
                <motion.span key={total} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  {formatBRL(total)}
                </motion.span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
