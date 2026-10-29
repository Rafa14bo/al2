import { useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { Flame, Heart, Leaf, Users } from "lucide-react";
import { PageHero } from "@/components/site/extras";
import { Reveal, SectionLabel } from "@/components/site/Reveal";
import { Marquee } from "@/components/site/Marquee";
import kitchen from "@/assets/kitchen.jpg";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "A Toca — Toca do Burguer | Barretos" },
      { name: "description", content: "Conheça a Toca do Burguer: lanches caprichados, gourmet e porções em Barretos/SP." },
      { property: "og:title", content: "A Toca — Toca do Burguer" },
      { property: "og:description", content: "De um food truck a referência em smash burger em São Paulo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Sobre,
});

const TIMELINE = [
  { year: "01", title: "Hot dog & lanches", text: "Do Hot Dog Tradicional ao X-Tudão, tudo bem recheado." },
  { year: "02", title: "Cheddar & contra-filé", text: "King Cheddar, Contra Piry, Bauru e muito mais." },
  { year: "03", title: "Toca Gourmet", text: "Brioche, maionese artesanal e hambúrguer de 150 g." },
  { year: "04", title: "Porções da Toca", text: "Batata recheada, iscas, contra-filé e a porção Família." },
];

const VALUES = [
  { icon: Flame, title: "Fogo de verdade", text: "Chapa de ferro fundido e brasa — nada de atalhos." },
  { icon: Leaf, title: "Ingredientes frescos", text: "Hortifruti local e pão brioche assado todas as manhãs." },
  { icon: Users, title: "Feito por gente", text: "Uma equipe apaixonada que conhece cada cliente pelo nome." },
  { icon: Heart, title: "Com carinho", text: "Cada burger montado como se fosse para a nossa família." },
];

function Sobre() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.85, 1]);
  const radius = useTransform(scrollYProgress, [0, 0.5], [64, 24]);

  const lineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: lineProgress } = useScroll({ target: lineRef, offset: ["start 70%", "end 60%"] });

  return (
    <>
      <PageHero
        eyebrow="Desde 2018"
        title={
          <>
            Feito na <span className="text-gradient-flame">brasa</span>
          </>
        }
        subtitle="Uma obsessão simples: fazer o hambúrguer mais suculento da cidade."
      />

      <div ref={ref} className="mx-auto max-w-7xl px-5">
        <motion.div style={{ scale, borderRadius: radius }} className="overflow-hidden will-change-transform">
          <img src={kitchen} alt="Chef prensando smash burgers na chapa quente" loading="lazy" width={1600} height={1008} className="aspect-[16/9] w-full object-cover" />
        </motion.div>
      </div>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-28 md:grid-cols-2">
        <Reveal>
          <SectionLabel>A gente</SectionLabel>
          <h2 className="mt-4 text-6xl uppercase md:text-7xl">Uma chapa, uma ideia fixa</h2>
        </Reveal>
        <Reveal delay={0.1} className="space-y-5 text-lg text-muted-foreground">
          <p>
            A Toca do Burguer é o lugar do lanche caprichado em Barretos: do hot dog tradicional ao X-Tudão,
            queijo escorrendo e um pão macio que segura tudo.
          </p>
          <p>
            Na linha Toca Gourmet, pão de brioche, maionese artesanal e hambúrguer artesanal de 150 g.
            O segredo? Não tem. É fogo, tempo e cuidado.
          </p>
        </Reveal>
      </section>

      <Marquee tilt={false} />

      <section className="mx-auto max-w-5xl px-5 py-28">
        <Reveal className="mb-16 text-center">
          <SectionLabel>Linha do tempo</SectionLabel>
          <h2 className="mt-4 text-6xl uppercase md:text-7xl">Nossa jornada</h2>
        </Reveal>
        <div ref={lineRef} className="relative">
          <div className="absolute left-4 top-0 h-full w-px bg-border md:left-1/2" />
          <motion.div style={{ scaleY: lineProgress }} className="absolute left-4 top-0 h-full w-px origin-top bg-primary md:left-1/2" />
          <div className="space-y-16">
            {TIMELINE.map((t, i) => (
              <Reveal key={t.year} className={`relative pl-12 md:w-1/2 md:pl-0 ${i % 2 ? "md:ml-auto md:pl-14" : "md:pr-14 md:text-right"}`}>
                <span
                  className={`absolute left-4 top-3 h-4 w-4 -translate-x-1/2 rounded-full bg-primary shadow-glow ${
                    i % 2 ? "md:left-0" : "md:left-full"
                  }`}
                />
                <p className="font-display text-6xl text-primary">{t.year}</p>
                <h3 className="mt-1 text-3xl">{t.title}</h3>
                <p className="mt-2 text-muted-foreground">{t.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-28">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -8 }}
                className="group h-full rounded-3xl border border-border bg-card p-8 transition-colors duration-300 hover:border-primary/60"
              >
                <v.icon className="h-10 w-10 text-primary transition-transform duration-500 group-hover:scale-125 group-hover:rotate-[-10deg]" />
                <h3 className="mt-6 text-3xl">{v.title}</h3>
                <p className="mt-2 text-muted-foreground">{v.text}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
