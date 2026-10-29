import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Clock, FileText, MapPin, Phone, Send } from "lucide-react";
import { BUSINESS } from "@/lib/menu";
import { toast } from "sonner";
import { z } from "zod";
import { PageHero } from "@/components/site/extras";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OPENING_HOURS, formatMinutes, isOpenAt, nowInSaoPaulo } from "@/lib/hours";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato e horários — Toca do Burguer | Barretos" },
      { name: "description", content: "Endereço, WhatsApp e horários da Toca do Burguer em Barretos/SP." },
      { property: "og:title", content: "Contato e horários — Toca do Burguer" },
      { property: "og:description", content: "Endereço, WhatsApp e horários da Toca do Burguer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contato,
});

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(60),
  email: z.string().trim().email("E-mail inválido").max(120),
  message: z.string().trim().min(5, "Escreva uma mensagem").max(800),
});

function Contato() {
  const [now, setNow] = useState<{ weekday: number; minutes: number } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setNow(nowInSaoPaulo());
    const t = setInterval(() => setNow(nowInSaoPaulo()), 60_000);
    return () => clearInterval(t);
  }, []);

  const open = now ? isOpenAt(now.weekday, now.minutes) : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Verifique os campos");
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setForm({ name: "", email: "", message: "" });
      toast.success("Mensagem enviada! Respondemos em breve.");
    }, 900);
  };

  const cards = [
    { icon: MapPin, title: "Endereço", text: `${BUSINESS.address} — CEP ${BUSINESS.cep}` },
    { icon: Phone, title: "WhatsApp", text: BUSINESS.phoneDisplay },
    { icon: FileText, title: "CNPJ", text: BUSINESS.cnpj },
  ];

  return (
    <>
      <PageHero
        eyebrow="Vem pra brasa"
        title={
          <>
            Fale com a <span className="text-gradient-flame">gente</span>
          </>
        }
        subtitle="Reservas, eventos, elogios ou aquela sugestão de burger novo — estamos ouvindo."
      />

      <section className="mx-auto grid max-w-7xl gap-6 px-5 md:grid-cols-3">
        {cards.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.08}>
            <motion.div whileHover={{ y: -6 }} className="group flex h-full items-start gap-4 rounded-3xl border border-border bg-card p-6 transition-colors hover:border-primary/60">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <c.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-3xl">{c.title}</h3>
                <p className="mt-1 text-muted-foreground">{c.text}</p>
              </div>
            </motion.div>
          </Reveal>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-16 lg:grid-cols-2">
        <Reveal className="rounded-3xl border border-border bg-card p-8">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-3 text-5xl">
              <Clock className="h-8 w-8 text-primary" /> Horários
            </h2>
            {open !== null && (
              <span
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${
                  open ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                }`}
              >
                <span className="relative flex h-2.5 w-2.5">
                  {open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />}
                  <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${open ? "bg-success" : "bg-destructive"}`} />
                </span>
                {open ? "Aberto agora" : "Fechado agora"}
              </span>
            )}
          </div>
          <ul className="mt-8 divide-y divide-border">
            {[2, 3, 4, 5, 6, 0, 1].map((d) => {
              const h = OPENING_HOURS[d];
              if (!h) return null;
              const today = now?.weekday === d;
              return (
                <li key={d} className={`flex justify-between py-3 transition-colors ${today ? "text-primary" : ""}`}>
                  <span className="font-semibold">
                    {h.day} {today && <span className="ml-2 text-xs uppercase tracking-widest">hoje</span>}
                  </span>
                  <span className={h.open === null ? "text-muted-foreground" : ""}>
                    {h.open === null || h.close === null ? "Fechado" : `${formatMinutes(h.open)} – ${formatMinutes(h.close)}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal delay={0.1} className="rounded-3xl border border-border bg-card p-8">
          <h2 className="text-5xl">Mande uma mensagem</h2>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <Input
              placeholder="Seu nome"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-12 rounded-xl bg-background"
            />
            <Input
              type="email"
              placeholder="Seu e-mail"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="h-12 rounded-xl bg-background"
            />
            <Textarea
              placeholder="Sua mensagem"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="resize-none rounded-xl bg-background"
            />
            <Button type="submit" variant="flame" size="xl" className="w-full" disabled={sending}>
              {sending ? (
                <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>
                  <Send />
                </motion.span>
              ) : (
                <Send />
              )}
              {sending ? "Enviando..." : "Enviar mensagem"}
            </Button>
          </form>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-28">
        <Reveal className="overflow-hidden rounded-3xl border border-border">
          <iframe
            title="Mapa Toca do Burguer"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(BUSINESS.mapsQuery)}&z=16&output=embed`}
            className="h-[420px] w-full grayscale invert-[0.9] hue-rotate-180"
            loading="lazy"
          />
        </Reveal>
      </section>
    </>
  );
}
