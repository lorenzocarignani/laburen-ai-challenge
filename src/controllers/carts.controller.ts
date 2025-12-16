import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /carts
export const createCart = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: "El carrito debe tener al menos un producto" });
    }

    const newCart = await prisma.cart.create({
      data: {
        items: {
          create: items.map((item: any) => ({
            productId: item.product_id,
            qty: item.qty,
          })),
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    res.status(201).json(newCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el carrito" });
  }
};

// PATCH /carts/:id
export const updateCart = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    const cartId = Number(id);

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
        items: {
          include: { product: true },
        },
      },
    });

    res.json(updatedCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el carrito" });
  }
};
