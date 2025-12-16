import { Router } from "express";
import { createCart, updateCart } from "../controllers/carts.controller";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItemInput:
 *       type: object
 *       required:
 *         - product_id
 *         - qty
 *       properties:
 *         product_id:
 *           type: integer
 *         qty:
 *           type: integer
 *     Cart:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *               qty:
 *                 type: integer
 */

/**
 * @swagger
 * /carts:
 *   post:
 *     summary: Crear un nuevo carrito de compras
 *     tags: [Carrito]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CartItemInput'
 *     responses:
 *       201:
 *         description: Carrito creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */
router.post("/", createCart);

/**
 * @swagger
 * /carts/{id}:
 *   patch:
 *     summary: Actualizar items de un carrito
 *     tags: [Carrito]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CartItemInput'
 *     responses:
 *       200:
 *         description: Carrito actualizado
 */
router.patch("/:id", updateCart);

export default router;
