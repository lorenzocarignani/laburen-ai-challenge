import { Router } from 'express';
import { getProducts, getProductById } from '../controllers/product.controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado
 *         name:
 *           type: string
 *           description: Nombre del producto
 *         price:
 *           type: number
 *           description: Precio unitario
 *         stock:
 *           type: integer
 *           description: Stock disponible
 *         size:
 *           type: string
 *         color:
 *           type: string
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Obtener lista de productos
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Filtro de búsqueda por nombre o descripción
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', getProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtener detalle de un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Detalle del producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id', getProductById);

export default router;