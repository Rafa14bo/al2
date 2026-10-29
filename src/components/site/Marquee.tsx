import { Star } from "lucide-react";

const WORDS = ["Toca Gourmet", "X-Tudão", "King Cheddar", "Contra-filé", "Batata recheada", "Porções da Toca", "Hot dog"];

export function Marquee({ tilt = true }: { tilt?: boolean }) {
  const items = [...WORDS, ...WORDS];
  return (
    <div className={`relative z-10 overflow-hidden bg-gradient-flame py-4 ${tilt ? "-rotate-2 scale-105" : ""}`}>
      <div className="flex w-max animate-marquee will-change-transform">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
            {items.map((w, i) => (
              <span
                key={`${dup}-${i}`}
                className="flex items-center gap-6 px-6 font-display text-3xl uppercase text-primary-foreground md:text-4xl"
              >
                {w}
                <Star className="h-5 w-5 fill-current" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
