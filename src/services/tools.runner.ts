import { PrismaClient } from "@prisma/client";
import { createOrderWithStockValidation } from "../services/order.service";

const prisma = new PrismaClient();

export const runTool = async (name: string, args: any) => {
  console.log(`🤖 Tool Call: ${name}`, JSON.stringify(args));

  try {
    switch (name) {
      case "searchProducts":
        const query = (args.query || "").trim();

        // --- ESTRATEGIA 1: CATEGORÍAS (Sin cambios) ---
        if (!query) {
          const categories = await prisma.product.groupBy({
            by: ["category"],
            where: {
              available: true,
              stock: { gte: 50 },
              category: { not: "" },
            },
            _count: { category: true },
            orderBy: { category: "asc" },
          });

          if (categories.length === 0)
            return "No hay stock mayorista disponible.";

          const lista = categories
            .map((c) => `• ${c.category} (${c._count.category} modelos)`)
            .join("\n");

          return `Categorías disponibles:\n${lista}\n\nPregunta al usuario cuál quiere ver.`;
        }

        // --- ESTRATEGIA 2: BÚSQUEDA DETALLADA ---
        const products = await prisma.product.findMany({
          where: {
            available: true,
            stock: { gte: 50 },
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { category: { contains: query, mode: "insensitive" } },
            ],
          },
          take: 20,
          orderBy: { price50: "asc" },
          // Traemos TODOS los precios necesarios
          select: {
            id: true,
            name: true,
            price50: true,
            price100: true,
            price200: true,
            size: true,
            stock: true,
          },
        });

        if (products.length === 0) {
          return "No se encontraron productos con ese nombre/categoría (Min 50u).";
        }

        // --- AGRUPACIÓN ---
        const groupedProducts: any = {};

        for (const p of products) {
          if (!groupedProducts[p.name]) {
            groupedProducts[p.name] = {
              id_ref: p.id,
              nombre: p.name,
              // Guardamos los PRECIOS REALES para pasárselos a la IA
              p50: p.price50,
              p100: p.price100,
              p200: p.price200,
              talles: [],
            };
          }
          if (p.size)
            groupedProducts[p.name].talles.push(`${p.size} (${p.stock})`);
        }

        const result = Object.values(groupedProducts)
          .slice(0, 5)
          .map((p: any) => {
            // Construimos un objeto de precios explícito
            const tablaPrecios: any = {
              Compra_Minima_50u: `$${p.p50}`,
            };

            if (p.p100) tablaPrecios["Llevando_100u"] = `$${p.p100}`;
            if (p.p200) tablaPrecios["Llevando_200u"] = `$${p.p200}`;

            return {
              Modelo: p.nombre,
              Lista_Precios: tablaPrecios,
              Talles_Disponibles: p.talles.join(", ") || "Único",
              ID_Referencia: p.id_ref,
            };
          });

        return JSON.stringify(result);

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
    return "Error técnico.";
  }
};
