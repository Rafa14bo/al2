import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Phone } from "lucide-react";
import { Logo } from "./Header";
import { BUSINESS } from "@/lib/menu";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-card">
      <div className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[18vw] leading-none text-foreground/[0.03]">
        TOCA DO BURGUER
      </div>
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo size="lg" />
          <p className="mt-4 max-w-sm text-muted-foreground">
            Lanches caprichados, hambúrgueres gourmet e porções para a família toda em Barretos.
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-2xl">Navegue</h4>
          <ul className="space-y-2 text-muted-foreground">
            {(
              [
                ["/", "Início"],
                ["/cardapio", "Cardápio"],
                ["/sobre", "A Toca"],
                ["/contato", "Contato"],
              ] as const
            ).map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="transition-colors hover:text-primary">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-2xl">Fale com a gente</h4>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-2">
              <MapPin className="h-5 w-5 shrink-0 text-primary" /> {BUSINESS.address}
            </li>
            <li>
              <a href={`https://wa.me/${BUSINESS.whatsapp}`} target="_blank" rel="noopener" className="flex gap-2 transition-colors hover:text-primary">
                <Phone className="h-5 w-5 shrink-0 text-primary" /> {BUSINESS.phoneDisplay}
              </a>
            </li>
            <li className="flex gap-2">
              <Clock className="h-5 w-5 shrink-0 text-primary" /> Ter a Dom, 18h às 00h30
            </li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-border py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {BUSINESS.name} • CNPJ {BUSINESS.cnpj}
      </div>
    </footer>
  );
}
