export type CartLine = {
  key: string;
  productId: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  extras: string[];
  note?: string;
};

export type NewLine = Omit<CartLine, "key">;

export function lineKey(productId: string, extras: string[], note?: string) {
  return [productId, [...extras].sort().join("+"), (note ?? "").trim().toLowerCase()].join("|");
}

/** Adds a line; identical product + extras + note merge into one line. */
export function addLine(lines: CartLine[], line: NewLine): CartLine[] {
  const key = lineKey(line.productId, line.extras, line.note);
  const existing = lines.find((l) => l.key === key);
  if (existing) {
    return lines.map((l) => (l.key === key ? { ...l, quantity: l.quantity + line.quantity } : l));
  }
  return [...lines, { ...line, key }];
}

/** Sets quantity; zero or less removes the line. */
export function setQuantity(lines: CartLine[], key: string, quantity: number): CartLine[] {
  if (quantity <= 0) return lines.filter((l) => l.key !== key);
  return lines.map((l) => (l.key === key ? { ...l, quantity } : l));
}

export function cartTotals(lines: CartLine[]) {
  return lines.reduce(
    (acc, l) => ({
      count: acc.count + l.quantity,
      subtotal: Math.round((acc.subtotal + l.unitPrice * l.quantity) * 100) / 100,
    }),
    { count: 0, subtotal: 0 },
  );
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export function formatBRL(value: number) {
  return brl.format(value).replace(/\u00a0/g, " ");
}

export function buildOrderMessage(
  lines: CartLine[],
  info: { name: string; address: string; payment: string },
) {
  const items = lines
    .map((l) => {
      const extras = l.extras.length ? ` (${l.extras.join(", ")})` : "";
      const note = l.note ? ` — obs: ${l.note}` : "";
      return `• ${l.quantity}x ${l.name}${extras}${note} — ${formatBRL(l.unitPrice * l.quantity)}`;
    })
    .join("\n");
  const { subtotal } = cartTotals(lines);
  return [
    `Olá, Toca do Burguer! Quero fazer um pedido:`,
    ``,
    items,
    ``,
    `Subtotal: ${formatBRL(subtotal)}`,
    `Nome: ${info.name}`,
    `Endereço: ${info.address}`,
    `Pagamento: ${info.payment}`,
  ].join("\n");
}
