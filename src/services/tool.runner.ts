import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Esta función recibe el nombre de la tool y los argumentos que Gemini decidió usar
export const runTool = async (name: string, args: any) => {
  console.log(`🤖 Agente intentando ejecutar: ${name} con args:`, args);

  try {
    switch (name) {
      case "searchProducts":
        // Llamada real a la base de datos
        const products = await prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: args.query || "", mode: "insensitive" } },
              {
                description: {
                  contains: args.query || "",
                  mode: "insensitive",
                },
              },
            ],
          },
          take: 5, // Limitamos para no saturar el chat
        });

        if (products.length === 0)
          return "No encontré productos con esa descripción.";

        // Convertimos a string para que Gemini lo pueda leer
        return JSON.stringify(
          products.map((p) => ({
            id: p.id,
            nombre: p.name,
            precio: p.price,
            stock: p.stock,
          }))
        );

      case "createCart":
        // Llamada real para crear carrito (lógica igual a tu controller)
        const cart = await prisma.cart.create({
          data: {
            items: {
              create: args.items.map((item: any) => ({
                productId: item.product_id,
                qty: item.qty,
              })),
            },
          },
        });
        return JSON.stringify({
          success: true,
          cart_id: cart.id,
          mensaje: "Carrito creado exitosamente.",
        });

      default:
        return "Herramienta no reconocida.";
    }
  } catch (error) {
    console.error("Error ejecutando tool:", error);
    return "Ocurrió un error técnico al intentar procesar tu solicitud.";
  }
};
