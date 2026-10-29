import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowRight, Beef, Clock, MapPin, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/site/Marquee";
import { Reveal, SectionLabel } from "@/components/site/Reveal";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductDialog } from "@/components/site/ProductDialog";
import { BurgerBuilder } from "@/components/site/BurgerBuilder";
import { Counter, HowToOrder } from "@/components/site/extras";
import { BUSINESS, HERO_BURGER, PRODUCTS, type Product } from "@/lib/menu";
import kitchen from "@/assets/kitchen.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Toca do Burguer — Lanches e hambúrguer gourmet em Barretos" },
      { name: "description", content: "Hambúrgueres gourmet, X-Tudão, contra-filé, porções e batatas recheadas em Barretos/SP. Peça pelo WhatsApp." },
      { property: "og:title", content: "Toca do Burguer — Barretos/SP" },
      { property: "og:description", content: "Hambúrgueres gourmet, lanches, porções e batatas recheadas. Peça pelo WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const EMBERS = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${(i * 0.7) % 5}s`,
  drift: `${((i * 23) % 60) - 30}px`,
  size: 3 + (i % 3) * 2,
}));

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 20 });
  const sy = useSpring(my, { stiffness: 120, damping: 20 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-12, 12]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [10, -10]);
  const tx = useTransform(sx, [-0.5, 0.5], [-20, 20]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const burgerY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const onMove = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const words = ["Fome?", "Vem pra", "Toca."];

  return (
    <section
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className="grain relative flex min-h-[100svh] items-center overflow-hidden pb-20 pt-32"
    >
      <div className="pointer-events-none absolute inset-0">
        {EMBERS.map((e, i) => (
          <span
            key={i}
            className="absolute bottom-0 animate-ember rounded-full bg-primary-glow"
            style={{ left: e.left, animationDelay: e.delay, width: e.size, height: e.size, ["--drift" as string]: e.drift }}
          />
        ))}
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 px-5 lg:grid-cols-[1.1fr_1fr]">
        <motion.div style={{ y: textY, opacity: fade }} className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
          >
            <MapPin className="h-4 w-4" /> Barretos • SP
          </motion.div>

          <h1 className="mt-6 text-[clamp(4.5rem,13vw,11rem)] uppercase">
            {words.map((w, i) => (
              <span key={w} className="block overflow-hidden">
                <motion.span
                  className={`block ${i === 1 ? "text-gradient-flame" : ""}`}
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-6 max-w-md text-lg text-muted-foreground"
          >
            Do X-Tudão ao gourmet no brioche com hambúrguer artesanal de 150 g — lanche caprichado e porções para dividir com a galera.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button asChild variant="flame" size="xl">
              <Link to="/cardapio">
                Ver cardápio <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="cream" size="xl">
              <a href="#monte">Monte o seu</a>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: burgerY }} className="relative mx-auto w-full max-w-[560px] [perspective:1200px]">
          <div className="absolute inset-[-10%] animate-glow rounded-full bg-gradient-glow" />
          <svg viewBox="0 0 200 200" className="absolute inset-[-6%] h-[112%] w-[112%] animate-spin-slow text-foreground/30" aria-hidden>
            <defs>
              <path id="circle" d="M100,100 m-88,0 a88,88 0 1,1 176,0 a88,88 0 1,1 -176,0" />
            </defs>
            <text className="fill-current font-display text-[11px] tracking-[0.35em]">
              <textPath href="#circle">TOCA DO BURGUER • GOURMET • CHEDDAR • BACON • BARRETOS •</textPath>
            </text>
          </svg>
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -25 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ rotateX, rotateY, x: tx }}
            className="relative"
          >
            <img
              src={HERO_BURGER}
              alt="Hambúrguer da Toca do Burguer com cheddar derretido"
              width={1024}
              height={1024}
              fetchPriority="high"
              className="w-full animate-float drop-shadow-[0_40px_40px_oklch(0_0_0/0.55)]"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 260, damping: 18 }}
            className="absolute -left-2 bottom-10 rounded-2xl border border-border bg-card/90 px-4 py-3 shadow-card backdrop-blur md:left-0"
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground">A partir de</p>
            <p className="font-display text-4xl text-primary">R$ 10,00</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.15, type: "spring", stiffness: 260, damping: 18 }}
            className="absolute -right-2 top-10 grid h-24 w-24 rotate-12 place-items-center rounded-full bg-accent text-center font-display text-xl leading-none text-accent-foreground shadow-card"
          >
            Gourmet
            <br />
            150 g
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Home() {
  const [selected, setSelected] = useState<Product | null>(null);
  const featured = PRODUCTS.filter((p) => p.featured);

  return (
    <>
      <Hero />
      <Marquee />

      {/* Mais pedidos */}
      <section className="mx-auto max-w-7xl px-5 py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <SectionLabel>Destaques da casa</SectionLabel>
            <h2 className="mt-4 text-6xl uppercase md:text-8xl">Só os brabos</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Button asChild variant="cream" size="xl">
              <Link to="/cardapio">
                Cardápio completo <ArrowRight />
              </Link>
            </Button>
          </Reveal>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.1}>
              <ProductCard product={p} onOpen={setSelected} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Diferenciais */}
      <section className="border-y border-border bg-card/50">
        <div className="mx-auto grid max-w-7xl gap-px px-5 md:grid-cols-3">
          {[
            { icon: Beef, title: "Toca Gourmet", text: "Pão de brioche, maionese artesanal e hambúrguer artesanal de 150 g." },
            { icon: Users, title: "Porções da Toca", text: "Contra-filé, isca de frango, tilápia e a porção Família para a galera." },
            { icon: MessageCircle, title: "Pedido no WhatsApp", text: "Monte a sacola aqui e envie direto pra gente no WhatsApp." },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 0.1} className="group p-10">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary transition-all duration-500 group-hover:rotate-[-8deg] group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-4xl">{f.title}</h3>
              <p className="mt-2 text-muted-foreground">{f.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Monte o seu */}
      <section id="monte" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-28">
        <Reveal className="mb-14 text-center">
          <SectionLabel>Interativo</SectionLabel>
          <h2 className="mt-4 text-6xl uppercase md:text-8xl">
            Monte o <span className="text-gradient-flame">seu</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Escolha o pão e monte o restante do seu jeito, com os adicionais do cardápio.
          </p>
        </Reveal>
        <Reveal>
          <BurgerBuilder />
        </Reveal>
      </section>

      {/* Números */}
      <section className="relative overflow-hidden">
        <ParallaxImage />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-28 text-center md:grid-cols-4">
          {[
            { to: PRODUCTS.filter((p) => !["bebidas", "latas", "cervejas"].includes(p.category)).length, suffix: "", label: "opções de comida" },
            { to: PRODUCTS.filter((p) => p.category === "gourmet").length, suffix: "", label: "burgers gourmet" },
            { to: 150, suffix: " g", label: "hambúrguer artesanal" },
            { to: 6, suffix: " dias", label: "por semana, ter a dom" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <p className="font-display text-7xl text-primary md:text-8xl">
                <Counter to={s.to} suffix={s.suffix} />
              </p>
              <p className="mt-2 uppercase tracking-widest text-foreground/80">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Depoimentos */}
      <section className="px-5 py-28">
        <Reveal className="mb-10 text-center">
          <SectionLabel>Como pedir</SectionLabel>
          <h2 className="mt-4 text-6xl uppercase md:text-8xl">Simples assim</h2>
        </Reveal>
        <div className="mx-auto max-w-6xl">
          <HowToOrder />
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-28">
        <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-flame p-10 md:p-16">
          <div className="relative z-10 max-w-xl text-primary-foreground">
            <h2 className="text-6xl uppercase md:text-8xl">Bateu a fome?</h2>
            <p className="mt-4 flex items-center gap-2 text-lg font-medium">
              <Clock className="h-5 w-5" /> Ter a Dom, das 18h às 00h30
            </p>
            <Button asChild size="xl" className="mt-8 rounded-full bg-background font-semibold uppercase tracking-wider text-foreground hover:bg-background/90">
              <Link to="/cardapio">
                Fazer pedido <ArrowRight />
              </Link>
            </Button>
            <a
              href={`https://wa.me/${BUSINESS.whatsapp}`}
              target="_blank"
              rel="noopener"
              className="mt-4 block font-semibold underline-offset-4 hover:underline"
            >
              ou chame no WhatsApp {BUSINESS.phoneDisplay}
            </a>
          </div>
          <motion.img
            src={HERO_BURGER}
            alt=""
            loading="lazy"
            width={1024}
            height={1024}
            initial={{ rotate: -20, x: 80, opacity: 0 }}
            whileInView={{ rotate: -8, x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute -bottom-16 -right-10 w-[60%] max-w-[480px] md:-right-4 md:bottom-[-20%]"
          />
        </Reveal>
      </section>

      <ProductDialog product={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function ParallaxImage() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  return (
    <div ref={ref} className="absolute inset-0">
      <motion.img src={kitchen} alt="" loading="lazy" style={{ y }} className="absolute inset-0 h-[130%] w-full -translate-y-[15%] object-cover" />
      <div className="absolute inset-0 bg-overlay" />
    </div>
  );
}
