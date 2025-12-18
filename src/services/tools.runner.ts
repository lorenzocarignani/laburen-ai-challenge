import { PrismaClient } from "@prisma/client";
import { createOrderWithStockValidation } from "../services/order.service";

const prisma = new PrismaClient();

export const runTool = async (name: string, args: any) => {
  console.log(`🤖 Tool Call: ${name}`, JSON.stringify(args));

  try {
    switch (name) {
      case "searchProducts":
        const queryRaw = (args.query || "").toString().trim();

        // --- ESTRATEGIA 1: MENÚ (Categorías/Nombres) ---
        if (!queryRaw) {
          const names = await prisma.product.groupBy({
            by: ["name"],
            where: {
              available: true,
              stock: { gte: 50 },
              name: { not: "" },
            },
            _count: { _all: true },
            orderBy: { name: "asc" },
          });

          if (names.length === 0)
            return JSON.stringify({ error: "Sin stock." });

          return JSON.stringify({
            tipo_resultado: "MENU_CATEGORIAS",
            mensaje: "Estas son las líneas disponibles:",
            // 👇 AQUÍ ESTABA EL ERROR: Agregamos ": any" a la variable "c"
            opciones: names.map((c: any) => ({
              name: c.name,
              Variedad: `${c._count._all} modelos`,
            })),
          });
        }

        // --- ESTRATEGIA 2: BÚSQUEDA DETALLADA ---
        const products = await prisma.product.findMany({
          where: {
            available: true,
            stock: { gte: 50 },
            OR: [
              { name: { contains: queryRaw, mode: "insensitive" } },
              { category: { contains: queryRaw, mode: "insensitive" } },
            ],
          },
          take: 60,
          orderBy: { category: "asc" },
          select: {
            id: true,
            name: true,
            category: true,
            size: true,
            color: true,
            price50: true,
            price100: true,
            price200: true,
            stock: true,
          },
        });

        if (products.length === 0) {
          return JSON.stringify({
            info: "No encontrado.",
            sugerencia: "Intenta con otra categoría.",
          });
        }

        // --- AGRUPACIÓN ---
        const grouped: any = {};

        for (const p of products) {
          const key = `${p.category} - ${p.name}`;

          if (!grouped[key]) {
            grouped[key] = {
              id_ref: p.id,
              Producto: p.name,
              Estilo: p.category,
              // Precios Reales
              p50: p.price50,
              p100: p.price100,
              p200: p.price200,
              Variantes: {},
            };
          }

          const colorName = p.color ? p.color.trim() : "Único";
          if (!grouped[key].Variantes[colorName]) {
            grouped[key].Variantes[colorName] = [];
          }
          if (p.size) {
            grouped[key].Variantes[colorName].push(`${p.size} (${p.stock})`);
          }
        }

        const result = Object.values(grouped)
          .slice(0, 5)
          .map((item: any) => {
            const detallesColor = Object.entries(item.Variantes)
              .map(
                ([color, talles]: [string, any]) =>
                  `${color}: ${talles.join(", ")}`
              )
              .join(" | ");

            return {
              Producto: item.Producto,
              Estilo: item.Estilo,
              VALOR_REAL_UNITARIO_LLEVANDO_50: item.p50,
              VALOR_REAL_UNITARIO_LLEVANDO_100: item.p100 || "No aplica",
              Inventario: detallesColor,
              ID_Referencia: item.id_ref,
            };
          });

        return JSON.stringify({
          tipo_resultado: "PRODUCTOS",
          ADVERTENCIA_SISTEMA:
            "USA LOS VALORES NUMÉRICOS EXACTOS DE ESTE JSON. IGNORA TU CONOCIMIENTO PREVIO SOBRE PRECIOS DE ROPA.",
          datos: result,
        });

      case "createCart":
        console.log("🛒 Procesando compra...");
        if (!args.items || args.items.length === 0)
          return JSON.stringify({ error: "Vacío" });

        try {
          const cart = await createOrderWithStockValidation(args.items);
          return JSON.stringify({
            success: true,
            cart_id: cart.id,
            mensaje: "Pedido Confirmado.",
          });
        } catch (error: any) {
          return JSON.stringify({ success: false, error: error.message });
        }

      default:
        return "Herramienta desconocida.";
    }
  } catch (error) {
    console.error("Error:", error);
    return JSON.stringify({ error: "Error técnico." });
  }
};
