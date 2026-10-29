import { motion, type HTMLMotionProps } from "motion/react";

type RevealProps = HTMLMotionProps<"div"> & { delay?: number; y?: number };

/** Fades + slides content in once when it scrolls into view (transform/opacity only). */
export function Reveal({ delay = 0, y = 32, children, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
      <span className="h-px w-8 bg-primary" />
      {children}
    </span>
  );
}
