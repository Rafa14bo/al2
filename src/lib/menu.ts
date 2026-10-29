// Cardápio oficial da Toca do Burguer (transcrito das artes originais enviadas pela empresa).
import heroBurger from "@/assets/hero-burger.png";
import classic from "@/assets/burger-classic.jpg";
import bacon from "@/assets/burger-bacon.jpg";
import chicken from "@/assets/burger-chicken.jpg";
import hotdog from "@/assets/hotdog.jpg";
import paoFrances from "@/assets/pao-frances.jpg";
import fries from "@/assets/side-fries.jpg";
import porcao from "@/assets/porcao.jpg";
import bebidas from "@/assets/bebidas.jpg";
import cerveja from "@/assets/cerveja.jpg";

export type Category =
  | "cachorro-quente"
  | "hamburgueres"
  | "cheddar"
  | "contra-file"
  | "frango"
  | "especiais"
  | "gourmet"
  | "batatas"
  | "porcoes"
  | "porcoes-especiais"
  | "bebidas"
  | "latas"
  | "cervejas";

export type ProductOption = { label: string; price: number };

export type Product = {
  id: string;
  name: string;
  description: string;
  /** Lowest price; when options exist this is the "a partir de" price. */
  price: number;
  category: Category;
  image: string;
  cutout?: boolean;
  tags?: string[];
  featured?: boolean;
  options?: ProductOption[];
};

export const CATEGORIES: { id: Category | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "gourmet", label: "Toca Gourmet" },
  { id: "hamburgueres", label: "Hambúrgueres" },
  { id: "cheddar", label: "Cheddar" },
  { id: "contra-file", label: "Contra-filé" },
  { id: "frango", label: "Frango" },
  { id: "especiais", label: "Especiais" },
  { id: "cachorro-quente", label: "Cachorro-quente" },
  { id: "batatas", label: "Batatas" },
  { id: "porcoes", label: "Porções da Toca" },
  { id: "porcoes-especiais", label: "Porções especiais" },
  { id: "bebidas", label: "Refris & sucos" },
  { id: "latas", label: "Latas & água" },
  { id: "cervejas", label: "Cervejas" },
];

export const CATEGORY_NOTES: Partial<Record<Category, string>> = {
  batatas: "Todas acompanham molho rosé artesanal.",
  porcoes: "Meia 600 g • Inteira 800 g",
};

/** Categories whose items accept the "Adicionais" list. */
export const CUSTOMIZABLE: Category[] = [
  "cachorro-quente",
  "hamburgueres",
  "cheddar",
  "contra-file",
  "frango",
  "especiais",
  "gourmet",
];

export const EXTRAS = [
  { id: "hamb-artesanal", label: "Hambúrguer artesanal 150 g", price: 8 },
  { id: "hamb-recheado", label: "Hambúrguer recheado 200 g", price: 12 },
  { id: "hamb-industrial", label: "Hambúrguer industrial", price: 4 },
  { id: "bacon", label: "Bacon", price: 4 },
  { id: "cheddar", label: "Cheddar", price: 4 },
  { id: "presunto", label: "Presunto", price: 3 },
  { id: "mucarela", label: "Muçarela", price: 4 },
  { id: "milho", label: "Milho", price: 1 },
  { id: "ovo", label: "Ovo", price: 2 },
  { id: "catupiry", label: "Catupiry", price: 6 },
  { id: "cebola", label: "Cebola", price: 2 },
  { id: "picles", label: "Picles artesanal", price: 2 },
  { id: "batata-palha", label: "Batata palha", price: 2 },
  { id: "salsicha", label: "Salsicha", price: 2 },
];

function slug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type Extra = Partial<Omit<Product, "id" | "name" | "description" | "category">>;
function item(category: Category, image: string, name: string, price: number, description = "", extra: Extra = {}): Product {
  const options = extra.options;
  return {
    id: `${category}-${slug(name)}`,
    name,
    description,
    category,
    image,
    ...extra,
    price: options?.length ? Math.min(...options.map((o) => o.price)) : price,
  };
}

const HB = "Pão de hambúrguer, ketchup, maionese";

