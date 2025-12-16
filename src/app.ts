import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/products.routes";
import cartRoutes from "./routes/carts.routes";

// Importaciones de Swagger
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger"; // Asegurate de la ruta correcta

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// --- SWAGGER UI ---
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log("📄 Swagger disponible en http://localhost:3000/api-docs");

// Rutas
app.use("/products", productRoutes);
app.use("/carts", cartRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
