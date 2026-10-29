import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Minus, Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/cart-logic";
import { EXTRAS, HERO_BURGER } from "@/lib/menu";

type LayerId = "patty" | "bacon" | "cheddar" | "mozzarella" | "ham" | "egg" | "catupiry" | "onion" | "pickle" | "straw" | "corn" | "sausage";

// Pães disponíveis. O cliente escolhe o pão e monta o restante do zero.
// ⚠️ Ajuste o `price` de cada pão conforme a tabela da casa.
const BREADS = [
  {
    id: "pao-hamburguer",
    label: "Pão de hambúrguer",
    description: "O clássico macio",
    price: 5,
    swatch: "bg-bun",
    top: "h-24 rounded-b-xl rounded-t-[999px] bg-bun",
    bottom: "h-12 rounded-b-[2.5rem] rounded-t-lg bg-bun-dark",
    detail: "seeds",
  },
  {
    id: "pao-brioche",
    label: "Pão de brioche",
    description: "Amanteigado e dourado",
    price: 8,
    swatch: "bg-[oklch(0.76_0.13_70)]",
    top: "h-24 rounded-b-xl rounded-t-[999px] bg-[oklch(0.76_0.13_70)]",
    bottom: "h-12 rounded-b-[2.5rem] rounded-t-lg bg-[oklch(0.64_0.13_58)]",
    detail: "seeds",
  },
  {
    id: "pao-frances",
    label: "Pão francês",
    description: "Casquinha crocante",
    price: 4,
    swatch: "bg-[oklch(0.78_0.1_75)]",
    top: "h-16 rounded-b-md rounded-t-[50%] bg-[oklch(0.78_0.1_75)]",
    bottom: "h-10 rounded-b-[2rem] rounded-t-md bg-[oklch(0.68_0.1_68)]",
    detail: "slash",
  },
  {
    id: "pao-hot-dog",
    label: "Pão de hot dog",
    description: "Alongado e fofinho",
    price: 4,
    swatch: "bg-[oklch(0.82_0.09_80)]",
    top: "h-14 rounded-b-md rounded-t-[999px] bg-[oklch(0.82_0.09_80)]",
    bottom: "h-8 rounded-b-[2rem] rounded-t-md bg-[oklch(0.72_0.09_72)]",
    detail: null,
  },
] as const;
type Bread = (typeof BREADS)[number];

const RAW_INGREDIENTS: { extraId: string; layer: LayerId; max: number; swatch: string }[] = [
  { extraId: "hamb-artesanal", layer: "patty", max: 3, swatch: "bg-patty" },
  { extraId: "salsicha", layer: "sausage", max: 3, swatch: "bg-[oklch(0.6_0.14_35)]" },
  { extraId: "bacon", layer: "bacon", max: 3, swatch: "bg-bacon" },
  { extraId: "cheddar", layer: "cheddar", max: 3, swatch: "bg-cheese" },
  { extraId: "mucarela", layer: "mozzarella", max: 3, swatch: "bg-mozzarella" },
  { extraId: "presunto", layer: "ham", max: 3, swatch: "bg-ham" },
  { extraId: "ovo", layer: "egg", max: 2, swatch: "bg-egg-yolk" },
  { extraId: "catupiry", layer: "catupiry", max: 2, swatch: "bg-catupiry" },
  { extraId: "cebola", layer: "onion", max: 2, swatch: "bg-onion" },
  { extraId: "picles", layer: "pickle", max: 2, swatch: "bg-pickle" },
  { extraId: "batata-palha", layer: "straw", max: 2, swatch: "bg-straw" },
  { extraId: "milho", layer: "corn", max: 2, swatch: "bg-corn" },
];
const INGREDIENTS = RAW_INGREDIENTS.map((i) => ({ ...i, ...EXTRAS.find((e) => e.id === i.extraId)! }));

