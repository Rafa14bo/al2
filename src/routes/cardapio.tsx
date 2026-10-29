import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { PageHero } from "@/components/site/extras";
import { ProductRow } from "@/components/site/ProductCard";
import { ProductDialog } from "@/components/site/ProductDialog";
import { CATEGORIES, CATEGORY_NOTES, PRODUCTS, type Category, type Product } from "@/lib/menu";

export const Route = createFileRoute("/cardapio")({
  head: () => ({
    meta: [
      { title: "Cardápio — Toca do Burguer | Barretos" },
      { name: "description", content: "Cardápio completo da Toca do Burguer: gourmet, X-Tudão, contra-filé, frango, hot dog, batatas, porções e bebidas." },
      { property: "og:title", content: "Cardápio — Toca do Burguer" },
      { property: "og:description", content: "Hambúrgueres, gourmet, porções, batatas e bebidas. Peça pelo WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Cardapio,
});

function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function Cardapio() {
  const [cat, setCat] = useState<Category | "todos">("todos");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);

  const groups = useMemo(() => {
    const q = normalize(query.trim());
    return CATEGORIES.filter((c) => c.id !== "todos" && (cat === "todos" || c.id === cat))
      .map((c) => ({
        ...c,
        items: PRODUCTS.filter(
          (p) => p.category === c.id && (!q || normalize(p.name).includes(q) || normalize(p.description).includes(q)),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [cat, query]);

  return (
    <>
      <PageHero
        eyebrow="Cardápio oficial"
        title={
          <>
            Nosso <span className="text-gradient-flame">cardápio</span>
          </>
        }
        subtitle="Toque em qualquer item para escolher adicionais, ou use o + para colocar direto na sacola."
      />

      <section className="mx-auto max-w-7xl px-5 pb-28">
        <div className="sticky top-[72px] z-20 -mx-5 mb-10 flex flex-col gap-3 border-b border-border/60 bg-background/90 px-5 py-4 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:max-w-[calc(100%-20rem)]">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setCat(c.id);
                  window.scrollTo({ top: 260, behavior: "smooth" });
                }}
                className={`relative isolate shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  cat === c.id ? "border-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat === c.id && (
                  <motion.span
                    layoutId="cat-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                {c.label}
              </button>
            ))}
          </div>
          <div className="relative lg:w-72">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar: bacon, catupiry, frango..."
              className="h-11 w-full rounded-full border border-border bg-card pl-11 pr-10 text-sm outline-none transition-colors focus:border-primary"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Limpar busca">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-16">
          <AnimatePresence mode="popLayout">
            {groups.map((g) => (
              <motion.div
                key={g.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-6 flex flex-wrap items-end justify-between gap-2 border-b border-border pb-3">
                  <h2 className="text-5xl uppercase md:text-6xl">{g.label}</h2>
                  {CATEGORY_NOTES[g.id as Category] && (
                    <p className="text-sm text-muted-foreground">{CATEGORY_NOTES[g.id as Category]}</p>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <AnimatePresence mode="popLayout">
                    {g.items.map((p) => (
                      <ProductRow key={p.id} product={p} onOpen={setSelected} />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {groups.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-20 text-center">
              <p className="font-display text-5xl">Nada encontrado</p>
              <p className="mt-2 text-muted-foreground">Tente outra palavra ou categoria.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-16 text-center text-sm text-muted-foreground">Preços e itens sujeitos a alteração sem aviso prévio.</p>
      </section>

      <ProductDialog product={selected} onClose={() => setSelected(null)} />
    </>
  );
}
