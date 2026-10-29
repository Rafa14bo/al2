import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/cardapio", label: "Cardápio" },
  { to: "/sobre", label: "A Toca" },
  { to: "/contato", label: "Contato" },
] as const;

// Arquivo em /public — troque por um PNG maior (ex.: 640x640) mantendo este nome.
export const LOGO_URL = "/logo-toca-do-burguer.png";

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="Toca do Burguer — início">
      <img
        src={LOGO_URL}
        alt="Logo Toca do Burguer"
        width={640}
        height={640}
        className={`${size === "lg" ? "h-20 w-20" : "h-12 w-12"} rounded-full ring-1 ring-primary/40 transition-transform duration-500 group-hover:rotate-[-12deg] group-hover:scale-105`}
      />
      <span className="hidden font-display text-2xl leading-none tracking-wide sm:block">
        Toca do <span className="text-primary">Burguer</span>
      </span>
    </Link>
  );
}

export function Header() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { count, open, bump } = useCart();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
          scrolled ? "border-b border-border/60 bg-background/80 py-3 backdrop-blur-xl" : "py-5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative isolate rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-colors ${
                    active ? "text-primary-foreground" : "text-foreground/80 hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={open}
              aria-label={`Abrir sacola (${count} itens)`}
              className="relative grid h-11 w-11 place-items-center rounded-full border border-border bg-secondary transition-colors hover:border-primary"
            >
              <ShoppingBag className="h-5 w-5" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={bump}
                    initial={{ scale: 0.4 }}
                    animate={{ scale: [1.5, 1] }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <Button asChild variant="flame" className="hidden h-11 px-6 lg:inline-flex">
              <Link to="/cardapio">Peça agora</Link>
            </Button>
            <button
              className="grid h-11 w-11 place-items-center rounded-full border border-border bg-secondary md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex flex-col justify-center bg-background/95 px-8 backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col gap-2">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="font-display text-6xl uppercase transition-colors hover:text-primary"
                    activeProps={{ className: "text-primary" }}
                    activeOptions={{ exact: item.to === "/" }}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
