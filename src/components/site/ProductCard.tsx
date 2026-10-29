import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/menu";
import { formatBRL } from "@/lib/cart-logic";
import { useCart } from "@/lib/cart";

function useQuickAdd(product: Product, onOpen: (p: Product) => void) {
  const { add } = useCart();
  return (e: React.MouseEvent) => {
    e.stopPropagation();
    // Items with size options need a choice first.
    if (product.options?.length) {
      onOpen(product);
      return;
    }
    add({ productId: product.id, name: product.name, image: product.image, unitPrice: product.price, quantity: 1, extras: [] });
    toast.success(`${product.name} na sacola!`);
  };
}

function PriceLabel({ product, className }: { product: Product; className: string }) {
  return (
    <span className={className}>
      {product.options?.length ? <span className="mr-1 font-sans text-xs uppercase tracking-wider text-muted-foreground">a partir de</span> : null}
      {formatBRL(product.price)}
    </span>
  );
}

/** Large showcase card (home featured items). */
export function ProductCard({ product, onOpen }: { product: Product; onOpen: (p: Product) => void }) {
  const quickAdd = useQuickAdd(product, onOpen);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      onClick={() => onOpen(product)}
      className="group relative h-full cursor-pointer overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-colors duration-300 hover:border-primary/50"
    >
      <div className="relative aspect-square overflow-hidden">
        {product.cutout && <div className="absolute inset-0 bg-gradient-glow" />}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={816}
          height={816}
          className={`h-full w-full transition-transform duration-700 ease-out group-hover:scale-110 ${
            product.cutout ? "relative object-contain p-8 group-hover:rotate-[-4deg]" : "object-cover"
          }`}
        />
        {product.tags?.[0] && (
          <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
            {product.tags[0]}
          </span>
        )}
      </div>
      <div className="relative p-6 pt-2">
        <h3 className="text-4xl">{product.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <div className="mt-5 flex items-center justify-between">
          <PriceLabel product={product} className="font-display text-3xl text-primary" />
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={quickAdd}
            aria-label={`Adicionar ${product.name}`}
            className="grid h-12 w-12 place-items-center rounded-full bg-gradient-flame text-primary-foreground shadow-glow transition-transform duration-300 group-hover:rotate-90"
          >
            <Plus className="h-6 w-6" />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

/** Compact row for the full menu list. */
export function ProductRow({ product, onOpen }: { product: Product; onOpen: (p: Product) => void }) {
  const quickAdd = useQuickAdd(product, onOpen);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onOpen(product)}
      className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-card p-3 transition-colors duration-300 hover:border-primary/60 hover:bg-secondary"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary sm:h-24 sm:w-24">
        <img
          src={product.image}
          alt=""
          loading="lazy"
          width={96}
          height={96}
          className={`h-full w-full transition-transform duration-500 ease-out group-hover:scale-110 ${product.cutout ? "object-contain p-1" : "object-cover"}`}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-2xl leading-none">{product.name}</h3>
          {product.tags?.[0] && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              {product.tags[0]}
            </span>
          )}
        </div>
        {product.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>}
        <PriceLabel product={product} className="mt-1.5 block font-display text-2xl text-primary" />
      </div>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={quickAdd}
        aria-label={`Adicionar ${product.name}`}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/50 text-primary transition-all duration-300 group-hover:rotate-90 group-hover:bg-primary group-hover:text-primary-foreground"
      >
        <Plus className="h-5 w-5" />
      </motion.button>
    </motion.article>
  );
}