export const PRODUCTS: Product[] = [
  // Toca Gourmet
  item("gourmet", heroBurger, "Gourmet Domaik", 34.99, "Pão de brioche, alho frito, catupiry, hambúrguer artesanal, muçarela, bacon, molho barbecue e maionese artesanal.", { cutout: true, featured: true, tags: ["Destaque"] }),
  item("gourmet", bacon, "Gourmet Zero 1", 32, "Pão de brioche, maionese artesanal, hambúrguer artesanal 150 g, cheddar, bacon, cebola roxa, picles artesanal, alface e tomate."),
  item("gourmet", classic, "Gourmet Zero 2", 32, "Pão de brioche, maionese artesanal, hambúrguer artesanal 150 g, muçarela, cream cheese, cebola roxa, picles artesanal, alface e tomate."),
  item("gourmet", bacon, "Gourmet Zero 3", 32, "Pão de brioche, maionese artesanal, hambúrguer caseiro 150 g, cheddar, ovo, catupiry e bacon em fatia."),
  item("gourmet", heroBurger, "Gourmet Zero 4", 35, "Pão de brioche, maionese artesanal, 2 hambúrgueres caseiros de 150 g, 3 fatias de cheddar e bacon em fatia.", { cutout: true }),
  item("gourmet", classic, "Gourmet Zero 5", 35, "Pão de brioche, maionese artesanal, 2 hambúrgueres caseiros de 150 g, 2 fatias de muçarela, bacon em fatia, picles artesanal, cebola roxa, tomate e alface."),
  item("gourmet", bacon, "Gourmet Zero 6 (Recheadão)", 34, "Pão de brioche, hambúrguer caseiro de 200 g recheado de muçarela, cheddar, cebola frita, muçarela e bacon em fatia.", { tags: ["Recheado"] }),

  // Hambúrgueres
  item("hamburgueres", classic, "Hambúrguer", 20, `${HB}, hambúrguer, presunto, muçarela, milho e tomate.`),
  item("hamburgueres", classic, "X-Salada", 21, `${HB}, hambúrguer, presunto, muçarela, milho, batata palha, tomate e alface.`),
  item("hamburgueres", classic, "X-Egg", 22, `${HB}, hambúrguer, presunto, muçarela, 2 ovos, milho, batata palha, tomate e alface.`),
  item("hamburgueres", bacon, "X-Bacon", 22, `${HB}, bacon, hambúrguer, presunto, muçarela, milho, batata palha, tomate e alface.`),
  item("hamburgueres", classic, "X-Tudo", 25, `${HB}, hambúrguer, presunto, muçarela, bacon, ovo, salsicha, milho, batata palha, tomate e alface.`),
  item("hamburgueres", heroBurger, "X-Tudão", 28, `${HB}, 2 hambúrgueres, presunto, muçarela, bacon, catupiry, ovo, salsicha, milho, batata palha, tomate e alface.`, { cutout: true, featured: true, tags: ["2 hambúrgueres"] }),

  // Cheddar
  item("cheddar", classic, "Cheddar Kids", 15, `${HB}, hambúrguer, cheddar e tomate.`),
  item("cheddar", bacon, "Duo Cheddar", 20, `${HB}, 2 hambúrgueres, 2 fatias de cheddar e bacon.`),
  item("cheddar", heroBurger, "Triple Cheddar", 25, `${HB}, 3 hambúrgueres, 3 fatias de cheddar e bacon.`, { cutout: true }),
  item("cheddar", heroBurger, "King Cheddar", 30, `${HB}, 3 hambúrgueres, 3 cheddars, ovo, bacon, catupiry, batata palha, tomate e alface.`, { cutout: true, featured: true, tags: ["3 hambúrgueres"] }),

  // Contra-filé
  item("contra-file", classic, "Contra Salada", 30, `${HB}, contra-filé, presunto, muçarela, milho, batata palha, tomate e alface.`),
  item("contra-file", classic, "Contra Egg", 31, `${HB}, contra-filé, presunto, muçarela, 2 ovos, milho, batata palha, tomate e alface.`),
  item("contra-file", bacon, "Contra Bacon", 31, `${HB}, contra-filé, bacon, presunto, muçarela, milho, batata palha, tomate e alface.`),
  item("contra-file", classic, "Contra Tudo", 34, `${HB}, contra-filé, presunto, muçarela, bacon, ovo, salsicha, milho, batata palha, tomate e alface.`),
  item("contra-file", paoFrances, "Contra Piry", 34, "Pão francês, maionese, batata palha, contra-filé picadinho, dupla camada de catupiry, bacon e 2 fatias de muçarela."),
  item("contra-file", paoFrances, "Bauru", 30, "Pão francês, contra-filé picadinho, 3 fatias de muçarela, cebola e tomate."),

  // Frango
  item("frango", chicken, "X-Frango", 22, `${HB}, frango, presunto, muçarela, milho e tomate.`),
  item("frango", chicken, "Frango Salada", 23, `${HB}, frango, presunto, muçarela, milho, batata palha, tomate e alface.`),
  item("frango", chicken, "Frango Egg", 25, `${HB}, frango, presunto, muçarela, 2 ovos, milho, batata palha, tomate e alface.`),
  item("frango", chicken, "Frango Bacon", 25, `${HB}, bacon, frango, presunto, muçarela, milho, batata palha, tomate e alface.`),
  item("frango", chicken, "Frango Tudo", 27, `${HB}, frango, presunto, muçarela, bacon, ovo, salsicha, milho, batata palha, tomate e alface.`),
  item("frango", paoFrances, "Frango Piry", 29, "Pão francês, maionese, batata palha, frango picadinho, dupla camada de catupiry, bacon e 2 fatias de muçarela."),
  item("frango", paoFrances, "Bauru de Frango", 25, "Pão francês, frango picadinho, 3 fatias de muçarela, cebola e tomate."),

  // Especiais
  item("especiais", paoFrances, "Queijo Quente", 18, "Pão francês, 4 fatias de muçarela, catupiry, orégano e tomate."),
  item("especiais", paoFrances, "Misto Quente", 16, "Pão francês, 4 fatias de presunto, 4 fatias de muçarela, tomate, milho e orégano."),
  item("especiais", paoFrances, "Americano", 15, "Pão francês, ketchup, maionese, 2 fatias de presunto, 2 fatias de muçarela, 2 ovos, batata palha, tomate e alface."),
  item("especiais", classic, "Vegetariano", 17, "Pão de hambúrguer, 2 fatias de muçarela, ovo, catupiry, batata palha, milho, picles artesanal, tomate e alface.", { tags: ["Sem carne"] }),
  item("especiais", heroBurger, "Moda da Casa", 40, `${HB}, hambúrguer, frango, contra-filé, catupiry, presunto, muçarela, bacon, ovo, salsicha, milho, batata palha, tomate e alface.`, { cutout: true, tags: ["O mais completo"] }),

  // Cachorro-quente
  item("cachorro-quente", hotdog, "Hot Dog Tradicional", 10, "Pão de hot dog, ketchup, maionese, mostarda, milho, batata palha e salsicha."),
  item("cachorro-quente", hotdog, "Hot Dog Bacon", 12, "Pão de hot dog, ketchup, maionese, mostarda, milho, batata palha, salsicha e bacon."),
  item("cachorro-quente", hotdog, "Dog Simples", 12, "Pão de hambúrguer, ketchup, maionese, milho, batata palha, 2 salsichas, alface e tomate."),
  item("cachorro-quente", hotdog, "Dog Especial", 17, "Pão de hambúrguer, ketchup, maionese, milho, batata palha, bacon, 2 salsichas, presunto, muçarela, alface e tomate."),

  // Batatas
  item("batatas", fries, "Batata Pequena", 9, "200 g de batata com molho rosé artesanal.", { options: [{ label: "Simples", price: 9 }, { label: "Recheada", price: 15 }] }),
  item("batatas", fries, "Batata Média", 16, "400 g de batata com molho rosé artesanal.", { options: [{ label: "Simples", price: 16 }, { label: "Recheada", price: 25 }] }),
  item("batatas", fries, "Batata Grande", 22, "600 g de batata com molho rosé artesanal.", { options: [{ label: "Simples", price: 22 }, { label: "Recheada", price: 35 }] }),
  item("batatas", fries, "King", 50, "1 kg de batata recheada com bacon e catupiry ou muçarela.", { tags: ["1 kg"] }),
  item("batatas", fries, "King Supremo", 60, "1 kg de batata recheada com bacon, catupiry e muçarela.", { tags: ["1 kg"] }),

  // Porções da Toca
  item("porcoes", porcao, "Filé de Frango", 50, "Filé de frango, cebola e tomate, acompanhado de pão francês, batata frita, salada e molhos.", { options: [{ label: "Meia (600 g)", price: 50 }, { label: "Inteira (800 g)", price: 58 }] }),
  item("porcoes", porcao, "Contra-Filé", 78, "Contra-filé, cebola e tomate, acompanhado de pão francês, batata frita, salada e molhos.", { options: [{ label: "Meia (600 g)", price: 78 }, { label: "Inteira (800 g)", price: 85 }] }),
  item("porcoes", porcao, "Isca de Frango", 55, "Isca de frango acompanhada de batata frita, salada e molhos.", { options: [{ label: "Meia (600 g)", price: 55 }, { label: "Inteira (800 g)", price: 65 }] }),
  item("porcoes", porcao, "Isca de Tilápia", 68, "Isca de tilápia acompanhada de batata frita, salada e molhos.", { options: [{ label: "Meia (600 g)", price: 68 }, { label: "Inteira (800 g)", price: 82 }] }),

  // Porções especiais
  item("porcoes-especiais", porcao, "Frango à Passarinho", 50, "1 kg de frango à passarinho, acompanhado de batata frita, salada e molhos."),
  item("porcoes-especiais", porcao, "Chiclete de Frango", 80, "800 g de frango, cebola, tomate, catupiry e muçarela, acompanhado de batata frita, salada e molhos."),
  item("porcoes-especiais", porcao, "Chiclete de Contra", 100, "800 g de contra-filé, cebola, tomate, catupiry e muçarela, acompanhado de batata frita, salada e molhos."),
  item("porcoes-especiais", porcao, "Isca Recheada", 100, "1 kg de isca de frango e 1 kg de batata com bacon e catupiry; acompanha salada e molhos."),
  item("porcoes-especiais", porcao, "Família", 170, "600 g de contra-filé, 600 g de isca de frango, 600 g de batata com bacon e catupiry, 600 g de isca de tilápia, acompanhado de pão francês fatiado, salada e molhos.", { tags: ["Para a família"] }),

  // Refrigerantes de garrafa e sucos
  ...(
    [
      ["Coca-Cola 2 L", 15],
      ["Coca-Cola Zero 2 L", 15],
      ["Poty 2 L", 9],
      ["Fanta 2 L", 13],
      ["Sprite 2 L", 13],
      ["Coca-Cola 1 L (vidro)", 9],
      ["Coca-Cola 1 L (descartável)", 10],
      ["Coca-Cola Zero 1 L (descartável)", 8],
      ["Guaraná 1 L (vidro)", 9],
      ["Guaraná 1 L (descartável)", 8],
      ["Suco de laranja 1 L", 15],
      ["Suco de uva 1 L", 15],
    ] as const
  ).map(([n, p]) => item("bebidas", bebidas, n, p)),

  // Latas e água
  ...(
    [
      ["Coca-Cola lata", 6],
      ["Coca-Cola Zero lata", 6],
      ["Guaraná lata", 6],
      ["Fanta lata", 6],
      ["Sprite lata", 6],
      ["Schweppes Citrus lata", 6],
      ["Schweppes Tônica lata", 6],
      ["H2O Limão 500 ml", 8],
      ["H2O Limoneto 500 ml", 8],
      ["Água com gás 500 ml", 4.5],
      ["Água sem gás 500 ml", 4],
    ] as const
  ).map(([n, p]) => item("latas", bebidas, n, p)),

  // Cervejas
  ...(
    [
      ["Crystal 600 ml", 12],
      ["Crystal lata", 6],
      ["Antárctica Boa 600 ml", 12],
      ["Antárctica Boa lata", 6],
      ["Skol 600 ml", 12],
      ["Skol lata", 6],
      ["Brahma 600 ml", 12],
      ["Brahma lata", 6],
      ["Original 600 ml", 13],
      ["Império lata", 6],
      ["Heineken 600 ml", 16],
      ["Heineken lata", 8],
      ["Heineken Zero", 8],
      ["Brahma Zero", 6],
    ] as const
  ).map(([n, p]) => item("cervejas", cerveja, n, p)),
];

export const HERO_BURGER = heroBurger;

export const BUSINESS = {
  name: "Toca do Burguer",
  whatsapp: "5517991893983",
  phoneDisplay: "(17) 99189-3983",
  address: "R. Doze de Outubro, 90 — Derby Clube, Barretos/SP",
  cep: "14787-240",
  cnpj: "44.162.357/0001-41",
  mapsQuery: "R. Doze de Outubro, 90 - Derby Clube, Barretos - SP, 14787-240",
};