function Layer({ id }: { id: LayerId }) {
  switch (id) {
    case "patty":
      return <div className="h-8 w-[94%] rounded-full bg-patty shadow-card" />;
    case "cheddar":
      return (
        <div className="relative h-3 w-full rounded-sm bg-cheese">
          <span className="absolute left-[18%] top-full h-4 w-3 rounded-b-full bg-cheese" />
          <span className="absolute left-[55%] top-full h-6 w-3 rounded-b-full bg-cheese" />
          <span className="absolute left-[80%] top-full h-3 w-3 rounded-b-full bg-cheese" />
        </div>
      );
    case "mozzarella":
      return <div className="h-2.5 w-[98%] rounded-sm bg-mozzarella" />;
    case "ham":
      return <div className="h-2.5 w-[96%] rounded-full bg-ham" />;
    case "bacon":
      return (
        <div className="flex w-[98%] gap-1">
          <div className="h-3 flex-1 -rotate-2 rounded-full bg-bacon" />
          <div className="h-3 flex-1 rotate-2 rounded-full bg-bacon" />
        </div>
      );
    case "egg":
      return (
        <div className="relative grid h-5 w-[90%] place-items-center rounded-[50%] bg-egg-white">
          <span className="h-4 w-10 rounded-full bg-egg-yolk" />
        </div>
      );
    case "catupiry":
      return (
        <div className="flex w-[85%] justify-around">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-4 w-14 rounded-full bg-catupiry" />
          ))}
        </div>
      );
    case "sausage":
      return <div className="h-3.5 w-[92%] rounded-full bg-[oklch(0.6_0.14_35)] shadow-card" />;
    case "onion":
      return <div className="h-2.5 w-[88%] rounded-full bg-onion" />;
    case "pickle":
      return (
        <div className="flex w-[80%] justify-around">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-3 w-8 rounded-full bg-pickle" />
          ))}
        </div>
      );
    case "straw":
      return (
        <div className="flex h-3 w-[96%] items-center justify-around">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className={`h-1 w-4 rounded-full bg-straw ${i % 2 ? "rotate-12" : "-rotate-12"}`} />
          ))}
        </div>
      );
    case "corn":
      return (
        <div className="flex h-3 w-[86%] items-center justify-around">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full bg-corn" />
          ))}
        </div>
      );
  }
}

let uid = 0;

function BunTop({ bread }: { bread: Bread }) {
  return (
    <motion.div layout className={`relative w-full shadow-card ${bread.top}`}>
      {bread.detail === "seeds" &&
        [
          [20, 30],
          [40, 18],
          [60, 26],
          [75, 45],
          [30, 55],
          [50, 45],
        ].map(([l, t], i) => (
          <span key={i} className="absolute h-2 w-3.5 rotate-12 rounded-full bg-sesame" style={{ left: `${l}%`, top: `${t}%` }} />
        ))}
      {bread.detail === "slash" &&
        [22, 46, 70].map((l) => (
          <span key={l} className="absolute top-[35%] h-1 w-10 -rotate-12 rounded-full bg-[oklch(0.9_0.05_85)]" style={{ left: `${l - 6}%` }} />
        ))}
    </motion.div>
  );
}

