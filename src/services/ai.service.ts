import { GoogleGenerativeAI, SchemaType, Tool } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Usamos 1.5-flash que es muy bueno siguiendo instrucciones estrictas
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const toolsDefinition: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "searchProducts",
        description:
          "Busca en la base de datos real. IMPORTANTE: Envía un string VACÍO ('') para ver CATEGORÍAS. Envía texto para buscar productos.",
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
        description:
          "Genera el pedido. SOLO usar cuando el cliente confirmó cantidad (min 50) y modelo.",
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

// --- EL CEREBRO BLINDADO ---
const systemInstruction = `
Eres 'José', el vendedor experto de la tienda MAYORISTA 'Laburen'.

TU FUENTE DE VERDAD ES ÚNICAMENTE LA HERRAMIENTA 'searchProducts'.
Tu trabajo es leer el JSON que devuelve esa herramienta y explicárselo al usuario.

REGLAS DE SEGURIDAD DE DATOS (CRÍTICAS):
1. **CERO INVENCIÓN:** Si la herramienta devuelve un producto llamado "Remera X" a "$5000", NO puedes decir "Remera Super" ni "$4999". Copia y pega los valores del JSON.
2. **SI NO ESTÁ EN EL JSON, NO EXISTE:** Si el usuario pide "Zapatillas" y searchProducts devuelve una lista vacía, di: "No tenemos stock de ese producto". No inventes que llegarán pronto.
3. **PRECIOS:** Los precios del JSON son sagrados. No apliques matemáticas ni descuentos mentales.
4. **COMPRA MÍNIMA:** La regla es estricta: Mínimo 50 unidades. No se puede vender menos.

INSTRUCCIONES DE RESPUESTA:
- Cuando uses searchProducts(""), devuelve las categorías en una lista simple.
- Cuando uses searchProducts("producto"), devuelve los modelos encontrados con sus precios exactos tal cual vienen en la respuesta.
- Si la respuesta contiene un campo "Lista_Precios" u objeto de precios, úsalo para informar las escalas (50u, 100u, 200u).

FORMATO DE RESPUESTA:
Mantén los mensajes cortos y directos para WhatsApp. No uses negritas ni markdown complejo si no es necesario.
`;

// Inicializar Modelo con Configuración de Temperatura Baja
// (temperature: 0 hace que el modelo sea menos creativo y más preciso con los datos)
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: {
    parts: [{ text: systemInstruction }],
    role: "system",
  },
  generationConfig: {
    temperature: 0, // <--- ESTO ES CLAVE PARA QUE NO INVENTE
  },
});

export const startChat = () => {
  return model.startChat({
    history: [], // El historial inicia limpio para que el System Instruction mande.
  });
};
