import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    const whereClause = q
      ? {
          OR: [
            { name: { contains: String(q), mode: "insensitive" as const } },
            {
              description: {
                contains: String(q),
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {};

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { id: "asc" }, // Ordenado para consistencia
    });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno al obtener productos" });
  }
};

// GET /products/:id
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar el producto" });
  }
};