export function BurgerBuilder() {
  const [breadId, setBreadId] = useState<Bread["id"] | null>(null);
  const [layers, setLayers] = useState<{ uid: number; extraId: string; layer: LayerId }[]>([]);
  const { add, open } = useCart();

  const bread = BREADS.find((b) => b.id === breadId) ?? null;
  const shown = bread ?? BREADS[0];

  const countOf = (extraId: string) => layers.filter((l) => l.extraId === extraId).length;
  const price = (bread?.price ?? 0) + layers.reduce((s, l) => s + (INGREDIENTS.find((i) => i.extraId === l.extraId)?.price ?? 0), 0);
  const canOrder = !!bread && layers.length > 0;

  const inc = (ing: (typeof INGREDIENTS)[number]) => {
    if (!bread || countOf(ing.extraId) >= ing.max) return;
    setLayers((prev) => [...prev, { uid: uid++, extraId: ing.extraId, layer: ing.layer }]);
  };
  const dec = (extraId: string) => {
    setLayers((prev) => {
      const idx = prev.map((l) => l.extraId).lastIndexOf(extraId);
      return idx === -1 ? prev : prev.filter((_, i) => i !== idx);
    });
  };

  const addToCart = () => {
    if (!bread || !layers.length) return;
    const summary = INGREDIENTS.filter((i) => countOf(i.extraId) > 0).map((i) => `${countOf(i.extraId)}x ${i.label}`);
    add({
      productId: `monte-${bread.id}`,
      name: `Monte o seu — ${bread.label}`,
      image: HERO_BURGER,
      unitPrice: price,
      quantity: 1,
      extras: summary,
    });
    toast.success("Seu lanche foi para a sacola!", { action: { label: "Ver sacola", onClick: open } });
  };

  const reset = () => {
    setBreadId(null);
    setLayers([]);
  };

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div className="relative flex min-h-[480px] items-end justify-center rounded-[2.5rem] border border-border bg-card p-10">
        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-glow opacity-50" />
        {!bread && (
          <p className="absolute inset-x-0 top-10 z-10 text-center font-display text-2xl text-muted-foreground">Escolha o pão para começar</p>
        )}
        <div className={`relative flex w-full max-w-[300px] flex-col items-center transition-opacity duration-300 ${bread ? "opacity-100" : "opacity-40"}`}>
          <BunTop bread={shown} />
          <div className="flex w-full flex-col items-center gap-1 py-1">
            <AnimatePresence initial={false} mode="popLayout">
              {[...layers].reverse().map((l) => (
                <motion.div
                  key={l.uid}
                  layout
                  initial={{ opacity: 0, y: -120, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 140, rotate: 20, transition: { duration: 0.25 } }}
                  transition={{ type: "spring", stiffness: 420, damping: 26 }}
                  className="flex w-full justify-center"
                >
                  <Layer id={l.layer} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <motion.div layout className={`w-full shadow-card ${shown.bottom}`} />
          <div className="mt-3 h-3 w-[110%] rounded-[50%] bg-foreground/10 blur-sm" />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">1. Escolha o pão</p>
        <div className="mb-6 grid gap-2 sm:grid-cols-2">
          {BREADS.map((b) => {
            const selected = b.id === breadId;
            return (
              <button
                key={b.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setBreadId(b.id)}
                className={`flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-left transition-colors duration-300 ${
                  selected ? "border-primary/60 bg-primary/5" : "border-border hover:border-primary/30"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className={`h-3.5 w-3.5 shrink-0 rounded-full ${b.swatch}`} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{b.label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {b.description} • {formatBRL(b.price)}
                    </span>
                  </span>
                </span>
                {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>

        <p className="mb-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">2. Escolha o restante</p>
        <div className={`grid gap-2 transition-opacity duration-300 sm:grid-cols-2 ${bread ? "" : "pointer-events-none opacity-50"}`}>
          {INGREDIENTS.map((ing) => {
            const n = countOf(ing.extraId);
            return (
              <div
                key={ing.extraId}
                className={`flex items-center justify-between rounded-2xl border px-3 py-2.5 transition-colors duration-300 ${
                  n > 0 ? "border-primary/60 bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className={`h-3.5 w-3.5 shrink-0 rounded-full ${ing.swatch}`} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{ing.label}</p>
                    <p className="text-xs text-muted-foreground">+ {formatBRL(ing.price)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center">
                  <Button variant="chip" size="iconSm" onClick={() => dec(ing.extraId)} disabled={!bread || n === 0} aria-label={`Remover ${ing.label}`}>
                    <Minus />
                  </Button>
                  <span className="w-6 text-center font-display text-xl">{n}</span>
                  <Button variant="chip" size="iconSm" onClick={() => inc(ing)} disabled={!bread || n >= ing.max} aria-label={`Adicionar ${ing.label}`}>
                    <Plus />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Total</p>
            <motion.p key={price} initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-5xl text-primary">
              {bread ? formatBRL(price) : "—"}
            </motion.p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="cream" size="xl" className="px-5" onClick={reset} aria-label="Recomeçar">
              <RotateCcw />
            </Button>
            <Button variant="flame" size="xl" onClick={addToCart} disabled={!canOrder}>
              Quero esse!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
