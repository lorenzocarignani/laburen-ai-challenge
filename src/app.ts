import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/products.routes";
import cartRoutes from "./routes/carts.routes";
import webhookRoutes from "./routes/webhook.routes";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// ✅ Health Check (Vital para Render)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// --- SWAGGER UI ---
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log("📄 Swagger disponible en http://localhost:3000/api-docs");

app.use("/products", productRoutes);
app.use("/carts", cartRoutes);
app.use("/webhook", webhookRoutes);

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
