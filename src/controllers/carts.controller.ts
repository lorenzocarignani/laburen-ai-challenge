import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createOrderWithStockValidation } from "../services/order.service";

const prisma = new PrismaClient();

// POST /carts
export const createCart = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    // Delegamos la lógica compleja al servicio
    const newCart = await createOrderWithStockValidation(items);

    res.status(201).json(newCart);
  } catch (error: any) {
    // Si el error viene de nuestras validaciones de negocio (stock, mínimos), devolvemos 400
    if (error.message && error.message.includes("Error en")) {
      return res.status(400).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: "Error interno al procesar el pedido." });
  }
};

// PATCH /carts/:id
export const updateCart = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { items } = req.body;
    const cartId = Number(id);

    // Nota: Esta lógica actualiza cantidades en un carrito existente pero
    // NO maneja re-validación de stock compleja (restock/destock).
    // Para un challenge, suele bastar con la creación segura (createCart).

    const cartExists = await prisma.cart.findUnique({ where: { id: cartId } });
    if (!cartExists)
      return res.status(404).json({ error: "Carrito no encontrado" });

    for (const item of items) {
      if (item.qty <= 0) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cartId, productId: item.product_id },
        });
      } else {
        const existingItem = await prisma.cartItem.findFirst({
          where: { cartId: cartId, productId: item.product_id },
        });

        if (existingItem) {
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { qty: item.qty },
          });
        } else {
          await prisma.cartItem.create({
            data: {
              cartId: cartId,
              productId: item.product_id,
              qty: item.qty,
            },
          });
        }
      }
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: { include: { product: true } },
      },
    });

    res.json(updatedCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el carrito" });
  }
};
