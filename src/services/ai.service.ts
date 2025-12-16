import { GoogleGenerativeAI, SchemaType, Tool } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// 1. Definición de las Herramientas usando SchemaType
// Tipamos esto explícitamente como Tool[] para que TypeScript no se queje
const toolsDefinition: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "searchProducts",
        description:
          "Busca productos en el catálogo por nombre o descripción. Úsalo cuando el usuario pregunte qué vendemos o busque algo específico.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            query: {
              type: SchemaType.STRING,
              description:
                "El término de búsqueda (ej: 'remera', 'azul', 'pantalon'). Dejar vacío si quiere ver todo.",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "createCart",
        description:
          "Crea un carrito de compras nuevo con los productos que el usuario eligió. Úsalo cuando el usuario confirme que quiere comprar.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            items: {
              type: SchemaType.ARRAY,
              description: "Lista de productos a comprar.",
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  product_id: {
                    type: SchemaType.NUMBER,
                    description: "El ID numérico del producto.",
                  },
                  qty: {
                    type: SchemaType.NUMBER,
                    description: "La cantidad a comprar.",
                  },
                },
                required: ["product_id", "qty"],
              },
            },
          },
          required: ["items"],
        },
      },
    ],
  },
];

// 2. Inicializar el Modelo
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  tools: toolsDefinition,
});

export const startChat = () => {
  return model.startChat({
    history: [
      {
        role: "user",
        parts: [
          {
            text: "Hola, eres el vendedor de Laburen.com. Tu objetivo es vender ropa. Sé amable y breve.",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "Entendido. Soy el asistente de ventas de Laburen. Ayudaré al cliente a encontrar ropa y crear su pedido.",
          },
        ],
      },
    ],
  });
};
