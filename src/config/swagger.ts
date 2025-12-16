// src/config/swagger.ts
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Laburen AI Agent API",
      version: "1.0.0",
      description:
        "API para gestión de productos y carritos de compra integrados con IA via Whatsapp",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de Desarrollo",
      },
    ],
  },
  // Indicamos dónde buscar los comentarios @swagger
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
