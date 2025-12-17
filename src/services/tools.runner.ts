import { PrismaClient } from "@prisma/client";
import { createOrderWithStockValidation } from "../services/order.service";

const prisma = new PrismaClient();

export const runTool = async (name: string, args: any) => {
  console.log(`🤖 Tool Call: ${name}`, JSON.stringify(args));

  try {
    switch (name) {
      case "searchProducts":
        const query = args.query || "";

        // 1. Buscar productos disponibles (available: true) y con stock >= 50
        const products = await prisma.product.findMany({
          where: {
            available: true,
            stock: { gte: 50 },
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { category: { contains: query, mode: "insensitive" } },
            ],
          },
          take: 8,
        });

        if (products.length === 0) {
          return "No se encontraron productos disponibles con stock suficiente para venta mayorista (mínimo 50u).";
        }

        // 2. Formatear respuesta inteligente: Solo mostrar escalas posibles según stock
        const result = products.map((p) => {
          let preciosStr = `Mínimo (50u): $${p.price50}`;

          if (p.price100 && p.stock >= 100) {
            preciosStr += ` | Llevando 100u: $${p.price100}`;
          }
          if (p.price200 && p.stock >= 200) {
            preciosStr += ` | Llevando 200u: $${p.price200}`;
          }

          return {
            id: p.id,
            producto: p.name,
            detalle: p.description,
            oferta_precios_segun_stock: preciosStr, // La IA leerá esto
            stock_real: p.stock,
            talle: p.size,
            color: p.color,
          };
        });

        return JSON.stringify(result);

      case "createCart":
        console.log("🛒 Procesando compra vía IA...");

        if (!args.items || args.items.length === 0) {
          return JSON.stringify({ error: "El pedido está vacío." });
        }

        try {
          // LLAMADA AL SERVICIO COMPARTIDO
          const cart = await createOrderWithStockValidation(args.items);

          return JSON.stringify({
            success: true,
            cart_id: cart.id,
            mensaje:
              "Pedido confirmado exitosamente. El stock ha sido reservado.",
          });
        } catch (error: any) {
          // Capturamos errores de negocio (stock insuficiente, mínimo de compra)
          return JSON.stringify({
            success: false,
            error: error.message,
          });
        }

      default:
        return "Herramienta no reconocida.";
    }
  } catch (error) {
    console.error("❌ Error general en tools:", error);
    return "Error técnico procesando la solicitud.";
  }
};
