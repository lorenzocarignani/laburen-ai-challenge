import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface OrderItem {
  product_id: number;
  qty: number;
}

export const createOrderWithStockValidation = async (items: OrderItem[]) => {
  if (!items || items.length === 0) {
    throw new Error("El pedido debe contener al menos un producto.");
  }

  return await prisma.$transaction(async (tx) => {
    const itemsToCreate = [];

    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.product_id },
      });

      if (!product) {
        throw new Error(`Producto ID ${item.product_id} no encontrado.`);
      }

      // --- DEBUGGING EN TIEMPO REAL ---
      console.log(
        `🔎 Validando: ${product.name} | Piden: ${item.qty} | Hay: ${product.stock}`
      );

      // 2. Validación A: Compra mínima mayorista (50u)
      if (item.qty < 50) {
        // AQUÍ ESTÁ EL CAMBIO: Le decimos a la IA cuánto pidió realmente
        throw new Error(
          `Error en '${product.name}': La compra mínima es de 50. La IA intentó pedir: ${item.qty} unidades.`
        );
      }

      // 3. Validación B: Stock suficiente
      if (product.stock < item.qty) {
        // AQUÍ ESTÁ EL CAMBIO: Le mostramos los números exactos
        throw new Error(
          `Error en '${product.name}': Pediste ${item.qty} pero solo tengo ${product.stock} en stock.`
        );
      }

      // 4. Calcular nuevo stock
      const newStock = product.stock - item.qty;
      const isStillAvailable = newStock >= 50;

      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: newStock,
          available: isStillAvailable,
        },
      });

      itemsToCreate.push({
        productId: item.product_id,
        qty: item.qty,
      });
    }

    const newCart = await tx.cart.create({
      data: {
        items: {
          create: itemsToCreate,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return newCart;
  });
};
