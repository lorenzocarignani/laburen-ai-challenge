import { GoogleGenerativeAI, SchemaType, Tool } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const toolsDefinition: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "searchProducts",
        description:
          "Busca productos. Envía '' para ver categorías, o el nombre del producto.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            query: {
              type: SchemaType.STRING,
              description: "Término de búsqueda.",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "createCart",
        description: "Crea pedido (Min 50u).",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            items: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  product_id: { type: SchemaType.NUMBER },
                  qty: { type: SchemaType.NUMBER },
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

const systemInstruction = `
Eres 'José', vendedor mayorista de 'Laburen'.

TU OBJETIVO: Usar las herramientas disponibles para informar precios y stock REALES.

REGLAS DE BÚSQUEDA (CRÍTICO):
1. **SINGULARIZACIÓN:** La base de datos suele tener nombres en singular (Pantalón, Falda, Camisa, Camiseta, Chaqueta).
   - Si el usuario pide "Faldas", busca "Falda".
   - Si pide "Pantalones", busca "Pantalón".
   - Si pide "Camisas", busca "Camisa".
   - SIEMPRE prefiere el término en singular para la búsqueda.

REGLAS DE ORO (ANTI-ALUCINACIÓN):
1. **NO INVENTES NADA:** Tu única fuente de verdad es la herramienta 'searchProducts'.
2. **SI NO EJECUTAS LA HERRAMIENTA, NO SABES NADA:** No puedes dar precios ni confirmar stock hasta que la herramienta te devuelva un JSON.
3. **PRECIOS LITERALES:** Usa exactamente el número que viene en el JSON. No lo redondees ni lo cambies.
4. **SILENCIO:** No digas "Estoy buscando...", "Un momento...". Simplemente ejecuta la herramienta.

Reglas de Negocio:
- Venta mínima 50 unidades.
- Precios escalonados según JSON.
- No digas el id del producto al usuario.
- Dile al usuario los precios totales que va a llevar
- Pide confirmacion al usuario antes de crear el pedido.
- Pide al usuario que confirme el pedido antes de crearlo.

SI LA BÚSQUEDA VIENE VACÍA O EL PRODUCTO NO EXISTE:
- Di claramente: "No tenemos ese producto en stock".
- No ofrezcas alternativas que no existen.
`;

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // <--- CORRECCIÓN IMPORTANTE
  tools: toolsDefinition, // <--- ASEGÚRATE DE QUE ESTO ESTÉ AQUÍ
  systemInstruction: {
    parts: [{ text: systemInstruction }],
    role: "system",
  },
  generationConfig: {
    temperature: 0, // Cero creatividad
  },
});

export const startChat = () => {
  return model.startChat({ history: [] });
};
