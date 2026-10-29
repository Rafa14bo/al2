import { useEffect, useRef } from "react";
import { animate, motion, useInView } from "motion/react";
import { MessageCircle, ShoppingBag, UtensilsCrossed } from "lucide-react";

export function Counter({ to, decimals = 0, suffix = "", prefix = "" }: { to: number; decimals?: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        node.textContent = `${prefix}${v.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, to, decimals, suffix, prefix]);

  return (
    <span ref={ref}>
      {prefix}0{suffix}
    </span>
  );
}

const STEPS = [
  { icon: UtensilsCrossed, title: "Escolha", text: "Navegue pelo cardápio e personalize com os adicionais que quiser." },
  { icon: ShoppingBag, title: "Monte a sacola", text: "Ajuste quantidades, informe seu nome, endereço e forma de pagamento." },
  { icon: MessageCircle, title: "Envie no WhatsApp", text: "Seu pedido chega prontinho na nossa conversa. É só confirmar!" },
];

export function HowToOrder() {
  return (
    <div className="relative grid gap-6 md:grid-cols-3">
      <div className="absolute left-[16%] right-[16%] top-10 hidden h-px bg-border md:block" />
      {STEPS.map((s, i) => (
        <motion.div
          key={s.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="group relative text-center"
        >
          <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-full border border-primary/40 bg-card text-primary transition-all duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
            <s.icon className="h-8 w-8" />
            <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-accent font-display text-lg text-accent-foreground">
              {i + 1}
            </span>
          </div>
          <h3 className="mt-6 text-4xl">{s.title}</h3>
          <p className="mx-auto mt-2 max-w-xs text-muted-foreground">{s.text}</p>
        </motion.div>
      ))}
    </div>
  );
}

export function PageHero({ eyebrow, title, subtitle }: { eyebrow: string; title: React.ReactNode; subtitle?: string }) {
  return (
    <section className="relative overflow-hidden pb-16 pt-40">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 animate-glow rounded-full bg-gradient-glow" />
      <div className="relative mx-auto max-w-7xl px-5 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-semibold uppercase tracking-[0.35em] text-primary"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 text-7xl uppercase md:text-9xl"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
